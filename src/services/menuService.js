const MenuItem = require('../models/MenuItem');

const getFormattedMenu = async () => {
    try {
        const items = await MenuItem.find({ isAvailable: true });
        if (items.length === 0) return "😔 El menú no está disponible por ahora.";

        // ORDEN ESTRICTO: Este orden debe ser IGUAL al del orderService
        const categoryOrder = ['hamburguesas', 'bebidas', 'extras'];
        
        const categoryLabels = {
            'hamburguesas': '🍔 Hamburguesas',
            'bebidas': '🥤 Bebidas',
            'extras': '🍟 Extras'
        };

        let menuMessage = "📋 *MENÚ DELICIAS* 📋\n(Escribe el número para pedir)\n\n";
        let globalIndex = 1; 

        // Recorremos el array de orden para garantizar la secuencia 1, 2, 3...
        categoryOrder.forEach(catKey => {
            const categoryItems = items.filter(item => item.category === catKey);

            if (categoryItems.length > 0) {
                menuMessage += `*${categoryLabels[catKey]}*\n`;
                
                categoryItems.forEach(item => {
                    menuMessage += `*${globalIndex}.* ${item.name} ..... $${item.price.toFixed(2)}\n`;
                    globalIndex++; 
                });
                menuMessage += "\n";
            }
        });

        return menuMessage;

    } catch (error) {
        console.error("Error menuService:", error);
        return "Error consultando menú.";
    }
};

module.exports = { getFormattedMenu };