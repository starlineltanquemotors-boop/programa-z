import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TallerTable } from "@/components/taller/TallerTable";

export default async function TallerPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const [orders, vehicles, users] = await Promise.all([
    prisma.workshopOrder.findMany({
      where: { organizationId: orgId },
      include: {
        vehicle: { select: { brand: true, model: true, year: true, plate: true } },
        assignedTo: { select: { id: true, name: true } },
        processes: { orderBy: { createdAt: "asc" } },
        expenses: { orderBy: { date: "desc" } },
      },
      orderBy: [{ status: "asc" }, { entryDate: "desc" }],
    }),
    prisma.vehicle.findMany({
      where: { organizationId: orgId },
      select: { id: true, brand: true, model: true, year: true, plate: true },
    }),
    prisma.user.findMany({
      where: { organizationId: orgId, active: true },
      select: { id: true, name: true, role: true },
    }),
  ]);

  const enProgreso = orders.filter((o) => o.status === "EN_PROCESO").length;
  const pendientes = orders.filter((o) => o.status === "PENDIENTE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Taller Mecánico</h1>
        <p className="text-gray-500 mt-1">
          {pendientes} pendientes · {enProgreso} en proceso · {orders.length} totales
        </p>
      </div>
      <TallerTable orders={orders} vehicles={vehicles} users={users} orgId={orgId} />
    </div>
  );
}
