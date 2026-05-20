import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const process = await prisma.workshopProcess.create({
    data: {
      workshopOrderId: params.id, name: data.name,
      description: data.description || null, mechanicId: data.mechanicId || null,
    },
  });
  return NextResponse.json(process, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: processId, status, startDate, endDate } = await req.json();
  const process = await prisma.workshopProcess.update({
    where: { id: processId },
    data: {
      status,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(startDate && endDate && {
        durationMinutes: Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 60000),
      }),
    },
  });
  return NextResponse.json(process);
}
