'use strict';

const BASE_URL = require('./config').BASE_URL;
let debug = require('debug')('rss:ptt:article');
let cheerio = require('cheerio');
let request = require('./config').request;
const AUTHOR_SELECTOR = '#main-content > div:nth-child(1) > span.article-meta-value';
const TITLE_SELECTOR = '#main-content > div:nth-child(3) > span.article-meta-value';
const BOARDNAME_SELECTOR = '#main-content > div.article-metaline-right > span.article-meta-value';
const DATETIME_SELECTOR = '#main-content > div:nth-child(4) > span.article-meta-value';

function getArticleFromHtml(html, cb) {
  let $ = cheerio.load(html);
  let article = {
    content: $('#main-content').text(),
    datetime: Date.parse($(DATETIME_SELECTOR).text()),
    author: $(AUTHOR_SELECTOR).text(),
    boardName: $(BOARDNAME_SELECTOR).text(),
    images: [],
  };

  $('img').each((i, element) => {
    article.images.push($(element).attr('src'));
  });

  cb(null, article);
}

/**
 * Get article body from Link
 * @param  {String}   link Article's link url.
 * @param  {Function} cb   callback(error, article)
 * @return {[type]}        [description]
 */
function getArticleFromLink(link, cb) {
  request.get(link, function(err, resp, html) {
    if (err || resp.statusCode !== 200) {
      debug(err);
      return cb(err, null);
    }

    getArticleFromHtml(html, cb);
  });
}

module.exports = {
  getArticleFromLink,
  getArticleFromHtml,
};

getArticleFromLink('https://www.ptt.cc/bbs/Beauty/M.1451229651.A.394.html', (err, article) => {
  console.log(article);
});
