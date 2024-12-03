const mongoose = require('mongoose');

const schema = mongoose.Schema;

const productSchema = require('./product-schema');

const {itemSchema} = require('./item-schema');

const orderSchema = new schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products: {
        type: [itemSchema],
    },
    total: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Canceled', 'In progress', 'Out for delivery', 'Completed'],
        default: 'In progress'
    }
});

module.exports = orderSchema;