import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/leads/[id]/followups - Actualizar estado de un follow-up
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: followUpId, status } = await req.json();

  const followUp = await prisma.followUp.update({
    where: { id: followUpId },
    data: { status },
  });

  return NextResponse.json(followUp);
}
