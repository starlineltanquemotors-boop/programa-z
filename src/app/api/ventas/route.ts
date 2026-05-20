import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/ventas - Registrar una nueva venta
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { leadId, vehicleId, initialPrice, financedAmount, commission, sellerId, channel, bankId, notes } = data;

  // Obtener el lead para el nombre del cliente
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, organizationId: session.user.organizationId },
  });

  if (!lead) return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });

  // Calcular tiempo de cierre
  const closingTime = Math.floor(
    (Date.now() - new Date(lead.entryDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const sale = await prisma.sale.create({
    data: {
      organizationId: session.user.organizationId,
      leadId,
      vehicleId: vehicleId || null,
      clientName: lead.name,
      initialPrice: initialPrice || 0,
      financedAmount: financedAmount || null,
      commission: commission || null,
      sellerId: sellerId || session.user.id,
      channel: channel || lead.channel,
      bankId: bankId || lead.bankId || null,
      closingTime,
      notes: notes || null,
    },
  });

  // Actualizar lead a ganado
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: "CERRADO_GANADO", closeDate: new Date() },
  });

  // Si hay vehículo, marcarlo como vendido
  if (vehicleId) {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "VENDIDO" },
    });
  }

  // Crear registro post-venta
  await prisma.postSale.create({
    data: {
      organizationId: session.user.organizationId,
      saleId: sale.id,
      clientName: lead.name,
      vehicleInfo: lead.vehicleInterest || "No especificado",
      purchaseDate: new Date(),
      warrantyExpires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año garantía
      status: "EN_GARANTIA",
    },
  });

  return NextResponse.json(sale, { status: 201 });
}
