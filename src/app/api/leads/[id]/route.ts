import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/leads/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, organizationId: session.user.organizationId },
    include: {
      assignedTo: { select: { id: true, name: true } },
      bank: { select: { id: true, name: true } },
      followUps: {
        include: { responsible: { select: { id: true, name: true } } },
        orderBy: { contactDate: "desc" },
      },
      sale: true,
    },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

// PATCH /api/leads/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const lead = await prisma.lead.update({
    where: { id: params.id, organizationId: session.user.organizationId },
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      channel: data.channel,
      vehicleInterest: data.vehicleInterest || null,
      initialAmount: data.initialAmount || null,
      assignedToId: data.assignedToId || null,
      status: data.status,
      bankId: data.bankId || null,
      bankStatus: data.bankStatus || null,
      priority: data.priority,
      notes: data.notes || null,
      lossReason: data.lossReason || null,
      closeDate: data.closeDate ? new Date(data.closeDate) : null,
      lastContact:
        data.status !== lead.status || data.notes !== lead.notes
          ? new Date()
          : lead.lastContact,
    },
  });

  return NextResponse.json(lead);
}

// DELETE /api/leads/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.lead.delete({
    where: { id: params.id, organizationId: session.user.organizationId },
  });

  return NextResponse.json({ success: true });
}

// POST /api/leads/[id]/followups
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  const followUp = await prisma.followUp.create({
    data: {
      leadId: params.id,
      organizationId: session.user.organizationId,
      contactType: data.contactType,
      result: data.result || null,
      nextStep: data.nextStep || null,
      nextDate: data.nextDate ? new Date(data.nextDate) : null,
      responsibleId: data.responsibleId,
      notes: data.notes || null,
    },
  });

  // Actualizar lastContact del lead
  await prisma.lead.update({
    where: { id: params.id },
    data: { lastContact: new Date() },
  });

  return NextResponse.json(followUp);
}
