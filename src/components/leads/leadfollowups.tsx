"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FollowUp, User } from "@prisma/client";
import { Plus, Check, X, Clock, Phone, MessageSquare, Mail, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type FollowUpWithUser = FollowUp & {
  responsible: Pick<User, "id" | "name">;
};

const contactMethodIcons: Record<string, React.ReactNode> = {
  WHATSAPP: <MessageSquare className="w-4 h-4" />,
  LLAMADA: <Phone className="w-4 h-4" />,
  EMAIL: <Mail className="w-4 h-4" />,
  PRESENCIAL: <MapPin className="w-4 h-4" />,
  MENSAJE: <MessageSquare className="w-4 h-4" />,
};

const contactMethodLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  LLAMADA: "Llamada",
  EMAIL: "Email",
  PRESENCIAL: "Presencial",
  MENSAJE: "Mensaje",
};

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  COMPLETADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

interface LeadFollowUpsProps {
  leadId: string;
  followUps: FollowUpWithUser[];
  users: (Pick<User, "id" | "name" | "role">)[];
}

export function LeadFollowUps({ leadId, followUps, users }: LeadFollowUpsProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    contactType: "WHATSAPP",
    result: "",
    nextStep: "",
    nextDate: "",
    responsibleId: "",
    notes: "",
  });

  async function handleAdd() {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al agregar");
      setShowForm(false);
      setForm({
        contactType: "WHATSAPP",
        result: "",
        nextStep: "",
        nextDate: "",
        responsibleId: "",
        notes: "",
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete(followUpId: string) {
    await fetch(`/api/leads/${leadId}/followups`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: followUpId, status: "COMPLETADO" }),
    });
    router.refresh();
  }

  async function handleCancel(followUpId: string) {
    await fetch(`/api/leads/${leadId}/followups`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: followUpId, status: "CANCELADO" }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Add new follow-up */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nuevo Seguimiento
        </button>
      ) : (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <h3 className="font-medium text-blue-900 mb-3">Nuevo Seguimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tipo de Contacto
              </label>
              <select
                value={form.contactType}
                onChange={(e) => setForm({ ...form, contactType: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(contactMethodLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Resultado
              </label>
              <input
                type="text"
                value={form.result}
                onChange={(e) => setForm({ ...form, result: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Interesado, hará visita"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Responsable
              </label>
              <select
                value={form.responsibleId}
                onChange={(e) =>
                  setForm({ ...form, responsibleId: e.target.value })
                }
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Próximo Paso
              </label>
              <input
                type="text"
                value={form.nextStep}
                onChange={(e) => setForm({ ...form, nextStep: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Llamar en 2 días"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha Próximo Contacto
              </label>
              <input
                type="datetime-local"
                value={form.nextDate}
                onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notas
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAdd}
              disabled={saving || !form.responsibleId}
              className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Follow-ups list */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {followUps.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay seguimientos registrados
          </div>
        ) : (
          <div className="divide-y">
            {followUps.map((fu) => (
              <div key={fu.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg">
                      {contactMethodIcons[fu.contactType]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {contactMethodLabels[fu.contactType]}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[fu.status]
                          }`}
                        >
                          {fu.status}
                        </span>
                      </div>

                      {fu.result && (
                        <p className="text-sm text-gray-600 mt-1">{fu.result}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(fu.contactDate)}
                        </span>
                        <span>Por: {fu.responsible.name}</span>
                      </div>

                      {fu.nextStep && (
                        <p className="text-xs text-blue-600 mt-1">
                          📋 Próximo: {fu.nextStep}
                          {fu.nextDate &&
                            ` — ${new Date(fu.nextDate).toLocaleDateString("es-DO")}`}
                        </p>
                      )}

                      {fu.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{fu.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {fu.status === "PENDIENTE" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleComplete(fu.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                        title="Completar"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel(fu.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
