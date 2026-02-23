# 🚀 Roundnet Directory Europe — Launch Checklist

> **Stack:** Next.js 14 App Router · i18n (en/de/fr/es/it) · Vercel  
> **Domain:** roundnet-directory.eu (TBD)  
> **Last updated:** 2026-02-23

---

## 1) PRE-LAUNCH MUST-DO

### Technical / Infra

- [x] Production build succeeds (`npm run build`) with zero TS errors
- [x] Edge runtime compatibility confirmed (no `__dirname` in middleware bundle)
- [ ] Environment variables confirmed in prod:
  - `NEXT_PUBLIC_SITE_URL` → final domain
  - `DATABASE_URL` → production Postgres
  - `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (if auth enabled)
- [x] HTTPS only (Vercel default)
- [x] Canonical URLs are absolute and correct on every page (via `generateAlternates`)
- [x] 404 behavior: unpublished / missing pages → `notFound()`
- [x] Redirects: `/` → `/en` (middleware + config)
- [x] Invalid locale → `notFound()` (layout validates `locales.includes(locale)`)
- [x] `robots.txt` serves correctly:
  - Disallow: `/api/`, `/admin/`, `/auth/`
  - Block AI bots (GPTBot, CCBot)
  - Sitemap reference included
- [x] `sitemap.xml` generated:
  - All locales included
  - Country / city / club pages included
  - `lastModified` present
- [ ] Sitemap excludes noindex pages (cities with 0 clubs)
- [ ] Page speed: Lighthouse mobile ≥ 85 performance
- [ ] Largest images optimized (Next.js `<Image>` component)
- [x] Map loads client-only and lazy (placeholder currently)
- [x] Caching headers for static assets (Vercel default)
- [ ] Error monitoring configured (Sentry or similar)

### Security / Privacy / GDPR

- [ ] Privacy Policy page exists at `/[locale]/privacy`
- [ ] Cookie banner (if using GA4 or analytics cookies)
- [ ] Consent flags honored:
  - Phone hidden by default
  - Email hidden unless `displayEmail=true`
- [ ] "Remove my data" flow works (contact form or email)
- [ ] Rate-limit on `/api/submissions` and `/api/admin/*`
- [ ] reCAPTCHA / hCaptcha on club submission form
- [ ] Email addresses not exposed in raw HTML (obfuscated or server-relay)

### Content / SEO Quality

- [x] Country pages have:
  - Localized intro text (SEO section)
  - FAQ schema (`FAQPage` JSON-LD) — *(on city pages; add to country pages)*
  - ItemList schema for clubs
  - Internal links block
- [x] City pages have:
  - Localized intro text (SEO section)
  - 3+ FAQs + FAQ schema
  - ItemList schema
  - `noindex` if 0 clubs (`noIndex: clubCount === 0`)
- [x] Club pages have:
  - Unique title + description
  - `SportsActivityLocation` + `Organization` schema
  - Contact + social links
  - "Claim this club" CTA
- [ ] Learn hub pages exist and link to directory pages
- [ ] Best-of pages exist and link to cities/clubs
- [x] No thin pages indexed (noindex rule active for empty pages)
- [x] Hreflang: each page lists all 5 locales + `x-default`
- [x] Self-referencing hreflang exists

### Data / Ingestion Readiness

- [ ] Sync job runs successfully in production
- [ ] Dedupe proven (no duplicate clubs on re-sync)
- [ ] Admin moderation workflow tested:
  - Approve submission → published → appears on site + sitemap
  - Unpublish → disappears + 404
- [ ] Geocoding cache warm
- [ ] "Last verified" tracking visible in admin

### Analytics Setup

- [ ] Google Search Console verified (domain property)
- [ ] Submit sitemap in GSC
- [ ] Analytics installed (GA4 / Plausible / Matomo)
- [ ] Define conversions:
  - Club submission
  - Claim club
  - Click "Contact"
  - Newsletter signup
- [ ] UTM conventions documented

---

## 2) LAUNCH DAY RUNBOOK

- [ ] Deploy production release tag (e.g. `v1.0`)
- [ ] Smoke test top routes:
  - `/en` → 200
  - `/en/clubs` → 200
  - `/en/clubs/france` → 200
  - `/en/clubs/france/lyon` → 200
  - `/en/club/<sample-club>` → 200
  - `/sitemap.xml` → valid XML
  - `/robots.txt` → correct rules
- [ ] Validate structured data:
  - [Rich Results Test](https://search.google.com/test/rich-results) for a city page
  - [Rich Results Test](https://search.google.com/test/rich-results) for a club page
- [ ] Submit sitemap in Google Search Console
- [ ] URL Inspection (Fetch as Google) for:
  - Homepage
  - 3 country pages
  - 5 city pages
- [ ] Post announcement:
  - EURA / IRF socials
  - NGB emails (use template in outreach section)
  - 10 club DMs on Instagram asking to claim listing
- [ ] Monitor logs for:
  - 404 spikes
  - Middleware errors
  - Bot traffic anomalies
- [ ] Rollback plan ready (revert to previous Vercel deployment)

---

## 3) POST-LAUNCH — FIRST 14 DAYS

### Day 1–2
- [ ] Fix any indexing blockers (wrong canonicals, sitemap errors, hreflang bugs)
- [ ] Add 20–50 more clubs manually (high quality) to seed coverage
- [ ] Create "Add a club" CTA on empty country/city pages (still noindex)

### Day 3–7
- [ ] Outreach to NGBs: request backlink to their country page
- [ ] Outreach to top clubs: ask them to link their profile page
- [ ] Publish 3 Learn articles (rules, how-to-start, equipment guide)
- [ ] Publish 2 Best-of pages per big country (e.g. "Best beginner clubs in Germany")

### Day 8–14
- [ ] Expand coverage in 2 biggest communities (DE + FR)
- [ ] Launch weekly newsletter
- [ ] Add "Events" MVP (even if manually curated)
- [ ] Evaluate search queries in GSC → adjust titles/descriptions for CTR

---

## 4) FIRST 200 PAGES ROLLOUT PLAN

> **Principle:** Index only pages with substance. Target quick wins first.

### Phase A — Pages 1–40
| Type | Count | Detail |
|------|-------|--------|
| Country pages | 25 | 5 countries × 5 locales (FR, DE, IT, ES, CH) |
| City pages (EN) | 10 | Cities with ≥ 2 clubs |
| Learn pages (EN) | 5 | Rules, equipment, beginner guide, etc. |
| **Total** | **~40** | |

**Action:** Ensure these are perfect — unique intros, FAQs, schema, internal links.

### Phase B — Pages 41–120
| Type | Count | Detail |
|------|-------|--------|
| City pages (EN) | 40 | Cities with ≥ 1 club |
| Best-of pages (EN) | 10 | "Best indoor clubs in X", etc. |
| Translations (DE/FR) | 30 | Top-performing country + top 10 city pages |
| **Total** | **+80** | |

**Action:** Use GSC impression data to pick which cities to translate first.

### Phase C — Pages 121–200
| Type | Count | Detail |
|------|-------|--------|
| City pages (EN) | 60 | Remaining cities |
| Translations (ES/IT) | 10 | Based on traffic demand |
| Tournament hub + events | 10 | EN only initially |
| **Total** | **+80** | |

### Indexing Rules
- City page indexable only if `clubCount ≥ 1`
- Best-of pages indexable only if they list ≥ 5 clubs
- Learn pages always indexable (must be high-quality, 500+ words)

---

## 5) QA TEST PLAN

### Manual Smoke Tests
- [ ] **i18n:** Switching languages keeps same route; `<html lang>` correct
- [ ] **SEO (view-source):** `<link rel="canonical">`, hreflang tags, Open Graph tags present
- [ ] **noindex:** Empty city pages have `<meta name="robots" content="noindex, follow">`
- [ ] **Structured data:**
  - FAQPage present on city pages
  - ItemList present on listing pages
  - SportsActivityLocation on club pages
  - BreadcrumbList on all inner pages
- [ ] **Sitemap:** Opens fast, contains expected URLs, does NOT contain `/admin` or noindex pages
- [ ] **Contact privacy:** Phone hidden, email masked
- [ ] **Submission flow:** Add club → appears in admin as pending → approve → published + visible
- [ ] **Unpublish:** Club becomes 404 and removed from sitemap on next build

### Automated Tests (CI)
See `scripts/qa-smoke.spec.ts`:
- [ ] `/en` loads 200
- [ ] `/en/clubs/france` loads 200 + has canonical
- [ ] `/en/clubs/france/lyon` has FAQ schema `<script type="application/ld+json">`
- [ ] `/sitemap.xml` contains `/en` URLs
- [ ] Club page has SportsActivityLocation schema
- [ ] Noindex pages excluded from sitemap

---

## 6) ANALYTICS + TRACKING PLAN

### Events to Track (GA4 / Plausible)
| Event | Trigger |
|-------|---------|
| `view_country_page` | Country page load |
| `view_city_page` | City page load |
| `view_club_page` | Club page load |
| `click_contact` | Click "Contact" / email button |
| `click_instagram` | Click Instagram link |
| `submit_add_club` | Club submission form submit |
| `submit_claim_club` | Claim club button click |
| `newsletter_signup` | Newsletter form submit |

### Dashboards
- Top countries/cities by traffic
- Conversion rate per CTA
- Pages with high impressions but low CTR → optimize titles
- Pages with high CTR but low time on page → improve content

---

## 7) OUTREACH + BACKLINKS PLAN (FIRST 30 DAYS)

### A) NGB Backlinks (Highest Value)
Contact each European Roundnet federation via IRF directory.

**Email template:**
> **Subject:** Add your club directory page to your official resources  
>  
> Hi [Federation Name],  
>  
> We launched a pan-European Roundnet club directory.  
> Your country page: [URL]  
>  
> We keep your club list updated and link back to your federation site.  
> Would you add this link under "Where to play / Clubs" on your website?  
>  
> Best regards,  
> Roundnet Directory Team

### B) Club Backlinks (Volume)
- Message 10 clubs/day via Instagram or email
- "Your club page is live — claim it and add your logo. Please link from your bio/website."
- Provide embeddable HTML badge snippet

### C) Tournament Organizers
- Ask to link tournament pages and submit events

### D) Communities & Universities
- Post in Facebook Roundnet groups + student sports groups
- "Find your local roundnet community at roundnet-directory.eu"

---

## 8) RISK REGISTER

| # | Risk | Impact | Mitigation |
|---|------|--------|------------|
| 1 | Thin pages indexed | SEO penalty | Enforce noindex + sitemap exclusion for empty pages |
| 2 | Duplicate clubs | Bad UX, SEO | Strict dedupe in data provider + admin review |
| 3 | Scraping breaks | Stale data | Modular fetchers + monitoring + manual fallback |
| 4 | GDPR complaint | Legal | Consent flags + fast removal workflow |
| 5 | Hreflang mistakes | Ranking issues | Automated tests + start with small locale set |
| 6 | Low adoption | No growth | Strong "claim club" CTA + systematic IG outreach |
| 7 | Map performance | Slow pages | Lazy load + server-side lists first |
| 8 | Spam submissions | Bad data | CAPTCHA + rate limit + moderation queue |
| 9 | Wrong/outdated info | Trust loss | "Report an issue" button + `lastVerifiedAt` field |
| 10 | No backlinks | Low authority | Weekly NGB + club outreach targets |
