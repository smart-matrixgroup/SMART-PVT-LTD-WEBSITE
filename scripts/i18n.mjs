// Post-build translation: turns dist/index.html (English) into dist/ta.html and
// dist/si.html using the dictionaries in src/i18n/.
//
//   node scripts/i18n.mjs            build the Tamil and Sinhala pages
//   node scripts/i18n.mjs --extract  list strings with no translation yet (src/i18n/todo-*.txt)
//
// Dictionaries are src/i18n/ta.json and si.json: { "English text": "translation" }.
// Text with no entry stays in English. After changing site text, run
// "node scripts/i18n.mjs --extract" to list strings that still need a translation.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parse } from 'node-html-parser';

const SITE = 'https://findoursmart.com';
const DIST = 'dist';
const I18N = 'src/i18n';
const LANGS = { ta: { name: 'Tamil', locale: 'ta_LK' }, si: { name: 'Sinhala', locale: 'si_LK' } };
const ATTRS = ['aria-label', 'placeholder', 'alt', 'title'];
const META = ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description', 'og:image:alt'];
const SKIP_JSON_KEYS = new Set(['id', 'logo', 'icon', 'url', 'image', 'photo', 'site', 'tone', 'wa', 'thumb', 'pdf']);

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");
const encode = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hasWords = (s) => /[A-Za-z]{2,}/.test(s) && !s.startsWith('<!') && !/^(https?:|\/|mailto:|tel:|#)/.test(s) && !/^[\w.-]+@[\w.-]+$/.test(s);

const root0 = () => parse(readFileSync(`${DIST}/index.html`, 'utf8'), { comment: true, blockTextElements: { script: true, style: true, noscript: true, pre: true } });

function walk(node, fn) {
  for (const ch of node.childNodes) {
    fn(ch);
    if (ch.childNodes?.length && !['script', 'style'].includes(ch.rawTagName)) walk(ch, fn);
  }
}

function collect(root) {
  const out = new Set();
  walk(root, (n) => {
    if (n.nodeType === 3) {
      const t = norm(decode(n.rawText).replace(/ /g, ' '));
      if (hasWords(t)) out.add(t);
    } else if (n.nodeType === 1) {
      for (const a of ATTRS) { const v = n.getAttribute?.(a); if (v && hasWords(norm(decode(v)))) out.add(norm(decode(v))); }
      if (n.rawTagName === 'meta') {
        const k = n.getAttribute('name') || n.getAttribute('property');
        if (META.includes(k)) out.add(norm(decode(n.getAttribute('content'))));
      }
    }
  });
  const data = root.querySelector('#site-data');
  if (data) {
    const visit = (v, key) => {
      if (typeof v === 'string') { if (!SKIP_JSON_KEYS.has(key) && hasWords(v)) out.add(norm(v)); }
      else if (Array.isArray(v)) v.forEach((x) => visit(x, key));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) visit(x, k);
    };
    visit(JSON.parse(data.rawText));
  }
  return [...out];
}

function loadDict(lang) {
  const file = `${I18N}/${lang}.json`;
  const dict = new Map();
  if (!existsSync(file)) return dict;
  for (const [en, tr] of Object.entries(JSON.parse(readFileSync(file, 'utf8')))) if (tr) dict.set(norm(en), tr);
  return dict;
}

function translate(lang, list) {
  const dict = loadDict(lang);
  const root = root0();
  const tr = (s) => dict.get(norm(s.replace(/ /g, ' ')));
  let missing = new Set();
  walk(root, (n) => {
    if (n.nodeType === 3) {
      const raw = decode(n.rawText);
      const key = norm(raw.replace(/ /g, ' '));
      if (!hasWords(key)) return;
      const t = tr(raw);
      if (!t) { missing.add(key); return; }
      const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
      n.rawText = encode(lead + t + trail);
    } else if (n.nodeType === 1) {
      for (const a of ATTRS) {
        const v = n.getAttribute?.(a);
        if (v && hasWords(norm(decode(v)))) { const t = tr(decode(v)); if (t) n.setAttribute(a, t); }
      }
      if (n.rawTagName === 'meta') {
        const k = n.getAttribute('name') || n.getAttribute('property');
        if (META.includes(k)) { const t = tr(decode(n.getAttribute('content'))); if (t) n.setAttribute('content', t); }
      }
    }
  });
  // JSON for the scripts and for search engines
  const mapJSON = (v, key) => {
    if (typeof v === 'string') return SKIP_JSON_KEYS.has(key) ? v : dict.get(norm(v)) ?? v;
    if (Array.isArray(v)) return v.map((x) => mapJSON(x, key));
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapJSON(x, k)]));
    return v;
  };
  for (const s of root.querySelectorAll('script[type="application/json"], script[type="application/ld+json"]')) {
    s.set_content(JSON.stringify(mapJSON(JSON.parse(s.rawText))).replace(/</g, '\\u003c'));
  }
  setLangMeta(root, lang);
  writeFileSync(`${DIST}/${lang}.html`, root.toString());
  return missing;
}

function setLangMeta(root, lang) {
  const html = root.querySelector('html');
  html.setAttribute('lang', lang === 'en' ? 'en-LK' : `${lang}-LK`);
  const url = lang === 'en' ? `${SITE}/` : `${SITE}/${lang}`;
  root.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  root.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  root.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'en' ? 'en_LK' : LANGS[lang].locale);
  const head = root.querySelector('head');
  for (const l of head.querySelectorAll('link[rel="alternate"][hreflang]')) l.remove();
  const alts = [['en', `${SITE}/`], ['ta', `${SITE}/ta`], ['si', `${SITE}/si`], ['x-default', `${SITE}/`]]
    .map(([h, u]) => `<link rel="alternate" hreflang="${h}" href="${u}" />`).join('');
  head.querySelector('link[rel="canonical"]').insertAdjacentHTML('afterend', alts);
  for (const el of root.querySelectorAll('[data-lang-code]')) el.set_content(lang.toUpperCase());
  for (const a of root.querySelectorAll('[data-lang-link]')) a.setAttribute('aria-current', String(a.getAttribute('data-lang-link') === lang));
}

const list = collect(root0());
if (process.argv.includes('--extract')) {
  for (const lang of Object.keys(LANGS)) {
    const dict = loadDict(lang);
    const todo = list.filter((x) => !dict.has(x));
    writeFileSync(`${I18N}/todo-${lang}.txt`, todo.join('\n') + '\n');
    console.log(`[i18n] ${lang}: ${todo.length} strings without a translation, see ${I18N}/todo-${lang}.txt (names, URLs and brand words stay English)`);
  }
} else {
  // English page: hreflang alternates only
  const en = root0();
  setLangMeta(en, 'en');
  writeFileSync(`${DIST}/index.html`, en.toString());
  for (const lang of Object.keys(LANGS)) {
    const missing = translate(lang, list);
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
