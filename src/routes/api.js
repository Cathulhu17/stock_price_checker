'use strict';

const fetch = require('node-fetch'); // Requiere node-fetch v2
const bcrypt = require('bcrypt'); // Para anonimizar IPs

// Datos en memoria
// Ejemplo: { "GOOG": { likes: Set(), price: 130.25 } }
const stocks = {};

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.status(400).json({ error: 'Debes especificar un stock' });

      // Si es una sola acción, convertir a array
      if (typeof stock === 'string') stock = [stock];

      // Obtener datos de cada acción
      const stockData = await Promise.all(
        stock.map(async (symbol) => {
          const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
          const response = await fetch(url);
          const data = await response.json();

          if (!data || data === 'Unknown symbol') {
            throw new Error(`No se encontró la acción: ${symbol}`);
          }

          const price = data.latestPrice;
          const stockSymbol = data.symbol.toUpperCase();

          if (!stocks[stockSymbol]) stocks[stockSymbol] = { likes: new Set(), price };

          // Anonimizar IP
          const ip = req.ip || req.connection.remoteAddress;
          const anonIp = bcrypt.hashSync(ip, 4); // hash de IP

          // Registrar like si aplica
          if (like) stocks[stockSymbol].likes.add(anonIp);

          return {
            stock: stockSymbol,
            price,
            likes: stocks[stockSymbol].likes.size,
          };
        })
      );

      // Rel_likes si hay 2 acciones
      if (stockData.length === 2) {
        const [s1, s2] = stockData;
        const rel_likes1 = s1.likes - s2.likes;
        const rel_likes2 = s2.likes - s1.likes;

        return res.json({
          stockData: [
            { stock: s1.stock, price: s1.price, rel_likes: rel_likes1 },
            { stock: s2.stock, price: s2.price, rel_likes: rel_likes2 },
          ],
        });
      }

      // Si es solo 1 acción
      res.json({ stockData: stockData[0] });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
};
