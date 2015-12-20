var debug = require('debug')('rss:app');
var express = require('express');
var morgan = require('morgan');
var LRU = require('lru-cache');
var pttRoute = require('./routes/ptt');
var app = express();

app.use(morgan(':req[X-Real-IP] - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

app.get('/', function(req, res) {
  console.log(req.query);
  res.end()
});

app.use(pttRoute);

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Internal Error');
});

module.exports = app;
