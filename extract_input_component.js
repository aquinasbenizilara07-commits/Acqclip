const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/tool_detail.html', 'utf8');

const idx = html.indexOf('id="search-bar"');
if (idx !== -1) {
  // Grab 1000 characters before and 1000 characters after
  const snippet = html.substring(Math.max(0, idx - 800), Math.min(html.length, idx + 1200));
  console.log(snippet);
} else {
  console.log('search-bar not found in tool_detail.html');
}
