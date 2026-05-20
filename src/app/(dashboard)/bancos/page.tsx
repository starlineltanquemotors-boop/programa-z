import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
export default async function BancosPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const banks = await prisma.bank.findMany({
    where: { organizationId: orgId },
    include: {
      leads: { select: { id: true, bankStatus: true } },
      sales: { select: { id: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bancos</h1>
        <p className="text-gray-500 mt-1">{banks.length} bancos registrados</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Banco</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Solicitudes</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aprobados</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rechazados</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">% Aprobación</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contacto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Sucursales</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ventas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {banks.map((bank) => {
                const aprobados = bank.leads.filter((l) => l.bankStatus === "APROBADO").length;
                const rechazados = bank.leads.filter((l) => l.bankStatus === "RECHAZADO").length;
                const total = bank.leads.length;
                const pct = total > 0 ? ((aprobados / total) * 100).toFixed(1) : "0";
                return (
                  <tr key={bank.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{bank.name}</td>
                    <td className="px-4 py-3 text-gray-600">{total}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{aprobados}</td>
                    <td className="px-4 py-3 text-red-600 font-medium">{rechazados}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-medium">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {bank.contactName && <div>{bank.contactName}</div>}
                      {bank.contactPhone && <div>{bank.contactPhone}</div>}
                      {!bank.contactName && !bank.contactPhone && "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{bank.branches || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{bank.sales.length}</td>
                  </tr>
                );
              })}
              {banks.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No hay bancos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
