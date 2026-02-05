const MenuItem = require('../models/MenuItem');

// Función simple para la IA
const getMenuAsString = async () => {
    const items = await MenuItem.find({ isAvailable: true });
    return items.map(i => `- ${i.name} ($${i.price}): ${i.description}`).join("\n");
};

// (Mantén tu getFormattedMenu viejo si quieres, pero exporta esta nueva también)
module.exports = { getMenuAsString }; // + lo que ya tenías