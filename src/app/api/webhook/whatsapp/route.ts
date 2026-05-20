import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * WhatsApp Cloud API Webhook
 * 
 * Maneja:
 * - Verificación del webhook (GET)
 * - Mensajes entrantes de WhatsApp (POST)
 * - Auto-registro de leads desde WhatsApp
 */

// GET: Verificación del webhook de Meta
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token) {
    // Buscar organización por webhook token
    const config = await prisma.whatsAppConfig.findFirst({
      where: { webhookVerifyToken: token, active: true },
    });

    if (config) {
      return new Response(challenge, { status: 200 });
    }
  }

  return new Response("Verification failed", { status: 403 });
}

// POST: Recibir mensajes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verificar que es una notificación de mensaje
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ok" });
    }

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;

        const value = change.value;
        if (!value.messages || value.messages.length === 0) continue;

        const metadata = value.metadata;
        const phoneNumberId = metadata?.phone_number_id;

        // Buscar la configuración de WhatsApp para este número
        const config = await prisma.whatsAppConfig.findFirst({
          where: { phoneNumberId, active: true },
        });

        if (!config) continue;

        for (const message of value.messages) {
          if (message.type !== "text") continue; // Solo procesamos texto por ahora

          const fromNumber = message.from;
          const msgText = message.text?.body || "";
          const msgId = message.id;
          const profileName = value.contacts?.find(
            (c: any) => c.wa_id === fromNumber.replace(/\D/g, "")
          )?.profile?.name;

          // Guardar mensaje en base de datos
          await prisma.whatsAppMessage.create({
            data: {
              organizationId: config.organizationId,
              fromNumber,
              toNumber: phoneNumberId,
              message: msgText,
              direction: "inbound",
              metaMessageId: msgId,
            },
          });

          // Verificar si ya existe un lead para este número
          let lead = await prisma.lead.findFirst({
            where: {
              organizationId: config.organizationId,
              phone: fromNumber,
            },
            orderBy: { createdAt: "desc" },
          });

          if (!lead) {
            // Crear nuevo lead automáticamente
            lead = await prisma.lead.create({
              data: {
                organizationId: config.organizationId,
                name: profileName || `Cliente ${fromNumber.slice(-6)}`,
                phone: fromNumber,
                channel: "WHATSAPP",
                sourceMessage: msgText,
                sourceMessageId: msgId,
                notes: `Lead creado automáticamente desde WhatsApp. Primer mensaje: "${msgText.substring(0, 200)}"`,
              },
            });

            // Enviar respuesta automática
            await sendAutoReply(
              phoneNumberId,
              fromNumber,
              config.accessToken,
              lead.name
            );
          } else {
            // Actualizar lead existente con nuevo mensaje
            await prisma.lead.update({
              where: { id: lead.id },
              data: {
                notes: lead.notes
                  ? `${lead.notes}\n\nNuevo mensaje (${new Date().toLocaleString()}): "${msgText.substring(0, 200)}"`
                  : `Nuevo mensaje: "${msgText.substring(0, 200)}"`,
              },
            });
          }

          // Actualizar referencia en el mensaje
          await prisma.whatsAppMessage.updateMany({
            where: { metaMessageId: msgId },
            data: { leadId: lead.id },
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "ok" }); // Siempre responder 200 a Meta
  }
}

async function sendAutoReply(
  phoneNumberId: string,
  to: string,
  accessToken: string,
  clientName: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: {
            body: `¡Hola ${clientName}! 👋\n\nGracias por contactarnos. Hemos recibido tu mensaje y un asesor te atenderá pronto.\n\nMientras tanto, ¿nos puedes decir qué vehículo te interesa? 🚗`,
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error sending auto reply:", error);
    return false;
  }
}
