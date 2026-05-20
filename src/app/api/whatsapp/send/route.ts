import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/whatsapp/send - Enviar mensaje de WhatsApp
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, message, leadId } = await req.json();

  if (!to || !message) {
    return NextResponse.json({ error: "to y message son requeridos" }, { status: 400 });
  }

  // Obtener configuración de WhatsApp
  const config = await prisma.whatsAppConfig.findUnique({
    where: { organizationId: session.user.organizationId },
  });

  if (!config || !config.active) {
    return NextResponse.json({ error: "WhatsApp no configurado" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const result = await response.json();

    // Guardar mensaje enviado
    await prisma.whatsAppMessage.create({
      data: {
        organizationId: session.user.organizationId,
        fromNumber: config.phoneNumberId,
        toNumber: to,
        message,
        direction: "outbound",
        status: response.ok ? "sent" : "failed",
        metaMessageId: result.messages?.[0]?.id,
        leadId: leadId || null,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
