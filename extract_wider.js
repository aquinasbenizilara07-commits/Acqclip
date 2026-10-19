const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/tool_detail.html', 'utf8');
const idx = html.indexOf('id="search-bar"');
// Let's go back 1200 characters and forward 1200 characters
const snippet = html.substring(idx - 1000, idx + 1000);

// Find surrounding container tags
console.log('Snippet:');
console.log(snippet);
