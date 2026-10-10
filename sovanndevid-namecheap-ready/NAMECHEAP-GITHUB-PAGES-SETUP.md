# Connect sovanndevid.xyz to GitHub Pages (Namecheap)

**Status: prepared only. No site published and no DNS records changed.**

## Before launch — your approval is required

Do not change public GitHub Pages settings or domain records until you have reviewed the website and explicitly approved publishing. Review any displayed personal/contact information, employer references, and project details.

## 1. Stage the website privately on GitHub

- Sign in to GitHub as `sovanndevid`.
- Create a **private** repository named `sovanndevid.github.io` (if this name is still available in your account).
- Upload the contents of the accompanying website ZIP into the root of the repository; the `index.html` and `CNAME` files must be at the repository root, not one folder deeper.
- Keep the repository private and GitHub Pages disabled while the portfolio is under review.

On GitHub Free, publishing a GitHub Pages website requires a public repository; do not enable Pages or change visibility until approval. A public repository exposes source code as well as the website.

## 2. After you explicitly approve public launch

- In GitHub repo Settings > General > Danger Zone, change the repository from private to public (only if you approve exposing website files).
- In Settings > Pages, set Source to **Deploy from a branch**, Branch `main`, Folder `/ (root)`, and Save.
- In GitHub Settings > Pages, ensure **Custom domain** is `sovanndevid.xyz` (the website ZIP also already has a CNAME file that contains this value).
- Prefer verifying the domain ownership in GitHub first if GitHub offers verification; follow the TXT record instructions it provides, if needed.

## 3. Namecheap DNS — only after GitHub Pages is configured

In Namecheap: Domain List > Manage next to `sovanndevid.xyz` > Advanced DNS > Host Records. If Namecheap BasicDNS/PremiumDNS/FreeDNS is not being used, edit records at the actual nameserver provider instead.

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A Record | @ | 185.199.108.153 | Automatic |
| A Record | @ | 185.199.109.153 | Automatic |
| A Record | @ | 185.199.110.153 | Automatic |
| A Record | @ | 185.199.111.153 | Automatic |
| CNAME Record | www | sovanndevid.github.io | Automatic |

Remove only conflicting A, AAAA, ALIAS, CNAME or URL redirect records for the relevant `@` and `www` hosts **after inspecting what they're used for**. Do not remove MX, email-related TXT, DKIM, or SPF records. Save all changes.

Important: To avoid a domain takeover risk, register the custom domain in GitHub Pages before pointing Namecheap DNS at GitHub. DNS may take up to 24 hours to propagate.

## 4. Verify and secure

- Open `https://sovanndevid.xyz` and `https://www.sovanndevid.xyz` (the latter should redirect to the apex domain).
- In GitHub Settings > Pages, check the domain's DNS status and enable **Enforce HTTPS** when available.
- If email already uses this domain, confirm email still works; do not modify mail-related records.
- Check desktop and mobile layout and that project links and mailto links work.

## Official instructions

- GitHub: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- Namecheap: https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/

**No router port forwarding is needed. Never provide account passwords or API keys in chat.**
