#!/usr/bin/env python3
"""
Step 7: Map clubs to cities and generate service areas
"""

import json
import os
from collections import defaultdict

def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    return text.lower().replace(' ', '-').replace('ü', 'u').replace('ö', 'o').replace('ä', 'a').replace('é', 'e').replace('è', 'e').replace('ñ', 'n')

def generate_service_areas(clubs: list) -> dict:
    """Generate countries and cities from club data"""
    
    countries = {}
    cities = {}
    
    for club in clubs:
        country_slug = club.get('countrySlug', '')
        city_slug = club.get('citySlug', '')
        
        if not country_slug or not city_slug:
            continue
        
        # Track country
        if country_slug not in countries:
            countries[country_slug] = {
                'slug': country_slug,
                'name': club.get('country', ''),
                'code': club.get('countryCode', ''),
                'flag': get_flag(club.get('countryCode', '')),
                'clubCount': 0,
                'cityCount': 0,
                'cities': set()
            }
        countries[country_slug]['clubCount'] += 1
        countries[country_slug]['cities'].add(city_slug)
        
        # Track city
        city_key = f"{country_slug}/{city_slug}"
        if city_key not in cities:
            cities[city_key] = {
                'slug': city_slug,
                'name': club.get('city', ''),
                'countrySlug': country_slug,
                'clubCount': 0,
                'latitude': club.get('latitude'),
                'longitude': club.get('longitude'),
            }
        cities[city_key]['clubCount'] += 1
    
    # Update city counts
    for country in countries.values():
        country['cityCount'] = len(country['cities'])
        del country['cities']  # Remove set, not JSON serializable
    
    return {
        'countries': list(countries.values()),
        'cities': list(cities.values())
    }

def get_flag(country_code: str) -> str:
    """Get flag emoji for country code"""
    flags = {
        'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 
        'NL': '🇳🇱', 'BE': '🇧🇪', 'AT': '🇦🇹', 'CH': '🇨🇭',
        'PL': '🇵🇱', 'CZ': '🇨🇿', 'GB': '🇬🇧', 'IE': '🇮🇪',
        'PT': '🇵🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰',
        'FI': '🇫🇮', 'HU': '🇭🇺', 'SK': '🇸🇰', 'HR': '🇭🇷',
        'SI': '🇸🇮', 'RO': '🇷🇴', 'BG': '🇧🇬', 'GR': '🇬🇷',
    }
    return flags.get(country_code, '🏳️')

def main():
    input_path = "data/with-features/clubs-with-features.json"
    
    if not os.path.exists(input_path):
        input_path = "data/enriched/clubs-enriched.json"
        if not os.path.exists(input_path):
            print(f"Input file not found")
            return
    
    with open(input_path, 'r') as f:
        clubs = json.load(f)
    
    service_areas = generate_service_areas(clubs)
    
    # Save service areas
    os.makedirs("data/final", exist_ok=True)
    
    with open("data/final/countries.json", 'w') as f:
        json.dump(service_areas['countries'], f, indent=2)
    
    with open("data/final/cities.json", 'w') as f:
        json.dump(service_areas['cities'], f, indent=2)
    
    with open("data/final/clubs.json", 'w') as f:
        json.dump(clubs, f, indent=2)
    
    print(f"Generated service areas:")
    print(f"  Countries: {len(service_areas['countries'])}")
    print(f"  Cities: {len(service_areas['cities'])}")
    print(f"  Clubs: {len(clubs)}")

if __name__ == "__main__":
    main()
