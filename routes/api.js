'use strict';

const express = require('express');
const axios = require('axios');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const router = express.Router();

// Esquema para los likes de acciones
const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  likes: { type: [String], default: [] } // guardamos IPs anonimizadas
});

const Stock = mongoose.model('Stock', stockSchema);

router.get('/stock-prices', async (req, res) => {
  const { stock, like } = req.query;
  const ip = req.ip || req.headers['x-forwarded-for'] || '0.0.0.0';
  const hashedIP = bcrypt.hashSync(ip, 5);

  try {
    const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
    const response = await axios.get(url);
    const stockPrice = response.data.latestPrice;

    let stockData = await Stock.findOne({ stock: stock.toUpperCase() });

    if (!stockData) {
      stockData = new Stock({ stock: stock.toUpperCase(), likes: [] });
    }

    if (like && !stockData.likes.includes(hashedIP)) {
      stockData.likes.push(hashedIP);
      await stockData.save();
    }

    res.json({
      stockData: {
        stock: stock.toUpperCase(),
        price: stockPrice,
        likes: stockData.likes.length
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

module.exports = router;
