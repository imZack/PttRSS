'use strict';

var debug = require('debug')('rss:ptt:index');
var express = require('express');
var LRU = require('lru-cache');
var RSS = require('rss');
var router = express.Router();
var cache = LRU({
  max: 50,
  maxAge: 1000 * 60 * 5,
});
var getArticlesFromBoard = require('./board').getArticlesFromBoard;

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
  let articles = data.articles;
  let feed = new RSS({
    title: data.board,
    description: 'PTT: ' + data.board,
    link: 'https://www.ptt.cc',
    site_url: data.siteUrl,
    generator: 'PttRSS',
    pubDate: new Date(),
  });

  // filter by title keywords
  if (data.titleKeywords && data.titleKeywords.length > 0) {
    articles = filterArticles(data.articles, data.titleKeywords);
  }

  // filter by push counts
  articles = articles.filter(function(article) {
    return article.push > data.push;
  });

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

    const board = req.params.board.toLowerCase();
    const siteUrl = 'https://www.ptt.cc/bbs/' + board + '/index.html';
    const push = req.query.push || -99;
    const minArticleCount = req.query.minArticleCount || 50;
    const cachedKey = req.originalUrl;
    let titleKeywords = req.query.title || [];
    if (!Array.isArray(titleKeywords)) {
      titleKeywords = [titleKeywords];
    }

    // Get from cache first
    const obj = cache.get(cachedKey);
    if (obj) {

      // check timestamp duration
      let duration = Math.abs(obj.timestamp - (new Date()).getTime());
      if (duration < 1000 * 60 * 5) {
        debug('cached board: %s', board, cachedKey);
        res.set('Content-Type', 'text/xml');
        let feed = generateRSS({
          siteUrl: siteUrl,
          board: board,
          articles: obj.articles,
          titleKeywords: titleKeywords,
          push: push,
        });

        return res.send(feed.xml());
      }

      debug('delete cached board:%s timestamp: %s',
             board, duration, cachedKey);
      cache.del(board);
    }

    let response = function response(articles) {
      debug('set cache board: %s', board, cachedKey);
      cache.set(
        cachedKey,
        {
          articles: articles,
          timestamp: (new Date()).getTime(),
        }
      );

      let feed = generateRSS({
        siteUrl,
        board,
        articles,
        titleKeywords,
        push,
      });

      res.set('Content-Type', 'text/xml');
      res.send(feed.xml());
    };

    let articles = [];
    let getArticlesCB = function(err, nextPageUrl, newArticles) {
      if (err) return next(err);
      if (!newArticles) return next(Error('Fetch failed'));

      articles = articles.concat(newArticles);
      if (articles.length < minArticleCount) {
        debug('get more articles, current count: %s', articles.length);
        getArticlesFromBoard(nextPageUrl, getArticlesCB);
        return;
      }

      return response(articles);
    };

    // Start crawling board index
    getArticlesFromBoard(siteUrl, getArticlesCB);
  });

module.exports = {
  router,
};
