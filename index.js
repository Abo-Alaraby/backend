const express = require('express');

const mongoose = require('mongoose');

const Product = require('./Database/Models/product-model');

const Cart = require('./Database/Models/cart-model');

const Order = require('./Database/Models/order-model');

const cookieParser = require('cookie-parser');

const app = express();

const {login, signupUser} = require('./APIs/User-Service/auth');

app.use(express.json());
app.use(cookieParser());

mongoose.connect('mongodb://127.0.0.1:27017/E-commerce')
        .then(() => console.log('Connected to the database'))
        .catch((error) => console.error(error));

app.post('/user/login', login);

app.post('/user/signup', signupUser);

app.listen(3000);