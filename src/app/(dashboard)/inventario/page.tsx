import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InventarioTable } from "@/components/inventario/InventarioTable";

export default async function InventarioPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const vehicles = await prisma.vehicle.findMany({
    where: { organizationId: orgId },
    include: {
      seller: { select: { id: true, name: true } },
      serviceRecords: { orderBy: { date: "desc" } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const disponibilidad = {
    disponibles: vehicles.filter((v) => v.status === "DISPONIBLE").length,
    reservados: vehicles.filter((v) => v.status === "RESERVADO").length,
    vendidos: vehicles.filter((v) => v.status === "VENDIDO").length,
    enTaller: vehicles.filter((v) => v.status === "EN_TALLER").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-500 mt-1">
          {vehicles.length} vehículos · {disponibilidad.disponibles} disponibles ·{" "}
          {disponibilidad.reservados} reservados · {disponibilidad.vendidos} vendidos
        </p>
      </div>
      <InventarioTable vehicles={vehicles} orgId={orgId} />
    </div>
  );
}
