#!/usr/bin/env python3
"""
Step 2: Clean and standardize scraped Outscraper data.
No external API needed — rule-based cleaning + slug generation.
"""

import json
import os
import re
import unicodedata
from typing import Optional

INPUT_FILE = os.path.join(os.path.dirname(__file__), "data", "raw", "outscraper-results.json")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "data", "cleaned", "clubs-cleaned.json")

# Country code → full name mapping
COUNTRY_MAP = {
    "DE": "Germany", "FR": "France", "IT": "Italy", "ES": "Spain",
    "NL": "Netherlands", "BE": "Belgium", "AT": "Austria", "CH": "Switzerland",
    "PL": "Poland", "CZ": "Czech Republic", "GB": "United Kingdom",
    "IE": "Ireland", "SE": "Sweden", "DK": "Denmark", "NO": "Norway",
    "FI": "Finland", "PT": "Portugal", "HU": "Hungary", "HR": "Croatia",
    "SI": "Slovenia", "LU": "Luxembourg", "SK": "Slovakia", "RO": "Romania",
    "BG": "Bulgaria", "GR": "Greece", "LT": "Lithuania", "LV": "Latvia",
    "EE": "Estonia",
}

# Reverse: name → code
COUNTRY_NAME_TO_CODE = {v: k for k, v in COUNTRY_MAP.items()}
# Handle long names
COUNTRY_NAME_TO_CODE["United Kingdom of Great Britain and Northern Ireland"] = "GB"

# Country → slug
COUNTRY_SLUG_MAP = {
    "Germany": "germany", "France": "france", "Italy": "italy", "Spain": "spain",
    "Netherlands": "netherlands", "Belgium": "belgium", "Austria": "austria",
    "Switzerland": "switzerland", "Poland": "poland", "Czech Republic": "czech-republic",
    "United Kingdom": "united-kingdom", "Ireland": "ireland", "Sweden": "sweden",
    "Denmark": "denmark", "Norway": "norway", "Finland": "finland", "Portugal": "portugal",
    "Hungary": "hungary", "Croatia": "croatia", "Slovenia": "slovenia",
    "Luxembourg": "luxembourg", "Slovakia": "slovakia",
}

# European country flag emojis
COUNTRY_FLAGS = {
    "Germany": "🇩🇪", "France": "🇫🇷", "Italy": "🇮🇹", "Spain": "🇪🇸",
    "Netherlands": "🇳🇱", "Belgium": "🇧🇪", "Austria": "🇦🇹", "Switzerland": "🇨🇭",
    "Poland": "🇵🇱", "Czech Republic": "🇨🇿", "United Kingdom": "🇬🇧", "Ireland": "🇮🇪",
    "Sweden": "🇸🇪", "Denmark": "🇩🇰", "Norway": "🇳🇴", "Finland": "🇫🇮",
    "Portugal": "🇵🇹", "Hungary": "🇭🇺", "Croatia": "🇭🇷", "Slovenia": "🇸🇮",
    "Luxembourg": "🇱🇺", "Slovakia": "🇸🇰",
}


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    if not text:
        return ""
    # Normalize unicode
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-")


def extract_country(raw: dict) -> tuple:
    """Extract (country_name, country_code) from raw data."""
    # Try country field
    country = raw.get("country", "") or ""
    country_code = raw.get("country_code", "") or ""

    # Clean up long UK name
    if "United Kingdom" in country:
        country = "United Kingdom"

    # Try to resolve from code
    if country_code and country_code in COUNTRY_MAP:
        return COUNTRY_MAP[country_code], country_code

    # Try to resolve from name
    if country in COUNTRY_NAME_TO_CODE:
        return country, COUNTRY_NAME_TO_CODE[country]

    return country, country_code


def extract_city(raw: dict) -> str:
    """Extract city name from raw data."""
    city = raw.get("city", "") or ""
    if city and city not in ("None", ""):
        return city

    # Try from full_address
    addr = raw.get("full_address", "") or ""
    if addr:
        parts = [p.strip() for p in addr.split(",")]
        # City is usually 2nd-to-last or 3rd-to-last part
        for part in parts:
            part = part.strip()
            if part and not re.match(r"^\d{4,5}", part) and part not in COUNTRY_MAP.values():
                return part

    return ""


def is_relevant(raw: dict) -> bool:
    """Filter out irrelevant results (not actual clubs)."""
    name = (raw.get("name") or "").lower()

    # Skip entries that are just country names
    if name in [c.lower() for c in COUNTRY_MAP.values()]:
        return False

    # Skip entries with no name
    if not name or name == "n/a":
        return False

    # Must have some roundnet/spikeball relevance
    relevant_keywords = ["roundnet", "spikeball", "spike"]
    name_lower = name.lower()
    desc = (raw.get("description") or "").lower()
    category = (raw.get("category") or "").lower()
    subtypes = " ".join(raw.get("subtypes", []) or []).lower()

    all_text = f"{name_lower} {desc} {category} {subtypes}"
    return any(kw in all_text for kw in relevant_keywords)


