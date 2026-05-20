import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LeadDetailForm } from "@/components/leads/LeadDetailForm";
import { LeadFollowUps } from "@/components/leads/LeadFollowUps";
import { LeadTimeline } from "@/components/leads/LeadTimeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: orgId },
    include: {
      assignedTo: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      bank: { select: { id: true, name: true } },
      followUps: {
        include: { responsible: { select: { id: true, name: true } } },
        orderBy: { contactDate: "desc" },
      },
      sale: true,
    },
  });

  if (!lead) notFound();

  const [users, banks] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: orgId, active: true },
      select: { id: true, name: true, role: true },
    }),
    prisma.bank.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/leads"
          className="p-1.5 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-500 text-sm">Lead #{lead.id.slice(-8)}</p>
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="seguimiento">
            Seguimiento ({lead.followUps.length})
          </TabsTrigger>
          <TabsTrigger value="timeline">Línea de Tiempo</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <LeadDetailForm lead={lead} users={users} banks={banks} />
        </TabsContent>

        <TabsContent value="seguimiento">
          <LeadFollowUps leadId={lead.id} followUps={lead.followUps} users={users} />
        </TabsContent>

        <TabsContent value="timeline">
          <LeadTimeline lead={lead} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
