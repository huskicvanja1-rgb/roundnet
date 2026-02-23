#!/bin/bash
# Quick start script for the scraping pipeline

echo "🏐 Roundnet Directory Data Pipeline"
echo "===================================="

# Check dependencies
echo "Checking dependencies..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
fi

if ! python3 -c "import anthropic" 2>/dev/null; then
    echo "📦 Installing anthropic..."
    pip install anthropic
fi

if ! python3 -c "import crawl4ai" 2>/dev/null; then
    echo "📦 Installing crawl4ai..."
    pip install crawl4ai
fi

if ! python3 -c "import httpx" 2>/dev/null; then
    echo "📦 Installing httpx..."
    pip install httpx
fi

echo "✅ Dependencies installed"

# Create data directories
mkdir -p data/raw data/cleaned data/verified data/enriched data/with-images data/with-features data/final

echo ""
echo "📁 Data directories created"
echo ""
echo "Next steps:"
echo ""
echo "1. Get Outscraper API key from https://outscraper.com"
echo "   Export it: export OUTSCRAPER_API_KEY=your_key"
echo ""
echo "2. Get Anthropic API key from https://console.anthropic.com"
echo "   Export it: export ANTHROPIC_API_KEY=your_key"
echo ""
echo "3. Run Outscraper with config:"
echo "   outscraper google-maps-search --config 01-outscraper-config.json"
echo "   (Or use their web interface and download results to data/raw/)"
echo ""
echo "4. Run the pipeline:"
echo "   python3 02-clean-data.py"
echo "   python3 03-verify-websites.py"
echo "   python3 04-enrich-data.py"
echo "   python3 05-verify-images.py"
echo "   python3 06-extract-features.py"
echo "   python3 07-service-areas.py"
echo "   python3 08-import-to-app.py"
echo ""
echo "Or run all at once (after Outscraper):"
echo "   ./run-pipeline.sh"
