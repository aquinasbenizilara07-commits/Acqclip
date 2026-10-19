const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/tool_detail.html', 'utf8');
const idx = html.indexOf('id="search-bar"');
const formStart = html.lastIndexOf('<form', idx);
const formEnd = html.indexOf('</form>', idx) + 7;

if (formStart !== -1 && formEnd !== -1) {
  console.log('=== FORM FOUND ===');
  console.log(html.substring(formStart, formEnd));
} else {
  console.log('Form not matched directly, finding parent container...');
  const divStart = html.lastIndexOf('<div class="', idx - 200);
  console.log(html.substring(divStart, idx + 800));
}
