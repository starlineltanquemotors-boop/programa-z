"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lead, User, Bank, FollowUp, Sale } from "@prisma/client";
import { Save, Trash2 } from "lucide-react";
import { channelLabels, leadStatusLabels, priorityLabels, formatDate } from "@/lib/utils";

type LeadFull = Lead & {
  assignedTo: Pick<User, "id" | "name"> | null;
  createdBy: Pick<User, "id" | "name"> | null;
  bank: Pick<Bank, "id" | "name"> | null;
  followUps: (FollowUp & { responsible: Pick<User, "id" | "name"> })[];
  sale: Sale | null;
};

interface LeadDetailFormProps {
  lead: LeadFull;
  users: (Pick<User, "id" | "name" | "role">)[];
  banks: Pick<Bank, "id" | "name">[];
}

export function LeadDetailForm({ lead, users, banks }: LeadDetailFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    channel: lead.channel,
    vehicleInterest: lead.vehicleInterest || "",
    initialAmount: lead.initialAmount || "",
    assignedToId: lead.assignedToId || "",
    status: lead.status,
    bankId: lead.bankId || "",
    bankStatus: lead.bankStatus || "",
    priority: lead.priority,
    notes: lead.notes || "",
    lossReason: lead.lossReason || "",
  });

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          initialAmount: form.initialAmount ? parseFloat(form.initialAmount) : null,
          closeDate:
            form.status === "CERRADO_GANADO" || form.status === "CERRADO_PERDIDO"
              ? new Date().toISOString()
              : lead.closeDate?.toISOString() || null,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");

      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este lead? Esta acción no se puede deshacer."))
      return;

    try {
      const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      router.push("/leads");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Formulario principal */}
      <div className="lg:col-span-2 bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Información del Lead
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Canal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal
            </label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {Object.entries(channelLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Vehículo de interés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehículo de Interés
            </label>
            <input
              type="text"
              value={form.vehicleInterest}
              onChange={(e) =>
                setForm({ ...form, vehicleInterest: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej: Toyota Corolla 2024"
            />
          </div>

          {/* Inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inicial
            </label>
            <input
              type="number"
              value={form.initialAmount}
              onChange={(e) =>
                setForm({ ...form, initialAmount: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {Object.entries(leadStatusLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Asignado a */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignado a
            </label>
            <select
              value={form.assignedToId}
              onChange={(e) =>
                setForm({ ...form, assignedToId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Sin asignar</option>
              {users
                .filter((u) => u.role === "SALES" || u.role === "MANAGER" || u.role === "ADMIN")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              {Object.entries(priorityLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banco
            </label>
            <select
              value={form.bankId}
              onChange={(e) => setForm({ ...form, bankId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Sin banco</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Banco
            </label>
            <select
              value={form.bankStatus}
              onChange={(e) =>
                setForm({ ...form, bankStatus: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">--</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>

          {/* Motivo de pérdida (si está perdido) */}
          {form.status === "CERRADO_PERDIDO" && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de Pérdida
              </label>
              <textarea
                value={form.lossReason}
                onChange={(e) =>
                  setForm({ ...form, lossReason: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="¿Por qué se perdió este lead?"
              />
            </div>
          )}

          {/* Notas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Notas internas sobre el lead..."
            />
          </div>
        </div>
      </div>

      {/* Sidebar info */}
      <div className="space-y-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Detalles</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha Entrada</span>
              <span className="font-medium">{formatDate(lead.entryDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Último Contacto</span>
              <span className="font-medium">
                {lead.lastContact ? formatDate(lead.lastContact) : "Nunca"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Creado por</span>
              <span className="font-medium">
                {lead.createdBy?.name || "Auto (WhatsApp)"}
              </span>
            </div>
            {lead.closeDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Fecha Cierre</span>
                <span className="font-medium">{formatDate(lead.closeDate)}</span>
              </div>
            )}
            {lead.sale && (
              <div className="flex justify-between">
                <span className="text-gray-500">Venta</span>
                <span className="font-medium text-green-600">
                  ✅ Vendido
                </span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp link */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <h3 className="font-semibold text-green-900 mb-2">WhatsApp</h3>
          <a
            href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
            target="_blank"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium"
          >
            💬 Abrir WhatsApp
          </a>
        </div>

        {/* Convertir a Venta */}
        {!lead.sale && lead.status !== "CERRADO_PERDIDO" && (
          <ConvertToSale lead={lead} users={users} banks={banks} />
        )}
      </div>
    </div>
  );
}

function ConvertToSale({ lead, users, banks }: { lead: LeadFull; users: any[]; banks: any[] }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    initialPrice: lead.initialAmount || "",
    financedAmount: "",
    commission: "",
    sellerId: lead.assignedToId || "",
    channel: lead.channel,
    bankId: lead.bankId || "",
    vehicleId: "",
    notes: "",
  });
  const [vehicles, setVehicles] = useState<any[]>([]);

  async function loadVehicles() {
    const res = await fetch("/api/inventario");
    if (res.ok) setVehicles(await res.json());
  }

  async function handleConvert() {
    if (!form.initialPrice || !form.sellerId) return;
    setSaving(true);
    const res = await fetch("/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        ...form,
        initialPrice: parseFloat(form.initialPrice),
        financedAmount: form.financedAmount ? parseFloat(form.financedAmount) : null,
        commission: form.commission ? parseFloat(form.commission) : null,
      }),
    });
    if (res.ok) {
      setShow(false);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
      <h3 className="font-semibold text-green-900 mb-2">💰 ¿Cerrar Venta?</h3>
      {!show ? (
        <button
          onClick={() => { setShow(true); loadVehicles(); }}
          className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          Convertir a Venta
        </button>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-green-800">Precio Venta *</label>
              <input type="number" value={form.initialPrice} onChange={(e) => setForm({ ...form, initialPrice: e.target.value })}
                className="w-full px-2 py-1.5 border border-green-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-green-800">Financiado</label>
              <input type="number" value={form.financedAmount} onChange={(e) => setForm({ ...form, financedAmount: e.target.value })}
                className="w-full px-2 py-1.5 border border-green-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-green-800">Comisión</label>
              <input type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })}
                className="w-full px-2 py-1.5 border border-green-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-green-800">Vendedor *</label>
              <select value={form.sellerId} onChange={(e) => setForm({ ...form, sellerId: e.target.value })}
                className="w-full px-2 py-1.5 border border-green-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Seleccionar</option>
                {users.filter((u) => u.role === "SALES" || u.role === "MANAGER" || u.role === "ADMIN").map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-green-800">Vehículo (inventario)</label>
              <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                className="w-full px-2 py-1.5 border border-green-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Sin vehículo</option>
                {vehicles.filter((v: any) => v.status === "DISPONIBLE").map((v: any) => (<option key={v.id} value={v.id}>{v.brand} {v.model} {v.year}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-green-800">Banco</label>
              <select value={form.bankId} onChange={(e) => setForm({ ...form, bankId: e.target.value })}
                className="w-full px-2 py-1.5 border border-green-300 rounded text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white">
                <option value="">Sin banco</option>
                {banks.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleConvert} disabled={saving || !form.initialPrice || !form.sellerId}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
              {saving ? "Procesando..." : "✅ Confirmar Venta"}
            </button>
            <button onClick={() => setShow(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
