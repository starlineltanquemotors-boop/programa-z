import { Lead, FollowUp, User, Sale } from "@prisma/client";
import { formatDateTime, channelLabels, leadStatusLabels } from "@/lib/utils";
import { Calendar, Phone, MessageSquare, User2, ShoppingCart, Activity } from "lucide-react";

type LeadFull = Lead & {
  assignedTo: Pick<User, "id" | "name"> | null;
  createdBy: Pick<User, "id" | "name"> | null;
  followUps: (FollowUp & { responsible: Pick<User, "id" | "name"> })[];
  sale: Sale | null;
};

export function LeadTimeline({ lead }: { lead: LeadFull }) {
  const events: { date: Date; icon: React.ReactNode; title: string; detail: string }[] = [];

  // Lead creado
  events.push({
    date: lead.entryDate,
    icon: <Activity className="w-4 h-4" />,
    title: "Lead creado",
    detail: `Vía ${channelLabels[lead.channel]}. ${lead.createdBy ? `Por ${lead.createdBy.name}` : "Automáticamente desde WhatsApp/redes sociales"}`,
  });

  // Seguimientos
  lead.followUps.forEach((fu) => {
    events.push({
      date: fu.contactDate,
      icon: <Phone className="w-4 h-4" />,
      title: `Seguimiento: ${fu.contactType}`,
      detail: `${fu.result || "Sin resultado"} - ${fu.responsible.name}${fu.notes ? `. "${fu.notes}"` : ""}`,
    });
  });

  // Cambios de estado (usamos lastContact como proxy o closeDate)
  if (lead.lastContact && lead.lastContact !== lead.entryDate) {
    events.push({
      date: lead.lastContact,
      icon: <User2 className="w-4 h-4" />,
      title: "Último contacto",
      detail: `Estado: ${leadStatusLabels[lead.status]}`,
    });
  }

  // Venta
  if (lead.sale) {
    events.push({
      date: lead.sale.saleDate,
      icon: <ShoppingCart className="w-4 h-4" />,
      title: "Venta realizada",
      detail: `Vendido por ${lead.sale.sellerId}. $${lead.sale.initialPrice.toLocaleString()}`,
    });
  }

  // Cierre
  if (lead.closeDate) {
    events.push({
      date: lead.closeDate,
      icon: <Calendar className="w-4 h-4" />,
      title:
        lead.status === "CERRADO_GANADO"
          ? "Lead ganado 🎉"
          : "Lead perdido",
      detail:
        lead.status === "CERRADO_PERDIDO"
          ? lead.lossReason || "Sin motivo especificado"
          : "Venta concretada",
    });
  }

  // Sort by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="bg-white rounded-xl border p-6 max-w-2xl">
      {events.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          No hay eventos registrados
        </p>
      ) : (
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          {events.map((event, i) => (
            <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Punto en la línea */}
              <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex-shrink-0">
                {event.icon}
              </div>

              <div className="pt-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {event.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(event.date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{event.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
