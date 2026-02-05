const whatsappService = require('../services/whatsappService');
const openaiService = require('../services/openaiService');

const verifyWebhook = (req, res) => res.send("Webhook activo 🚀");

const receiveMessage = async (req, res) => {
    try {
        const messageBody = req.body.Body || "";
        const fromNumber = req.body.From;

        console.log(`📩 User: ${messageBody}`);

        // ¡YA NO HAY IF/ELSE GIGANTES! 
        // Le pasamos TODO a la IA y ella decide qué función ejecutar.
        const aiResponse = await openaiService.handleOpenAIResponse(messageBody, fromNumber);
        
        await whatsappService.sendMessage(fromNumber, aiResponse);
        
        res.status(200).send('OK');
    } catch (error) {
        console.error("🔥 Error:", error);
        res.status(500).send('Error');
    }
};

module.exports = { verifyWebhook, receiveMessage };