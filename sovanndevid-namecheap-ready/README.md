# Sovanndevid Nong — Personal Portfolio

A polished, responsive static portfolio prepared for **sovanndevid.xyz**.

## What's inside

- `index.html` — all page content, accessibility, SEO, Open Graph metadata, project links
- `styles.css` — responsive layout, custom illustrations, micro-interactions
- `script.js` — mobile navigation, project filters, copy-email action, dynamic year
- `assets/favicon.svg` — favicon
- `assets/social-card.svg` — social sharing visual

All main content works without build tools, bundlers or a backend. Web fonts use Google Fonts when online and system-font fallbacks offline. No analytics or tracking are installed.

## Preview locally

Double-click `index.html` or run `python3 -m http.server 8000` inside this folder and open `http://localhost:8000`.

## Publishing with GitHub Pages

1. Create a **public** GitHub repository (such as `portfolio`) and upload all the files/folders *inside this directory* to the repository root.
2. In repository **Settings > Pages**, publish from the main branch / root folder (or use the recommended GitHub Actions deployment if your account displays that instead).
3. In **Settings > Pages > Custom domain**, enter `sovanndevid.xyz` and save.
4. At your domain's DNS provider, set **A records** for the root `@` to GitHub Pages' documented IPv4 addresses: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Optionally add `www` as a CNAME to `sovanndevid.github.io` and add this domain to GitHub Pages as supported. Delete conflicting A/AAAA/CNAME records only after reviewing their current purpose.
5. Allow DNS to propagate, verify domain ownership if GitHub prompts for it, then enable **Enforce HTTPS** after GitHub issues a certificate.

**Important:** These record values apply **only if you choose GitHub Pages**. For Cloudflare Pages, Vercel, Netlify, or other hosting, use the DNS values provided by the chosen host instead. You normally do **not** need home-router port forwarding for hosted websites.

## Before publishing

- Review your name, employer, email address and project descriptions for public display.
- Confirm that you want to make the portfolio publicly accessible.
- Review GitHub repository visibility and content (the FitnessFlex and PlantShield links reference public repositories).
- Domain/DNS and the hosting account need to be under your control; never send passwords or API keys in chat.
- If you add a downloadable CV later, remove home address, phone or personal details you do not want public.

## Edit quickly

Change your text and project links in `index.html`, theme colours in the `:root` block in `styles.css`, and filter logic in `script.js`.

Prepared October 2026.
