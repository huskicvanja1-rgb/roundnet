#!/usr/bin/env python3
"""
Step 5: Verify and categorize images using Claude Vision
"""

import json
import os
import base64
import httpx
from anthropic import Anthropic

client = Anthropic()

IMAGE_ANALYSIS_PROMPT = """Analyze this image for a Roundnet/Spikeball club directory.

Determine:
1. isRoundnetRelated: Is this image related to Roundnet/Spikeball? (true/false)
2. imageType: One of "action_shot", "team_photo", "equipment", "venue", "logo", "event", "other"
3. quality: Rate 1-10 (composition, resolution, relevance)
4. description: Brief description of the image
5. usableForDirectory: Would this be a good image for a club listing? (true/false)

Return only valid JSON.
"""

def analyze_image(image_url: str) -> dict:
    """Analyze a single image using Claude Vision"""
    
    try:
        # Download image
        response = httpx.get(image_url, timeout=10)
        if response.status_code != 200:
            return {"error": "Failed to download", "usableForDirectory": False}
        
        # Convert to base64
        image_data = base64.standard_b64encode(response.content).decode("utf-8")
        media_type = response.headers.get("content-type", "image/jpeg")
        
        # Analyze with Claude Vision
        result = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=512,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": IMAGE_ANALYSIS_PROMPT
                        }
                    ],
                }
            ],
        )
        
        return json.loads(result.content[0].text)
        
    except Exception as e:
        return {"error": str(e), "usableForDirectory": False}

def verify_club_images(clubs: list) -> list:
    """Verify images for all clubs"""
    
    for i, club in enumerate(clubs):
        photos = club.get('photos', [])
        if not photos:
            club['verified_images'] = []
            continue
        
        print(f"Analyzing images for {i+1}/{len(clubs)}: {club.get('name', 'unknown')}")
        
        verified = []
        for photo_url in photos[:5]:  # Limit to 5 images per club
            analysis = analyze_image(photo_url)
            if analysis.get('usableForDirectory'):
                verified.append({
                    "url": photo_url,
                    **analysis
                })
        
        # Sort by quality and take best 3
        verified.sort(key=lambda x: x.get('quality', 0), reverse=True)
        club['verified_images'] = verified[:3]
    
    return clubs

def main():
    input_path = "data/enriched/clubs-enriched.json"
    output_path = "data/with-images/clubs-with-images.json"
    
    os.makedirs("data/with-images", exist_ok=True)
    
    if not os.path.exists(input_path):
        print(f"Input file not found: {input_path}")
        return
    
    with open(input_path, 'r') as f:
        clubs = json.load(f)
    
    clubs_with_images = verify_club_images(clubs)
    
    with open(output_path, 'w') as f:
        json.dump(clubs_with_images, f, indent=2)
    
    # Stats
    with_images = sum(1 for c in clubs_with_images if c.get('verified_images'))
    total_images = sum(len(c.get('verified_images', [])) for c in clubs_with_images)
    print(f"\nImage verification complete: {with_images} clubs with {total_images} verified images")

if __name__ == "__main__":
    main()
