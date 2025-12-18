const UserSession = require('../models/UserSession');
const MenuItem = require('../models/MenuItem');

// Función auxiliar para tener el MISMO orden que el menú visual
const getSortedItems = (items) => {
    const categoryOrder = ['hamburguesas', 'bebidas', 'extras'];
    let sorted = [];
    categoryOrder.forEach(cat => {
        const catItems = items.filter(i => i.category === cat);
        sorted.push(...catItems);
    });
    // Agregamos cualquier cosa que no tenga categoría (por seguridad)
    const others = items.filter(i => !categoryOrder.includes(i.category));
    sorted.push(...others);
    return sorted;
};

const addToCartByIndex = async (phoneNumber, index) => {
    try {
        const rawItems = await MenuItem.find({ isAvailable: true });
        
        // 🚨 EL ARREGLO MÁGICO: Ordenamos igual que el menú visual
        const items = getSortedItems(rawItems);

        // Convertir índice visual (1) a índice de array (0)
        const arrayIndex = parseInt(index) - 1;

        if (arrayIndex < 0 || arrayIndex >= items.length) {
            return null; 
        }

        const product = items[arrayIndex];
        
        // Guardar en sesión
        let session = await UserSession.findOne({ phoneNumber });
        if (!session) session = new UserSession({ phoneNumber });

        session.cart.push({
            productName: product.name,
            price: product.price,
            quantity: 1
        });

        await session.save();
        return { product, session };

    } catch (error) {
        console.error("Error addToCartByIndex:", error);
        return null;
    }
};

const getCart = async (phoneNumber) => {
    const session = await UserSession.findOne({ phoneNumber });
    if (!session) return null;
    return session.cart;
};

// Eliminar un item específico (por índice del carrito)
const removeFromCart = async (phoneNumber, index) => {
    try {
        const session = await UserSession.findOne({ phoneNumber });
        if (!session || session.cart.length === 0) return null;

        const arrayIndex = parseInt(index) - 1;
        if (arrayIndex < 0 || arrayIndex >= session.cart.length) return false;

        const removedItem = session.cart.splice(arrayIndex, 1);
        await session.save();
        
        return { 
            success: true, 
            removedItem: removedItem[0], 
            remainingCart: session.cart 
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

// Vaciar todo el carrito
const clearCart = async (phoneNumber) => {
    await UserSession.findOneAndDelete({ phoneNumber });
};

module.exports = {
    addToCartByIndex,
    getCart,
    removeFromCart,
    clearCart
};