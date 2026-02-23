#!/usr/bin/env python3
"""
Step 3: Verify websites are active using Crawl4AI
"""

import json
import asyncio
import os
from typing import Optional

try:
    from crawl4ai import AsyncWebCrawler
    HAS_CRAWL4AI = True
except ImportError:
    HAS_CRAWL4AI = False
    print("Crawl4AI not installed. Run: pip install crawl4ai")

async def verify_website(url: str, crawler: 'AsyncWebCrawler') -> dict:
    """Verify a single website and extract relevant info"""
    
    try:
        result = await crawler.arun(url=url, timeout=10)
        
        if result.success:
            # Check if it's actually a roundnet/spikeball related site
            content_lower = result.markdown.lower() if result.markdown else ""
            is_relevant = any(term in content_lower for term in [
                'roundnet', 'spikeball', 'spike ball', 'round net'
            ])
            
            return {
                "url": url,
                "status": "active",
                "is_relevant": is_relevant,
                "title": result.metadata.get("title", ""),
                "has_contact": "contact" in content_lower or "email" in content_lower,
                "has_schedule": any(term in content_lower for term in ['schedule', 'training', 'practice', 'meetup']),
            }
        else:
            return {
                "url": url,
                "status": "error",
                "is_relevant": False,
                "error": str(result.error_message)
            }
    except Exception as e:
        return {
            "url": url,
            "status": "error", 
            "is_relevant": False,
            "error": str(e)
        }

async def verify_all_websites(clubs: list) -> list:
    """Verify all club websites"""
    
    if not HAS_CRAWL4AI:
        print("Skipping website verification - Crawl4AI not installed")
        return clubs
    
    async with AsyncWebCrawler() as crawler:
        for i, club in enumerate(clubs):
            website = club.get('website')
            if website:
                print(f"Verifying {i+1}/{len(clubs)}: {website}")
                result = await verify_website(website, crawler)
                club['website_verification'] = result
                
                # Update verified status
                if result['status'] == 'active' and result['is_relevant']:
                    club['website_verified'] = True
                else:
                    club['website_verified'] = False
            else:
                club['website_verified'] = False
    
    return clubs

def main():
    input_path = "data/cleaned/clubs-cleaned.json"
    output_path = "data/verified/clubs-verified.json"
    
    os.makedirs("data/verified", exist_ok=True)
    
    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}")
        return
    
    with open(input_path, 'r') as f:
        clubs = json.load(f)
    
    print(f"Verifying {len(clubs)} club websites...")
    verified_clubs = asyncio.run(verify_all_websites(clubs))
    
    with open(output_path, 'w') as f:
        json.dump(verified_clubs, f, indent=2)
    
    # Stats
    active = sum(1 for c in verified_clubs if c.get('website_verified'))
    print(f"\nVerification complete: {active}/{len(verified_clubs)} websites active and relevant")

if __name__ == "__main__":
    main()
