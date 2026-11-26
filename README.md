# findoursmart.com — SMART [PVT] LTD website

Static Astro site. Two separate experiences on one URL:

- **Desktop (> 860px):** the website — 3D neural hero (three.js, lazy-loaded) with services orbiting the SMART head; click a service for its popup.
- **Mobile (≤ 860px):** an iOS-style app — tab bar, large titles, inset grouped lists, page sheets with drag-to-dismiss, light/dark mode.

Prices are always shown as ranges (`price`, `priceFrom`, `priceMin`/`priceMax`). Both read every word, price and contact detail from **`src/data/site.ts`**. Edit there.

## Commands

```
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs dist/ (static files, host anywhere)
npm run preview   # serve the built dist/
```

## Before going live — fill in `src/data/site.ts` (search for `TODO(owner)`)

| Field | Why |
|---|---|
| `contact.hours` | Real opening hours |
| `social.*` | Facebook / Instagram / LinkedIn / TikTok links (empty ones are hidden) |
| `testimonials` | Real client quotes. Entries with `placeholder: true` show only in `npm run dev`, never in the build |

## Deploy

`npm run build`, then upload `dist/` to any static host (Cloudflare Pages, Netlify, Firebase Hosting, Vercel).
Point `findoursmart.com` DNS at the host. After it is live, add the site to Google Search Console and submit `https://findoursmart.com/sitemap-index.xml`.

## SEO included

Title/description/canonical, Open Graph + Twitter cards (`public/og-image.jpg`), JSON-LD (ProfessionalService with offer catalog and LKR prices, WebSite, WebPage, FAQPage), `robots.txt`, sitemap, web manifest, favicons.
