const UserSession = require('../models/UserSession');
const MenuItem = require('../models/MenuItem');

// Función auxiliar para redondeo seguro de dinero (Evita el $15.000004)
const safeRound = (amount) => Math.round(amount * 100) / 100;

// 1. OBTENER CARRITO
const getCart = async (phoneNumber) => {
    try {
        const session = await UserSession.findOne({ phoneNumber });
        if (!session || session.cart.length === 0) return null;

        let total = 0;
        let message = "🛒 *TU CARRITO ACTUAL:*\n";
        
        // Agrupamos items para que se vea ordenado (Ej: Clásica x2)
        const resumen = {};
        session.cart.forEach(item => {
            if (!resumen[item.productName]) {
                resumen[item.productName] = { count: 0, price: item.price };
            }
            resumen[item.productName].count++;
        });

        let i = 1;
        for (const [name, data] of Object.entries(resumen)) {
            const subtotal = safeRound(data.price * data.count);
            message += `${i}. ${name} (x${data.count}) - $${subtotal.toFixed(2)}\n`;
            total += subtotal;
            i++;
        }

        message += `\n💰 *Total: $${safeRound(total).toFixed(2)}*`;
        return message;
    } catch (error) {
        console.error("Error obteniendo carrito:", error);
        return "Error consultando el carrito.";
    }
};

// 2. AGREGAR AL CARRITO (Con límites de seguridad)
const addToCartByName = async (phoneNumber, nameQuery, quantity = 1) => {
    try {
        // 🛡️ VALIDACIÓN 1: Números locos
        if (quantity < 1) quantity = 1;
        if (quantity > 20) quantity = 20; // Límite anti-spam

        const allItems = await MenuItem.find({ isAvailable: true });
        const product = allItems.find(p => p.name.toLowerCase().includes(nameQuery.toLowerCase()));

        if (!product) return null;

        let session = await UserSession.findOne({ phoneNumber });
        if (!session) session = new UserSession({ phoneNumber });

        // Agregamos items individuales
        for (let i = 0; i < quantity; i++) {
            session.cart.push({
                productName: product.name,
                price: product.price,
                quantity: 1 
            });
        }

        await session.save();
        
        const total = session.cart.reduce((sum, item) => sum + item.price, 0);
        return { success: true, productName: product.name, addedQty: quantity, total: safeRound(total).toFixed(2) };

    } catch (error) { return null; }
};

// 3. ELIMINAR DEL CARRITO (Ahora soporta Cantidad "Borra 2")
const removeFromCartByName = async (phoneNumber, nameQuery, quantity = 1) => {
    try {
        if (quantity < 1) quantity = 1; // Mínimo borra 1

        const session = await UserSession.findOne({ phoneNumber });
        if (!session || session.cart.length === 0) return null;

        let removedCount = 0;
        let removedName = "";

        // Intentamos borrar 'quantity' veces
        for (let i = 0; i < quantity; i++) {
            const itemIndex = session.cart.findIndex(item => 
                item.productName.toLowerCase().includes(nameQuery.toLowerCase())
            );

            if (itemIndex > -1) {
                removedName = session.cart[itemIndex].productName; // Guardamos el nombre real
                session.cart.splice(itemIndex, 1);
                removedCount++;
            } else {
                break; // Si ya no quedan, dejamos de borrar
            }
        }

        if (removedCount > 0) {
            await session.save();
            const total = session.cart.reduce((sum, item) => sum + item.price, 0);
            return { 
                success: true, 
                itemName: removedName, 
                removedQty: removedCount, 
                total: safeRound(total).toFixed(2) 
            };
        }
        return null; // No encontró nada
    } catch (error) {
        console.error(error);
        return null;
    }
};

// 4. TICKET FINAL
const generateTicket = async (phoneNumber) => {
    try {
        const session = await UserSession.findOne({ phoneNumber });
        if (!session || session.cart.length === 0) return null;

        let total = 0;
        let ticket = "🧾 *TICKET FINAL* 🧾\n------------------\n";
        
        const resumen = {};
        session.cart.forEach(item => {
            if (!resumen[item.productName]) resumen[item.productName] = { count: 0, price: item.price };
            resumen[item.productName].count++;
        });

        for (const [name, data] of Object.entries(resumen)) {
            const subtotal = safeRound(data.price * data.count);
            ticket += `• ${name} (x${data.count}) .. $${subtotal.toFixed(2)}\n`;
            total += subtotal;
        }
        
        ticket += "------------------\n";
        ticket += `💰 *TOTAL: $${safeRound(total).toFixed(2)}*\n`;
        ticket += "------------------\n";
        ticket += "¡Gracias por tu compra! 🍔";
        
        return ticket;
    } catch (error) { return null; }
};

// 5. VACIAR CARRITO
const clearCart = async (phoneNumber) => {
    try {
        await UserSession.findOneAndUpdate({ phoneNumber }, { $set: { cart: [] } });
        return true;
    } catch (error) { return false; }
};

module.exports = {
    getCart,
    addToCartByName,
    removeFromCartByName, 
    generateTicket,
    clearCart
};