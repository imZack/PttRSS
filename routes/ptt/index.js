'use strict';

var debug = require('debug')('rss:ptt:index');
var express = require('express');
var NodeCache = require('node-cache');
var RSS = require('rss');
var router = express.Router();
var cache = new NodeCache({stdTTL: 60 * 5, checkperiod: 0});
var articleCache = new NodeCache({stdTTL: 60 * 60, checkperiod: 0});

var getArticlesFromBoard = require('./board').getArticlesFromBoard;
var getArticleFromLink = require('./article').getArticleFromLink;

function matchTitle(article, keywords) {
  for (var index = 0; index < keywords.length; index++) {
    if (article.title.indexOf(keywords[index]) !== -1) {
      debug('title: %s matched keyword: %s', article.title, keywords[index]);
      return true;
    }
  }

  debug('title: %s not matched any keywords: %s', article.title, keywords);
  return false;
}

function filterArticles(articles, keywords) {
  return articles.filter((article) => {
    return matchTitle(article, keywords);
  });
}

function generateRSS(data, fetchContent) {
  fetchContent = (fetchContent === true);
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
  articles = articles.filter((article) => {
    return article.push > data.push;
  });

  if (fetchContent === false) {
    return new Promise((resolve, reject) => {
      articles.forEach((articleMeta) => {
        feed.item(articleMeta);
      });
      resolve(feed);
    });
  }

  return new Promise((resolve, reject) => {
    articles.forEach((articleMeta) => {
      let article = articleCache.get(articleMeta.url);
      if (article) {
        debug('cached article: %s', article.title);
        feed.item(article);
        if (feed.items.length === articles.length) return resolve(feed);
        return;
      }

      getArticleFromLink(articleMeta.url, (err, article) => {
        if (err) return reject(err);
        article = Object.assign(articleMeta, article);
        feed.item(article);
        debug('set cache article: %s', article.title, article.url);
        articleCache.set(article.url, article);
        if (feed.items.length === articles.length) return resolve(feed);
      });
    });
  });
}

router
  .get('/:board\.xml', (req, res, next) => {
    if (!req.params.board) return next(Error('Invaild Parameters'));

    const board = req.params.board.toLowerCase();
    const siteUrl = 'https://www.ptt.cc/bbs/' + board + '/index.html';
    const push = req.query.push || -99;
    const minArticleCount = req.query.minArticleCount || 50;
    const cachedKey = req.originalUrl;
    const fetchContent = req.query.fetchContent === 'true';
    let titleKeywords = req.query.title || [];
    if (!Array.isArray(titleKeywords)) {
      titleKeywords = [titleKeywords];
    }

    // Get from cache first
    const obj = cache.get(cachedKey);
    if (obj) {
      return generateRSS({
        siteUrl: siteUrl,
        board: board,
        articles: obj.articles,
        titleKeywords: titleKeywords,
        push: push,
      }, fetchContent)
      .then((feed) => {
        debug('cached board: %s', board, cachedKey);
        res.set('Content-Type', 'text/xml');
        return res.send(feed.xml());
      }).catch((err) => {
        return next(err);
      });
    }

    let response = function response(articles) {
      debug('set cache board: %s', board, cachedKey);
      cache.set(
        cachedKey,
        {articles: articles}
      );

      return generateRSS({
        siteUrl,
        board,
        articles,
        titleKeywords,
        push,
      }, fetchContent)
      .then(feed => {
        res.set('Content-Type', 'text/xml');
        res.send(feed.xml());
        return;
      }).catch(err => {
        return next(err);
      });
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
