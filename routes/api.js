'use strict';
const fetch = require('node-fetch');
const bcrypt = require('bcrypt'); // para anonimizar IPs

// Estructura de datos en memoria
// Ejemplo: { "GOOG": { likes: Set(), price: 130.25 } }
const stocks = {};

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      let { stock, like } = req.query;
      if (!stock) return res.status(400).json({ error: 'Debes especificar un stock' });

      // Permitir 1 o 2 acciones (stock puede ser string o array)
      if (typeof stock === 'string') {
        stock = [stock];
      }

      // 🔹 Obtener los datos de cada acción desde el proxy de freeCodeCamp
      const stockData = await Promise.all(
        stock.map(async (symbol) => {
          const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote`;
          const response = await fetch(url);
          const data = await response.json();

          const price = data.latestPrice;
          const stockSymbol = data.symbol.toUpperCase();

          // Si no existe la acción en memoria, la inicializamos
          if (!stocks[stockSymbol]) stocks[stockSymbol] = { likes: new Set(), price };

          // 🔹 Anonimizar la IP (para cumplir con privacidad)
          const ip = req.ip || req.connection.remoteAddress;
          const anonIp = bcrypt.hashSync(ip, 4); // se guarda un hash, no la IP real

          // Si el usuario le da "like", lo registramos
          if (like) {
            stocks[stockSymbol].likes.add(anonIp);
          }

          return {
            stock: stockSymbol,
            price,
            likes: stocks[stockSymbol].likes.size,
          };
        })
      );

      // 🔹 Si se consultaron 2 acciones, devolvemos "rel_likes"
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

      // 🔹 Si es una sola acción, devolvemos directamente sus datos
      res.json({ stockData: stockData[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
};
