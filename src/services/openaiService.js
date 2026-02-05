const OpenAI = require("openai");
const menuService = require('./menuService');
const orderService = require('./orderService');
const whatsappService = require('./whatsappService');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 🛠️ HERRAMIENTAS ACTUALIZADAS
const tools = [
    { 
        type: "function", 
        function: { name: "send_menu_pdf", description: "Envía imagen del menú.", parameters: { type: "object", properties: {} } } 
    },
    { 
        type: "function", 
        function: { name: "get_cart", description: "Muestra carrito.", parameters: { type: "object", properties: {} } } 
    },
    { 
        type: "function", 
        function: { 
            name: "add_to_cart", 
            description: "AGREGAR comida. PROHIBIDO USAR PARA QUITAR.", 
            parameters: { 
                type: "object", 
                properties: { 
                    productName: { type: "string" }, 
                    quantity: { type: "integer", description: "Cantidad (default 1). Max 20." } 
                }, 
                required: ["productName"] 
            } 
        } 
    },
    { 
        type: "function", 
        function: { 
            name: "remove_from_cart", 
            description: "ELIMINAR comida. Usar si dicen quitar, sacar, borrar, menos.", 
            parameters: { 
                type: "object", 
                properties: { 
                    productName: { type: "string", description: "Nombre del producto" },
                    // 👇 AHORA LA IA SABE QUE PUEDE BORRAR VARIOS
                    quantity: { type: "integer", description: "Cantidad a borrar (default 1)" }
                }, 
                required: ["productName"] 
            } 
        } 
    },
    { 
        type: "function", 
        function: { name: "finalize_order", description: "Cerrar cuenta (pagar).", parameters: { type: "object", properties: {} } } 
    },
    { 
        type: "function", 
        function: { name: "clear_cart", description: "Vaciar TODO el carrito.", parameters: { type: "object", properties: {} } } 
    }
];

const handleOpenAIResponse = async (userText, userNumber) => {
    try {
        const menuContext = await menuService.getMenuAsString();

        const messages = [
            { 
                role: "system", 
                content: `Eres "DeliciasBot". Menú: ${menuContext}

                ⚠️ REGLAS:
                1. ➕ AGREGAR: Usa 'add_to_cart'.
                2. ➖ QUITAR: Usa 'remove_from_cart'. Si dicen "Quita 2 colas", pon quantity: 2.
                3. 🛒 FEEDBACK: Después de CUALQUIER cambio (agregar/quitar), el sistema mostrará el carrito automáticamente. Tú solo di "Listo".
                4. 🧾 PAGAR: Usa 'finalize_order'.
                
                ¡Sé conciso!`
            },
            { role: "user", content: userText }
        ];

        const runner = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            tools: tools,
            tool_choice: "auto",
        });

        const msg = runner.choices[0].message;

        if (msg.tool_calls) {
            messages.push(msg); 

            for (const toolCall of msg.tool_calls) {
                const fnName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                let resultContent = "";

                if (fnName === "send_menu_pdf") {
                     const menuUrl = "https://raw.githubusercontent.com/drahcirok/foodtruck-whatsapp-bot/featured/ai/Captura%20de%20pantalla%202026-02-05%20014237.png"; 
                     await whatsappService.sendMessage(userNumber, "Aquí el menú 🍔", menuUrl);
                     resultContent = "Menú enviado.";
                } 
                else if (fnName === "add_to_cart") {
                    const res = await orderService.addToCartByName(userNumber, args.productName, args.quantity || 1);
                    if (res) {
                        const newCart = await orderService.getCart(userNumber);
                        await whatsappService.sendMessage(userNumber, newCart);
                        resultContent = `✅ Agregado ${res.addedQty}x ${res.productName}.`;
                    } else resultContent = "❌ No encontrado.";
                }
                else if (fnName === "remove_from_cart") {
                    // 👇 AQUI USAMOS LA CANTIDAD PARA BORRAR
                    const res = await orderService.removeFromCartByName(userNumber, args.productName, args.quantity || 1);
                    if (res) {
                        const newCart = await orderService.getCart(userNumber);
                        if (newCart) await whatsappService.sendMessage(userNumber, newCart);
                        else await whatsappService.sendMessage(userNumber, "Carrito vacío 🗑️");
                        resultContent = `🗑️ Eliminado ${res.removedQty}x ${res.itemName}.`;
                    } else resultContent = "⚠️ No estaba en el carrito.";
                }
                else if (fnName === "get_cart") {
                    const cart = await orderService.getCart(userNumber);
                    if(cart) await whatsappService.sendMessage(userNumber, cart);
                    resultContent = cart ? "Mostrado." : "Vacío.";
                }
                else if (fnName === "clear_cart") {
                    await orderService.clearCart(userNumber);
                    resultContent = "Todo borrado.";
                }
                else if (fnName === "finalize_order") {
                    const ticket = await orderService.generateTicket(userNumber);
                    if(ticket) {
                        await whatsappService.sendMessage(userNumber, ticket);
                        await orderService.clearCart(userNumber);
                        resultContent = "Ticket enviado.";
                    } else resultContent = "Carrito vacío.";
                }

                messages.push({ tool_call_id: toolCall.id, role: "tool", name: fnName, content: resultContent });
            }
            
            const finalResponse = await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: messages });
            return finalResponse.choices[0].message.content;
        }
        
        return msg.content;
    } catch (error) { console.error(error); return "Error 🤯"; }
};

module.exports = { handleOpenAIResponse };