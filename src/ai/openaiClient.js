const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function replyWithAI(userText, extraContext = "") {
  try {
    const response = await client.responses.create({
      model: "gpt-5.2",
      instructions: `
Eres un asistente de WhatsApp para un Food Truck.
Responde en español, corto, claro y amigable.
Si el usuario se equivoca, sugiere: MENU, CARRITO, TOTAL, PEDIDO, AYUDA.
No inventes precios ni productos.
      `,
      input: `CONTEXTO:\n${extraContext}\n\nUSUARIO:\n${userText}`
    });

    return response.output_text?.trim() || "No pude responder.";
    
  } catch (error) {
    console.error("Error IA:", error);
    return "Ups 😅 hubo un problema con la IA.";
  }
}

module.exports = { replyWithAI };

