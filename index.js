const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const Product = require("./Database/Models/product-model");

const Cart = require("./Database/Models/cart-model");

const Order = require("./Database/Models/order-model");

const cookieParser = require("cookie-parser");

const app = express();

const { login, signupUser, authenticate, authorizeAdmin } = require("./APIs/User-Service/auth");

const {
  createProduct,
  viewProduct,
  removeProduct,
  changeProduct,
  addProductToCart,
  searchProducts,
} = require("./APIs/Product-Service/product-controller");

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect("mongodb://127.0.0.1:27017/E-commerce")
  .then(() => console.log("Connected to the database"))
  .catch((error) => console.error(error));

app.post("/user/login", login);

app.post("/user/signup", signupUser);

app.post("/product/create", authenticate, authorizeAdmin, createProduct);

app.get("/product/:id", viewProduct);

app.delete("/product/:id", authenticate, authorizeAdmin, removeProduct);

app.patch("/product/:id", authenticate, authorizeAdmin, changeProduct);

app.patch("/cart/:cartId/product/:productId", authenticate, addProductToCart);

app.get("/products/search", searchProducts);

app.listen(3000);
