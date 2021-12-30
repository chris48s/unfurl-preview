const { unfurl } = require('unfurl.js');
const url = require('url');
const { writeJsonResponse } = require('../lib.js');

module.exports = function (request, response) {
  const parsedUrl = url.parse(request.url, true);
  if (request.method == 'GET') {
    const targetUrl = parsedUrl.query.url;

    unfurl(targetUrl)
      .then(function (data) {
        writeJsonResponse(response, 200, data);
      })
      .catch(function (err) {
        writeJsonResponse(response, 500, err);
      });
  } else {
    writeJsonResponse(response, 405, { error: 'method not allowed' });
  }
};
