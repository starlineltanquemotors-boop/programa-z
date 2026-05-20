"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Plus, Wrench, DollarSign, Edit, Trash2 } from "lucide-react";

const statusLabels: Record<string, string> = {
  DISPONIBLE: "Disponible",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  EN_TALLER: "En Taller",
  PUBLICADO: "Publicado",
};

const statusColors: Record<string, string> = {
  DISPONIBLE: "bg-green-100 text-green-700",
  RESERVADO: "bg-yellow-100 text-yellow-700",
  VENDIDO: "bg-blue-100 text-blue-700",
  EN_TALLER: "bg-orange-100 text-orange-700",
  PUBLICADO: "bg-purple-100 text-purple-700",
};

export function InventarioTable({ vehicles, orgId }: { vehicles: any[]; orgId: string }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyVehicle = {
    brand: "", model: "", year: new Date().getFullYear(), price: "", minInitial: "",
    status: "DISPONIBLE", sellerId: "", type: "", color: "", vin: "", plate: "",
    mileage: "", fuel: "", transmission: "", description: "", costPrice: "",
  };

  const [form, setForm] = useState(emptyVehicle);

  function openNew() {
    setForm(emptyVehicle);
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(v: any) {
    setForm({
      brand: v.brand, model: v.model, year: v.year, price: String(v.price),
      minInitial: v.minInitial ? String(v.minInitial) : "", status: v.status,
      sellerId: v.sellerId || "", type: v.type || "", color: v.color || "",
      vin: v.vin || "", plate: v.plate || "", mileage: v.mileage ? String(v.mileage) : "",
      fuel: v.fuel || "", transmission: v.transmission || "", description: v.description || "",
      costPrice: v.costPrice ? String(v.costPrice) : "",
    });
    setEditing(v.id);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      ...form,
      year: Number(form.year),
      price: parseFloat(form.price) || 0,
      minInitial: form.minInitial ? parseFloat(form.minInitial) : null,
      mileage: form.mileage ? parseInt(form.mileage) : null,
      costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
    };

    const url = editing ? `/api/inventario/${editing}` : "/api/inventario";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setShowForm(false);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este vehículo?")) return;
    await fetch(`/api/inventario/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" /> Agregar Vehículo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">{editing ? "Editar Vehículo" : "Nuevo Vehículo"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div><label className="text-xs font-medium">Marca *</label><input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Modelo *</label><input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Año *</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Precio *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Inicial Mínima</label><input type="number" value={form.minInitial} onChange={(e) => setForm({ ...form, minInitial: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Tipo</label><input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Sedán, SUV..." className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Color</label><input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">VIN/Chasis</label><input type="text" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Placa</label><input type="text" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Kilometraje</label><input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="text-xs font-medium">Combustible</label><select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">--</option><option value="Gasolina">Gasolina</option><option value="Diésel">Diésel</option><option value="Híbrido">Híbrido</option><option value="Eléctrico">Eléctrico</option></select></div>
            <div><label className="text-xs font-medium">Transmisión</label><select value={form.transmission} onChange={(e) => setForm({ ...form, transmission: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="">--</option><option value="Manual">Manual</option><option value="Automática">Automática</option></select></div>
            <div><label className="text-xs font-medium">Estado</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">{Object.entries(statusLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}</select></div>
            <div><label className="text-xs font-medium">Precio Costo</label><input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-1.5 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} disabled={saving || !form.brand || !form.model} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Marca</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Modelo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Año</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Inicial Mín.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Servicios</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.brand}</td>
                  <td className="px-4 py-3 text-gray-600">{v.model}</td>
                  <td className="px-4 py-3 text-gray-600">{v.year}</td>
                  <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(v.price)}</td>
                  <td className="px-4 py-3 text-gray-600">{v.minInitial ? formatCurrency(v.minInitial) : "-"}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[v.status]}`}>{statusLabels[v.status]}</span></td>
                  <td className="px-4 py-3 text-gray-600">{v.type || "-"}</td>
                  <td className="px-4 py-3">
                    {v.serviceRecords.length > 0 ? (
                      <span className="text-blue-600 text-xs">{v.serviceRecords.length} registros</span>
                    ) : <span className="text-gray-400 text-xs">Sin servicios</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(v)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No hay vehículos en inventario</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
