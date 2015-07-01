var debug = require('debug')('rss:index');
var express = require('express');
var morgan = require('morgan');
var LRU = require('lru-cache');
var PTT = require('./ptt');
var RSS = require('rss');
var app = express();
var cache = LRU({
  max: 50,
  maxAge: 1000 * 60 * 5
});

app.use(morgan(':req[X-Real-IP] - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

app
  .get('/:board\.xml', function(req, res, next) {
    if (!req.params.board) throw Error('Invaild Parameters');
    var board = req.params.board;
    var siteUrl = 'https://www.ptt.cc/bbs/' + board + '/index.html';
    var obj = cache.get(board);
    if (obj) {
      var duration = Math.abs(obj.timestamp - (new Date()).getTime());
      if (duration < 1000 * 60 * 5) {
        debug('cached board: %s', board);
        res.set('Content-Type', 'text/xml');
        return res.send(obj.xml);
      }

      debug('delete cached board:%s timestamp: %s', board, duration);
      cache.del(board);
    }

    var feed = new RSS({
      title: board,
      description: 'PTT: ' + board,
      link: 'https://www.ptt.cc',
      site_url: siteUrl,
      generator: 'PttRSS',
      pubDate: new Date()
    });

    PTT(siteUrl, function(err, rows) {
      if (err) throw err;

      rows.forEach(function(row) {
        feed.item(row);
      });

      var xml = feed.xml();
      cache.set(board, {xml: xml, timestamp: (new Date()).getTime()});
      debug('set cache board: %s', board);
      res.set('Content-Type', 'text/xml');
      res.send(xml);
    });
  });

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Internal Error');
});

module.exports = app;
