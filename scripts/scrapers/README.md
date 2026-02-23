# Roundnet Directory Data Pipeline

## 7-Step Process (Based on Frey Chu Strategy)

### Prerequisites
```bash
pip install outscraper crawl4ai anthropic pandas
```

### Step 1: Scrape Raw Data (Outscraper)
Use `01-outscraper-config.json` with Outscraper API or web interface.

### Step 2: Clean Data (Claude)
Run `02-clean-data.py` to standardize and validate scraped data.

### Step 3: Verify Websites (Crawl4AI)
Run `03-verify-websites.py` to check which URLs are active.

### Step 4: Enrich Data
Run `04-enrich-data.py` to add training schedules, features, etc.

### Step 5: Verify Images (Claude Vision)
Run `05-verify-images.py` to validate and categorize images.

### Step 6: Extract Features
Run `06-extract-features.py` to parse amenities and filters.

### Step 7: Generate Service Areas
Run `07-service-areas.py` to map clubs to cities/regions.

### Final: Import to App
Run `08-import-to-app.py` to generate the data provider.

## Data Sources

| Source | Query | Countries |
|--------|-------|-----------|
| Google Maps | "roundnet club", "spikeball club" | All EU |
| Google Maps | "roundnet verein" | DE, AT, CH |
| Google Maps | "club roundnet" | FR, BE |
| Google Maps | "roundnet italia" | IT |
| Instagram | #roundnet + location | All |
| Facebook | Roundnet/Spikeball groups | All |

## Estimated Costs
- Outscraper: ~$20-50 (depends on volume)
- Claude API: ~$5-10
- Crawl4AI: Free (open source)
- **Total: ~$30-60**
