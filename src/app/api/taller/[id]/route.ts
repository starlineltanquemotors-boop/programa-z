import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const order = await prisma.workshopOrder.update({
    where: { id: params.id, organizationId: session.user.organizationId },
    data: {
      ...(data.clientName !== undefined && { clientName: data.clientName }),
      ...(data.clientPhone !== undefined && { clientPhone: data.clientPhone }),
      ...(data.vehicleInfo !== undefined && { vehicleInfo: data.vehicleInfo }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId || null }),
      ...(data.estimatedDelivery !== undefined && { estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null }),
      ...(data.deliveryDate !== undefined && { deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null }),
      ...(data.totalCharged !== undefined && { totalCharged: data.totalCharged }),
      ...(data.totalCost !== undefined && { totalCost: data.totalCost }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
  return NextResponse.json(order);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.workshopOrder.delete({
    where: { id: params.id, organizationId: session.user.organizationId },
  });
  return NextResponse.json({ success: true });
}
