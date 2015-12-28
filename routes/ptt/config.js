'use strict';

const BASE_URL = 'https://www.ptt.cc';
let request = require('request-promise');
let jar = request.jar();
let cookie = request.cookie('over18=1');
jar.setCookie(cookie, 'https://www.ptt.cc');
request = request.defaults({jar: jar});

module.exports = {
  BASE_URL,
  request,
};
