"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Providers } from "@/components/Providers";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  PhoneCall,
  ShoppingCart,
  Car,
  Wrench,
  Heart,
  Building2,
  Megaphone,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Seguimiento", href: "/seguimiento", icon: PhoneCall },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Inventario", href: "/inventario", icon: Car },
  { name: "Post-Venta", href: "/postventa", icon: Heart },
  { name: "Bancos", href: "/bancos", icon: Building2 },
  { name: "Marketing", href: "/marketing", icon: Megaphone },
  { name: "Vendedores", href: "/vendedores", icon: UserCheck },
  { name: "Taller", href: "/taller", icon: Wrench },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/80"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <div className="flex items-center gap-2">
                <Car className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-lg">DealerCRM</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r">
          <div className="flex items-center gap-2 h-16 px-6 border-b">
            <Car className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">DealerCRM</span>
          </div>
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center gap-x-4 bg-white border-b px-4 h-16 shadow-sm">
          <button
            className="lg:hidden -ml-2 p-2 text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <button className="p-2 text-gray-400 hover:text-gray-500">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name || "Usuario"}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user?.organizationName || "Dealer"}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-gray-400 hover:text-red-500 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
