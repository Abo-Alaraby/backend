const Order = require("../../Database/Models/order-model");
const Product = require("../../Database/Models/product-model");
const Cart = require("../../Database/Models/cart-model");
// Add RabbitMQ setup
const amqp = require('amqplib/callback_api');
let channel = null;
const queue = 'orderQueue';
amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, ch) {
    if (error1) {
      throw error1;
    }
    channel = ch;
    channel.assertQueue(queue, {
      durable: false
    });
  });
});

async function placeOrder(req, res) {
  const user = req.user;

  try {
    if (!user) throw new Error("Please login to place an order");

    const { items } = req.body;

    if (items.length == 0) throw new Error("Please add products to your cart first");

    let total = 0;

    const notEnoughStockProducts = [];

    for (let item of items) {
      const product = await Product.findById(item.product);

      if (product.stock < item.quantity) {
        notEnoughStockProducts.push(product.name); // Collect out-of-stock products
        continue; // Skip updating this product's stock
      }

      total += product.price * item.quantity;

      product.stock -= item.quantity;

      await product.save();
    }

    if (notEnoughStockProducts.length > 0) {
      // If there are out-of-stock products, throw an error with all their names
      throw new Error(
        `Not enough stock for the following products: ${notEnoughStockProducts.join(", ")}. Please check the available stock and try again.`
      );
    }

    //There should be payment here
    const userId = user.id;
    const cart = await Cart.findOne({ user: userId });
    const newOrder = new Order({ user: userId, products: items, total });
    cart.products = [];
    cart.total = 0;
    await cart.save();
    await newOrder.save();

    // Publish message to RabbitMQ
    const orderMessage = JSON.stringify({ orderId: newOrder._id, userId, items, total, action: "place" });
    channel.sendToQueue(queue, Buffer.from(orderMessage));

    return res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
}

async function cancelOrder(req, res) {
  const user = req.user;

  try {
    //This case shouldn't happen anyway, but for redundant safety
    if (!user) throw new Error("Please login first");

    const userId = user.id;

    const orderId = req.params.id;

    const findOrder = await Order.findById(orderId);

    if (!findOrder || !userId || !findOrder.user.equals(userId)) throw new Error("This order doesn't exist");

    for (const item of findOrder.products) {
      const product = await Product.findById(item.product);

      product.stock += item.quantity;

      await product.save();
    }


    // Publish cancel message to RabbitMQ
    const cancelMessage = JSON.stringify({ orderId, userId, action: "cancel" });
    channel.sendToQueue(queue, Buffer.from(cancelMessage));

    return res.status(200).json("Order deleted successfully");
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

//GET
async function viewOrder(req, res) {
  const orderId = req.params.id;

  const userId = req.user.id;

  try {
    const order = await Order.findById(orderId);

    if (!order || !order.user.equals(userId)) throw new Error("This order doesn't exist");

    return res.status(200).json(order);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

//GET
async function getStatus(req, res) {
  const orderId = req.params.id;

  const userId = req.user.id;

  try {
    const order = await Order.findById(orderId);

    if (!order || !order.user.equals(userId)) throw new Error("This order doesn't exist");

    return res.status(200).json(order.status);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

//PATCH
async function completeDelivery(req, res) {
  const orderId = req.params.id;

  const userId = req.user.id;

  try {
    const order = await Order.findById(orderId);

    //The user cannot access this order
    if (!order || !order.user.equals(userId)) throw new Error("This order doesn't exist");

    order.status = "Completed";

    await order.save();

    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function getAllOrders(req, res) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId });
    return res.status(200).json(orders);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = { getAllOrders, cancelOrder, placeOrder, viewOrder, getStatus, completeDelivery };
