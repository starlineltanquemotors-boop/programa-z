"use client";

import { Lead, User, Bank } from "@prisma/client";
import Link from "next/link";
import { Phone, Calendar, User2 } from "lucide-react";
import { formatDate, channelLabels, priorityColors, priorityLabels } from "@/lib/utils";

type LeadWithRelations = Lead & {
  assignedTo: Pick<User, "id" | "name"> | null;
  bank: Pick<Bank, "id" | "name"> | null;
};

interface LeadsKanbanProps {
  leads: LeadWithRelations[];
}

const columns = [
  { key: "NUEVO", label: "Nuevos", color: "bg-blue-50 border-blue-200" },
  { key: "CONTACTADO", label: "Contactados", color: "bg-indigo-50 border-indigo-200" },
  { key: "CALIFICADO", label: "Calificados", color: "bg-purple-50 border-purple-200" },
  { key: "EN_NEGOCIACION", label: "En Negociación", color: "bg-orange-50 border-orange-200" },
  { key: "CERRADO_GANADO", label: "Ganados", color: "bg-green-50 border-green-200" },
  { key: "CERRADO_PERDIDO", label: "Perdidos", color: "bg-red-50 border-red-200" },
];

export function LeadsKanban({ leads }: LeadsKanbanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {columns.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.key);
        return (
          <div
            key={col.key}
            className={`rounded-xl border-2 ${col.color} p-3 min-h-[300px]`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">
                {col.label}
              </h3>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 border">
                {colLeads.length}
              </span>
            </div>

            <div className="space-y-2">
              {colLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="block bg-white rounded-lg border p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {lead.name}
                    </p>
                    {lead.priority && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          priorityColors[lead.priority]
                        }`}
                      >
                        {priorityLabels[lead.priority]}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      {lead.phone}
                    </div>
                    {lead.vehicleInterest && (
                      <div className="text-xs text-gray-500">
                        🚗 {lead.vehicleInterest}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(lead.entryDate)}
                    </div>
                    {lead.assignedTo && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <User2 className="w-3 h-3" />
                        {lead.assignedTo.name}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t">
                    <span className="text-[10px] text-gray-400">
                      {channelLabels[lead.channel] || lead.channel}
                    </span>
                  </div>
                </Link>
              ))}

              {colLeads.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Sin leads
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