def extract_features(raw: dict) -> list:
    """Infer features from available data."""
    features = []
    name = (raw.get("name") or "").lower()
    desc = (raw.get("description") or "").lower()
    all_text = f"{name} {desc}"

    if "indoor" in all_text:
        features.append("indoor")
    if "outdoor" in all_text:
        features.append("outdoor")
    if "training" in all_text or "treningi" in all_text:
        features.append("weekly_meetups")
    if "beginner" in all_text or "anfänger" in all_text:
        features.append("beginner_friendly")
    if "tournament" in all_text or "turnier" in all_text:
        features.append("tournaments")

    # Default: if no indoor/outdoor specified, assume outdoor
    if "indoor" not in features and "outdoor" not in features:
        features.append("outdoor")

    return features


def clean_entry(raw: dict) -> Optional[dict]:
    """Clean a single scraped entry."""
    if not is_relevant(raw):
        return None

    name = raw.get("name", "").strip()
    country_name, country_code = extract_country(raw)
    city = extract_city(raw)

    if not country_name:
        return None

    # Generate slugs
    club_slug = slugify(name)
    city_slug = slugify(city) if city else ""
    country_slug = COUNTRY_SLUG_MAP.get(country_name, slugify(country_name))

    if not club_slug:
        return None

    # Extract social links
    site = raw.get("site") or ""
    instagram = ""
    facebook = ""
    if "instagram.com" in site:
        instagram = site
        site = ""
    elif "facebook.com" in site:
        facebook = site
        site = ""

    return {
        "name": name,
        "slug": club_slug,
        "description": (raw.get("description") or "").strip() or None,
        "type": "official" if "e.v." in name.lower() or "e. v." in name.lower() or "association" in name.lower() else "community",
        "address": raw.get("full_address") or None,
        "city": city or None,
        "citySlug": city_slug or None,
        "country": country_name,
        "countrySlug": country_slug,
        "countryCode": country_code,
        "flag": COUNTRY_FLAGS.get(country_name, ""),
        "latitude": raw.get("latitude"),
        "longitude": raw.get("longitude"),
        "website": site or None,
        "email": raw.get("email") or None,
        "phone": raw.get("phone") or None,
        "instagram": instagram or None,
        "facebook": facebook or None,
        "features": extract_features(raw),
        "rating": raw.get("rating"),
        "reviewCount": raw.get("reviews"),
        "photos": (raw.get("photos_sample") or [])[:5],
        "placeId": raw.get("place_id") or raw.get("google_id"),
        "isVerified": False,
        "memberCount": None,
        "foundedYear": None,
        "trainingSchedule": raw.get("working_hours", {}).get("Monday") if isinstance(raw.get("working_hours"), dict) else None,
    }


def main():
    with open(INPUT_FILE, "r") as f:
        raw_data = json.load(f)

    print(f"📥 Loaded {len(raw_data)} raw entries")

    # Clean all entries
    cleaned = []
    for raw in raw_data:
        result = clean_entry(raw)
        if result:
            cleaned.append(result)

    # Deduplicate by slug
    seen_slugs = set()
    unique = []
    for club in cleaned:
        if club["slug"] not in seen_slugs:
            seen_slugs.add(club["slug"])
            unique.append(club)
        else:
            print(f"  ⚠️  Duplicate skipped: {club['name']}")

    # Sort by country, then city, then name
    unique.sort(key=lambda c: (c["country"], c.get("city") or "", c["name"]))

    # Save
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(unique, f, indent=2, ensure_ascii=False)

    # Stats
    countries = set(c["country"] for c in unique)
    cities = set(c.get("city") for c in unique if c.get("city"))
    print(f"\n✅ Cleaned: {len(unique)} clubs in {len(cities)} cities across {len(countries)} countries")
    print(f"   Removed: {len(raw_data) - len(unique)} entries (irrelevant/duplicate)")
    print(f"   Output: {OUTPUT_FILE}")

    # Print summary
    print("\n📊 By country:")
    by_country = {}
    for c in unique:
        by_country.setdefault(c["country"], []).append(c)
    for country, clubs in sorted(by_country.items(), key=lambda x: -len(x[1])):
        flag = COUNTRY_FLAGS.get(country, "")
        print(f"   {flag} {country}: {len(clubs)} clubs")


if __name__ == "__main__":
    main()
