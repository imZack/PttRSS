'use strict';

const BASE_URL = require('./config').BASE_URL;
let Promise = require('bluebird');
let debug = require('debug')('rss:ptt:board');
let request = require('./config').request;
let cheerio = require('cheerio');
let prevCss = '#action-bar-container > div > div.btn-group.pull-right > a:nth-child(2)';

function getArticlesFromHtml(html) {
  let $ = cheerio.load(html);
  let nextPageUrl = BASE_URL + $(prevCss).attr('href');
  let articles = [];

  $('#main-container > div.r-list-container.bbs-screen > div').each(
    function (i, element) {
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
  return Promise.resolve({ nextPageUrl, articles });
}

function getArticlesFromBoard(link) {
  debug('fetching %s', link);
  return request.get(link).then(html => getArticlesFromHtml(html));
}

module.exports = {
  getArticlesFromBoard,
  getArticlesFromHtml,
};
