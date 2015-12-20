var debug = require('debug')('rss:ptt:index');
var express = require('express');
var LRU = require('lru-cache');
var PTTCrawler = require('./crawler');
var RSS = require('rss');
var router = express.Router();
var cache = LRU({
  max: 50,
  maxAge: 1000 * 60 * 5
});

function matchTitle(article, keywords) {
  for (var index = 0; index < keywords.length; index++) {
    if (article.title.indexOf(keywords[index]) != -1) {
      debug('title: %s matched keyword: %s', article.title, keywords[index]);
      return true;
    }
  }

  debug('title: %s not matched any keywords: %s', article.title, keywords);
  return false;
}

function filterArticles(articles, keywords) {
  return articles.filter(function(article) {
    return matchTitle(article, keywords);
  });
}

function generateRSS(data) {
  var feed = new RSS({
    title: data.board,
    description: 'PTT: ' + data.board,
    link: 'https://www.ptt.cc',
    site_url: data.siteUrl,
    generator: 'PttRSS',
    pubDate: new Date()
  });

  articles = data.articles;
  if (data.titleKeywords && data.titleKeywords.length > 0) {
    articles = filterArticles(data.articles, data.titleKeywords);
  }

  articles.forEach(function(row) {
    feed.item(row);
  });

  return feed;
}

router
  .get('/:board\.xml', function(req, res, next) {
    if (!req.params.board) {
      return next(Error('Invaild Parameters'));
    }

    var board = req.params.board;
    var siteUrl = 'https://www.ptt.cc/bbs/' + board + '/index.html';
    var titleKeywords = req.query.title || [];
    if (!Array.isArray(titleKeywords)) {
      titleKeywords = [titleKeywords];
    }

    // Get from cache first
    var obj = cache.get(board);
    if (obj) {

      // check timestamp duration
      var duration = Math.abs(obj.timestamp - (new Date()).getTime());
      if (duration < 1000 * 60 * 5) {
        debug('cached board: %s', board);
        res.set('Content-Type', 'text/xml');
        var feed = generateRSS({
          siteUrl: siteUrl,
          board: board,
          articles: obj.articles,
          titleKeywords: titleKeywords
        });

        return res.send(feed.xml());
      }

      debug('delete cached board:%s timestamp: %s', board, duration);
      cache.del(board);
    }


    // Start crawling board index
    PTTCrawler(siteUrl, function(err, rows) {
      if (err) {
        return next(err);
      }

      if (!rows) {
        return next(Error('Fetch failed'));
      }

      debug('set cache board: %s', board);
      cache.set(board, {articles: rows, timestamp: (new Date()).getTime()});

      var feed = generateRSS({
        siteUrl: siteUrl,
        board: board,
        articles: rows,
        titleKeywords: titleKeywords
      });

      res.set('Content-Type', 'text/xml');
      res.send(feed.xml());
    });
  });


module.exports = router;
