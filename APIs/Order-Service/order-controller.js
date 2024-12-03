const Order = require('../../Database/Models/order-model');

const Product = require('../../Database/Models/product-model');

//Will use it to update inventory later
async function updateInventory(orderId) {


}


async function placeOrder(req, res) {

    const user = req.user;


    try {

        if(!user)
            throw new Error('Please login to place an order');

        const {items} = req.body;

        if(items.length == 0)
            throw new Error('Please add products to your cart first');
        
        let total = 0;

        const notEnoughStockProducts = [];

        for(let item of items){

            const product = await Product.findById(item.product);

            if (product.stock <  item.quantity) {
                notEnoughStockProducts.push(product.name);  // Collect out-of-stock products
                continue;  // Skip updating this product's stock
            }

            total += product.price * item.quantity;

            product.stock -= item.quantity;

            await product.save();

        }

        if (notEnoughStockProducts.length > 0) {
            // If there are out-of-stock products, throw an error with all their names
            throw new Error(`Not enough stock for the following products: ${notEnoughStockProducts.join(', ')}. Please check the available stock and try again.`);
        }

        //There should be payment here
        const userId = user.id;

        const newOrder = new Order({user: userId, products: items, total});

        await newOrder.save();


        return res.status(201).json('Order placed successfully');

    }catch(error){

        return res.status(400).json(error.message);

    }

}

async function cancelOrder(req, res) {

    const user = req.user;
    
    try {

        //This case shouldn't happen anyway, but for redundant safety
        if(!user)
            throw new Error('Please login first');

        const userId = user.id;

        const orderId = req.params.id;

        const findOrder = await Order.findById(orderId);

        if(!findOrder || !userId || !findOrder.user.equals(userId))
            throw new Error('This order doesn\'t exist');

        for(const item of findOrder.products){

            const product = await Product.findById(item.product);

            product.stock += item.quantity;

            await product.save();
        }

        await Order.findByIdAndDelete(orderId);

        return res.status(200).json('Order deleted successfully')

    }catch(error){

        return res.status(400).json(error.message);

    }
}

//GET
async function viewOrder(req, res) {

    const orderId = req.params.id;

    const userId = req.user.id;

    try{

        const order = await Order.findById(orderId);

        if(!order || !order.user.equals(userId))
            throw new Error('This order doesn\'t exist');

        return res.status(200).json(order);

    }catch(error){

        return res.status(400).json(error.message);
    }
}

//GET
async function getStatus(req, res) {

    const orderId = req.params.id;

    const userId = req.user.id;

    try{

        const order = await Order.findById(orderId);

        if(!order || !order.user.equals(userId))
            throw new Error('This order doesn\'t exist');

        return res.status(200).json(order.status);

    }catch(error){

        return res.status(400).json(error.message);
    }

}

//PATCH
async function completeDelivery(req, res){

    const orderId = req.params.id;

    const userId = req.user.id;

    try{

        const order = await Order.findById(orderId);

        //The user cannot access this order
        if(!order || !order.user.equals(userId))
            throw new Error('This order doesn\'t exist');

        order.status = 'Completed';

        await order.save();

        return res.status(201).json(order);

    }catch(error){

        return res.status(400).json(error.message);
    }

}

module.exports = {cancelOrder, placeOrder, viewOrder, getStatus, completeDelivery};