import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { channelLabels } from "@/lib/utils";

export default async function MarketingPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const channels = await prisma.marketingChannel.findMany({
    where: { organizationId: orgId },
    orderBy: { name: "asc" },
  });

  // Leads y ventas por canal
  const leadsByChannel = await prisma.lead.groupBy({
    by: ["channel"],
    where: { organizationId: orgId },
    _count: true,
  });

  const salesByChannel = await prisma.sale.groupBy({
    by: ["channel"],
    where: { organizationId: orgId },
    _count: true,
  });

  const channelData = Object.keys(channelLabels).map((ch) => {
    const leads = leadsByChannel.find((l) => l.channel === ch)?._count || 0;
    const sales = salesByChannel.find((s) => s.channel === ch)?._count || 0;
    return {
      channel: channelLabels[ch],
      leads,
      sales,
      conversion: leads > 0 ? ((sales / leads) * 100).toFixed(1) : "0",
    };
  }).filter((d) => d.leads > 0 || d.sales > 0);

  const totalLeads = channelData.reduce((s, d) => s + d.leads, 0);
  const totalSales = channelData.reduce((s, d) => s + d.sales, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-500 mt-1">Rendimiento por canal</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Leads", value: totalLeads, color: "text-blue-600" },
          { label: "Total Ventas", value: totalSales, color: "text-green-600" },
          { label: "Conversión Global", value: `${totalLeads > 0 ? ((totalSales / totalLeads) * 100).toFixed(1) : "0"}%`, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Canal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Leads</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ventas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Conversión</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {channelData.map((d) => (
                <tr key={d.channel} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.channel}</td>
                  <td className="px-4 py-3 text-gray-600">{d.leads}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{d.sales}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(parseFloat(d.conversion), 100)}%` }} />
                      </div>
                      <span className="text-xs font-medium">{d.conversion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {channelData.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No hay datos de marketing aún</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
