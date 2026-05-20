import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadsFilter } from "@/components/leads/LeadsFilter";
import { LeadsKanban } from "@/components/leads/LeadsKanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const status = searchParams.status;
  const channel = searchParams.channel;
  const priority = searchParams.priority;
  const assignedTo = searchParams.assignedTo;
  const search = searchParams.search;

  const where: any = { organizationId: orgId };
  if (status) where.status = status;
  if (channel) where.channel = channel;
  if (priority) where.priority = priority;
  if (assignedTo) where.assignedToId = assignedTo;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, users] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true } },
        bank: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, active: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Captación de Leads</h1>
          <p className="text-gray-500 mt-1">
            {leads.length} leads encontrados
          </p>
        </div>
      </div>

      <LeadsFilter users={users} />

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tabla</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <LeadsTable leads={leads} />
        </TabsContent>
        <TabsContent value="kanban">
          <LeadsKanban leads={leads} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
