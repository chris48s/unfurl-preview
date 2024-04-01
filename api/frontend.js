const { unfurl } = require('unfurl.js');
const url = require('url');
const { renderResult, prependHttp, writeHtmlResponse } = require('../lib.js');

module.exports = function (request, response) {
  const parsedUrl = url.parse(request.url, true);
  if (request.method == 'GET') {
    let targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      return writeHtmlResponse(response, 200, renderPage('', ''));
    }
    targetUrl = prependHttp(targetUrl);

    unfurl(targetUrl)
      .then(function (data) {
        writeHtmlResponse(response, 200, renderPage(targetUrl, renderResult(targetUrl, data)));
      })
      .catch(function (err) {
        writeHtmlResponse(response, 200, renderPage(targetUrl, err.toString()));
      });
  } else {
    writeHtmlResponse(response, 405, 'method not allowed');
  }
};

function renderPage(url, result) {
  const apiLinks =
    url && result.length > 0
      ? `<a href="/api/html?url=${encodeURIComponent(url)}">Get this HTML fragment</a> |
         <a href="/api/json?url=${encodeURIComponent(url)}">Get this data as JSON</a>`
      : '';

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <link rel="shortcut icon" href="favicon.ico">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/water.css@2.1.1/out/water.min.css" />
      <style>
      blockquote {
        margin: 0;
        padding: 0 1em;
        border-left: 0.25em solid #dfe2e5;
        text-align: left;
      }
      p {
        padding: 0.1em;
      }
      input {
        max-width: 90%
      }
      </style>
      <title>Unfurl Preview</title>
    </head>
    <body>
      <header><h1>Unfurl Preview</h1></header>
      <main>
        <form method="get">
          <input
            style="margin-right: 1em"
            type="text"
            name="url"
            id="url"
            size="36"
            value="${url}"
          />
          <input type="submit" value="unfurl"/>
        </form>
        <div id="result">${result}</div>
        <br />
        ${apiLinks}
      </main>
    </body>
  </html>`;
}
