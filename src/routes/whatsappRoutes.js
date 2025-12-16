const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Ruta GET para verificar en el navegador
router.get('/webhook', whatsappController.verifyWebhook);

// Ruta POST donde Twilio manda los mensajes
router.post('/webhook', whatsappController.receiveMessage);

module.exports = router;