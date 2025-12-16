const twilio = require('twilio');

class WhatsAppService {
    constructor() {
        // Solo inicializa Twilio si hay credenciales reales
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            this.isConnected = true;
        } else {
            console.warn("⚠️ Modo Simulación: No hay credenciales de Twilio.");
            this.isConnected = false;
        }
    }

    async sendMessage(to, body) {
        // Si estamos en modo simulación, solo imprimimos en consola
        if (!this.isConnected) {
            console.log(`🤖 [SIMULACIÓN] Bot responde a ${to}: "${body}"`);
            return { sid: 'SIMULATED_MESSAGE' };
        }

        // Si hay credenciales, enviamos de verdad
        try {
            const message = await this.client.messages.create({
                from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
                to: to,
                body: body
            });
            console.log(`📤 Mensaje enviado a ${to}: ${message.sid}`);
            return message;
        } catch (error) {
            console.error("❌ Error enviando mensaje real:", error);
        }
    }
}

module.exports = new WhatsAppService();