import { Lead, User, Bank } from "@prisma/client";
import Link from "next/link";
import { formatDate, channelLabels, leadStatusLabels, priorityLabels, leadStatusColors, priorityColors } from "@/lib/utils";

type LeadWithRelations = Lead & {
  assignedTo: Pick<User, "id" | "name"> | null;
  bank: Pick<Bank, "id" | "name"> | null;
};

interface LeadsTableProps {
  leads: LeadWithRelations[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-12 text-center">
        <p className="text-gray-400">No hay leads registrados</p>
        <p className="text-gray-300 text-sm mt-1">
          Los leads de WhatsApp, Instagram y Facebook se registrarán automáticamente
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Canal</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Vehículo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Asignado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Banco</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Prioridad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Entrada</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Último Contacto</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Días SC</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leads.map((lead) => {
              const daysWithoutContact = lead.lastContact
                ? Math.floor(
                    (Date.now() - new Date(lead.lastContact).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : Math.floor(
                    (Date.now() - new Date(lead.entryDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">
                      {channelLabels[lead.channel] || lead.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.vehicleInterest || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.assignedTo?.name || "Sin asignar"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        leadStatusColors[lead.status]
                      }`}
                    >
                      {leadStatusLabels[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.bank?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        priorityColors[lead.priority]
                      }`}
                    >
                      {priorityLabels[lead.priority]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(lead.entryDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {lead.lastContact ? formatDate(lead.lastContact) : "Nunca"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        daysWithoutContact > 7
                          ? "bg-red-100 text-red-700"
                          : daysWithoutContact > 3
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {daysWithoutContact}d
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
