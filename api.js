'use strict';
const fetch = require('node-fetch');

// Base temporal en memoria
const stocks = {};

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.json({ error: 'Stock no especificado' });

      // Permitir un string o array
      if (typeof stock === 'string') stock = [stock];

      const results = await Promise.all(
        stock.map(async (symbol) => {
          const response = await fetch(
            `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
          );
          const data = await response.json();

          if (!data.symbol) throw new Error('Stock no encontrado');

          const stockSymbol = data.symbol.toUpperCase();
          const price = data.latestPrice;

          // Inicializamos si no existe
          if (!stocks[stockSymbol]) stocks[stockSymbol] = new Set();

          // Like único por IP
          if (like === 'true') stocks[stockSymbol].add(req.ip);

          return {
            stock: stockSymbol,
            price,
            likes: stocks[stockSymbol].size,
          };
        })
      );

      // Si hay dos acciones → calcular rel_likes
      if (results.length === 2) {
        const [s1, s2] = results;
        const rel1 = s1.likes - s2.likes;
        const rel2 = s2.likes - s1.likes;
        return res.json({
          stockData: [
            { stock: s1.stock, price: s1.price, rel_likes: rel1 },
            { stock: s2.stock, price: s2.price, rel_likes: rel2 },
          ],
        });
      }

      // Una sola acción
      res.json({ stockData: results[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
};

