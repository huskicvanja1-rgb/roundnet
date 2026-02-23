#!/usr/bin/env python3
"""
Step 4: Enrich club data with additional information
"""

import json
import os
from anthropic import Anthropic

client = Anthropic()

ENRICHMENT_PROMPT = """You are enriching data for a Roundnet/Spikeball club directory.

Given this club data and website content:

Club: {club_data}

Website content (if available): {website_content}

Enrich the data with:
1. trainingSchedule: Human-readable training schedule (e.g., "Tuesdays 18:00-20:00, Saturdays 10:00-12:00")
2. memberCount: Estimated number of active members (or null if unknown)
3. foundedYear: Year the club was founded (or null if unknown)
4. additionalFeatures: Any additional features not in the original list
5. socialMedia: Extract any social media links found
6. contactPerson: Name of contact person if mentioned
7. languages: Languages spoken at the club
8. level: Skill level focus - "all_levels", "beginners", "intermediate", "competitive"
9. equipment: Equipment info - do they provide nets/balls?
10. pricing: Membership or session pricing if mentioned

Return only valid JSON with these fields added to the original data.
"""

def enrich_club(club: dict, website_content: str = "") -> dict:
    """Enrich a single club with additional data"""
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": ENRICHMENT_PROMPT.format(
                    club_data=json.dumps(club, indent=2),
                    website_content=website_content[:2000] if website_content else "Not available"
                )
            }
        ]
    )
    
    try:
        enriched = json.loads(response.content[0].text)
        return {**club, **enriched}
    except json.JSONDecodeError:
        return club

def main():
    input_path = "data/verified/clubs-verified.json"
    output_path = "data/enriched/clubs-enriched.json"
    
    os.makedirs("data/enriched", exist_ok=True)
    
    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}")
        return
    
    with open(input_path, 'r') as f:
        clubs = json.load(f)
    
    enriched = []
    for i, club in enumerate(clubs):
        print(f"Enriching {i+1}/{len(clubs)}: {club.get('name', 'unknown')}")
        
        # Get website content if verification was done
        website_content = ""
        if club.get('website_verification', {}).get('content'):
            website_content = club['website_verification']['content']
        
        enriched.append(enrich_club(club, website_content))
    
    with open(output_path, 'w') as f:
        json.dump(enriched, f, indent=2)
    
    print(f"\nEnriched {len(enriched)} clubs")

if __name__ == "__main__":
    main()
