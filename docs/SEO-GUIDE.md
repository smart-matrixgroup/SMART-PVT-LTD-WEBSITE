# findoursmart.com SEO guide

What is already built into the site, and the steps only you can do (they need your Google, domain and hosting logins).

## Already done in the code

| Area | What is in place |
|---|---|
| Titles and descriptions | Each language has its own title and description. English: "SMART [PVT] LTD \| Software Company in Trincomalee, Sri Lanka \| Websites & Apps" |
| Headings | One H1 per page: "Software company in Trincomalee, Sri Lanka" (Tamil and Sinhala versions on /ta and /si) |
| Languages | English `/`, Tamil `/ta`, Sinhala `/si`, linked with `hreflang` so Google shows the right one |
| Sitemap | `/sitemap-index.xml` lists every page with dates and language links |
| robots.txt | Allows everything, hides `/docs/`, points to the sitemap |
| Share preview | Open Graph and Twitter card with `og-image.jpg` (1200×630), for WhatsApp, Facebook and LinkedIn |
| Business data for Google | `ProfessionalService` schema: name, registration number PV 00277791, founding date, address, both phone numbers, opening hours, area served (Trincomalee, Eastern Province, Sri Lanka), services with LKR price ranges, social profiles, FAQ |
| Local signals | `geo.region` LK-53 (Trincomalee), the address and phone numbers shown as text on every page |
| Speed | Static HTML, self-hosted fonts with preload, lazy images, 3D only on laptops. Speed is a ranking factor |
| Mobile | A separate mobile layout. Google ranks the mobile version first |
| Verification hooks | Paste codes into `src/data/site.ts` → `seo` (see step 2) |
| Analytics hook | Paste Umami codes into `src/data/site.ts` → `analytics` (see step 6) |

## Your steps, in order

### 1. Put the site live (nothing else works before this)
1. Create a free account on **Cloudflare Pages** (or Netlify).
2. Connect the GitHub repo `smart-matrixgroup/SMART-PVT-LTD-WEBSITE`.
3. Build command `npm run build`, output folder `dist`.
4. Add the custom domain `findoursmart.com` (and `www` redirecting to it). HTTPS is automatic.

### 2. Google Search Console
1. Go to https://search.google.com/search-console and click **Add property**.
2. Best option: **Domain** → `findoursmart.com` → copy the TXT record → add it in your domain's DNS → **Verify**.
   Or **URL prefix** → **HTML tag** → copy only the `content="…"` value into `seo.googleSiteVerification` in `src/data/site.ts`, push, wait for the deploy, then click **Verify**.
3. **Sitemaps** → enter `sitemap-index.xml` → **Submit**.
4. **URL inspection** → paste `https://findoursmart.com/`, then `/ta`, then `/si` → **Request indexing** for each.
5. Check **Pages** and **Core Web Vitals** once a week for the first month.

### 3. Bing Webmaster Tools (also feeds ChatGPT search and DuckDuckGo)
https://www.bing.com/webmasters → **Import from Google Search Console**. One click once step 2 is done.

### 4. Google Business Profile (this decides "software company Trincomalee" on Maps)
- **Website**: `https://findoursmart.com`
- **Primary category**: Software company. **Extra categories**: Website designer, Internet marketing service, Computer consultant
- **Phones**: +94 26 222 7878 (main) and +94 789 999 687
- **Address exactly as on the site**: 135C, 2nd Floor, Inner Harbour Road, Trincomalee 31000
- **Hours**: Monday to Saturday 9:00 AM – 6:00 PM
- **Services**: add all 8 services with the same names and price ranges as the site
- **Photos**: logo, office front and inside, team, screenshots of client websites (10+ photos)
- **Posts**: one post a week (new project, offer, tip)
- **Reviews**: send every happy client the review link and reply to every review. Reviews are the biggest local ranking factor.

Keep the name, address and phone exactly the same everywhere (website, Google, Facebook, directories).

### 5. Links to your site
- Ask each client to add "Website by SMART" in their footer, linking to `https://findoursmart.com`: mehala.me, vaikunthan.com, lovecakehouse.com, uncampusacademy.com. Add it to every future project too.
- Put `https://findoursmart.com` in the Facebook page, YouTube About, TikTok bio, and a LinkedIn company page.
- List the business, with the same name, address and phone, in Sri Lankan directories (for example Rainbow Pages and other local business listings).
- Add `https://kadabook.app` ↔ `https://findoursmart.com` links both ways.

### 6. Visitor stats on the website (Umami, free, no cookies)
1. Sign up at https://cloud.umami.is and click **Add website** → `findoursmart.com`.
2. Copy the **Website ID** into `analytics.umamiWebsiteId` in `src/data/site.ts`.
3. In the website settings turn on **Share URL**, copy it into `analytics.umamiShareUrl`.
4. Push. The site starts counting visitors, pages, countries and time spent. A **Live website stats** link appears in the laptop footer and the mobile Contact tab.

### 7. After launch, keep growing
- Check https://pagespeed.web.dev for the home page and fix anything below 90.
- Add a case-study page for each client project and short articles (for example "How much does a website cost in Sri Lanka?"). New pages with real answers are what move you up for "best software company" searches.

## What to expect
- "SMART Trincomalee" and "SMART PVT LTD": usually first within days of indexing.
- "Software company Trincomalee" and "web design Trincomalee": usually top results in weeks to a few months, mainly from the Google Business Profile and reviews.
- "Best software company Sri Lanka": very competitive. It takes months of reviews, links and new content. Nobody can guarantee position one, but every step above pushes towards it.
