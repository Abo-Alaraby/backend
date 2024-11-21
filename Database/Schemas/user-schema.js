const mongoose = require('mongoose');

const schema = mongoose.Schema;

const addressSchema = new schema({
    country: {
        type: String
    },
    city: {
        type: String
    },
    street: {
        type: String
    },
    homeNumber: {
        type: Number
    }
});

const userSchema = new schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    phone: {
        type: Number,
        required: true
    },
    address: {
        type: addressSchema
    },
  },

  {timestamps: true}

);

module.exports = userSchema;

