import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const expense = await prisma.workshopExpense.create({
    data: {
      workshopOrderId: params.id, concept: data.concept, amount: data.amount,
      category: data.category || "REPUESTOS", provider: data.provider || null,
      invoice: data.invoice || null, notes: data.notes || null,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
