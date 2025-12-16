const UserSession = require('../models/UserSession');
const MenuItem = require('../models/MenuItem');

// Agregar por ÍNDICE (El usuario manda "1", nosotros buscamos items[0])
const addToCartByIndex = async (phoneNumber, index) => {
    try {
        // 1. Obtener menú ordenado IGUAL que como se muestra
        // (Nota: MongoDB suele mantener orden de inserción, pero idealmente ordenarías por categoría)
        const items = await MenuItem.find({ isAvailable: true }); 
        
        // 2. Matemáticas de array: El usuario ve 1, la máquina ve 0.
        const arrayIndex = index - 1;

        // 3. Validación de seguridad
        if (arrayIndex < 0 || arrayIndex >= items.length) {
            console.log(`❌ Índice inválido: ${index} (Array: ${arrayIndex})`);
            return null; 
        }

        const product = items[arrayIndex];

        // 4. Guardar en sesión
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
        console.error("Error en addToCartByIndex:", error);
        return null;
    }
};

const getCart = async (phoneNumber) => {
    const session = await UserSession.findOne({ phoneNumber });
    if (!session) return null;
    return session.cart;
};

const clearCart = async (phoneNumber) => {
    await UserSession.findOneAndDelete({ phoneNumber });
};
// ... (código anterior de addToCart, etc)

// NUEVA FUNCIÓN: Eliminar item del carrito
const removeFromCart = async (phoneNumber, index) => {
    try {
        const session = await UserSession.findOne({ phoneNumber });
        if (!session || session.cart.length === 0) return null;

        // Convertir índice visual (1) a índice de array (0)
        const arrayIndex = parseInt(index) - 1;

        // Validar que el índice exista
        if (arrayIndex < 0 || arrayIndex >= session.cart.length) {
            return false; // No existe ese item
        }

        // Sacar el item del array
        const removedItem = session.cart.splice(arrayIndex, 1); // Elimina 1 elemento en esa posición
        
        await session.save();
        return { 
            success: true, 
            removedItem: removedItem[0], // Devolvemos qué borramos para confirmar
            remainingCart: session.cart 
        };

    } catch (error) {
        console.error("Error borrando item:", error);
        return null;
    }
};

// ...

module.exports = {
    addToCartByIndex, // Solo necesitamos exportar esta para la nueva lógica
    getCart,
    clearCart,
    removeFromCart
};