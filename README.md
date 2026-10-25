# Southdown Chiropractic & Wellness Centre — website

A single-page static site (HTML, CSS, vanilla JS). No build step or framework, so it can be hosted anywhere.

## Preview locally

```bash
python3 -m http.server 4173 --directory southdown-chiropractic
```

Then open http://localhost:4173.

## Structure

```
index.html            All page content, SEO meta and LocalBusiness (schema.org) data
assets/css/styles.css Design tokens at the top (brand teal/sage, stone neutrals, fonts)
assets/js/main.js     Mobile menu, "Open now" status + today's hours, scroll effects
assets/img/           Web-ready images (cropped from the clinic's Instagram)
assets/img/source/    Original Instagram downloads, not referenced by the site
```

Opening hours appear in three places: the `HOURS` array in `main.js` (drives "Open now"), the hours table in `index.html`, and the JSON-LD block in `<head>`. Update all three together.

## Content sources

Everything comes from the clinic's Instagram (@southdownchiropractic): services list, hours (pinned post, Aug 2025), Dr. Z's bio, first-visit process, and Jason's testimonial. The massage therapist is referred to generically until the clinic confirms who it is.

## Confirm with the clinic before launch

- Hours are still current (Mon/Wed 9–8, Tue/Sat 9–3, Thu 10–8, Fri/Sun closed)
- That massage is billable to extended health benefits, and whether they direct-bill
- Who their registered massage therapist is (to name them on the site), when massage is available, and current pricing
- Whether they want online booking (e.g. Jane App); currently all CTAs are call/email
- Permission to use Jason's testimonial and photos on the website
- Higher-resolution photos of the clinic, Dr. Z and the massage room (current ones are crops from Instagram graphics)

## Deploying

Upload the folder (excluding `assets/img/source/`) to any static host: Netlify, Cloudflare Pages, GitHub Pages, or their existing hosting. Point `southdownchiropractic.com` at it, which currently uses GoDaddy's site builder.
