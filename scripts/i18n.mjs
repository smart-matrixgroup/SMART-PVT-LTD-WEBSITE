// Post-build translation: turns dist/index.html (English) into dist/ta.html and
// dist/si.html using the dictionaries in src/i18n/ (logic in i18n-core.mjs).
//
//   node scripts/i18n.mjs            build the Tamil and Sinhala pages
//   node scripts/i18n.mjs --extract  list strings with no translation yet (src/i18n/todo-*.txt)
//
// Dictionaries are src/i18n/ta.json and si.json: { "English text": "translation" }.
// Text with no entry stays in English.
import { readFileSync, writeFileSync } from 'node:fs';
import { SITE, LANGS, collect, loadDict, translateHtml } from './i18n-core.mjs';

const DIST = 'dist';
const english = readFileSync(`${DIST}/index.html`, 'utf8');

if (process.argv.includes('--extract')) {
  const list = collect(english);
  for (const lang of Object.keys(LANGS)) {
    const dict = loadDict(lang);
    const todo = list.filter((x) => !dict.has(x));
    writeFileSync(`src/i18n/todo-${lang}.txt`, todo.join('\n') + '\n');
    console.log(`[i18n] ${lang}: ${todo.length} strings without a translation, see src/i18n/todo-${lang}.txt (names, URLs and brand words stay English)`);
  }
} else {
  writeFileSync(`${DIST}/index.html`, translateHtml(english, 'en').html);
  for (const lang of Object.keys(LANGS)) {
    const { html, missing } = translateHtml(english, lang);
    writeFileSync(`${DIST}/${lang}.html`, html);
    console.log(`[i18n] ${lang}.html written${missing.size ? `, ${missing.size} strings left in English` : ''}`);
    if (missing.size && process.argv.includes('--verbose')) console.log([...missing].join('\n'));
  }
  // sitemap: every page with last-modified date; language pages list each other
  const today = new Date().toISOString().slice(0, 10);
  const alt = ['en', 'ta', 'si'].map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${l === 'en' ? '/' : '/' + l}"/>`).join('')
    + `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`;
  const pages = [
    [`${SITE}/`, '1.0', alt], [`${SITE}/ta`, '0.9', alt], [`${SITE}/si`, '0.9', alt],
    [`${SITE}/privacy-policy`, '0.3', ''], [`${SITE}/terms`, '0.3', ''],
  ];
  writeFileSync(`${DIST}/sitemap-0.xml`, '<?xml version="1.0" encoding="UTF-8"?>'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
    + pages.map(([u, p, a]) => `<url><loc>${u}</loc><lastmod>${today}</lastmod><priority>${p}</priority>${a}</url>`).join('')
    + '</urlset>');
}
