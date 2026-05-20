"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, FilterX } from "lucide-react";

interface User {
  id: string;
  name: string;
}

interface LeadsFilterProps {
  users: User[];
}

export function LeadsFilter({ users }: LeadsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/leads?${params.toString()}`);
  }

  function clearFilters() {
    router.push("/leads");
  }

  const hasFilters = Array.from(searchParams.keys()).length > 0;

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            defaultValue={searchParams.get("search") || ""}
            onChange={(e) => {
              const value = e.target.value;
              const params = new URLSearchParams(searchParams.toString());
              if (value) {
                params.set("search", value);
              } else {
                params.delete("search");
              }
              // Debounce
              const timeout = setTimeout(() => {
                router.push(`/leads?${params.toString()}`);
              }, 500);
              return () => clearTimeout(timeout);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Filtro de Estado */}
        <select
          value={searchParams.get("status") || ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="NUEVO">Nuevo</option>
          <option value="CONTACTADO">Contactado</option>
          <option value="CALIFICADO">Calificado</option>
          <option value="EN_NEGOCIACION">En Negociación</option>
          <option value="CERRADO_GANADO">Cerrado (Ganado)</option>
          <option value="CERRADO_PERDIDO">Cerrado (Perdido)</option>
        </select>

        {/* Filtro de Canal */}
        <select
          value={searchParams.get("channel") || ""}
          onChange={(e) => updateFilter("channel", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">Todos los canales</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="WEB">Web</option>
          <option value="LLAMADA">Llamada</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="OTRO">Otro</option>
        </select>

        {/* Filtro de Prioridad */}
        <select
          value={searchParams.get("priority") || ""}
          onChange={(e) => updateFilter("priority", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">Todas las prioridades</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>

        {/* Filtro de Vendedor */}
        <select
          value={searchParams.get("assignedTo") || ""}
          onChange={(e) => updateFilter("assignedTo", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">Todos los vendedores</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <FilterX className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
