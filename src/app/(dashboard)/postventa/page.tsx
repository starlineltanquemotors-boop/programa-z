import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function PostVentaPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const postSales = await prisma.postSale.findMany({
    where: { organizationId: orgId },
    include: {
      sale: {
        select: {
          clientName: true,
          initialPrice: true,
          vehicle: { select: { brand: true, model: true, year: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { nextContact: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post-Venta</h1>
        <p className="text-gray-500 mt-1">{postSales.length} clientes en seguimiento post-venta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Garantía Vigente", count: postSales.filter((p) => p.status === "EN_GARANTIA").length, color: "text-green-600" },
          { label: "Garantía Vencida", count: postSales.filter((p) => p.status === "GARANTIA_VENCIDA").length, color: "text-red-600" },
          { label: "Próximo Contacto", count: postSales.filter((p) => p.nextContact && new Date(p.nextContact) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vehículo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha Compra</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Garantía Vence</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Próximo Contacto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {postSales.map((ps) => (
                <tr key={ps.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{ps.clientName}</td>
                  <td className="px-4 py-3 text-gray-600">{ps.vehicleInfo}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(ps.purchaseDate)}</td>
                  <td className="px-4 py-3">
                    {ps.warrantyExpires ? (
                      <span className={new Date(ps.warrantyExpires) < new Date() ? "text-red-600" : "text-green-600"}>
                        {formatDate(ps.warrantyExpires)}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{ps.nextContact ? formatDate(ps.nextContact) : "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ps.status === "EN_GARANTIA" ? "bg-green-100 text-green-700" :
                      ps.status === "GARANTIA_VENCIDA" ? "bg-red-100 text-red-700" :
                      ps.status === "ACTIVO" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                    }`}>{ps.status.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{ps.notes || "-"}</td>
                </tr>
              ))}
              {postSales.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No hay seguimientos post-venta</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
