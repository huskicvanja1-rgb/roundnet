#!/usr/bin/env python3
"""
Step 2: Clean and standardize scraped data using Claude
"""

import json
import os
from anthropic import Anthropic

# Initialize Claude client
client = Anthropic()

CLEANING_PROMPT = """You are a data cleaning assistant for a Roundnet/Spikeball club directory.

Given this raw scraped data, clean and standardize it:

{raw_data}

Return a JSON object with these fields:
- name: Clean club name (remove "- Google Maps" etc)
- slug: URL-friendly slug (lowercase, hyphens)
- description: Brief description in English (translate if needed)
- type: one of "official", "community", "university", "recreational"
- address: Formatted address
- city: City name only
- citySlug: URL-friendly city slug
- country: Full country name
- countrySlug: URL-friendly country slug  
- countryCode: 2-letter ISO code
- latitude: number or null
- longitude: number or null
- website: Clean URL or null
- email: Email or null
- phone: Phone or null
- instagram: Instagram handle (without @) or null
- facebook: Facebook URL or null
- features: array of applicable features from this list:
  - beginner_friendly
  - equipment_provided
  - indoor
  - outdoor
  - coaching
  - tournaments
  - weekly_meetups
  - youth_program
  - wheelchair_accessible
- isVerified: false (will verify later)
- confidence: 0-100 how confident you are this is a real roundnet club

Only return valid JSON, no markdown.
"""

def clean_single_entry(raw_entry: dict) -> dict:
    """Clean a single scraped entry using Claude"""
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": CLEANING_PROMPT.format(raw_data=json.dumps(raw_entry, indent=2))
            }
        ]
    )
    
    try:
        return json.loads(response.content[0].text)
    except json.JSONDecodeError:
        print(f"Failed to parse response for: {raw_entry.get('name', 'unknown')}")
        return None

def clean_all_data(input_file: str, output_file: str):
    """Clean all scraped data"""
    
    with open(input_file, 'r') as f:
        raw_data = json.load(f)
    
    cleaned = []
    for i, entry in enumerate(raw_data):
        print(f"Cleaning {i+1}/{len(raw_data)}: {entry.get('name', 'unknown')}")
        result = clean_single_entry(entry)
        if result and result.get('confidence', 0) >= 50:
            cleaned.append(result)
    
    # Remove duplicates by slug
    seen_slugs = set()
    unique = []
    for club in cleaned:
        if club['slug'] not in seen_slugs:
            seen_slugs.add(club['slug'])
            unique.append(club)
    
    with open(output_file, 'w') as f:
        json.dump(unique, f, indent=2)
    
    print(f"\nCleaned {len(unique)} clubs (removed {len(cleaned) - len(unique)} duplicates)")

if __name__ == "__main__":
    input_path = "data/raw/outscraper-results.json"
    output_path = "data/cleaned/clubs-cleaned.json"
    
    os.makedirs("data/cleaned", exist_ok=True)
    
    if os.path.exists(input_path):
        clean_all_data(input_path, output_path)
    else:
        print(f"Input file not found: {input_path}")
        print("Run Outscraper first to generate raw data.")
