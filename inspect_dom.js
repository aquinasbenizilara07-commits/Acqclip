const fs = require('fs');

const html = fs.readFileSync('e:/REA/klapacq/extracted_klap.html', 'utf8');

// Find main sections
const headerMatch = html.match(/<header[\s\S]*?<\/header>/);
const subnavMatch = html.match(/<nav class="justify-center flex items-center text-slate-500"[\s\S]*?<\/nav>/);
const heroMatch = html.match(/<section class="max-w-5xl mx-auto px-3 my-16 text-center[\s\S]*?<\/section>/);
const gridSectionsMatch = html.match(/<div class="mx-auto my-16 md:my-24 px-3 max-w-\[1500px\] px-3 md:px-12 mx-auto">([\s\S]*?)<\/div><footer/);
const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);

console.log('Header found:', !!headerMatch);
console.log('Subnav found:', !!subnavMatch);
console.log('Hero found:', !!heroMatch);
console.log('Grid sections found:', !!gridSectionsMatch);
console.log('Footer found:', !!footerMatch);
