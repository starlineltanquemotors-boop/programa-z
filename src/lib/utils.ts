import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function daysBetween(a: Date, b: Date): number {
  const diff = Math.abs(a.getTime() - b.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const channelLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  WEB: "Web",
  LLAMADA: "Llamada",
  PRESENCIAL: "Presencial",
  OTRO: "Otro",
};

export const leadStatusLabels: Record<string, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  CALIFICADO: "Calificado",
  EN_NEGOCIACION: "En Negociación",
  CERRADO_GANADO: "Cerrado (Ganado)",
  CERRADO_PERDIDO: "Cerrado (Perdido)",
};

export const priorityLabels: Record<string, string> = {
  ALTA: "Alta",
  MEDIA: "Media",
  BAJA: "Baja",
};

export const priorityColors: Record<string, string> = {
  ALTA: "bg-red-100 text-red-800",
  MEDIA: "bg-yellow-100 text-yellow-800",
  BAJA: "bg-green-100 text-green-800",
};

export const leadStatusColors: Record<string, string> = {
  NUEVO: "bg-blue-100 text-blue-800",
  CONTACTADO: "bg-indigo-100 text-indigo-800",
  CALIFICADO: "bg-purple-100 text-purple-800",
  EN_NEGOCIACION: "bg-orange-100 text-orange-800",
  CERRADO_GANADO: "bg-green-100 text-green-800",
  CERRADO_PERDIDO: "bg-red-100 text-red-800",
};
