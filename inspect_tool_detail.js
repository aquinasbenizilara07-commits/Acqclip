const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/tool_detail.html', 'utf8');

// Find inputs, forms, buttons
const inputs = [...html.matchAll(/<input[^>]+>/g)].map(m => m[0]);
const forms = [...html.matchAll(/<form[^>]+>/g)].map(m => m[0]);
const buttons = [...html.matchAll(/<button[^>]+>([\s\S]*?)<\/button>/g)].map(m => m[0].replace(/<[^>]+>/g, '').trim());

console.log('Inputs found:');
inputs.forEach(i => console.log(' ', i));

console.log('\nButtons found:');
buttons.filter(b => b.length > 0 && b.length < 50).forEach(b => console.log(' ', b));
