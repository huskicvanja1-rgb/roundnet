# 🏐 Roundnet Directory — Master Plan & Progress

> Originalni 8-step data pipeline (Frey Chu strategija)

---

## Pipeline koraci

| # | Korak | Skripta | Status |
|---|-------|---------|--------|
| 1 | Scrape raw data (Outscraper Google Maps) | `scripts/scrapers/01-outscraper-scrape.py` | ✅ 39 rezultata, 24 pretrage |
| 2 | Clean & standardize data (lokalni, bez API) | `scripts/scrapers/02-clean-data-local.py` | ✅ 29 klubova, 10 zemalja |
| 3 | Import u app (TypeScript data provider) | `scripts/scrapers/03-import-to-app.py` | ✅ Generisan `scraped-data.ts` |
| 4 | Verify websites (Crawl4AI) | — | ⬜ Planirano |
| 5 | Enrich data (trening raspored, opisi) | — | ⬜ Planirano |
| 6 | Verify images (Claude Vision) | — | ⬜ Planirano |
| 7 | Extract features (amenities, filteri) | — | ⬜ Planirano |
| 8 | Connect database (Prisma/Neon) | — | ⬜ Planirano |

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
- [x] Outscraper scrape — 39 rezultata sa Google Maps
- [x] Čišćenje podataka — 29 pravih klubova u 25 gradova, 10 zemalja
- [x] Import u app — MockDataProvider zamenjen sa ScrapedDataProvider
- [x] Deploy sa pravim podacima (125+ statičkih stranica)

## Statistika podataka 📊

| Zemlja | Klubovi | Gradovi |
|--------|---------|---------|
| 🇦🇹 Austria | 2 | 2 |
| 🇧🇪 Belgium | 7 | 6 |
| 🇫🇷 France | 4 | 4 |
| 🇩🇪 Germany | 6 | 5 |
| 🇮🇹 Italy | 2 | 2 |
| 🇱🇺 Luxembourg | 2 | 1 |
| 🇳🇴 Norway | 1 | 1 |
| 🇵🇱 Poland | 1 | 1 |
| 🇪🇸 Spain | 2 | 2 |
| 🇬🇧 United Kingdom | 2 | 1 |
| **Ukupno** | **29** | **25** |

## Šta je SLEDEĆE ⏭️

1. ~~Nabaviti Outscraper API ključ~~ ✅
2. ~~Pokrenuti korak 1 (scrape)~~ ✅
3. ~~Proći kroz pipeline korake 2–3~~ ✅
4. ~~Zameniti MockDataProvider pravim podacima~~ ✅
5. Obogatiti podatke (opisi, slike, rasporedi)
6. Verifikovati web sajtove klubova
7. Povezati Postgres bazu (Prisma)
8. Admin panel za moderaciju
