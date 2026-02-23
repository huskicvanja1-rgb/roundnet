#!/usr/bin/env python3
"""
Step 6: Extract and standardize features for filtering
"""

import json
import os

# Standard features for the directory
STANDARD_FEATURES = {
    'beginner_friendly': [
        'beginner', 'anfänger', 'débutant', 'principiante', 'newbie', 
        'all levels', 'alle niveaus', 'tous niveaux'
    ],
    'equipment_provided': [
        'equipment', 'ausrüstung', 'équipement', 'nets provided', 
        'we provide', 'balls available', 'gear'
    ],
    'indoor': [
        'indoor', 'halle', 'salle', 'gym', 'gymnasium', 'sports hall',
        'winter', 'covered'
    ],
    'outdoor': [
        'outdoor', 'park', 'beach', 'strand', 'plage', 'grass', 
        'summer', 'open air'
    ],
    'coaching': [
        'coach', 'trainer', 'training', 'lessons', 'instruction',
        'learn', 'technique', 'skills'
    ],
    'tournaments': [
        'tournament', 'turnier', 'tournoi', 'competition', 'competitive',
        'league', 'championship', 'ranked'
    ],
    'weekly_meetups': [
        'weekly', 'wöchentlich', 'hebdomadaire', 'regular', 'every week',
        'meetup', 'session', 'practice'
    ],
    'youth_program': [
        'youth', 'kids', 'children', 'junior', 'kinder', 'jeunes',
        'school', 'under 18'
    ],
    'wheelchair_accessible': [
        'accessible', 'wheelchair', 'disability', 'barrier-free',
        'rollstuhl', 'handicap'
    ]
}

def extract_features(club: dict) -> list:
    """Extract standardized features from club data"""
    
    # Combine all text fields for searching
    text_to_search = ' '.join([
        str(club.get('description', '')),
        str(club.get('trainingSchedule', '')),
        str(club.get('additionalFeatures', '')),
        str(club.get('equipment', '')),
    ]).lower()
    
    features = set(club.get('features', []))
    
    for feature, keywords in STANDARD_FEATURES.items():
        if any(keyword in text_to_search for keyword in keywords):
            features.add(feature)
    
    # Infer some features
    if club.get('trainingSchedule'):
        features.add('weekly_meetups')
    
    return list(features)

def main():
    input_path = "data/with-images/clubs-with-images.json"
    output_path = "data/with-features/clubs-with-features.json"
    
    os.makedirs("data/with-features", exist_ok=True)
    
    if not os.path.exists(input_path):
        # Try earlier stage
        input_path = "data/enriched/clubs-enriched.json"
        if not os.path.exists(input_path):
            print(f"Input file not found")
            return
    
    with open(input_path, 'r') as f:
        clubs = json.load(f)
    
    for club in clubs:
        club['features'] = extract_features(club)
    
    with open(output_path, 'w') as f:
        json.dump(clubs, f, indent=2)
    
    # Feature stats
    feature_counts = {}
    for club in clubs:
        for feature in club.get('features', []):
            feature_counts[feature] = feature_counts.get(feature, 0) + 1
    
    print("Feature distribution:")
    for feature, count in sorted(feature_counts.items(), key=lambda x: -x[1]):
        print(f"  {feature}: {count}")

if __name__ == "__main__":
    main()
