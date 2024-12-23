const amqp = require('amqplib/callback_api');
const Order = require("../../Database/Models/order-model");
const Product = require("../../Database/Models/product-model");

const queue = 'orderQueue';

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    channel.assertQueue(queue, {
      durable: false
    });

    console.log("Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, async function(msg) {
      const orderData = JSON.parse(msg.content.toString());
      console.log("Received:", orderData);

      // Process the order data
      if (orderData.orderId && orderData.userId && orderData.action === 'cancel') {
        // Example: Update inventory or perform other actions
        await updateInventory(orderData.orderId);
      }

      // Acknowledge the message
      channel.ack(msg);
    }, {
      noAck: false
    });
  });
});

async function updateInventory(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
            product.stock -= item.quantity;
            await product.save();
        }
    }
    await Order.findByIdAndDelete(orderId);
}
