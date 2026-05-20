import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Sembrando datos de desarrollo...");

  // 1. Crear Organización
  const org = await prisma.organization.upsert({
    where: { slug: "demo-dealer" },
    update: {},
    create: {
      name: "Demo Dealer Motors",
      slug: "demo-dealer",
      plan: "pro",
    },
  });
  console.log("✅ Organización creada:", org.name);

  // 2. Crear Usuarios
  const password = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dealer.com" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Admin Principal",
      email: "admin@dealer.com",
      password,
      role: "ADMIN",
    },
  });

  const vendedor1 = await prisma.user.upsert({
    where: { email: "carlos@dealer.com" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Carlos Rodríguez",
      email: "carlos@dealer.com",
      password,
      role: "SALES",
      phone: "809-555-0101",
    },
  });

  const vendedor2 = await prisma.user.upsert({
    where: { email: "maria@dealer.com" },
    update: {},
    create: {
      organizationId: org.id,
      name: "María Santos",
      email: "maria@dealer.com",
      password,
      role: "SALES",
      phone: "809-555-0102",
    },
  });

  const mecanico = await prisma.user.upsert({
    where: { email: "jose@dealer.com" },
    update: {},
    create: {
      organizationId: org.id,
      name: "José Méndez",
      email: "jose@dealer.com",
      password,
      role: "MECHANIC",
      phone: "809-555-0103",
    },
  });

  console.log("✅ Usuarios creados (contraseña: 123456)");

  // 3. Crear Bancos
  const bancos = await Promise.all([
    prisma.bank.create({ data: { organizationId: org.id, name: "Banco Popular", contactName: "Laura Pérez", contactPhone: "809-555-0201", branches: "Sucursal Principal, Naco, Bella Vista" } }),
    prisma.bank.create({ data: { organizationId: org.id, name: "Banreservas", contactName: "Pedro Gómez", contactPhone: "809-555-0202", branches: "Sucursal Central" } }),
    prisma.bank.create({ data: { organizationId: org.id, name: "BHD", contactName: "Ana Martínez", contactPhone: "809-555-0203" } }),
  ]);
  console.log("✅ Bancos creados");

  // 4. Crear Canales de Marketing
  await Promise.all([
    prisma.marketingChannel.create({ data: { organizationId: org.id, name: "Facebook Ads", channel: "FACEBOOK" } }),
    prisma.marketingChannel.create({ data: { organizationId: org.id, name: "Instagram Orgánico", channel: "INSTAGRAM" } }),
    prisma.marketingChannel.create({ data: { organizationId: org.id, name: "WhatsApp Business", channel: "WHATSAPP" } }),
  ]);
  console.log("✅ Canales de marketing creados");

  // 5. Crear Vehículos en Inventario
  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { organizationId: org.id, brand: "Toyota", model: "Corolla", year: 2024, price: 1250000, minInitial: 250000, status: "DISPONIBLE", type: "Sedán", color: "Blanco", vin: "JTDBR32E040012345", mileage: 0, fuel: "Gasolina", transmission: "Automática", costPrice: 1050000 } }),
    prisma.vehicle.create({ data: { organizationId: org.id, brand: "Honda", model: "CR-V", year: 2024, price: 1850000, minInitial: 370000, status: "DISPONIBLE", type: "SUV", color: "Negro", mileage: 15000, fuel: "Gasolina", transmission: "Automática", costPrice: 1600000 } }),
    prisma.vehicle.create({ data: { organizationId: org.id, brand: "Hyundai", model: "Tucson", year: 2023, price: 1450000, minInitial: 290000, status: "RESERVADO", type: "SUV", color: "Azul", mileage: 25000, fuel: "Gasolina", transmission: "Automática", sellerId: vendedor1.id, costPrice: 1200000 } }),
    prisma.vehicle.create({ data: { organizationId: org.id, brand: "Kia", model: "Sportage", year: 2024, price: 1320000, minInitial: 264000, status: "EN_TALLER", type: "SUV", color: "Rojo", mileage: 5000, fuel: "Gasolina", transmission: "Automática", costPrice: 1100000 } }),
    prisma.vehicle.create({ data: { organizationId: org.id, brand: "Nissan", model: "Sentra", year: 2024, price: 1100000, minInitial: 220000, status: "DISPONIBLE", type: "Sedán", color: "Gris", mileage: 0, fuel: "Gasolina", transmission: "Automática", costPrice: 950000 } }),
  ]);
  console.log("✅ Vehículos creados");

  // 6. Crear Leads de ejemplo
  const leads = await Promise.all([
    prisma.lead.create({ data: { organizationId: org.id, name: "Juan Pérez", phone: "809-555-1001", email: "juan@email.com", channel: "WHATSAPP", vehicleInterest: "Toyota Corolla 2024", initialAmount: 300000, assignedToId: vendedor1.id, status: "EN_NEGOCIACION", bankId: bancos[0].id, priority: "ALTA", notes: "Cliente referido, muy interesado" } }),
    prisma.lead.create({ data: { organizationId: org.id, name: "María García", phone: "809-555-1002", channel: "INSTAGRAM", vehicleInterest: "Honda CR-V", initialAmount: 400000, assignedToId: vendedor2.id, status: "CONTACTADO", priority: "MEDIA" } }),
    prisma.lead.create({ data: { organizationId: org.id, name: "Roberto Díaz", phone: "809-555-1003", channel: "FACEBOOK", vehicleInterest: "Hyundai Tucson", initialAmount: 250000, assignedToId: vendedor1.id, status: "NUEVO", priority: "BAJA" } }),
    prisma.lead.create({ data: { organizationId: org.id, name: "Laura Fernández", phone: "809-555-1004", email: "laura@email.com", channel: "WHATSAPP", vehicleInterest: "Nissan Sentra", assignedToId: vendedor2.id, status: "CALIFICADO", bankId: bancos[1].id, bankStatus: "EN_REVISION", priority: "ALTA", notes: "Esperando aprobación bancaria" } }),
    prisma.lead.create({ data: { organizationId: org.id, name: "Pedro Ramírez", phone: "809-555-1005", channel: "LLAMADA", vehicleInterest: "Kia Sportage", initialAmount: 350000, assignedToId: vendedor1.id, status: "CERRADO_GANADO", bankId: bancos[0].id, closeDate: new Date("2024-01-15"), priority: "ALTA" } }),
    prisma.lead.create({ data: { organizationId: org.id, name: "Sofía Hernández", phone: "809-555-1006", channel: "WHATSAPP", vehicleInterest: "Toyota Corolla", assignedToId: vendedor2.id, status: "CERRADO_PERDIDO", lossReason: "Se fue con la competencia por mejor precio", closeDate: new Date("2024-01-10"), priority: "MEDIA" } }),
    prisma.lead.create({ data: { organizationId: org.id, name: "Carlos Mendoza", phone: "809-555-1007", channel: "WHATSAPP", vehicleInterest: "Hyundai Tucson 2023", status: "NUEVO", priority: "MEDIA" } }),
  ]);
  console.log("✅ Leads creados");

  // 7. Crear Seguimientos
  await Promise.all([
    prisma.followUp.create({ data: { leadId: leads[0].id, organizationId: org.id, contactType: "WHATSAPP", result: "Interesado, quiere visita al dealer", nextStep: "Agendar cita para test drive", nextDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), responsibleId: vendedor1.id } }),
    prisma.followUp.create({ data: { leadId: leads[0].id, organizationId: org.id, contactType: "LLAMADA", result: "Confirmó cita para mañana", nextStep: "Preparar vehículo para prueba", nextDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), responsibleId: vendedor1.id, status: "COMPLETADO" } }),
    prisma.followUp.create({ data: { leadId: leads[1].id, organizationId: org.id, contactType: "WHATSAPP", result: "Envió fotos de la CR-V, le gustó", nextStep: "Llamar en 3 días", nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), responsibleId: vendedor2.id } }),
    prisma.followUp.create({ data: { leadId: leads[3].id, organizationId: org.id, contactType: "LLAMADA", result: "Documentos enviados al banco", nextStep: "Esperar respuesta del banco", responsibleId: vendedor2.id } }),
  ]);
  console.log("✅ Seguimientos creados");

  // 8. Crear una Venta (para el lead ganado)
  const sale = await prisma.sale.create({
    data: {
      organizationId: org.id,
      leadId: leads[4].id,
      vehicleId: vehicles[3].id,
      clientName: "Pedro Ramírez",
      initialPrice: 1320000,
      financedAmount: 970000,
      commission: 35000,
      sellerId: vendedor1.id,
      channel: "LLAMADA",
      bankId: bancos[0].id,
      saleDate: new Date("2024-01-15"),
      closingTime: 12,
    },
  });
  console.log("✅ Venta creada");

  // Actualizar vehículo a vendido y lead a ganado
  await prisma.vehicle.update({ where: { id: vehicles[3].id }, data: { status: "VENDIDO" } });

  // 9. Crear Post-Venta
  await prisma.postSale.create({
    data: {
      organizationId: org.id,
      saleId: sale.id,
      clientName: "Pedro Ramírez",
      vehicleInfo: "Kia Sportage 2024",
      purchaseDate: new Date("2024-01-15"),
      warrantyExpires: new Date("2025-01-15"),
      nextContact: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "EN_GARANTIA",
    },
  });
  console.log("✅ Post-venta creada");

  // 10. Crear Orden de Taller
  const order = await prisma.workshopOrder.create({
    data: {
      organizationId: org.id,
      vehicleId: vehicles[2].id,
      clientName: "Cliente Taller",
      clientPhone: "809-555-3001",
      vehicleInfo: "Kia Sportage 2024 Rojo",
      description: "Cambio de aceite, filtros y revisión general de frenos",
      status: "EN_PROCESO",
      assignedToId: mecanico.id,
      totalCharged: 8500,
    },
  });

  await Promise.all([
    prisma.workshopProcess.create({ data: { workshopOrderId: order.id, name: "Cambio de aceite y filtro", status: "COMPLETADO", startDate: new Date(Date.now() - 60 * 60 * 1000), endDate: new Date(Date.now() - 30 * 60 * 1000), durationMinutes: 30 } }),
    prisma.workshopProcess.create({ data: { workshopOrderId: order.id, name: "Revisión de frenos", status: "EN_PROCESO", startDate: new Date(Date.now() - 20 * 60 * 1000) } }),
    prisma.workshopExpense.create({ data: { workshopOrderId: order.id, concept: "Aceite 5W-30 Sintético", amount: 2800, category: "REPUESTOS", provider: "AutoPartes RD" } }),
    prisma.workshopExpense.create({ data: { workshopOrderId: order.id, concept: "Filtro de aceite", amount: 450, category: "REPUESTOS", provider: "AutoPartes RD" } }),
    prisma.workshopExpense.create({ data: { workshopOrderId: order.id, concept: "Mano de obra", amount: 2000, category: "MANO_DE_OBRA" } }),
  ]);
  console.log("✅ Orden de taller creada con procesos y gastos");

  console.log("\n🎉 Datos de prueba listos!");
  console.log("📧 Login: admin@dealer.com / 123456");
  console.log("👤 Vendedores: carlos@dealer.com, maria@dealer.com");
  console.log("🔧 Mecánico: jose@dealer.com");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
