const mongoose = require('mongoose');

const schema = mongoose.Schema;

const productSchema = new schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    image: {
        //Path to image
        type: String
    },
    tags: {
        //We could maybe use it for search
        type: [String]
    }

}, {timeStamps: true});

module.exports = productSchema;