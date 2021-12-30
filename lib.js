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

function prependHttp(url) {
  url = url.trim();

  if (/^\.*\/|^(?!localhost)\w+:/.test(url)) {
    return url;
  }

  return url.replace(/^(?!(?:\w+:)?\/\/)/, 'http://');
}

const writeHtmlResponse = function (response, code, body) {
  response.writeHead(code, {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(body);
};

const writeJsonResponse = function (response, code, body) {
  response.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(body));
};

module.exports = { renderResult, prependHttp, writeHtmlResponse, writeJsonResponse };
