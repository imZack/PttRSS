const debug = require('debug')('rss:ptt:index');
const express = require('express');
const NodeCache = require('node-cache');
const Promise = require('bluebird');
const RSS = require('rss');
const { getArticlesFromLink, getArticleFromLink } = require('ptt');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 * 5, checkperiod: 0 });
const articleCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 0 });

function matchTitle(article, keywords) {
  for (let index = 0; index < keywords.length; index += 1) {
    if (article.title.toLowerCase().indexOf(keywords[index].toLowerCase()) !== -1) {
      debug('title: %s matched keyword: %s', article.title, keywords[index]);
      return true;
    }
  }

  debug('title: %s not matched any keywords: %s', article.title, keywords);
  return false;
}

function filterArticles(articles, keywords, exclude = false) {
  return articles.filter(article => exclude ^ matchTitle(article, keywords));
}

function generateRSS(data, fetchContent) {
  fetchContent = (fetchContent === true);
  let { articles } = data;
  const feed = new RSS({
    title: data.board,
    description: `PTT: ${data.board}`,
    link: 'https://www.ptt.cc',
    site_url: data.siteUrl,
    generator: 'PttRSS',
    pubDate: new Date(),
  });
  const titleKeywords = data.titleKeywords;
  const exTitleKeywords = data.exTitleKeywords;

  // filter by title keywords
  if (titleKeywords && titleKeywords.length > 0) {
    articles = filterArticles(articles, titleKeywords);
  }

  if (exTitleKeywords && exTitleKeywords.length > 0) {
    debug(exTitleKeywords);
    articles = filterArticles(articles, exTitleKeywords, true);
  }

  // filter by push counts
  articles = articles.filter(article => article.push > data.push);

  if (fetchContent === false) {
    return new Promise((resolve) => {
      articles.forEach((articleMeta) => {
        feed.item(articleMeta);
      });
      resolve(feed);
    });
  }

  return Promise.map(articles, (articleMeta) => {
    const article = articleCache.get(articleMeta.url);
    if (article) {
      debug('cached article: %s', article.title);
      feed.item(article);
      return;
    }

    getArticleFromLink(articleMeta.url)
      .then((_article) => {
        const articleWithMeta = Object.assign(articleMeta, _article);
        feed.item(articleWithMeta);
        debug('set cache article: %s', articleWithMeta.title, articleWithMeta.url);
        articleCache.set(articleWithMeta.url, articleWithMeta);
      })
      .delay(100);
  }, { concurrency: 3 }).then(() => Promise.resolve(feed));
}

router
  .get('/:board\.xml', (req, res, next) => {
    if (!req.params.board) return next(Error('Invaild Parameters'));

    const board = req.params.board.toLowerCase();
    const siteUrl = `https://www.ptt.cc/bbs/${board}/index.html`;
    const push = req.query.push || -99;
    const minArticleCount = req.query.minArticleCount || 50;
    const cachedKey = req.originalUrl;
    const fetchContent = req.query.fetchContent === 'true';
    let titleKeywords = req.query.title || [];
    if (!Array.isArray(titleKeywords)) {
      titleKeywords = [titleKeywords];
    }

    let exTitleKeywords = req.query.extitle || [];
    if (!Array.isArray(exTitleKeywords)) {
      exTitleKeywords = [exTitleKeywords];
    }

    // Get from cache first
    const obj = cache.get(cachedKey);
    if (obj) {
      return generateRSS({
        siteUrl,
        board,
        articles: obj.articles,
        titleKeywords,
        exTitleKeywords,
        push,
      }, fetchContent)
        .then((feed) => {
          debug('cached board: %s', board, cachedKey);
          res.set('Content-Type', 'text/xml');
          return res.send(feed.xml());
        })
        .catch(err => next(err));
    }

    const response = function response(articles) {
      debug('set cache board: %s', board, cachedKey);
      cache.set(
        cachedKey,
        { articles },
      );

      return generateRSS({
        siteUrl,
        board,
        articles,
        titleKeywords,
        exTitleKeywords,
        push,
      }, fetchContent);
    };

    let articles = [];
    const getArticles = (data) => {
      if (!data.articles) throw Error('Fetch failed');

      articles = articles.concat(data.articles);
      if (articles.length < minArticleCount) {
        debug('get more articles, current count: %s', articles.length);
        return getArticlesFromLink(data.nextPageUrl)
          .then(_data => getArticles(_data));
      }

      return Promise.resolve(articles);
    };

    // Start crawling board index
    return getArticlesFromLink(siteUrl)
      .then(data => getArticles(data))
      .then(_articles => response(_articles))
      .then((feed) => {
        res.set('Content-Type', 'text/xml');
        res.send(feed.xml());
      })
      .catch(err => next(err));
  });

module.exports = {
  router,
};
