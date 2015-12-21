var debug = require('debug')('rss:ptt:crawler');
var request = require('request');
var cheerio = require('cheerio');
var baseUrl = 'https://www.ptt.cc';
var prevCss = '#action-bar-container > div > div.btn-group.pull-right > a:nth-child(2)';
var jar = request.jar();
var cookie = request.cookie('over18=1');
jar.setCookie(cookie, 'https://www.ptt.cc');
request = request.defaults({jar: jar});

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

          var push = elem.children('div.nrec').text();
          if (push === '') {
            push = 0;
          } else if (push === '爆') {
            push = 100;
          } else if (push[0] === 'X') {
            push = -(+push.substr(1, 1));
          } else {
            push = +push;
          }

          var row = {
            title: elem.children('div.title').children('a').text(),
            date: elem.children('div.meta').children('div.date').text(),
            author: elem.children('div.meta').children('div.author').text(),
            push: push,
            url: baseUrl +
                 elem.children('div.title').children('a').attr('href')
          };

          if (row.title === '') {
            return;
          }

          row.date = Date.parse(new Date().getFullYear() + '/' + row.date);
          rows.push(row);
        });

      if (rows.length < 50) {
        var nextPage = baseUrl + $(prevCss).attr('href');
        if (!nextPage) {
          debug('no next page');
          return cb(null, rows);
        }

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
