const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/tool_detail.html', 'utf8');
const idx = html.indexOf('id="search-bar"');
console.log('--- 400 chars before ---');
console.log(html.substring(idx - 400, idx));
console.log('--- 600 chars after ---');
console.log(html.substring(idx, idx + 600));
