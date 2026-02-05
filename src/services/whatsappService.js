const twilio = require('twilio');

class WhatsAppService {
    constructor() {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;

        this.client = null;
        this.isConnected = false;

        // Verificamos que existan las credenciales antes de iniciar
        if (sid && token && sid.startsWith("AC")) {
            try {
                this.client = twilio(sid, token);
                this.isConnected = true;
                // console.log("✅ Servicio de WhatsApp listo."); 
            } catch (error) {
                console.error("🔥 Error iniciando cliente de Twilio:", error);
            }
        } else {
            console.warn("⚠️ Twilio NO configurado (Faltan SID/TOKEN en .env).");
        }
    }

    // 📩 Función para enviar mensajes (Texto o Imagen)
    async sendMessage(to, body, mediaUrl = null) {
        if (!this.isConnected || !this.client) {
            console.warn("⚠️ Intento de envío fallido: Twilio no está conectado.");
            return;
        }

        try {
            // Lógica de seguridad para el número del Bot
            let fromNumber = process.env.TWILIO_PHONE_NUMBER;
            // Si en el .env pusiste solo el número (+1415...), le agregamos 'whatsapp:'
            if (fromNumber && !fromNumber.includes('whatsapp:')) {
                fromNumber = `whatsapp:${fromNumber}`;
            }

            const messageOptions = {
                from: fromNumber,
                to: to, // El número del usuario ya suele venir con 'whatsapp:' desde el controller
                body: body
            };

            // 📸 LA MAGIA: Si nos pasan una URL, la agregamos
            if (mediaUrl) {
                messageOptions.mediaUrl = [mediaUrl];
            }

            await this.client.messages.create(messageOptions);
            
            console.log(`📤 Mensaje enviado a ${to} ${mediaUrl ? '📸 (Con Imagen)' : ''}`);

        } catch (error) {
            console.error(`🔥 Error fatal enviando mensaje a ${to}:`, error.message);
        }
    }
}

// Exportamos la instancia directamente para usarla como "whatsappService.sendMessage()"
module.exports = new WhatsAppService();