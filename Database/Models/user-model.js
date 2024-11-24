const mongoose = require('mongoose');

const userSchema = require('../Schemas/user-schema');

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;