import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/inventario/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const vehicle = await prisma.vehicle.update({
    where: { id: params.id, organizationId: session.user.organizationId },
    data: {
      brand: data.brand, model: data.model, year: data.year, price: data.price,
      minInitial: data.minInitial, status: data.status,
      sellerId: data.sellerId || null, type: data.type || null,
      color: data.color || null, vin: data.vin || null, plate: data.plate || null,
      mileage: data.mileage || null, fuel: data.fuel || null,
      transmission: data.transmission || null, description: data.description || null,
      costPrice: data.costPrice || null,
    },
  });
  return NextResponse.json(vehicle);
}

// DELETE /api/inventario/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.vehicle.delete({
    where: { id: params.id, organizationId: session.user.organizationId },
  });
  return NextResponse.json({ success: true });
}
