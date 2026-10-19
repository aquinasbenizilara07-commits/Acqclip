const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/tool_detail.html', 'utf8');
const idx = html.indexOf('id="search-bar"');
console.log(html.substring(idx - 1500, idx - 400));
