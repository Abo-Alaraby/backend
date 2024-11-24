const mongoose = require('mongoose');

const adminSchema = require('../Schemas/admin-schema');

const adminModel = mongoose.model('Admin', adminSchema);

module.exports = adminModel;