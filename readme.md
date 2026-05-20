# 🚗 DealerCRM

CRM especializado para concesionarios de vehículos con integración de WhatsApp, Instagram y Facebook.

## ✨ Funcionalidades

- 📥 **Captación de Leads** — Auto-registro desde WhatsApp/Facebook/Instagram
- 📞 **Seguimiento** — Pipeline de ventas con recordatorios
- 💰 **Ventas** — Registro de ventas con métricas de cierre
- 🚗 **Inventario** — Gestión de vehículos con historial de servicios
- 🔧 **Taller Mecánico** — Órdenes, procesos y control de gastos
- ❤️ **Post-Venta** — Seguimiento de garantías y mantenimiento
- 🏦 **Bancos** — Control de solicitudes y tasa de aprobación
- 📊 **Marketing** — Rendimiento por canal (leads, ventas, conversión)
- 👥 **Vendedores** — Métricas individuales y comisiones
- 📈 **Dashboard** — KPIs en tiempo real

## 🛠️ Stack

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS, Radix UI
- **Backend:** Next.js API Routes, NextAuth.js, Prisma ORM
- **Base de datos:** PostgreSQL
- **Integraciones:** Meta WhatsApp Cloud API

## 🚀 Instalación

```bash
# 1. Clonar
git clone <repo-url>
cd dealer-crm

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales:
#   - DATABASE_URL (PostgreSQL)
#   - NEXTAUTH_SECRET
#   - ENCRYPTION_KEY

# 4. Configurar base de datos
npm run db:push        # Crear tablas
npm run db:seed        # Datos demo (opcional)

# 5. Iniciar
npm run dev
```

Accede en `http://localhost:3000`

### Login demo
- **Email:** admin@dealer.com
- **Contraseña:** 123456

## 📱 Configuración WhatsApp

1. Crea una app en [Meta for Developers](https://developers.facebook.com/)
2. Configura WhatsApp > API Setup
3. Obtén: Phone Number ID, WABA ID, Access Token
4. Configura el webhook en la sección de Configuración del CRM
5. URL del webhook: `https://tudominio.com/api/webhook/whatsapp`

## 📁 Estructura

```
src/
├── app/
│   ├── (auth)/login/           # Autenticación
│   ├── (dashboard)/            # Panel principal
│   │   ├── dashboard/          # KPIs y métricas
│   │   ├── leads/              # Captación y pipeline
│   │   ├── seguimiento/        # Seguimiento de leads
│   │   ├── ventas/             # Registro de ventas
│   │   ├── inventario/         # Gestión de vehículos
│   │   ├── taller/             # Taller mecánico
│   │   ├── postventa/          # Post-venta
│   │   ├── bancos/             # Gestión de bancos
│   │   ├── marketing/          # Canales de marketing
│   │   ├── vendedores/         # Métricas por vendedor
│   │   └── configuracion/      # Configuración del sistema
│   └── api/                    # API REST
├── components/                 # Componentes React
├── lib/                        # Utilidades (db, auth, utils)
└── prisma/                     # Schema y seed
```

## 📄 Licencia

Propietario — Todos los derechos reservados.
