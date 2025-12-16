const MenuItem = require('../models/MenuItem');

const getFormattedMenu = async () => {
    try {
        const items = await MenuItem.find({ isAvailable: true }); // O 'available: true'

        if (items.length === 0) return "😔 Menú no disponible.";

        const categories = {
            'hamburguesas': '🍔 Hamburguesas',
            'bebidas': '🥤 Bebidas',
            'extras': '🍟 Extras'
        };

        let menuMessage = "📋 *MENÚ DELICIAS* 📋\n(Escribe el número para pedir)\n\n";
        let globalIndex = 1; // IMPORTANTE: Empezamos en 1

        for (const [key, label] of Object.entries(categories)) {
            const categoryItems = items.filter(item => item.category === key);
            
            if (categoryItems.length > 0) {
                menuMessage += `*${label}*\n`;
                categoryItems.forEach(item => {
                    // Visualización clara: "1. Hamburguesa..... $5.00"
                    menuMessage += `*${globalIndex}.* ${item.name} ..... $${item.price.toFixed(2)}\n`;
                    globalIndex++; 
                });
                menuMessage += "\n";
            }
        }

        return menuMessage;

    } catch (error) {
        console.error(error);
        return "Error del menú.";
    }
};

module.exports = { getFormattedMenu };