import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// In `npm run dev`, serve /ta and /si by translating the English page on the fly,
// the same way the build step writes dist/ta.html and dist/si.html.
const devLanguages = {
  name: 'smart-dev-languages',
  enforce: 'pre',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const m = req.url?.match(/^\/(ta|si)\/?(?:[?#].*)?$/);
      if (!m) return next();
      try {
        const { translateHtml } = await import(`./scripts/i18n-core.mjs?t=${Date.now()}`);
        const r = await fetch(`http://${req.headers.host}/`);
        const { html } = translateHtml(await r.text(), m[1]);
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(html);
      } catch (e) {
        next(e);
      }
    });
  },
};

export default defineConfig({
  site: 'https://findoursmart.com',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  vite: { build: { chunkSizeWarningLimit: 700 }, plugins: [devLanguages] },
  prefetch: { prefetchAll: true },
});
