var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('rss:ptt');
var baseUrl = 'https://www.ptt.cc';
var prevCss = '#action-bar-container > div > div.btn-group.pull-right > a:nth-child(2)';

function PTT(link, rows, cb) {
  if (arguments.length < 3) {
    cb = rows;
    rows = [];
  }

  debug('fetching %s', link);
  request.get(link, function(err, resp, html) {
      if (!err && resp.statusCode === 200) {
        var $ = cheerio.load(html);
        $('#main-container > div.r-list-container.bbs-screen > div')
          .each(function(i, elem) {
          var elem = $(elem);
          var row = {
            title: elem.children('div.title').children('a').text(),
            date: elem.children('div.meta').children('div.date').text(),
            author: elem.children('div.meta').children('div.author').text(),
            url: baseUrl + elem.children('div.title').children('a').attr('href')
          };

          if (row.title === '') {
            return;
          }

          row.date =  Date.parse(new Date().getFullYear() + '/' +
            row.date.substr(1, row.date.length));
          rows.push(row);
        });

        if (rows.length < 50) {
          var nextPage = baseUrl + $(prevCss).attr('href');
          PTT(nextPage, rows, cb);
          return;
        }

        debug('get %s rows', rows.length);
        return cb(null, rows);
      }

      debug(err);
      cb(err, null);
    });
}

module.exports = PTT;
