const mongoose = require("mongoose");

const schema = mongoose.Schema;

const { productSchema } = require("./product-schema");

const { itemSchema } = require("./item-schema");

const cartSchema = new schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
      unique: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ["User", "Admin"],
    },
    products: {
      type: [itemSchema],
    },
    total: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = cartSchema;
