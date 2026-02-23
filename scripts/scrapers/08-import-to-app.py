#!/usr/bin/env python3
"""
Step 8: Import final data into the Next.js app data provider
"""

import json
import os

def generate_typescript_data():
    """Generate TypeScript data file for the app"""
    
    # Load final data
    with open("data/final/countries.json", 'r') as f:
        countries = json.load(f)
    
    with open("data/final/cities.json", 'r') as f:
        cities = json.load(f)
    
    with open("data/final/clubs.json", 'r') as f:
        clubs = json.load(f)
    
    # Generate TypeScript
    ts_content = '''// Auto-generated from scraping pipeline
// Generated: {date}
// Total: {country_count} countries, {city_count} cities, {club_count} clubs

import type {{ Country, City, Club }} from './schemas';

export const scrapedCountries: Country[] = {countries};

export const scrapedCities: City[] = {cities};

export const scrapedClubs: Club[] = {clubs};
'''.format(
        date=__import__('datetime').datetime.now().isoformat(),
        country_count=len(countries),
        city_count=len(cities),
        club_count=len(clubs),
        countries=json.dumps(countries, indent=2),
        cities=json.dumps(cities, indent=2),
        clubs=json.dumps(clubs, indent=2)
    )
    
    # Write to lib/data
    output_path = "../../lib/data/scraped-data.ts"
    with open(output_path, 'w') as f:
        f.write(ts_content)
    
    print(f"Generated {output_path}")
    print(f"  Countries: {len(countries)}")
    print(f"  Cities: {len(cities)}")
    print(f"  Clubs: {len(clubs)}")
    print()
    print("Next steps:")
    print("1. Update lib/data/provider.ts to use scrapedCountries, scrapedCities, scrapedClubs")
    print("2. Run npm run build to verify")
    print("3. Test locally with npm run dev")

def main():
    required_files = [
        "data/final/countries.json",
        "data/final/cities.json", 
        "data/final/clubs.json"
    ]
    
    for f in required_files:
        if not os.path.exists(f):
            print(f"Missing: {f}")
            print("Run the previous steps first.")
            return
    
    generate_typescript_data()

if __name__ == "__main__":
    main()
