require('dotenv').config();
const mongoose = require('mongoose');
// Asegúrate de que la ruta al modelo sea correcta según tu carpeta
const MenuItem = require('../src/models/MenuItem'); 

const menuItems = [
  // 🍔 Categoría: 'hamburguesas' (TIENE QUE SER EXACTO)
  { 
    name: "Clásica", 
    description: "Carne 200g, queso cheddar, lechuga, tomate", 
    price: 5.50, 
    category: "hamburguesas" 
  },
  { 
    name: "Bacon Lovers", 
    description: "Doble carne, extra tocino, salsa BBQ", 
    price: 7.00, 
    category: "hamburguesas" 
  },
  { 
    name: "Veggie", 
    description: "Medallón de lenteja, aguacate, cebolla caramelizada", 
    price: 6.00, 
    category: "hamburguesas" 
  },
  
  // 🥤 Categoría: 'bebidas'
  { 
    name: "Coca-Cola", 
    description: "Lata 330ml muy fría", 
    price: 1.50, 
    category: "bebidas" 
  },
  { 
    name: "Agua Mineral", 
    description: "Sin gas 500ml", 
    price: 1.00, 
    category: "bebidas" 
  },
  
  // 🍟 Categoría: 'extras'
  { 
    name: "Papas Fritas", 
    description: "Porción grande crujiente", 
    price: 2.50, 
    category: "extras" 
  }
];

const seedDB = async () => {
  try {
    // 1. Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Conectado a MongoDB...');

    // 2. Limpiar la base de datos (borrar lo viejo)
    await MenuItem.deleteMany({});
    console.log('🗑️  Menú anterior eliminado.');

    // 3. Insertar los nuevos items
    await MenuItem.insertMany(menuItems);
    console.log('✅ Menú insertado correctamente. ¡La nevera está llena!');

    process.exit();
  } catch (error) {
    console.error('❌ Error cargando datos:', error.message); // Muestra solo el mensaje corto
    process.exit(1);
  }
};

seedDB();