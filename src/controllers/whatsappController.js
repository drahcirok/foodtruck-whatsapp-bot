const whatsappService = require('../services/whatsappService');
const menuService = require('../services/menuService');
const orderService = require('../services/orderService');

const verifyWebhook = (req, res) => {
    res.send("Webhook activo 🚀");
};

const receiveMessage = async (req, res) => {
    try {
        const messageBody = req.body.Body || "";
        const fromNumber = req.body.From;

        // Limpieza de texto
        const incomingText = messageBody.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
            .trim();

        console.log(`📩 Mensaje de ${fromNumber}: ${incomingText}`);

        // A. SALUDO (Con Imagen)
        if (['hola', 'buenas', 'hi', 'inicio'].some(w => incomingText.includes(w))) {
            
            // Usamos una URL de imagen estable (Fries & Burger)
            const welcomeImage = "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1000";

            const welcomeMessage = 
                "🌟 *¡Bienvenido a Food Truck Delicias!* 🌟\n\n" +
                "🍔 *Las mejores hamburguesas del campus*\n" +
                "👇 ¿Qué se te antoja hoy?\n\n" +
                "📋 Escribe *Menú* para ver la carta.\n" +
                "🛒 Escribe *Carrito* para ver tu orden.";

            // Nota: Asegúrate de haber actualizado whatsappService.js para aceptar el 3er parámetro
            await whatsappService.sendMessage(fromNumber, welcomeMessage, welcomeImage);
        }

        // B. MOSTRAR MENÚ
        else if (incomingText === 'menu' || incomingText === 'carta') {
            const menuText = await menuService.getFormattedMenu();
            await whatsappService.sendMessage(fromNumber, menuText);
        }

        // C. VER CARRITO
        else if (incomingText === 'carrito' || incomingText === 'pedido') {
            const cart = await orderService.getCart(fromNumber);
            if (cart && cart.length > 0) {
                let msg = "🛒 *TU PEDIDO ACTUAL:*\n\n";
                let total = 0;
                
                cart.forEach((item, i) => {
                    msg += `*[${i + 1}]* ${item.productName} - $${item.price.toFixed(2)}\n`;
                    total += item.price;
                });
                
                msg += `\n💰 Total: $${total.toFixed(2)}`;
                msg += `\n\n👇 *Opciones:*`;
                msg += `\n• Escribe *Pagar* para finalizar.`;
                msg += `\n• Escribe *Eliminar X* (ej: Eliminar 1) para quitar uno.`;
                msg += `\n• Escribe *Vaciar* para borrar todo.`;
                msg += `\n• Escribe *Menú* para pedir más.`;
                
                await whatsappService.sendMessage(fromNumber, msg);
            } else {
                await whatsappService.sendMessage(fromNumber, "Tu carrito está vacío 🕸️\nEscribe *Menú* para pedir.");
            }
        }

        // D. ELIMINAR UN ITEM (MEJORADO: Muestra el carrito de nuevo)
        else if (incomingText.startsWith('eliminar') || incomingText.startsWith('borrar') || incomingText.startsWith('quitar')) {
            const parts = incomingText.split(' ');
            const index = parts[1]; 

            if (index && !isNaN(index)) {
                const result = await orderService.removeFromCart(fromNumber, index);
                
                if (result && result.success) {
                    // 1. Confirmamos la eliminación
                    await whatsappService.sendMessage(fromNumber, 
                        `🗑️ Eliminado: *${result.removedItem.productName}*`
                    );

                    // 2. MOSTRAR EL CARRITO ACTUALIZADO AUTOMÁTICAMENTE
                    const cart = result.remainingCart;
                    
                    if (cart.length > 0) {
                        let total = 0;
                        let msg = "🔄 *ASÍ QUEDA TU PEDIDO:*\n\n";

                        cart.forEach((item, i) => {
                            msg += `*[${i + 1}]* ${item.productName} - $${item.price.toFixed(2)}\n`;
                            total += item.price;
                        });

                        msg += `\n💰 Total: $${total.toFixed(2)}`;
                        msg += `\n\n👇 *Opciones:*`;
                        msg += `\n• Escribe *Pagar* para finalizar.`;
                        msg += `\n• Escribe *Eliminar X* para quitar otro.`;
                        msg += `\n• Escribe *Vaciar* para borrar todo.`;
                        msg += `\n• Escribe *Menú* para pedir más.`;

                        await whatsappService.sendMessage(fromNumber, msg);

                    } else {
                        // Si borró lo último que quedaba
                        await whatsappService.sendMessage(fromNumber, "Tu carrito quedó vacío 🕸️\nEscribe *Menú* para pedir.");
                    }

                } else {
                    await whatsappService.sendMessage(fromNumber, "❌ No pude borrar eso. Revisa el número en tu *Carrito*.");
                }
            } else {
                // Si no puso número, asumimos que quizás quiso decir "borrar todo" (pasa al siguiente bloque)
            }
        }

        // E. VACIAR TODO EL CARRITO
        if (incomingText === 'vaciar' || incomingText === 'borrar todo' || incomingText === 'limpiar') {
            await orderService.clearCart(fromNumber);
            await whatsappService.sendMessage(fromNumber, 
                "🗑️ *Carrito vaciado correctamente.*\n\n" +
                "Escribe *Menú* para empezar de nuevo."
            );
        }

        // F. PEDIR COMIDA POR NÚMERO
        else if (/^\d+$/.test(incomingText)) {
            const index = parseInt(incomingText);
            const result = await orderService.addToCartByIndex(fromNumber, index);

            if (result) {
                const { product, session } = result;
                const total = session.cart.reduce((sum, item) => sum + item.price, 0);

                await whatsappService.sendMessage(fromNumber,
                    `✅ *${product.name}* agregado.\n` +
                    `💰 Subtotal: $${total.toFixed(2)}\n\n` +
                    `👇 Escribe otro número o *Carrito*.`
                );
            } else {
                await whatsappService.sendMessage(fromNumber, "❌ Ese número no está en el menú.");
            }
        }

        // G. PAGAR
        else if (incomingText === 'pagar' || incomingText === 'confirmar') {
             const cart = await orderService.getCart(fromNumber);
             if (cart && cart.length > 0) {
                 let total = 0;
                 let ticket = "🧾 *TICKET FINAL* 🧾\n\n";
                 cart.forEach(item => {
                     ticket += `• ${item.productName} .. $${item.price.toFixed(2)}\n`;
                     total += item.price;
                 });
                 ticket += `\n💰 *TOTAL: $${total.toFixed(2)}*\n\n`;
                 ticket += "🛵 Tu pedido ha sido enviado. ¡Gracias!";
                 
                 await whatsappService.sendMessage(fromNumber, ticket);
                 await orderService.clearCart(fromNumber);
             } else {
                 await whatsappService.sendMessage(fromNumber, "🛒 El carrito está vacío.");
             }
        } 
        
        res.status(200).send('OK');

    } catch (error) {
        console.error("🔥 Error Controller:", error);
        res.status(500).send('Error');
    }
};

module.exports = { verifyWebhook, receiveMessage };