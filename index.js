const express = require('express');

const mongoose = require('mongoose');

const User = require('./Database/Models/user-model');

const Product = require('./Database/Models/product-model');

const Cart = require('./Database/Models/cart-model');

const Order = require('./Database/Models/order-model');

const Admin = require('./Database/Models/admin-model');

const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/E-commerce')
        .then(() => console.log('Connected to the database'))
        .catch((error) => console.error(error));

app.listen(3000);