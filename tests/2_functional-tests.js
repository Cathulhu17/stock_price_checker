const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {

  this.timeout(10000); // por si la API tarda

  let likesBefore = 0;

  // 1️⃣ Ver una acción
  test('Viewing one stock: GET /api/stock-prices/', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        likesBefore = res.body.stockData.likes;
        done();
      });
  });

  // 2️⃣ Ver una acción y darle "like"
  test('Viewing one stock and liking it: GET /api/stock-prices/', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isAtLeast(res.body.stockData.likes, likesBefore);
        done();
      });
  });

  // 3️⃣ Ver la misma acción y volver a darle like (no debe aumentar)
  test('Viewing the same stock and liking it again: GET /api/stock-prices/', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.equal(res.body.stockData.likes, likesBefore + 1); // no suma más likes
        done();
      });
  });

  // 4️⃣ Ver dos acciones
  test('Viewing two stocks: GET /api/stock-prices/', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.property(res.body.stockData[0], 'rel_likes');
        done();
      });
  });

  // 5️⃣ Ver dos acciones y darles like
  test('Viewing two stocks and liking them: GET /api/stock-prices/', function (done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.property(res.body.stockData[0], 'rel_likes');
        done();
      });
  });

});

