'use strict';
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');

const stocks = {};

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.status(400).json({ error: 'Debes especificar un stock' });

      if (typeof stock === 'string') stock = [stock];

      const stockData = await Promise.all(
        stock.map(async (symbol) => {
          const response = await fetch(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
          );
          const data = await response.json();

          if (!data || !data.symbol || !data.latestPrice) {
            return { stock: symbol.toUpperCase(), price: null, likes: 0 };
          }

          const price = data.latestPrice;
          const stockSymbol = data.symbol.toUpperCase();

          if (!stocks[stockSymbol]) stocks[stockSymbol] = { likes: new Set(), price };

          const ip = req.ip || req.connection.remoteAddress;
          const anonIp = bcrypt.hashSync(ip, 4);

          if (like === 'true') {
            stocks[stockSymbol].likes.add(anonIp);
          }

          return {
            stock: stockSymbol,
            price,
            likes: stocks[stockSymbol].likes.size,
          };
        })
      );

      if (stockData.length === 2) {
        const [s1, s2] = stockData;
        return res.json({
          stockData: [
            {
              stock: s1.stock,
              price: s1.price,
              rel_likes: s1.likes - s2.likes,
            },
            {
              stock: s2.stock,
              price: s2.price,
              rel_likes: s2.likes - s1.likes,
            },
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
