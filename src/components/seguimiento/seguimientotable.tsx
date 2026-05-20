"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Check, X, Plus, Clock, Phone, MessageSquare, Mail, MapPin } from "lucide-react";
import Link from "next/link";

const contactMethodIcons: Record<string, React.ReactNode> = {
  WHATSAPP: <MessageSquare className="w-3 h-3" />,
  LLAMADA: <Phone className="w-3 h-3" />,
  EMAIL: <Mail className="w-3 h-3" />,
  PRESENCIAL: <MapPin className="w-3 h-3" />,
  MENSAJE: <MessageSquare className="w-3 h-3" />,
};

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  COMPLETADO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export function SeguimientoTable({
  followUps,
  leads,
  users,
  orgId,
}: {
  followUps: any[];
  leads: any[];
  users: any[];
  orgId: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    leadId: "",
    contactType: "WHATSAPP",
    result: "",
    nextStep: "",
    nextDate: "",
    responsibleId: "",
    notes: "",
  });

  async function handleStatusChange(followUpId: string, status: string, leadId: string) {
    await fetch(`/api/leads/${leadId}/followups`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: followUpId, status }),
    });
    router.refresh();
  }

  async function handleAdd() {
    if (!form.leadId || !form.responsibleId) return;
    setSaving(true);
    const res = await fetch(`/api/leads/${form.leadId}/followups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({
        leadId: "", contactType: "WHATSAPP", result: "", nextStep: "", nextDate: "", responsibleId: "", notes: "",
      });
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
      >
        <Plus className="w-4 h-4" />
        Nuevo Seguimiento
      </button>

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium mb-3">Nuevo Seguimiento</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Lead</label>
              <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })}
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar lead</option>
                {leads.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Tipo</label>
              <select value={form.contactType} onChange={(e) => setForm({ ...form, contactType: e.target.value })}
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="WHATSAPP">WhatsApp</option>
                <option value="LLAMADA">Llamada</option>
                <option value="EMAIL">Email</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="MENSAJE">Mensaje</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Responsable</label>
              <select value={form.responsibleId} onChange={(e) => setForm({ ...form, responsibleId: e.target.value })}
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar</option>
                {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Resultado</label>
              <input type="text" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })}
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Próximo Paso</label>
              <input type="text" value={form.nextStep} onChange={(e) => setForm({ ...form, nextStep: e.target.value })}
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Próxima Fecha</label>
              <input type="datetime-local" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })}
                className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} disabled={saving}
              className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-gray-600 hover:bg-gray-200 rounded text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha Contacto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Resultado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Próximo Paso</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Próxima Fecha</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Responsable</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {followUps.map((fu) => (
                <tr key={fu.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {fu.lead ? (
                      <Link href={`/leads/${fu.lead.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        {fu.lead.name}
                      </Link>
                    ) : (
                      <span>{fu.contact?.name || "-"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDateTime(fu.contactDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600">{contactMethodIcons[fu.contactType]} {fu.contactType}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{fu.result || "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{fu.nextStep || "-"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{fu.nextDate ? formatDateTime(fu.nextDate) : "-"}</td>
                  <td className="px-4 py-3 text-gray-600">{fu.responsible.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[fu.status]}`}>{fu.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {fu.status === "PENDIENTE" && (
                      <div className="flex gap-1">
                        <button onClick={() => handleStatusChange(fu.id, "COMPLETADO", fu.leadId!)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded" title="Completar">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStatusChange(fu.id, "CANCELADO", fu.leadId!)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancelar">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {followUps.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">No hay seguimientos registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
