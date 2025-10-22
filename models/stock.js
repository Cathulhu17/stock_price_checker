'use strict';
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  likes: { type: [String], default: [] }, // array de IPs anonimizadas
});

module.exports = mongoose.model('Stock', stockSchema);
