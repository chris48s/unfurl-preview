const { unfurl } = require('unfurl.js');
const url = require('url');

const writeResponse = function (response, code, body) {
  response.writeHead(code, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(body);
};

function prependHttp(url) {
  url = url.trim();

  if (/^\.*\/|^(?!localhost)\w+:/.test(url)) {
    return url;
  }

  return url.replace(/^(?!(?:\w+:)?\/\/)/, 'http://');
}

module.exports = function (request, response) {
  const parsedUrl = url.parse(request.url, true);
  if (request.method == 'GET') {
    let targetUrl = parsedUrl.query.url;
    if (!targetUrl) {
      return writeResponse(response, 200, renderPage('', ''));
    }
    targetUrl = prependHttp(targetUrl);

    unfurl(targetUrl)
      .then(function (data) {
        writeResponse(response, 200, renderPage(targetUrl, renderResult(targetUrl, data)));
      })
      .catch(function (err) {
        writeResponse(response, 200, renderPage(targetUrl, err.toString()));
      });
  } else {
    writeResponse(response, 405, 'method not allowed');
  }
};

function renderPage(url, result) {
  const jsonLinkHtml =
    url && result.length > 0
      ? `<br /><a href="/api/json?url=${encodeURIComponent(url)}">Get this data as JSON</a>`
      : '';

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <link rel="shortcut icon" href="favicon.ico">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kognise/water.css@1.2.2/dist/dark.css" />
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
        ${jsonLinkHtml}
      </main>
    </body>
  </html>`;
}

function renderResult(url, data) {
  const description = data.description || (data.open_graph && data.open_graph.description);
  const authorName = data.open_graph && data.open_graph.site_name;
  const authorIcon = data.favicon;
  const title = data.title.trim() || (data.open_graph && data.open_graph.title);
  const titleLink = (data.open_graph && data.open_graph.url) || url;
  const thumbUrl =
    data.open_graph && data.open_graph.images && data.open_graph.images[0] && data.open_graph.images[0].url;

  const thumbHtml = thumbUrl ? `<img src="${thumbUrl}" width="100" align="right" alt="thumbnail" />` : '';
  const authorHtml = authorName
    ? `
    <p>
      ${authorIcon ? `<img src="${authorIcon}" height="14" alt="author icon" />` : ''}
      ${authorIcon ? ' ' : ''}
      ${authorName}
    </p>`
    : '';
  const titleLinkHtml = titleLink ? `<a href="${titleLink}">${title}</a>` : title;
  const titleHtml = title ? `<p><strong>${titleLinkHtml}</strong></p>` : '';
  const descriptionHtml = description ? `<p>${description}</p>` : '';

  return `
    <blockquote>
      ${thumbHtml}
      ${authorHtml}
      ${titleHtml}
      ${descriptionHtml}
    </blockquote>
  `;
}
