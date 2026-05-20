import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/inventario
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vehicles = await prisma.vehicle.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      seller: { select: { id: true, name: true } },
      serviceRecords: { orderBy: { date: "desc" } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(vehicles);
}

// POST /api/inventario
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const vehicle = await prisma.vehicle.create({
    data: {
      organizationId: session.user.organizationId,
      brand: data.brand,
      model: data.model,
      year: data.year,
      price: data.price,
      minInitial: data.minInitial,
      status: data.status || "DISPONIBLE",
      sellerId: data.sellerId || null,
      type: data.type || null,
      color: data.color || null,
      vin: data.vin || null,
      plate: data.plate || null,
      mileage: data.mileage || null,
      fuel: data.fuel || null,
      transmission: data.transmission || null,
      description: data.description || null,
      costPrice: data.costPrice || null,
    },
  });

  return NextResponse.json(vehicle, { status: 201 });
}


