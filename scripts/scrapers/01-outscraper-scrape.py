#!/usr/bin/env python3
"""
Step 1: Scrape Google Maps via Outscraper API
Searches for roundnet/spikeball clubs across Europe.
"""

import json
import os
import time
import urllib.request
import urllib.parse
import urllib.error

API_KEY = os.environ.get("OUTSCRAPER_API_KEY", "")
BASE_URL = "https://api.app.outscraper.com/maps/search-v3"

# Search queries — localized per region
SEARCHES = [
    {"query": "roundnet club", "region": "Europe"},
    {"query": "spikeball club", "region": "Europe"},
    {"query": "roundnet verein", "region": "Germany"},
    {"query": "spikeball verein", "region": "Germany"},
    {"query": "roundnet verein", "region": "Austria"},
    {"query": "roundnet verein", "region": "Switzerland"},
    {"query": "club roundnet", "region": "France"},
    {"query": "club spikeball", "region": "France"},
    {"query": "roundnet", "region": "Italy"},
    {"query": "roundnet", "region": "Spain"},
    {"query": "roundnet", "region": "Netherlands"},
    {"query": "roundnet", "region": "Belgium"},
    {"query": "roundnet", "region": "Poland"},
    {"query": "roundnet", "region": "Czech Republic"},
    {"query": "roundnet", "region": "United Kingdom"},
    {"query": "roundnet", "region": "Ireland"},
    {"query": "roundnet", "region": "Sweden"},
    {"query": "roundnet", "region": "Denmark"},
    {"query": "roundnet", "region": "Norway"},
    {"query": "roundnet", "region": "Finland"},
    {"query": "roundnet", "region": "Portugal"},
    {"query": "roundnet", "region": "Hungary"},
    {"query": "roundnet", "region": "Croatia"},
    {"query": "roundnet", "region": "Slovenia"},
]

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "data", "raw", "outscraper-results.json")


def search_outscraper(query: str, region: str, limit: int = 50) -> list:
    """Call Outscraper Google Maps Search API."""
    full_query = f"{query}, {region}"
    params = urllib.parse.urlencode({
        "query": full_query,
        "limit": limit,
        "async": "false",
    })
    url = f"{BASE_URL}?{params}"

    req = urllib.request.Request(url, headers={
        "X-API-KEY": API_KEY,
        "Accept": "application/json",
    })

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode())
            # Outscraper v3 returns {"id":..., "status":..., "data": [[...]]}
            if "data" in data and data["data"]:
                results = data["data"][0] if isinstance(data["data"][0], list) else data["data"]
                print(f"  ✅ '{full_query}' → {len(results)} results")
                return results
            else:
                print(f"  ⚠️  '{full_query}' → 0 results")
                return []
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        print(f"  ❌ '{full_query}' → HTTP {e.code}: {body[:200]}")
        return []
    except Exception as e:
        print(f"  ❌ '{full_query}' → Error: {e}")
        return []


def main():
    if not API_KEY:
        print("❌ OUTSCRAPER_API_KEY not set. Export it first.")
        return

    print("🏐 Outscraper Google Maps Scraper")
    print(f"   {len(SEARCHES)} searches queued\n")

    all_results = []
    seen_place_ids = set()

    for i, s in enumerate(SEARCHES, 1):
        print(f"[{i}/{len(SEARCHES)}] Searching: {s['query']} in {s['region']}")
        results = search_outscraper(s["query"], s["region"])

        for r in results:
            pid = r.get("place_id") or r.get("google_id") or r.get("name", "")
            if pid not in seen_place_ids:
                seen_place_ids.add(pid)
                all_results.append(r)

        # Rate limit — 1 req/sec to stay within free tier
        if i < len(SEARCHES):
            time.sleep(1.5)

    # Save raw results
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Done! {len(all_results)} unique places saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
