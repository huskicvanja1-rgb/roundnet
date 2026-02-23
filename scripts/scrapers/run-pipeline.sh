#!/bin/bash
# Run the full data pipeline

set -e  # Exit on error

echo "🏐 Running Roundnet Data Pipeline"
echo "=================================="

if [ ! -f "data/raw/outscraper-results.json" ]; then
    echo "❌ No raw data found at data/raw/outscraper-results.json"
    echo "Please run Outscraper first."
    exit 1
fi

echo ""
echo "Step 2: Cleaning data..."
python3 02-clean-data.py

echo ""
echo "Step 3: Verifying websites..."
python3 03-verify-websites.py

echo ""
echo "Step 4: Enriching data..."
python3 04-enrich-data.py

echo ""
echo "Step 5: Verifying images..."
python3 05-verify-images.py

echo ""
echo "Step 6: Extracting features..."
python3 06-extract-features.py

echo ""
echo "Step 7: Generating service areas..."
python3 07-service-areas.py

echo ""
echo "Step 8: Importing to app..."
python3 08-import-to-app.py

echo ""
echo "✅ Pipeline complete!"
echo ""
echo "Next: Update lib/data/provider.ts to use the new data"
