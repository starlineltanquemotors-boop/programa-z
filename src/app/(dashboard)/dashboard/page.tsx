import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Users,
  PhoneCall,
  ShoppingCart,
  Car,
  TrendingUp,
  DollarSign,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId;

  // Estadísticas principales
  const [totalLeads, activeLeads, leadsThisMonth, closedWon] = await Promise.all([
    prisma.lead.count({ where: { organizationId: orgId } }),
    prisma.lead.count({
      where: { organizationId: orgId, status: { notIn: ["CERRADO_GANADO", "CERRADO_PERDIDO"] } },
    }),
    prisma.lead.count({
      where: {
        organizationId: orgId,
        entryDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.lead.count({
      where: { organizationId: orgId, status: "CERRADO_GANADO" },
    }),
  ]);

  const [totalSales, salesThisMonth] = await Promise.all([
    prisma.sale.count({ where: { organizationId: orgId } }),
    prisma.sale.count({
      where: {
        organizationId: orgId,
        saleDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  const [totalVehicles, availableVehicles] = await Promise.all([
    prisma.vehicle.count({ where: { organizationId: orgId } }),
    prisma.vehicle.count({
      where: { organizationId: orgId, status: "DISPONIBLE" },
    }),
  ]);

  // Leads sin contacto (más de 3 días)
  const staleLeads = await prisma.lead.count({
    where: {
      organizationId: orgId,
      status: { notIn: ["CERRADO_GANADO", "CERRADO_PERDIDO"] },
      OR: [
        { lastContact: null },
        {
          lastContact: {
            lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    },
  });

  const conversionRate = totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : "0";

  const stats = [
    {
      name: "Total Leads",
      value: totalLeads,
      change: `+${leadsThisMonth} este mes`,
      icon: Users,
      color: "text-blue-600 bg-blue-100",
    },
    {
      name: "Leads Activos",
      value: activeLeads,
      change: `${staleLeads} sin contacto`,
      icon: PhoneCall,
      color: "text-orange-600 bg-orange-100",
    },
    {
      name: "Ventas del Mes",
      value: salesThisMonth,
      change: `${totalSales} totales`,
      icon: ShoppingCart,
      color: "text-green-600 bg-green-100",
    },
    {
      name: "Tasa Conversión",
      value: `${conversionRate}%`,
      change: `${closedWon} ganados`,
      icon: TrendingUp,
      color: "text-purple-600 bg-purple-100",
    },
    {
      name: "Inventario",
      value: availableVehicles,
      change: `${totalVehicles} totales`,
      icon: Car,
      color: "text-indigo-600 bg-indigo-100",
    },
    {
      name: "Sin Contacto",
      value: staleLeads,
      change: ">3 días",
      icon: AlertCircle,
      color: "text-red-600 bg-red-100",
    },
  ];

  // Leads por canal
  const leadsByChannel = await prisma.lead.groupBy({
    by: ["channel"],
    where: { organizationId: orgId },
    _count: true,
  });

  const channelData = leadsByChannel.map((c) => ({
    name: c.channel,
    count: c._count,
  }));

  const maxChannel = Math.max(...channelData.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Resumen general de {session?.user?.organizationName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Channel Distribution & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads por Canal */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Leads por Canal</h3>
          {channelData.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay datos aún</p>
          ) : (
            <div className="space-y-3">
              {channelData.map((ch) => (
                <div key={ch.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{ch.name}</span>
                    <span className="font-medium">{ch.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(ch.count / maxChannel) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leads Recientes */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Leads Recientes</h3>
          <RecentLeads orgId={orgId!} />
        </div>
      </div>
    </div>
  );
}

async function RecentLeads({ orgId }: { orgId: string }) {
  const leads = await prisma.lead.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { assignedTo: { select: { name: true } } },
  });

  if (leads.length === 0) {
    return <p className="text-gray-400 text-sm">No hay leads aún</p>;
  }

  const statusLabels: Record<string, string> = {
    NUEVO: "Nuevo",
    CONTACTADO: "Contactado",
    CALIFICADO: "Calificado",
    EN_NEGOCIACION: "En Negociación",
    CERRADO_GANADO: "Ganado",
    CERRADO_PERDIDO: "Perdido",
  };

  const statusColors: Record<string, string> = {
    NUEVO: "bg-blue-100 text-blue-700",
    CONTACTADO: "bg-indigo-100 text-indigo-700",
    CALIFICADO: "bg-purple-100 text-purple-700",
    EN_NEGOCIACION: "bg-orange-100 text-orange-700",
    CERRADO_GANADO: "bg-green-100 text-green-700",
    CERRADO_PERDIDO: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div
          key={lead.id}
          className="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{lead.name}</p>
            <p className="text-xs text-gray-500">
              {lead.phone} · {lead.assignedTo?.name || "Sin asignar"}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              statusColors[lead.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {statusLabels[lead.status] || lead.status}
          </span>
        </div>
      ))}
    </div>
  );
}
