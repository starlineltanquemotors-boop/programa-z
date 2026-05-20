import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export default async function VendedoresPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const users = await prisma.user.findMany({
    where: { organizationId: orgId, active: true },
    include: {
      leads: { select: { id: true, status: true } },
      sales: { select: { id: true, initialPrice: true, commission: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendedores</h1>
        <p className="text-gray-500 mt-1">{users.length} vendedores</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Leads</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ventas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">% Cierre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Perdidos</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total Vendido</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Comisiones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const totalLeads = user.leads.length;
                const wonLeads = user.leads.filter((l) => l.status === "CERRADO_GANADO").length;
                const lostLeads = user.leads.filter((l) => l.status === "CERRADO_PERDIDO").length;
                const closeRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0";
                const totalSold = user.sales.reduce((s, sale) => s + sale.initialPrice, 0);
                const totalCommission = user.sales.reduce((s, sale) => s + (sale.commission || 0), 0);

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.role}</td>
                    <td className="px-4 py-3 text-gray-600">{totalLeads}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{user.sales.length}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(parseFloat(closeRate), 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium">{closeRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-red-600">{lostLeads}</td>
                    <td className="px-4 py-3 font-medium text-blue-600">{formatCurrency(totalSold)}</td>
                    <td className="px-4 py-3 font-medium text-orange-600">{formatCurrency(totalCommission)}</td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No hay vendedores registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
