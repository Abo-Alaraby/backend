const mongoose = require("mongoose");

const orderSchema = require("../Schemas/order-schema.js");

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
