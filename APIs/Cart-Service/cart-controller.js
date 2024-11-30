const Cart = require('../../Database/Models/cart-model');


async function viewCart(req, res){

    const cartId = req.params.id;

    try {

        const userId = req.user.id;

        const cart = await Cart.findById(cartId);

        if(!cartId || !cart.user.equals(userId))
            throw new Error('This cart doesn\'t exist');

        return res.status(200).json(cart);

    }catch(error){

        return res.status(400).json(error.message);
    }
}

async function removeProductFromCart(req, res){

    const cartId = req.params.id;

    try {

        const userId = req.user.id;

        const cart = await Cart.findById(cartId);

        if(!cartId || !cart.user.equals(userId))
            throw new Error('This cart doesn\'t exist');

        const productId = req.params.productId;

        if(!productId)
            throw new Error('This product doesn\'t exist');

        const newProductsAfterRemoval = cart.products.filter(product => !productId.equals(product._id));

        cart.products = newProductsAfterRemoval;

        await cart.save();

        return res.status(201).json(cart);

    }catch(error){

        return res.status(400).json(error.message);
    }

}

async function clearCart(req, res){

    const cartId = req.params.id;

    try {

        const userId = req.user.id;

        const cart = await Cart.findById(cartId);

        if(!cartId || !cart.user.equals(userId))
            throw new Error('This cart doesn\'t exist');

        cart.products = [];

        await cart.save();

        return res.status(201).json(cart);

    }catch(error){

        return res.status(400).json(error.message);
    }

}

module.exports = {clearCart, viewCart, removeProductFromCart}