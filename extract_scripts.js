const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/extracted_klap.html', 'utf8');

// Find all script tags
const scripts = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]).filter(s => s.includes('.js'));
console.log('Total scripts found:', scripts.length);
scripts.forEach(s => console.log(s));
