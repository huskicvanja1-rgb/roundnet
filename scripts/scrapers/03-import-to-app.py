#!/usr/bin/env python3
"""
Step 3: Import cleaned club data into the Next.js app.
Generates a TypeScript data file with real scraped data,
matching the exact schemas in lib/data/schemas.ts.
"""

import json
import os
import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, "data", "cleaned", "clubs-cleaned.json")
OUTPUT_FILE = os.path.join(SCRIPT_DIR, "..", "..", "lib", "data", "scraped-data.ts")

# Valid ClubFeature values from schemas.ts
VALID_FEATURES = {
    'beginner_friendly', 'equipment_provided', 'indoor', 'outdoor',
    'coaching', 'tournaments', 'weekly_meetups', 'youth_program',
    'wheelchair_accessible',
}

# Valid ClubType values from schemas.ts
VALID_TYPES = {'official', 'community', 'university', 'recreational'}


def sanitize_string(val):
    """Escape backticks and backslashes for TS template literals."""
    if val is None:
        return None
    return val


def main():
    with open(INPUT_FILE, "r") as f:
        clubs = json.load(f)

    print(f"📥 Loaded {len(clubs)} clubs")

    # ── Build country/city aggregates ──
    countries_map = {}
    for club in clubs:
        cs = club["countrySlug"]
        if cs not in countries_map:
            countries_map[cs] = {
                "name": club["country"],
                "slug": cs,
                "code": club.get("countryCode", "XX"),
                "flag": club.get("flag", "🏳️"),
                "clubs": [],
                "cities": {},
            }
        countries_map[cs]["clubs"].append(club)

        city_slug = club.get("citySlug")
        city_name = club.get("city")
        if city_slug and city_name:
            if city_slug not in countries_map[cs]["cities"]:
                countries_map[cs]["cities"][city_slug] = {
                    "name": city_name,
                    "slug": city_slug,
                    "countrySlug": cs,
                    "clubs": [],
                    "latitude": club.get("latitude"),
                    "longitude": club.get("longitude"),
                }
            countries_map[cs]["cities"][city_slug]["clubs"].append(club)

    # ── Countries array (matches CountrySchema) ──
    countries_arr = []
    for cs, data in sorted(countries_map.items()):
        countries_arr.append({
            "slug": data["slug"],
            "name": data["name"],
            "code": data["code"],
            "flag": data["flag"],
            "clubCount": len(data["clubs"]),
            "cityCount": len(data["cities"]),
        })

    # ── Cities array (matches CitySchema) ──
    cities_arr = []
    for cs, data in sorted(countries_map.items()):
        for city_slug, city_data in sorted(data["cities"].items()):
            entry = {
                "slug": city_data["slug"],
                "name": city_data["name"],
                "countrySlug": city_data["countrySlug"],
                "clubCount": len(city_data["clubs"]),
            }
            if city_data.get("latitude") is not None:
                entry["latitude"] = city_data["latitude"]
            if city_data.get("longitude") is not None:
                entry["longitude"] = city_data["longitude"]
            cities_arr.append(entry)

    # ── Clubs array (matches ClubSchema — flat citySlug/countrySlug) ──
    clubs_arr = []
    for club in clubs:
        club_type = club.get("type", "community")
        if club_type not in VALID_TYPES:
            club_type = "community"

        features = [f for f in club.get("features", []) if f in VALID_FEATURES]

        entry = {
            "slug": club["slug"],
            "name": club["name"],
            "type": club_type,
            "citySlug": club.get("citySlug", ""),
            "countrySlug": club.get("countrySlug", ""),
            "isVerified": club.get("isVerified", False),
        }

        # Optional fields — only include if truthy/present
        if club.get("description"):
            entry["description"] = club["description"]
        if club.get("address"):
            entry["address"] = club["address"]
        if club.get("latitude") is not None:
            entry["latitude"] = club["latitude"]
        if club.get("longitude") is not None:
            entry["longitude"] = club["longitude"]
        if club.get("website"):
            entry["website"] = club["website"]
        if club.get("email"):
            entry["email"] = club["email"]
        if club.get("phone"):
            entry["phone"] = club["phone"]
        if club.get("instagram"):
            entry["instagram"] = club["instagram"]
        if club.get("facebook"):
            entry["facebook"] = club["facebook"]
        if features:
            entry["features"] = features
        if club.get("trainingSchedule"):
            ts = club["trainingSchedule"]
            # trainingSchedule may be a list (from Google Maps hours) — join to string
            if isinstance(ts, list):
                ts = ", ".join(ts)
            # Skip useless values like "Closed"
            if ts and ts.lower() not in ("closed",):
                entry["trainingSchedule"] = ts
        if club.get("memberCount"):
            entry["memberCount"] = club["memberCount"]
        if club.get("foundedYear"):
            entry["foundedYear"] = club["foundedYear"]

        clubs_arr.append(entry)

    # ── Write TypeScript file ──
    now = datetime.datetime.now().isoformat()
    ts_lines = []
    ts_lines.append(f"// AUTO-GENERATED from Outscraper Google Maps data")
    ts_lines.append(f"// Generated: {now}")
    ts_lines.append(f"// DO NOT EDIT MANUALLY — re-run scripts/scrapers/03-import-to-app.py")
    ts_lines.append("")
    ts_lines.append("import type { Country, City, Club } from './schemas';")
    ts_lines.append("")
    ts_lines.append(f"export const SCRAPED_COUNTRIES: Country[] = {json.dumps(countries_arr, indent=2, ensure_ascii=False)};")
    ts_lines.append("")
    ts_lines.append(f"export const SCRAPED_CITIES: City[] = {json.dumps(cities_arr, indent=2, ensure_ascii=False)};")
    ts_lines.append("")
    ts_lines.append(f"export const SCRAPED_CLUBS: Club[] = {json.dumps(clubs_arr, indent=2, ensure_ascii=False)};")
    ts_lines.append("")

    output_path = os.path.normpath(OUTPUT_FILE)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        f.write("\n".join(ts_lines))

    print(f"✅ Generated {output_path}")
    print(f"   {len(countries_arr)} countries, {len(cities_arr)} cities, {len(clubs_arr)} clubs")
    for c in countries_arr:
        print(f"   {c['flag']} {c['name']}: {c['clubCount']} clubs in {c['cityCount']} cities")


if __name__ == "__main__":
    main()
