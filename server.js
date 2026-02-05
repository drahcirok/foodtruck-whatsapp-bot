require('dotenv').config(); // 1. Cargar variables de entorno primero
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db'); // Importar conexión a DB
const { replyWithAI } = require("./src/ai/openaiClient");

// 2. Inicializar la Base de Datos
if (process.env.MONGODB_URI && process.env.MONGODB_URI.startsWith("mongodb")) {
  connectDB();
} else {
  console.warn("⚠️ MongoDB NO configurado. El servidor seguirá sin base de datos.");
}


const app = express();

// 3. Middlewares (Configuración del servidor)
app.use(cors()); // Permite conexiones externas (útil si haces un frontend luego)
app.use(express.json()); // Para recibir datos en formato JSON
app.use(express.urlencoded({ extended: true })); // CRUCIAL para que Twilio funcione (envía datos como formularios)

// 4. Rutas
// Ruta base para verificar que el servidor vive
app.get('/', (req, res) => {
    res.json({ 
        message: '🤖 Food Truck Bot API funcionando correctamente', 
        status: 'Online',
        timestamp: new Date()
    });
});

app.get("/ai-test", async (req, res) => {
  if (process.env.AI_ENABLED !== "true") {
    return res.status(400).json({ error: "AI_DISABLED" });
  }

  const q = req.query.q || "Hola, ¿qué vendes hoy?";
  const ai = await replyWithAI(String(q), "Comandos: MENU, CARRITO, TOTAL, PEDIDO, AYUDA");
  res.json({ question: q, answer: ai });
});

// Ruta principal del Chatbot (conecta con lo que hicimos en FASE 2)
app.use('/whatsapp', require('./src/routes/whatsappRoutes'));

// 5. Manejo de errores global (Buenas prácticas)
app.use((err, req, res, next) => {
    console.error("🔥 Error no controlado:", err.stack);
    res.status(500).send('Algo salió mal en el servidor.');
});

// 6. Arrancar el Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📡 Esperando mensajes en: http://localhost:${PORT}/whatsapp/webhook`);
});