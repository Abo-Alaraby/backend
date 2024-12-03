const Product = require('../../Database/Models/product-model');

const Cart = require('../../Database/Models/cart-model');

const mongoose = require('mongoose');

//DECLARATIVE PARADIGM
async function createProduct(req, res){

    const {name, description, price, stock, image, tags} = req.body;

    //Check for missing fields that are required
    if(!name || !price || !stock)
        return res.status(400).json({message: 'All required fields must be provided.'});

    //Check for required fields with incorrect type or value
    if(typeof price !== 'number' || price <= 0)
        return res.status(400).json({message: 'Price must be a positive number.'});

    if(typeof stock !== 'number' || stock < 0)
        return res.status(400).json({message: 'Stock must be a positive number.'});


    try{

        //Check if the product exists in the database
        const oldProduct = await Product.findOne({ name, price });
        
        if(oldProduct) return res.status(409).json({message: 'Product already exists.'});

        //Create Product
        const newProduct = new Product({name, description, price, stock, image, tags});

        const success = await newProduct.save();

        return res.status(201).json(success);
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

//DECLARATIVE PARADIGM
async function viewProduct(req, res){
    const { id } = req.params;

    //Check if id is valid
    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({message: 'Invalid ID.'});

    try{
        const product = await Product.findById(id);

        return product ? res.status(200).json(product) : res.status(404).json({message: 'Product not found.'});
    }
    catch(err){
        console.log(err);

        return res.status(500).json({message: 'Internal Server Error'});
    }
}

//DECLARATIVE PARADIGM
async function removeProduct(req, res){
    const { id } = req.params;

    //Check if id is valid
    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({message: 'Invalid ID.'});

    try{
        const product = await Product.findByIdAndDelete(id);

        return product ? res.status(200).json({message: 'Product successfully deleted.'}) : res.status(404).json({message: 'Product not found.'});
    }
    catch(err){
        console.log(err);

        return res.status(500).json({message: 'Internal Server Error'});
    }
}

async function changeProduct(req, res){
    const { id } = req.params;
    const { name, description, price, stock, image, tags } = req.body;

    //Check if id is valid
    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({message: 'Invalid ID.'});

    //Check for required fields with incorrect type or value
    if(!price == undefined && typeof price !== 'number' || price < 0)
        return res.status(400).json({message: 'Price must be a positive number.'});

    if(!stock == undefined && typeof stock !== 'number' || stock < 0)
        return res.status(400).json({message: 'Stock must be a positive number.'});

    try{
        let targetProduct = await Product.findById(id);
        
        if(!targetProduct) return res.status(404).json({message: 'Product not found'});

        if(name) targetProduct.name = name;
        if(description) targetProduct.description = description;
        if(price) targetProduct.price = price;
        if(stock) targetProduct.stock = stock;
        if(image) targetProduct.image = image;
        if(tags) targetProduct.tags = tags;

        const success = await targetProduct.save();

        return res.status(200).json(success);
    }
    catch(err){
        console.log(err);

        return res.status(500).json({message: 'Internal Server Error.'});
    }
}

//IMPERATIVE PARADIGM
async function addProductToCart(req, res){
    const { cartId, productId } = req.params;

    //Check if ids are valid
    if(!mongoose.Types.ObjectId.isValid(productId))
        return res.status(400).json({message: 'Invalid product ID.'});

    if(!mongoose.Types.ObjectId.isValid(cartId))
        return res.status(400).json({message: 'Invalid cart ID.'});

    try{
        let targetCart = await Cart.findById(cartId);

        const targetProduct = await Product.findById(productId);

        if(!targetCart) return res.status(404).json({message: 'Cart not found.'});

        if(!targetProduct) return res.status(404).json({message: 'Product not found.'});

        let found = false;
        for(let i = 0; i < targetCart.products.length; i++)
            if(targetCart.products[i]._id == productId){
                found = true;
                break;
            }
        
        if(found) return res.status(400).json({message: 'Product is already in cart.'});

        targetCart.products.push(targetProduct);

        targetCart.total += targetProduct.price;
        
        const success = await targetCart.save();

        return res.status(200).json(success);
    }
    catch(err){
        console.log(err);

        return res.status(500).json({message: 'Internal Server Error.'});
    }
}

//DECLARATIVE PARADIGM
async function searchProducts(req, res){
    const { name } = req.query;

    if(!name) return res.status(400).json({message: 'Search parameter is required.'});
    try{
        const result = await Product.find({
            $or: [
                { name: { $regex: name, $options: 'i' } },  // Case-insensitive search for name
                { tags: { $regex: name, $options: 'i' } }
            ]
        });

        return result.length ? res.status(200).json(result) : res.status(404).json({message: 'No matching results.'});
    }
    catch(err){
        console.log(err);

        return res.status(500).json({message: 'Internal Server Error'});
    }
}


module.exports = { createProduct, viewProduct, removeProduct, changeProduct, addProductToCart, searchProducts };