'use strict';

var cors = require('cors');
var fs = require('fs');
var runner = { on: function(){}, report: null };

module.exports = function (app) {

  app.route('/_api/server.js')
    .get(function(req, res, next) {
      fs.readFile(__dirname + '/server.js', function(err, data) {
        if(err) return next(err);
        res.send(data.toString());
      });
    });
  app.route('/_api/routes/api.js')
    .get(function(req, res, next) {
      fs.readFile(__dirname + '/routes/api.js', function(err, data) {
        if(err) return next(err);
        res.type('txt').send(data.toString());
      });
    });

  app.get('/_api/get-tests', cors(), function(req, res, next){
    if(process.env.NODE_ENV === 'test') return next();
    res.json({status: 'unavailable'});
  },
  function(req, res, next){
    if(!runner.report) return next();
    res.json(runner.report);
  },
  function(req, res){
    runner.on('done', function(report){
      process.nextTick(() =>  res.json(runner.report));
    });
  });
};
