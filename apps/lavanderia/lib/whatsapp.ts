// Integração com a WhatsApp Cloud API (Meta) para avisar o cliente
// automaticamente quando a roupa fica pronta.
//
// Configuração necessária (.env.local):
//   WHATSAPP_TOKEN            -> token de acesso permanente do app da Meta
//   WHATSAPP_PHONE_NUMBER_ID  -> ID do número de telefone comercial
//
// Guia rápido: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

export async function sendWhatsAppMessage(to: string, message: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.warn(
      "[whatsapp] WHATSAPP_TOKEN/WHATSAPP_PHONE_NUMBER_ID não configurados — mensagem não enviada."
    );
    return { skipped: true };
  }

  const digits = to.replace(/\D/g, "");
  const toNumber = digits.startsWith("55") ? digits : `55${digits}`;

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toNumber,
        type: "text",
        text: { body: message },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Falha ao enviar WhatsApp: ${res.status} ${errText}`);
  }

  return res.json();
}

export function buildReadyMessage(params: {
  customerName: string;
  orderId: string;
  hotelName?: string;
}) {
  const hotel = params.hotelName ?? "LavaPronto";
  return `Olá, ${params.customerName}! 👋 Sua roupa já está pronta para retirada (pedido #${params.orderId.slice(
    0,
    8
  )}). Pode passar na lavanderia do ${hotel} quando quiser. Obrigado pela preferência!`;
}

export function buildFoodReadyMessage(params: {
  customerName: string;
  orderId: string;
  roomNumber?: string;
  hotelName?: string;
}) {
  const hotel = params.hotelName ?? "Hotel Araguaia Palace";
  const room = params.roomNumber ? ` (quarto ${params.roomNumber})` : "";
  return `Olá, ${params.customerName}! 🍕 Seu pedido${room} já está pronto e a caminho (pedido #${params.orderId.slice(
    0,
    8
  )}). Bom apetite! — ${hotel}`;
}
