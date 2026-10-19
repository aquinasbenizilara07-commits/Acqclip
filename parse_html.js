const fs = require('fs');
const html = fs.readFileSync('e:/REA/klapacq/extracted_klap.html', 'utf8');

// Match sections
const sectionMatches = [...html.matchAll(/<section id="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<\/section>/g)];
console.log('Sections count:', sectionMatches.length);
sectionMatches.forEach(m => {
  console.log('ID:', m[1], 'Title:', m[2].replace(/<[^>]+>/g, '').trim());
});

// Videos
const videos = html.match(/https:\/\/assets\.klap\.app\/[^"'\s]+\.mp4/g) || [];
console.log('\nUnique videos:', Array.from(new Set(videos)));
