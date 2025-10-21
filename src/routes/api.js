'use strict';
const fetch = require('node-fetch');
const crypto = require('crypto');
const Stock = require('../models/Stock');

module.exports = function(app) {
  app.get('/api/stock-prices', async (req, res) => {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.status(400).json({ error: 'Missing stock parameter' });
      if (typeof stock === 'string') stock = [stock];

      const ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || '';
      const anonIp = crypto.createHash('sha256').update(ip).digest('hex');

      const results = await Promise.all(stock.map(async (s) => {
        const symbol = s.toUpperCase();
        const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
        const response = await fetch(url);
        const data = await response.json();
        const price = data && data.latestPrice ? data.latestPrice : null;

        let doc = await Stock.findOne({ symbol });
        if (!doc) {
          doc = new Stock({ symbol, likes: [] });
        }

        if (like === 'true' || like === true) {
          if (!doc.likes.includes(anonIp)) {
            doc.likes.push(anonIp);
            await doc.save();
          }
        }

        return { stock: symbol, price, likes: doc.likes.length };
      }));

      if (results.length === 2) {
        const a = results[0], b = results[1];
        return res.json({ stockData: [
          { stock: a.stock, price: a.price, rel_likes: a.likes - b.likes },
          { stock: b.stock, price: b.price, rel_likes: b.likes - a.likes }
        ]});
      }

      res.json({ stockData: results[0] });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};
