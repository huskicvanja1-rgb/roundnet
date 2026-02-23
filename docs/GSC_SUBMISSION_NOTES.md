# Google Search Console — Submission & Inspection Notes

## 1. Verify Domain Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **Add property** → choose **Domain** → enter `roundnet-directory.eu`
3. Verify via DNS TXT record (recommended for domain-level property)
   - Add a TXT record to your DNS: `google-site-verification=XXXXXXXXX`
   - In Vercel: **Settings → Domains → DNS Records** → add TXT
4. Wait for verification (can take up to 48 hours)

> **Alternative:** Use URL prefix method with `https://roundnet-directory.eu`  
> Verify via HTML tag in `<head>` (add to layout.tsx metadata).

---

## 2. Submit Sitemap

1. In GSC, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **Submit**
4. Verify status shows "Success" after Google fetches it

**Our sitemap includes:**
- All locale variants (`/en/`, `/de/`, `/fr/`, `/es/`, `/it/`)
- Home, clubs listing, country, city, and club pages
- `lastModified` timestamps
- Priority values (1.0 for home, 0.85 for countries, 0.8 for cities, 0.75 for clubs)

---

## 3. URL Inspection — Priority Pages

After submitting the sitemap, manually inspect these URLs to accelerate indexing:

### Homepage
```
https://roundnet-directory.eu/en
```

### Country Pages (top 5)
```
https://roundnet-directory.eu/en/clubs/germany
https://roundnet-directory.eu/en/clubs/france
https://roundnet-directory.eu/en/clubs/italy
https://roundnet-directory.eu/en/clubs/spain
https://roundnet-directory.eu/en/clubs/switzerland
```

### City Pages (top 5)
```
https://roundnet-directory.eu/en/clubs/germany/berlin
https://roundnet-directory.eu/en/clubs/france/lyon
https://roundnet-directory.eu/en/clubs/italy/bologna
https://roundnet-directory.eu/en/clubs/spain/barcelona
https://roundnet-directory.eu/en/clubs/germany/munich
```

**For each URL:**
1. Paste URL in GSC URL Inspection tool
2. Click **Request Indexing**
3. Verify the page:
   - Returns 200
   - Has correct canonical
   - Shows detected structured data (FAQ, ItemList, etc.)
   - Has hreflang references

---

## 4. Monitor Indexing

### First 7 Days
- Check **Coverage** report daily for errors
- Common issues to watch:
  - `Discovered – currently not indexed` → normal initially
  - `Crawled – currently not indexed` → may need content improvement
  - `Duplicate without user-selected canonical` → check canonical tags
  - `Excluded by 'noindex' tag` → expected for empty city pages

### First 30 Days
- Check **Performance** report:
  - Which pages get impressions?
  - Which queries drive clicks?
  - Which pages have low CTR? → optimize title/description
- Check **Core Web Vitals** report:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

---

## 5. Rich Results Validation

Test structured data with:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

**Pages to test:**
| Page Type | Expected Schema | URL Example |
|-----------|----------------|-------------|
| City page | FAQPage, ItemList, BreadcrumbList | `/en/clubs/germany/berlin` |
| Club page | SportsActivityLocation, BreadcrumbList, FAQPage | `/en/club/berlin-roundnet-verein` |
| Clubs listing | ItemList | `/en/clubs` |
| Country page | ItemList, BreadcrumbList | `/en/clubs/germany` |

---

## 6. Bing Webmaster Tools (Optional)

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Import from GSC (fastest method)
3. Submit same sitemap
4. Bing often indexes faster than Google for new sites

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| Sitemap returns 404 | Check `src/app/sitemap.ts` exists and builds correctly |
| Pages not indexed after 7 days | Request indexing manually; add internal links |
| "URL is not on Google" | Check robots.txt isn't blocking; check canonical |
| Structured data errors | Validate with Rich Results Test; fix JSON-LD |
| hreflang issues | Run [hreflang checker](https://technicalseo.com/tools/hreflang/) |
