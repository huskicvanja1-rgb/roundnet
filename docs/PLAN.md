# 🏐 Roundnet Directory — Master Plan & Progress

> Originalni 8-step data pipeline (Frey Chu strategija)

---

## Pipeline koraci

| # | Korak | Skripta | Status |
|---|-------|---------|--------|
| 1 | Scrape raw data (Outscraper Google Maps) | `scripts/scrapers/01-outscraper-config.json` | ⬜ Nije pokrenuto |
| 2 | Clean & standardize data (Claude API) | `scripts/scrapers/02-clean-data.py` | ⬜ Skripta gotova, čeka podatke |
| 3 | Verify websites (Crawl4AI) | `scripts/scrapers/03-verify-websites.py` | ⬜ Nije pokrenuto |
| 4 | Enrich data (trening raspored, features) | `scripts/scrapers/04-enrich-data.py` | ⬜ Nije pokrenuto |
| 5 | Verify images (Claude Vision) | `scripts/scrapers/05-verify-images.py` | ⬜ Nije pokrenuto |
| 6 | Extract features (amenities, filteri) | `scripts/scrapers/06-extract-features.py` | ⬜ Nije pokrenuto |
| 7 | Generate service areas (mapiranje gradovi) | `scripts/scrapers/07-service-areas.py` | ⬜ Nije pokrenuto |
| 8 | Import to app (generisanje data providera) | `scripts/scrapers/08-import-to-app.py` | ⬜ Nije pokrenuto |

---

## Potrebni API ključevi

- `OUTSCRAPER_API_KEY` — https://outscraper.com
- `ANTHROPIC_API_KEY` — https://console.anthropic.com

---

## Šta je ZAVRŠENO ✅

- [x] Next.js sajt sa i18n (en/de/fr/es/it)
- [x] Directory stranice (country/city/club)
- [x] SEO: canonical, hreflang, JSON-LD (FAQ, ItemList, BreadcrumbList, SportsActivityLocation)
- [x] Sitemap.xml i robots.txt
- [x] noindex za prazne stranice
- [x] Dinamički `<html lang>` po lokalu
- [x] Deploy na Vercel (radi, 200 na svim rutama)
- [x] Launch checklist (`docs/LAUNCH_CHECKLIST.md`)
- [x] Playwright smoke testovi (`scripts/qa-smoke.spec.ts`)
- [x] GSC submission vodič (`docs/GSC_SUBMISSION_NOTES.md`)
- [x] Uklonjen next-intl (ručni i18n sistem, nema __dirname greške)

## Šta je SLEDEĆE ⏭️

1. Nabaviti Outscraper API ključ
2. Pokrenuti korak 1 (scrape)
3. Proći kroz pipeline korake 2–8
4. Zameniti MockDataProvider pravim podacima
5. Povezati Postgres bazu (Prisma)
6. Admin panel za moderaciju
