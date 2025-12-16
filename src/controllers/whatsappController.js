const whatsappService = require('../services/whatsappService');
const menuService = require('../services/menuService');
const orderService = require('../services/orderService');

// Verificación del Webhook (necesario para configurar Twilio/Meta inicial)
const verifyWebhook = (req, res) => {
    res.send("Webhook activo 🚀");
};

// Manejador principal de mensajes
const receiveMessage = async (req, res) => {
    try {
        const messageBody = req.body.Body || "";
        const fromNumber = req.body.From;

        // 🧠 1. LIMPIEZA DE TEXTO (HCI: Reducción de errores)
        // Convertimos a minúsculas, quitamos tildes y espacios extra
        // Ejemplo: "Quiero el MENÚ" -> "quiero el menu"
        const incomingText = messageBody.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
            .trim();

        console.log(`📩 Mensaje limpio de ${fromNumber}: ${incomingText}`);

        // --- FLUJO DEL CHATBOT ---

        // A. SALUDO (Hola, Buenas, Inicio)
        if (['hola', 'buenas', 'hi', 'inicio', 'empezar'].some(w => incomingText.includes(w))) {
            await whatsappService.sendMessage(fromNumber, 
                "👋 *¡Bienvenido a Food Truck Delicias!*\n\n" +
                "🤖 Soy tu asistente virtual.\n\n" +
                "📋 Escribe *Menú* para ver la carta.\n" +
                "🛒 Escribe *Carrito* para ver tu pedido."
            );
        }

        // B. MOSTRAR MENÚ (Solo palabra clave 'menu' o 'carta')
        else if (incomingText === 'menu' || incomingText === 'carta') {
            const menuText = await menuService.getFormattedMenu();
            await whatsappService.sendMessage(fromNumber, menuText);
        }

        // C. VER CARRITO (Muestra índices [1], [2] para poder borrar)
        else if (incomingText === 'carrito' || incomingText === 'pedido') {
            const cart = await orderService.getCart(fromNumber);
            if (cart && cart.length > 0) {
                let msg = "🛒 *TU PEDIDO ACTUAL:*\n\n";
                let total = 0;
                
                // Mostramos índice [X] para que el usuario sepa qué borrar
                cart.forEach((item, i) => {
                    msg += `*[${i + 1}]* ${item.productName} - $${item.price.toFixed(2)}\n`;
                    total += item.price;
                });
                
                msg += `\n💰 Total: $${total.toFixed(2)}`;
                msg += `\n\n👇 *Opciones:*`;
                msg += `\n• Escribe *Pagar* para finalizar.`;
                msg += `\n• Escribe *Eliminar X* (ej: Eliminar 1) para quitar algo.`;
                msg += `\n• Escribe *Menú* para pedir más.`;
                
                await whatsappService.sendMessage(fromNumber, msg);
            } else {
                await whatsappService.sendMessage(fromNumber, "Tu carrito está vacío 🕸️\nEscribe *Menú* para pedir.");
            }
        }

        // D. ELIMINAR ITEM (Detecta "eliminar 1", "borrar 2", "quitar 1")
        else if (incomingText.startsWith('eliminar') || incomingText.startsWith('borrar') || incomingText.startsWith('quitar')) {
            const parts = incomingText.split(' ');
            const index = parts[1]; // Tomamos el número después de la palabra

            if (index && !isNaN(index)) {
                const result = await orderService.removeFromCart(fromNumber, index);

                if (result && result.success) {
                    const total = result.remainingCart.reduce((sum, item) => sum + item.price, 0);
                    await whatsappService.sendMessage(fromNumber, 
                        `🗑️ Eliminado: *${result.removedItem.productName}*\n` +
                        `💰 Nuevo Total: $${total.toFixed(2)}\n\n` +
                        `Escribe *Carrito* para ver cómo quedó.`
                    );
                } else {
                    await whatsappService.sendMessage(fromNumber, "❌ No pude borrar eso. Revisa el número en tu *Carrito*.");
                }
            } else {
                await whatsappService.sendMessage(fromNumber, "⚠️ Debes decirme el número. Ejemplo: *Eliminar 1*");
            }
        }

        // E. PEDIR COMIDA POR NÚMERO (Si escribe "1", "2"...)
        else if (/^\d+$/.test(incomingText)) {
            const index = parseInt(incomingText);
            const result = await orderService.addToCartByIndex(fromNumber, index);

            if (result) {
                const { product, session } = result;
                const total = session.cart.reduce((sum, item) => sum + item.price, 0);

                await whatsappService.sendMessage(fromNumber,
                    `✅ *${product.name}* agregado.\n` +
                    `💰 Subtotal: $${total.toFixed(2)}\n\n` +
                    `👇 Escribe otro número del menú o *Carrito* para ver tu cuenta.`
                );
            } else {
                await whatsappService.sendMessage(fromNumber, 
                    "❌ Ese número no está en el menú.\nEscribe *Menú* para ver la lista correcta."
                );
            }
        }

        // F. PAGAR (Checkout)
        else if (incomingText === 'pagar' || incomingText === 'confirmar' || incomingText === 'finalizar') {
             const cart = await orderService.getCart(fromNumber);
             if (cart && cart.length > 0) {
                 let total = 0;
                 let ticket = "🧾 *TICKET FINAL* 🧾\n\n";
                 
                 cart.forEach(item => {
                     ticket += `• ${item.productName} .. $${item.price.toFixed(2)}\n`;
                     total += item.price;
                 });
                 
                 ticket += `\n💰 *TOTAL A PAGAR: $${total.toFixed(2)}*\n\n`;
                 ticket += "🛵 Tu pedido ha sido enviado a cocina.\n¡Gracias por tu compra!";
                 
                 await whatsappService.sendMessage(fromNumber, ticket);
                 await orderService.clearCart(fromNumber); // Limpiamos la sesión
             } else {
                 await whatsappService.sendMessage(fromNumber, "🛒 El carrito está vacío. No hay nada que cobrar.");
             }
        } 
        
        // G. MENSAJE NO ENTENDIDO (Fallback)
        else {
            await whatsappService.sendMessage(fromNumber, 
                "🤔 No entendí eso.\n\n" +
                "• Escribe *Menú* para ver comida.\n" +
                "• Escribe *Carrito* para ver tu pedido."
            );
        }

        // Respuesta estándar a Twilio para evitar timeouts
        res.status(200).send('OK');

    } catch (error) {
        console.error("🔥 Error en controller:", error);
        res.status(500).send('Error interno del servidor');
    }
};

module.exports = {
    verifyWebhook,
    receiveMessage
};