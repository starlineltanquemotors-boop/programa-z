import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, channelLabels } from "@/lib/utils";
import Link from "next/link";

export default async function VentasPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const [sales, leads] = await Promise.all([
    prisma.sale.findMany({
      where: { organizationId: orgId },
      include: {
        lead: { select: { name: true, phone: true } },
        seller: { select: { name: true } },
        bank: { select: { name: true } },
        vehicle: { select: { brand: true, model: true, year: true } },
      },
      orderBy: { saleDate: "desc" },
    }),
    prisma.lead.findMany({
      where: { organizationId: orgId, status: { in: ["CALIFICADO", "EN_NEGOCIACION"] }, sale: null },
      select: { id: true, name: true },
    }),
  ]);

  const totalVentas = sales.reduce((sum, s) => sum + s.initialPrice, 0);
  const totalComision = sales.reduce((sum, s) => sum + (s.commission || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 mt-1">{sales.length} ventas registradas</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="bg-white rounded-lg border px-4 py-2">
            <span className="text-gray-500">Total:</span>{" "}
            <span className="font-bold text-green-600">{formatCurrency(totalVentas)}</span>
          </div>
          <div className="bg-white rounded-lg border px-4 py-2">
            <span className="text-gray-500">Comisiones:</span>{" "}
            <span className="font-bold text-blue-600">{formatCurrency(totalComision)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vehículo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Financiado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Comisión</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Canal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Banco</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">T. Cierre</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${sale.leadId}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {sale.clientName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {sale.vehicle ? `${sale.vehicle.brand} ${sale.vehicle.model} ${sale.vehicle.year}` : "-"}
                  </td>
                  <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(sale.initialPrice)}</td>
                  <td className="px-4 py-3 text-gray-600">{sale.financedAmount ? formatCurrency(sale.financedAmount) : "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{sale.commission ? formatCurrency(sale.commission) : "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{sale.seller.name}</td>
                  <td className="px-4 py-3"><span className="text-gray-600">{channelLabels[sale.channel]}</span></td>
                  <td className="px-4 py-3 text-gray-600">{sale.bank?.name || "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(sale.saleDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{sale.closingTime ? `${sale.closingTime}d` : "-"}</td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">No hay ventas registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
