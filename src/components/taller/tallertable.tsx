"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Plus, Edit, Trash2, Wrench, DollarSign, Clock, CheckCircle, XCircle, Play, ChevronDown, ChevronUp } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente", EN_PROCESO: "En Proceso",
  EN_ESPERA_REPUESTOS: "Espera Repuestos", LISTO: "Listo",
  ENTREGADO: "Entregado", CANCELADO: "Cancelado",
};

const statusColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-700", EN_PROCESO: "bg-blue-100 text-blue-700",
  EN_ESPERA_REPUESTOS: "bg-orange-100 text-orange-700", LISTO: "bg-green-100 text-green-700",
  ENTREGADO: "bg-gray-100 text-gray-700", CANCELADO: "bg-red-100 text-red-700",
};

const processStatusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente", EN_PROCESO: "En Proceso", COMPLETADO: "Completado",
};

export function TallerTable({ orders, vehicles, users, orgId }: { orders: any[]; vehicles: any[]; users: any[]; orgId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "processes" | "expenses">("info");

  const mechanics = users.filter((u) => u.role === "MECHANIC" || u.role === "ADMIN" || u.role === "MANAGER");

  const emptyOrder = {
    vehicleId: "", clientName: "", clientPhone: "", vehicleInfo: "",
    description: "", status: "PENDIENTE", assignedToId: "",
    estimatedDelivery: "", totalCharged: "", notes: "",
  };

  const [form, setForm] = useState(emptyOrder);

  // Formulario de nuevo proceso
  const [processForm, setProcessForm] = useState({ name: "", description: "", mechanicId: "" });

  // Formulario de nuevo gasto
  const [expenseForm, setExpenseForm] = useState({
    concept: "", amount: "", category: "REPUESTOS", provider: "", invoice: "", notes: "",
  });

  function openNew() { setForm(emptyOrder); setEditing(null); setShowForm(true); }
  function openEdit(o: any) {
    setForm({
      vehicleId: o.vehicleId || "", clientName: o.clientName, clientPhone: o.clientPhone || "",
      vehicleInfo: o.vehicleInfo, description: o.description, status: o.status,
      assignedToId: o.assignedToId || "", estimatedDelivery: o.estimatedDelivery ? o.estimatedDelivery.slice(0, 16) : "",
      totalCharged: o.totalCharged ? String(o.totalCharged) : "", notes: o.notes || "",
    });
    setEditing(o.id); setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      totalCharged: form.totalCharged ? parseFloat(form.totalCharged) : 0,
      estimatedDelivery: form.estimatedDelivery ? new Date(form.estimatedDelivery).toISOString() : null,
    };
    const url = editing ? `/api/taller/${editing}` : "/api/taller";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setShowForm(false); router.refresh(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta orden de taller?")) return;
    await fetch(`/api/taller/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/taller/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...(status === "ENTREGADO" ? { deliveryDate: new Date().toISOString() } : {}) }),
    });
    router.refresh();
  }

  async function handleAddProcess(orderId: string) {
    if (!processForm.name) return;
    await fetch(`/api/taller/${orderId}/processes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(processForm),
    });
    setProcessForm({ name: "", description: "", mechanicId: "" });
    router.refresh();
  }

  async function handleProcessStatus(processId: string, orderId: string, status: string) {
    await fetch(`/api/taller/${orderId}/processes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: processId, status, ...(status === "COMPLETADO" ? { endDate: new Date().toISOString() } : { startDate: new Date().toISOString() }) }),
    });
    router.refresh();
  }

  async function handleAddExpense(orderId: string) {
    if (!expenseForm.concept || !expenseForm.amount) return;
    await fetch(`/api/taller/${orderId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...expenseForm, amount: parseFloat(expenseForm.amount) }),
    });
    setExpenseForm({ concept: "", amount: "", category: "REPUESTOS", provider: "", invoice: "", notes: "" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
        <Plus className="w-4 h-4" /> Nueva Orden de Taller
      </button>

      {/* Formulario Nueva/Editar Orden */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">{editing ? "Editar Orden" : "Nueva Orden de Taller"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><label className="text-xs font-medium">Cliente *</label><input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Teléfono</label><input type="text" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Vehículo Info *</label><input type="text" value={form.vehicleInfo} onChange={(e) => setForm({ ...form, vehicleInfo: e.target.value })} placeholder="Marca Modelo Año Placa" className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Vehículo (inventario)</label><select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Seleccionar</option>{vehicles.map((v: any) => (<option key={v.id} value={v.id}>{v.brand} {v.model} {v.year} {v.plate ? `- ${v.plate}` : ""}</option>))}</select></div>
            <div><label className="text-xs font-medium">Asignar Mecánico</label><select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">Sin asignar</option>{mechanics.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}</select></div>
            <div><label className="text-xs font-medium">Estado</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">{Object.entries(statusLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}</select></div>
            <div><label className="text-xs font-medium">Entrega Estimada</label><input type="datetime-local" value={form.estimatedDelivery} onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Cobro Total</label><input type="number" value={form.totalCharged} onChange={(e) => setForm({ ...form, totalCharged: e.target.value })} placeholder="0.00" className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="md:col-span-2"><label className="text-xs font-medium">Descripción del Trabajo *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="md:col-span-2"><label className="text-xs font-medium">Notas</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving || !form.clientName || !form.vehicleInfo || !form.description} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista de Órdenes */}
      <div className="space-y-3">
        {orders.map((order) => {
          const isExpanded = expandedId === order.id;
          const totalCost = order.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
          const margin = order.totalCharged - totalCost;

          return (
            <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-gray-100 rounded-lg"><Wrench className="w-5 h-5 text-gray-600" /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><p className="font-medium text-gray-900">{order.clientName}</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>{statusLabels[order.status]}</span></div>
                    <p className="text-sm text-gray-500 truncate">{order.vehicleInfo} — {order.description.substring(0, 60)}{order.description.length > 60 ? "..." : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="hidden sm:block text-right">
                    <p className="text-gray-500">Procesos: {order.processes.length}</p>
                    <p className="text-xs text-gray-400">Entrada: {formatDate(order.entryDate)}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.totalCharged)}</p>
                    <p className={`text-xs ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>Costo: {formatCurrency(totalCost)} | {margin >= 0 ? "+" : ""}{formatCurrency(margin)}</p>
                  </div>
                  <div className="flex gap-1">
                    {order.status === "PENDIENTE" && (
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, "EN_PROCESO"); }} className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition" title="Iniciar"><Play className="w-4 h-4" /></button>
                    )}
                    {order.status === "EN_PROCESO" && (
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, "LISTO"); }} className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition" title="Marcar Listo"><CheckCircle className="w-4 h-4" /></button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); openEdit(order); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"><Edit className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t bg-gray-50">
                  {/* Tabs */}
                  <div className="flex border-b bg-white px-4">
                    {["info", "processes", "expenses"].map((tab) => (
                      <button key={tab} onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                        {tab === "info" ? "Detalles" : tab === "processes" ? `Procesos (${order.processes.length})` : `Gastos (${order.expenses.length})`}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {/* Info Tab */}
                    {activeTab === "info" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500">Cliente</p><p className="font-medium">{order.clientName}</p></div>
                        <div><p className="text-gray-500">Teléfono</p><p className="font-medium">{order.clientPhone || "-"}</p></div>
                        <div><p className="text-gray-500">Vehículo</p><p className="font-medium">{order.vehicleInfo}</p></div>
                        <div><p className="text-gray-500">Mecánico</p><p className="font-medium">{order.assignedTo?.name || "Sin asignar"}</p></div>
                        <div><p className="text-gray-500">F. Entrada</p><p className="font-medium">{formatDateTime(order.entryDate)}</p></div>
                        <div><p className="text-gray-500">Entrega Est.</p><p className="font-medium">{order.estimatedDelivery ? formatDateTime(order.estimatedDelivery) : "-"}</p></div>
                        <div><p className="text-gray-500">Entrega Real</p><p className="font-medium">{order.deliveryDate ? formatDateTime(order.deliveryDate) : "-"}</p></div>
                        <div><p className="text-gray-500">Margen</p><p className={`font-medium ${margin >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(margin)}</p></div>
                        {order.notes && <div className="col-span-full"><p className="text-gray-500">Notas</p><p className="text-gray-700">{order.notes}</p></div>}
                      </div>
                    )}

                    {/* Processes Tab */}
                    {activeTab === "processes" && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <input type="text" placeholder="Nombre del proceso" value={processForm.name} onChange={(e) => setProcessForm({ ...processForm, name: e.target.value })}
                            className="px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 w-48" />
                          <select value={processForm.mechanicId} onChange={(e) => setProcessForm({ ...processForm, mechanicId: e.target.value })}
                            className="px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="">Mecánico</option>
                            {mechanics.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                          </select>
                          <button onClick={() => handleAddProcess(order.id)} disabled={!processForm.name} className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition">
                            <Plus className="w-4 h-4 inline mr-1" />Agregar Proceso
                          </button>
                        </div>

                        {order.processes.length === 0 ? (
                          <p className="text-gray-400 text-sm py-4">No hay procesos registrados</p>
                        ) : (
                          <div className="space-y-2">
                            {order.processes.map((p: any) => {
                              const duration = p.startDate && p.endDate
                                ? Math.round((new Date(p.endDate).getTime() - new Date(p.startDate).getTime()) / 60000)
                                : null;
                              return (
                                <div key={p.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "COMPLETADO" ? "bg-green-100 text-green-700" : p.status === "EN_PROCESO" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{processStatusLabels[p.status]}</span>
                                    <div>
                                      <p className="font-medium text-sm">{p.name}</p>
                                      {duration && <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{duration} min</p>}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    {p.status === "PENDIENTE" && (
                                      <button onClick={() => handleProcessStatus(p.id, order.id, "EN_PROCESO")} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200">Iniciar</button>
                                    )}
                                    {p.status === "EN_PROCESO" && (
                                      <button onClick={() => handleProcessStatus(p.id, order.id, "COMPLETADO")} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">Completar</button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expenses Tab */}
                    {activeTab === "expenses" && (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <input type="text" placeholder="Concepto" value={expenseForm.concept} onChange={(e) => setExpenseForm({ ...expenseForm, concept: e.target.value })}
                            className="px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 w-40" />
                          <input type="number" placeholder="Monto" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                            className="px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 w-28" />
                          <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                            className="px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                            <option value="REPUESTOS">Repuestos</option><option value="MANO_DE_OBRA">Mano de Obra</option><option value="HERRAMIENTAS">Herramientas</option><option value="EXTERNO">Externo</option><option value="OTRO">Otro</option>
                          </select>
                          <input type="text" placeholder="Proveedor" value={expenseForm.provider} onChange={(e) => setExpenseForm({ ...expenseForm, provider: e.target.value })}
                            className="px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 w-32" />
                          <button onClick={() => handleAddExpense(order.id)} disabled={!expenseForm.concept || !expenseForm.amount} className="px-3 py-1.5 bg-orange-600 text-white rounded text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition">
                            <DollarSign className="w-4 h-4 inline mr-1" />Agregar Gasto
                          </button>
                        </div>

                        {order.expenses.length === 0 ? (
                          <p className="text-gray-400 text-sm py-4">No hay gastos registrados</p>
                        ) : (
                          <div className="bg-white rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead><tr className="bg-gray-50 border-b"><th className="text-left px-3 py-2 font-medium text-gray-600">Concepto</th><th className="text-left px-3 py-2 font-medium text-gray-600">Categoría</th><th className="text-left px-3 py-2 font-medium text-gray-600">Proveedor</th><th className="text-right px-3 py-2 font-medium text-gray-600">Monto</th><th className="text-left px-3 py-2 font-medium text-gray-600">Fecha</th></tr></thead>
                              <tbody className="divide-y">
                                {order.expenses.map((e: any) => (
                                  <tr key={e.id}><td className="px-3 py-2">{e.concept}</td><td className="px-3 py-2 text-gray-600">{e.category.replace(/_/g, " ")}</td><td className="px-3 py-2 text-gray-600">{e.provider || "-"}</td><td className="px-3 py-2 text-right font-medium text-red-600">{formatCurrency(e.amount)}</td><td className="px-3 py-2 text-gray-500 text-xs">{formatDate(e.date)}</td></tr>
                                ))}
                                <tr className="bg-gray-50 font-medium"><td colSpan={3} className="px-3 py-2 text-right">Total Gastos:</td><td className="px-3 py-2 text-right text-red-600">{formatCurrency(totalCost)}</td><td></td></tr>
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {orders.length === 0 && <div className="bg-white rounded-xl border p-12 text-center text-gray-400">No hay órdenes de taller</div>}
      </div>
    </div>
  );
}
