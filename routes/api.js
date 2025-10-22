'use strict';
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');
const Stock = require('../models/stock'); // Modelo de MongoDB

module.exports = function (app) {
  // Ruta principal: /api/stock-prices
  app.get('/api/stock-prices', async (req, res) => {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.status(400).json({ error: 'Debes especificar un stock' });

      if (typeof stock === 'string') stock = [stock];

      const stockData = await Promise.all(stock.map(async (symbol) => {
        const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
        const response = await fetch(url);
        const data = await response.json();

        const price = data.latestPrice;
        const stockSymbol = data.symbol.toUpperCase();

        // 🔹 Obtener IP y anonimizar
        const ip = req.ip || req.connection.remoteAddress;
        const anonIp = bcrypt.hashSync(ip, 4);

        // 🔹 Guardar o actualizar en MongoDB
        let stockDoc = await Stock.findOne({ symbol: stockSymbol });
        if (!stockDoc) {
          stockDoc = new Stock({ symbol: stockSymbol, price, likes: like ? [anonIp] : [] });
        } else {
          stockDoc.price = price;
          if (like && !stockDoc.likes.includes(anonIp)) stockDoc.likes.push(anonIp);
        }
        await stockDoc.save();

        return {
          stock: stockSymbol,
          price,
          likes: stockDoc.likes.length,
        };
      }));

      if (stockData.length === 2) {
        const [s1, s2] = stockData;
        return res.json({
          stockData: [
            { stock: s1.stock, price: s1.price, rel_likes: s1.likes - s2.likes },
            { stock: s2.stock, price: s2.price, rel_likes: s2.likes - s1.likes },
          ],
        });
      }

      res.json({ stockData: stockData[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
};

module.exports = router;
