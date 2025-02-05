const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const Product = require("./Database/Models/product-model");

const Cart = require("./Database/Models/cart-model");

const Order = require("./Database/Models/order-model");

const cookieParser = require("cookie-parser");

const app = express();

const { login, signupUser, signupAdmin, userDetails } = require("./APIs/User-Service/auth");

const { authenticate, authorizeAdmin } = require("./Middleware/auth");

const {
  createProduct,
  viewProduct,
  removeProduct,
  changeProduct,
  addProductToCart,
  searchProducts,
  getAllProducts,
} = require("./APIs/Product-Service/product-controller");

const { placeOrder, cancelOrder, viewOrder, getStatus, completeDelivery, getAllOrders } = require("./APIs/Order-Service/order-controller");
const { viewCart, clearCart, removeProductFromCart } = require("./APIs/Cart-Service/cart-controller");
const { sendEmail } = require("./APIs/Notification-Service/mail");

require('./APIs/Order-Service/order-consumer');

app.listen(3000);
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
  .then()
  .catch((error) => console.error(error));

app.post("/user/login", login);

app.post("/user/signup", signupUser);

app.post("/admin/signup", signupAdmin);

app.get("/user/me", authenticate, userDetails);

app.post("/product/create", authenticate, authorizeAdmin, createProduct);

app.get("/product/:id", viewProduct);

app.get("/product", getAllProducts);

app.delete("/product/:id", authenticate, authorizeAdmin, removeProduct);

app.patch("/product/:id", authenticate, authorizeAdmin, changeProduct);

app.patch("/cart/:id", authenticate, addProductToCart);

app.get("/products/search", searchProducts);

app.post("/order", authenticate, placeOrder);

app.get("/order", authenticate, getAllOrders);

app.delete("/order/:id", authenticate, cancelOrder);

app.get("/order/:id", authenticate, viewOrder);

//I think this should be removed, it is redundant
app.get("/order/:id/status", authenticate, getStatus);

app.patch("/order/:id", authenticate, completeDelivery);

app.get("/cart", authenticate, viewCart);

app.delete("/cart/product/:productId", authenticate, removeProductFromCart);

app.delete("/cart", authenticate, clearCart);

app.post("/email", sendEmail);

module.exports = app;