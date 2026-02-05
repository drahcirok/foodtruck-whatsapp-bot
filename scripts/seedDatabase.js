require('dotenv').config();
const mongoose = require('mongoose');
// Asegúrate de que la ruta al modelo sea correcta según tu carpeta
const MenuItem = require('../src/models/MenuItem'); 

const menuItems = [
  // 🍔 Categoría: 'hamburguesas'
  { 
    name: "Clásica", 
    description: "Carne 200g, queso cheddar, lechuga, tomate", 
    price: 5.50, 
    category: "hamburguesas",
    isAvailable: true 
  },
  { 
    name: "Bacon Lovers", 
    description: "Doble carne, extra tocino, salsa BBQ", 
    price: 7.00, 
    category: "hamburguesas",
    isAvailable: true 
  },
  { 
    name: "Veggie", 
    description: "Medallón de lenteja, aguacate, cebolla caramelizada", 
    price: 6.00, 
    category: "hamburguesas",
    isAvailable: true 
  },
  {
    name: "Pollo Crispy",
    description: "Pechuga de pollo crujiente, lechuga fresca, tomate y mayonesa de la casa.",
    price: 6.50,
    category: "hamburguesas",
    image: "https://images.unsplash.com/photo-1615297928064-24977384d0f4?q=80&w=1000",
    isAvailable: true
  },
  {
    name: "Tex-Mex",
    description: "Hamburguesa picante con guacamole, jalapeños, cheddar fundido y nachos triturados.",
    price: 7.50,
    category: "hamburguesas",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000",
    isAvailable: true
  },
  {
    name: "La Monstruo",
    description: "Doble carne, doble queso, tocino, huevo frito y aros de cebolla. ¡Solo para valientes!",
    price: 9.00,
    category: "hamburguesas",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1000",
    isAvailable: true
  },
  
  // 🥤 Categoría: 'bebidas'
  { 
    name: "Coca-Cola", 
    description: "Lata 330ml muy fría", 
    price: 1.50, 
    category: "bebidas",
    isAvailable: true 
  },
  { 
    name: "Agua Mineral", 
    description: "Sin gas 500ml", 
    price: 1.00, 
    category: "bebidas",
    isAvailable: true 
  },
  {
    name: "Sprite",
    description: "Refresco sabor lima-limón, botella de 500ml.",
    price: 1.50,
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=1000",
    isAvailable: true
  },
  {
    name: "Limonada Casera",
    description: "Refrescante limonada natural con hierbabuena y hielo.",
    price: 2.00,
    category: "bebidas",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000",
    isAvailable: true
  },
  
  // 🍟 Categoría: 'extras'
  { 
    name: "Papas Fritas", 
    description: "Porción grande crujiente", 
    price: 2.50, 
    category: "extras",
    isAvailable: true 
  },
  {
    name: "Aros de Cebolla",
    description: "6 aros de cebolla empanizados y ultra crujientes con salsa BBQ.",
    price: 3.00,
    category: "extras",
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=1000",
    isAvailable: true
  },
  {
    name: "Salchipapas",
    description: "Cama de papas fritas con trozos de salchicha frita y salsas al gusto.",
    price: 4.50,
    category: "extras",
    image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=1000",
    isAvailable: true
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
    console.error('❌ Error cargando datos:', error.message);
    process.exit(1);
  }
};

seedDB();