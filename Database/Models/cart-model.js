const mongoose = require('mongoose');

const cartSchema = require('../Schemas/cart-schema');

const cartModel = mongoose.model('Cart', cartSchema);

module.exports = cartModel;