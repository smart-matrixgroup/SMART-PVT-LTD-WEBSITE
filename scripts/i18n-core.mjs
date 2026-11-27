// Shared translation logic, used by the build step (scripts/i18n.mjs) and by the
// dev server (astro.config.mjs) so /ta and /si work in both.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

export const SITE = 'https://findoursmart.com';
export const LANGS = { ta: { name: 'Tamil', locale: 'ta_LK' }, si: { name: 'Sinhala', locale: 'si_LK' } };
const I18N = fileURLToPath(new URL('../src/i18n/', import.meta.url));
const ATTRS = ['aria-label', 'placeholder', 'alt', 'title'];
const META = ['description', 'og:title', 'og:description', 'twitter:title', 'twitter:description', 'og:image:alt'];
const SKIP_JSON_KEYS = new Set(['id', 'logo', 'icon', 'url', 'image', 'photo', 'site', 'tone', 'wa', 'thumb', 'pdf']);

const norm = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");
const encode = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hasWords = (s) => /[A-Za-z]{2,}/.test(s) && !s.startsWith('<!') && !/^(https?:|\/|mailto:|tel:|#)/.test(s) && !/^[\w.-]+@[\w.-]+$/.test(s);

export const parseHtml = (html) => parse(html, { comment: true, blockTextElements: { script: true, style: true, noscript: true, pre: true } });

function walk(node, fn) {
  for (const ch of node.childNodes) {
    fn(ch);
    if (ch.childNodes?.length && !['script', 'style'].includes(ch.rawTagName)) walk(ch, fn);
  }
}

/** Every English string on the page that could be translated. */
export function collect(html) {
  const root = parseHtml(html);
  const out = new Set();
  walk(root, (n) => {
    if (n.nodeType === 3) {
      const t = norm(decode(n.rawText));
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

export function loadDict(lang) {
  const file = `${I18N}${lang}.json`;
  const dict = new Map();
  if (!existsSync(file)) return dict;
  for (const [en, tr] of Object.entries(JSON.parse(readFileSync(file, 'utf8')))) if (tr) dict.set(norm(en), tr);
  return dict;
}

/** English HTML in, translated HTML out. lang 'en' only sets the language links. */
export function translateHtml(html, lang) {
  const root = parseHtml(html);
  const missing = new Set();
  if (lang !== 'en') {
    const dict = loadDict(lang);
    const tr = (s) => dict.get(norm(s));
    walk(root, (n) => {
      if (n.nodeType === 3) {
        const raw = decode(n.rawText);
        const key = norm(raw);
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
    const mapJSON = (v, key) => {
      if (typeof v === 'string') return SKIP_JSON_KEYS.has(key) ? v : dict.get(norm(v)) ?? v;
      if (Array.isArray(v)) return v.map((x) => mapJSON(x, key));
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapJSON(x, k)]));
      return v;
    };
    for (const s of root.querySelectorAll('script[type="application/json"], script[type="application/ld+json"]')) {
      s.set_content(JSON.stringify(mapJSON(JSON.parse(s.rawText))).replace(/</g, '\\u003c'));
    }
  }
  setLangMeta(root, lang);
  return { html: root.toString(), missing };
}

function setLangMeta(root, lang) {
  root.querySelector('html')?.setAttribute('lang', lang === 'en' ? 'en-LK' : `${lang}-LK`);
  const url = lang === 'en' ? `${SITE}/` : `${SITE}/${lang}`;
  root.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
  root.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  root.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'en' ? 'en_LK' : LANGS[lang].locale);
  const head = root.querySelector('head');
  if (head) {
    for (const l of head.querySelectorAll('link[rel="alternate"][hreflang]')) l.remove();
    const alts = [['en', `${SITE}/`], ['ta', `${SITE}/ta`], ['si', `${SITE}/si`], ['x-default', `${SITE}/`]]
      .map(([h, u]) => `<link rel="alternate" hreflang="${h}" href="${u}" />`).join('');
    head.querySelector('link[rel="canonical"]')?.insertAdjacentHTML('afterend', alts);
  }
  for (const el of root.querySelectorAll('[data-lang-code]')) el.set_content(lang.toUpperCase());
  for (const a of root.querySelectorAll('[data-lang-link]')) a.setAttribute('aria-current', String(a.getAttribute('data-lang-link') === lang));
}
