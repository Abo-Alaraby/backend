const mongoose = require("mongoose");

const cartSchema = require("../Schemas/cart-schema.js");

const cartModel = mongoose.model("Cart", cartSchema);

module.exports = cartModel;
