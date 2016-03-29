var debug = require('debug')('rss:app');
var morgan = require('morgan');
var PTTRouter = require('./routes/ptt').router;
var express = require('express');
var app = express();

app.use(morgan(':req[X-Real-IP] - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"')); // jscs:ignore

app.get('/', function (req, res) {
  res.end();
});

app.use(PTTRouter);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Internal Error');
});

module.exports = app;
