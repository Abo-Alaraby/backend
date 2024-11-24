const mongoose = require('mongoose');

const schema = mongoose.Schema;

const adminSchema = new schema({
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
        //Not of type Number, as a phone number can get quite long.
        //also to handle international codes and leading zeroes implicitly
        type: String,
        required: true
    }
  },

  {timestamps: true}

);

module.exports = adminSchema;

