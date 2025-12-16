const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  status: { 
    type: String, 
    default: 'welcome'
  },
  // Aquí está la clave: aseguramos que se llame 'productName'
  cart: [{
    productName: String, 
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  lastInteraction: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('UserSession', userSessionSchema);