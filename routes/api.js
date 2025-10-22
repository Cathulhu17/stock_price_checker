'use strict';
const fetch = require('node-fetch');
const bcrypt = require('bcrypt');

const stocks = {}; // almacenamiento en memoria

module.exports = function (app) {
  app.route('/api/stock-prices').get(async (req, res) => {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.status(400).json({ error: 'Stock requerido' });

      // asegurar array
      if (typeof stock === 'string') stock = [stock];

      const results = await Promise.all(
        stock.map(async (symbol) => {
          const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
          const response = await fetch(url);
          const data = await response.json();

          const stockSymbol = data.symbol?.toUpperCase() || symbol.toUpperCase();
          const price = Number(data.latestPrice) || 0;

          // inicializar si no existe
          if (!stocks[stockSymbol]) stocks[stockSymbol] = { likes: new Set(), price };

          // IP anonimizada
          const ip = req.ip || req.connection.remoteAddress;
          const anonIp = bcrypt.hashSync(ip, 4);

          if (like === 'true' || like === true) {
            stocks[stockSymbol].likes.add(anonIp);
          }

          return {
            stock: stockSymbol,
            price,
            likes: stocks[stockSymbol].likes.size,
          };
        })
      );

      // si son 2 stocks -> rel_likes
      if (results.length === 2) {
        const [a, b] = results;
        return res.json({
          stockData: [
            { stock: a.stock, price: a.price, rel_likes: a.likes - b.likes },
            { stock: b.stock, price: b.price, rel_likes: b.likes - a.likes },
          ],
        });
      }

      // si es 1 stock
      res.json({ stockData: results[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno' });
    }
  });
};

