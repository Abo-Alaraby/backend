const mongoose = require("mongoose");

const productSchema = require("../Schemas/product-schema.js");

const productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
