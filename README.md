# Sovanndevid Nong — Portfolio v2.0

Responsive static portfolio for Sovanndevid (David) Nong at **https://sovanndevid.xyz/**.

## Pages and assets

- `index.html` — homepage with five projects, skills, experience and contact
- `projects/fitnessflex.html`, `projects/plantshield.html`, `projects/study-buddy.html` — verified GitHub project case studies
- `styles.css` and `case-study.css` — responsive design, including reduced-motion support
- `script.js` — navigation, project filters, copy-email and interaction tracking
- `assets/Sovanndevid_Nong_Resume_2026.pdf` — general-purpose one-page résumé (source details checked against 2026 résumé)
- `CNAME`, `sitemap.xml`, `robots.txt`, `.nojekyll` — static-site and custom-domain configuration

## Analytics

Google tag `G-5RKWZN6Y47` is included in every HTML page. Additional GA4 events:

| Event name | Interaction | Personal data sent? |
| --- | --- | --- |
| `resume_download` | Résumé link | No |
| `portfolio_project_open` | Case study link | Project slug only |
| `portfolio_social_click` | GitHub/LinkedIn code link | Destination category only |
| `portfolio_contact_click` | Email link | No address passed |

Follow local privacy, cookie, consent and analytics requirements before public deployment.

## Before publishing

1. Review each case study for factual accuracy and group-work attribution.
2. Review the PDF résumé and ensure your contact details are intended for public distribution.
3. Test in a local static server and run an independent Lighthouse report from Chrome DevTools.
4. After explicit approval, commit the deployment files to `main` in `sovanndevid/sovanndevid.github.io`.
5. Confirm deployment, custom-domain HTTPS and GA4 Realtime / DebugView events.

GitHub README drafts are distributed separately in the review package and must not be deployed to the website.
