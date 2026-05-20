import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const order = await prisma.workshopOrder.create({
    data: {
      organizationId: session.user.organizationId,
      vehicleId: data.vehicleId || null, clientName: data.clientName,
      clientPhone: data.clientPhone || null, vehicleInfo: data.vehicleInfo,
      description: data.description, status: data.status || "PENDIENTE",
      assignedToId: data.assignedToId || null,
      estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
      totalCharged: data.totalCharged || 0, notes: data.notes || null,
    },
  });
  return NextResponse.json(order, { status: 201 });
}
