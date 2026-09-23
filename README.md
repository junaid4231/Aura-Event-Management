# Aura Event Management — website

Static, production-ready site: 3 pages plus a 404 page, mobile-first, self-hosted fonts and libraries, no framework and no build step on Vercel.

## Deploy on Vercel

**Option A — GitHub (recommended, auto-deploys on every push)**
1. Create a new GitHub repository and upload **the contents of this `website` folder** (so `index.html` and `vercel.json` sit at the repo root).
2. In Vercel, go to **Add New → Project**, import the repo, and use these settings:
   - Framework Preset: **Other**
   - Build Command: *leave empty*
   - Output Directory: *leave empty* (the root)
3. Click **Deploy**.

**Option B — Vercel CLI**
```bash
npm i -g vercel
cd website
vercel          # first run links/creates the project (preview URL)
vercel --prod   # publish to production
```

## After you connect a domain
1. Vercel → Project → **Settings → Domains** → add your domain (e.g. `auraevents.ae`).
2. In `build.py`, set `SITE_URL = "https://your-domain"`.
3. Run `python build.py` (needs `pip install pillow`; `npm i -g esbuild` minifies CSS/JS).
4. Push or redeploy. This updates canonical URLs, social previews, the sitemap and robots.txt.

## What's included for production
- Clean URLs: `/`, `/work`, `/enquire`. Old `.html` links redirect automatically. `/contact`, `/portfolio` and `/whatsapp` shortcuts are set up.
- Security headers (CSP, HSTS, nosniff, frame-deny, referrer and permissions policy) in `vercel.json`.
- Long-term caching for fonts, libraries and versioned CSS/JS; weekly caching with background refresh for photos and videos.
- SEO: unique titles and descriptions, canonical URLs, Open Graph and Twitter cards, LocalBusiness structured data, `sitemap.xml`, `robots.txt`.
- Web app manifest and icons; favicon in `.ico` and SVG; Apple touch icon.
- Custom `404.html`.
- Performance: minified and versioned CSS/JS, deferred scripts, preloaded hero, lazy images with intrinsic sizes (no layout shift), videos that start after the page loads and pause off-screen.
- Accessibility: skip link, keyboard-friendly gallery and palette picker, reduced-motion support (snow and animation off), and a snowfall on/off toggle that is remembered.
- `.vercelignore` keeps source files (`build.py`, unminified CSS/JS) off the live site.

## Editing
- **Copy and pages:** edit `build.py`, then run `python build.py`. It regenerates the HTML, minifies the assets, and refreshes the sitemap, robots.txt and manifest.
- **Styles and behaviour:** edit `assets/aura.css` and `assets/aura.js`, then run `python build.py` so the `.min` files and cache-busting versions update.
- **Videos:** replace the files in `media/` and keep the names (portrait 4:5, about 720×900, H.264 MP4, muted, under about 1.5 MB). Export the first frame as the matching `-poster.webp`.

Before launch, check the copy that describes your service: the installation window, take-down, areas covered and the FAQ answers.
