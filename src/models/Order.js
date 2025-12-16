// src/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerNumber: { type: String, required: true },
  customerName: String,
  items: [{
    name: String,
    quantity: { type: Number, default: 1 },
    price: Number,
    notes: String
  }],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  address: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer'],
    default: 'cash'
  },
  estimatedTime: Number, // minutes
  specialInstructions: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);