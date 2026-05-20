import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SeguimientoTable } from "@/components/seguimiento/SeguimientoTable";

export default async function SeguimientoPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const [followUps, leads, users] = await Promise.all([
    prisma.followUp.findMany({
      where: { organizationId: orgId },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        contact: { select: { id: true, name: true } },
        responsible: { select: { id: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { nextDate: "asc" }, { contactDate: "desc" }],
    }),
    prisma.lead.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, active: true },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seguimiento</h1>
        <p className="text-gray-500 mt-1">
          {followUps.filter((f) => f.status === "PENDIENTE").length} pendientes de{" "}
          {followUps.length} totales
        </p>
      </div>
      <SeguimientoTable followUps={followUps} leads={leads} users={users} orgId={orgId} />
    </div>
  );
}
