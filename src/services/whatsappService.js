const fs = require('fs');
const myConsole = new console.Console(fs.createWriteStream('./logs.txt'));
const twilio = require('twilio');

class WhatsAppService {
    constructor() {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;

        if (sid && token && sid.startsWith("AC")) {
            this.client = twilio(sid, token);
            this.isConnected = true;
        } else {
            this.client = null;
            this.isConnected = false;
            console.warn("⚠️ Twilio NO configurado (SID/TOKEN faltan o inválidos). El servidor seguirá funcionando sin WhatsApp.");
        }
    }


    // 🚨 AQUÍ ESTÁ LA MAGIA: Agregamos 'mediaUrl'
    async sendMessage(to, body, mediaUrl = null) {
        if (!this.client) {
            console.warn("⚠️ sendMessage llamado pero Twilio no está configurado. No se enviará nada.");
            return;
        }

        try {
            const messageOptions = {
                from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
                to: to,
                body: body
            };

            // Si nos pasan una foto, la metemos en el paquete
            if (mediaUrl) {
                messageOptions.mediaUrl = [mediaUrl];
            }

            await this.client.messages.create(messageOptions);
            
            console.log(`📤 Mensaje enviado a ${to}`);
        } catch (error) {
            console.error(`🔥 Error enviando mensaje a ${to}:`, error);
        }
    }
}

module.exports = new WhatsAppService();