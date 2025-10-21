const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.property(res.body.stockData, 'symbol');
        assert.property(res.body.stockData, 'price');
        done();
      });
  });

  test('Viewing one stock and liking it', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, 'likes');
        done();
      });
  });

  test('Viewing the same stock and liking it again (should not increase likes)', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData, 'likes');
        done();
      });
  });

  test('Viewing two stocks', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        done();
      });
  });

  test('Viewing two stocks and liking them', function(done) {
    chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['TSLA', 'AMZN'], like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.property(res.body.stockData[0], 'rel_likes');
        done();
      });
  });

});
