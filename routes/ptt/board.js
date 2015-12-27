'use strict';

let debug = require('debug')('rss:ptt:board');
const BASE_URL = require('./config').BASE_URL;
let request = require('./config').request;
let cheerio = require('cheerio');
let prevCss = '#action-bar-container > div > div.btn-group.pull-right > a:nth-child(2)';

function getArticlesFromHtml(html, cb) {
  let $ = cheerio.load(html);
  let nextPageUrl = BASE_URL + $(prevCss).attr('href');
  let articles = [];

  $('#main-container > div.r-list-container.bbs-screen > div').each(
    function(i, element) {
      let elem = $(element);
      let push = elem.children('div.nrec').text();

      if (push === '') {
        push = 0;
      } else if (push === '爆') {
        push = 100;
      } else if (push[0] === 'X') {
        push = -(+push.substr(1, 1));
      } else {
        push = +push;
      }

      let row = {
        title: elem.children('div.title').children('a').text(),
        date: elem.children('div.meta').children('div.date').text(),
        author: elem.children('div.meta').children('div.author').text(),
        push: push,
        url: BASE_URL +
             elem.children('div.title').children('a').attr('href'),
      };

      if (row.title === '') {
        return;
      }

      row.date = Date.parse(new Date().getFullYear() + '/' + row.date);
      articles.push(row);
    });

  debug('get %s articles, next page link: %s', articles.length, nextPageUrl);
  return cb(null, nextPageUrl, articles);
}

/**
 * Get articles' data from board url
 * @param  {String}   link Start point, usually http://ptt.cc/boardname/index.html
 * @param  {Function} cb   callback(error, nextPageLink, articles)
 * @return {[type]}        None
 */
function getArticlesFromBoard(link, cb) {
  debug('fetching %s', link);
  request.get(link, function(err, resp, html) {
    if (err || resp.statusCode !== 200) {
      debug(err);
      return cb(err, null, null);
    }

    getArticlesFromHtml(html, cb);
  });
}

module.exports = {
  getArticlesFromBoard,
  getArticlesFromHtml,
};
