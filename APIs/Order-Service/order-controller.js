const Order = require('../../Database/Models/order-model');


//Will use it to update inventory later
async function updateInventory(orderId) {


}


async function placeOrder(req, res) {

    const user = req.user;


    try {

        if(!user)
            throw new Error('Please login to place an order');

        const {products} = req.body;

        if(products.length == 0)
            throw new Error('Please add products to your cart first');

        let total = 0;

        const outOfStockProducts = [];

        for(let product of products){

            total += product.price;

            if (product.stock <= 0) {
                outOfStockProducts.push(product.name);  // Collect out-of-stock products
                continue;  // Skip updating this product's stock
            }

            product.stock -= 1;

        }

        if (outOfStockProducts.length > 0) {
            // If there are out-of-stock products, throw an error with all their names
            throw new Error(`The following products are out of stock: ${outOfStockProducts.join(', ')}. Please remove them from the cart and try again.`);
        }

        //There should be payment here
        const userId = user.id;

        const productPromises = products.map(product => product.save());

        await Promise.allSettled(productPromises);

        const newOrder = new Order({user: userId, products, total});

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