const { unfurl } = require('unfurl.js');
const url = require('url');
const { renderResult, writeHtmlResponse } = require('../lib.js');

module.exports = function (request, response) {
  const parsedUrl = url.parse(request.url, true);
  if (request.method == 'GET') {
    let targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      return writeHtmlResponse(response, 200, '');
    }

    unfurl(targetUrl)
      .then(function (data) {
        writeHtmlResponse(response, 200, renderResult(targetUrl, data));
      })
      .catch(function (err) {
        writeHtmlResponse(response, 200, err.toString());
      });
  } else {
    writeHtmlResponse(response, 405, 'method not allowed');
  }
};
