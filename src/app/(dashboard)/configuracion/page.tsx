import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ConfiguracionPage() {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.organizationId!;

  const [org, whatsappConfig, users] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.whatsAppConfig.findUnique({ where: { organizationId: orgId } }),
    prisma.user.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona tu cuenta, WhatsApp y usuarios</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Dealer */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Información del Concesionario</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Nombre</span>
              <span className="font-medium">{org?.name || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Plan</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">{org?.plan || "free"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Slug</span>
              <span className="font-medium text-gray-400">{org?.slug || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Creado</span>
              <span className="font-medium">{org?.createdAt ? new Date(org.createdAt).toLocaleDateString("es-DO") : "-"}</span>
            </div>
          </div>
        </div>

        {/* Configuración WhatsApp */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">WhatsApp Cloud API</h2>
          {whatsappConfig ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Estado</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${whatsappConfig.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {whatsappConfig.active ? "✅ Activo" : "❌ Inactivo"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Phone Number ID</span>
                <span className="font-medium font-mono text-xs">{whatsappConfig.phoneNumberId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">WABA ID</span>
                <span className="font-medium font-mono text-xs">{whatsappConfig.wabaId}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Webhook URL</span>
                <span className="font-medium font-mono text-xs text-blue-600">{process.env.NEXTAUTH_URL || "https://tudominio.com"}/api/webhook/whatsapp</span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                <p className="font-medium mb-1">ℹ️ Configurar en Meta Business:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600">
                  <li>Crea una app en Meta for Developers</li>
                  <li>Configura WhatsApp &gt; API Setup</li>
                  <li>Usa el Webhook URL de arriba</li>
                  <li>Usa el token de verificación configurado</li>
                  <li>Suscríbete a los eventos de "messages"</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-3">WhatsApp no está configurado</p>
              <p className="text-xs text-gray-400">
                Conecta tu WhatsApp Business API para recibir leads automáticamente
              </p>
            </div>
          )}
        </div>

        {/* Usuarios */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Usuarios del Sistema</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Rol</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Teléfono</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Creado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2 font-medium">{user.name}</td>
                    <td className="px-4 py-2 text-gray-600">{user.email}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{user.role}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{user.phone || "-"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString("es-DO")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
