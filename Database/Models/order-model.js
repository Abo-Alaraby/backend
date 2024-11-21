const mongoose = require('mongoose');

const orderSchema = require('../Schemas/order-schema');

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;