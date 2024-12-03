const Cart = require('../../Database/Models/cart-model');

const Product = require('../../Database/Models/product-model');

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

    const productId = req.params.productId;

    try {

        const userId = req.user.id;

        const cart = await Cart.findById(cartId);

        if(!cartId || !cart.user.equals(userId))
            throw new Error('This cart doesn\'t exist');

        const product = await Product.findById(productId);

        if(!productId || !product)
            throw new Error('This product doesn\'t exist');

        let found = false;
        const newProductsAfterRemoval = cart.products.filter(item => {
            if(item.product.equals(productId)){
                found = true;
                if(item.quantity == 1)
                    return false;
                item.quantity--;
            }
            return true;
        });

        if(!found)
            throw new Error('This product does not exist in the cart');

        cart.products = newProductsAfterRemoval;

        cart.total -= product.price;

        cart.markModified('products');

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

        cart.total = 0;

        await cart.save();

        return res.status(201).json(cart);

    }catch(error){

        return res.status(400).json(error.message);
    }

}

module.exports = {clearCart, viewCart, removeProductFromCart}