const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'El nombre es obligatorio'] 
    },
    description: String,
    price: { 
        type: Number, 
        required: true 
    },
    category: {
        type: String,
        enum: ['hamburguesas', 'bebidas', 'postres', 'extras'],
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);