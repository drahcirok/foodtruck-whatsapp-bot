const fs = require('fs');
const myConsole = new console.Console(fs.createWriteStream('./logs.txt'));
const twilio = require('twilio');

class WhatsAppService {
    constructor() {
        this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        this.isConnected = true; 
    }

    // 🚨 AQUÍ ESTÁ LA MAGIA: Agregamos 'mediaUrl'
    async sendMessage(to, body, mediaUrl = null) {
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