# Roundnet Directory Europe

A comprehensive pan-European directory for Roundnet (Spikeball) clubs, communities, and events. Built with Next.js 14, Prisma, PostgreSQL with PostGIS, and Tailwind CSS.

## Features

- 🗺️ **Interactive Map** - Find clubs near you with Leaflet-powered geolocation
- 🔍 **Advanced Search** - Filter by country, city, club type, and features
- 🌍 **Multilingual** - Full i18n support (EN, DE, FR, ES, IT)
- 📱 **Responsive** - Mobile-first design with PWA support
- 🔐 **Authentication** - NextAuth with role-based access control
- 📊 **Admin Dashboard** - Moderate submissions, manage clubs, view analytics
- 🔄 **Data Sync** - Automated scraping from IRF and national federations
- 📍 **SEO Optimized** - Dynamic sitemap, schema.org markup, hreflang tags

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with PostGIS extension
- **ORM**: Prisma
- **Authentication**: NextAuth v5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Maps**: Leaflet / react-leaflet
- **Scraping**: Cheerio, Puppeteer
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/roundnet-directory/europe.git
   cd europe
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/roundnet?schema=public"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Create PostGIS extension (requires superuser)
   psql -d roundnet -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   
   # Run migrations
   pnpm prisma migrate dev
   
   # Seed initial data
   pnpm prisma db seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── scripts/
│   ├── scrapers/          # Data scraping scripts
│   └── cron/              # Scheduled sync jobs
├── src/
│   ├── app/
│   │   ├── [locale]/      # Localized pages
│   │   ├── admin/         # Admin dashboard
│   │   └── api/           # API routes
│   ├── components/
│   │   ├── ui/            # Base UI components
│   │   ├── layout/        # Header, Footer
│   │   ├── clubs/         # Club-related components
│   │   └── map/           # Map components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── db.ts          # Prisma client
│   │   └── i18n/          # Internationalization
│   └── locales/           # Translation files
└── public/                # Static assets
```

## Data Sources

The directory aggregates data from multiple sources:

1. **International Roundnet Federation (IRF)** - Official member federations
2. **National Federation Websites** - Scraped with permission
3. **User Submissions** - Community-contributed clubs
4. **Direct API Integration** - Where available

### Running Scrapers

```bash
# Run all scrapers
pnpm scrape:all

# Scrape specific federation
pnpm scrape:irf
pnpm scrape:france
pnpm scrape:germany
```

## API Endpoints

### Public API

- `GET /api/clubs` - List clubs with filtering
- `GET /api/clubs/[slug]` - Get club details
- `GET /api/events` - List upcoming events
- `GET /api/countries` - List countries with club counts
- `POST /api/submissions` - Submit a new club

### Admin API (requires authentication)

- `GET /api/admin/submissions` - List pending submissions
- `POST /api/admin/submissions/[id]/approve` - Approve submission
- `POST /api/admin/submissions/[id]/reject` - Reject submission

## Internationalization

Supported languages:
- 🇬🇧 English (en) - Default
- 🇩🇪 German (de)
- 🇫🇷 French (fr)
- 🇪🇸 Spanish (es)
- 🇮🇹 Italian (it)

Translation files are located in `src/locales/`. To add a new language:

1. Create a new JSON file: `src/locales/[lang].json`
2. Add the locale to `src/lib/i18n/config.ts`
3. Update `src/lib/i18n/dictionaries.ts`

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- **Submit clubs** - Know a club that's missing? Use the submission form
- **Report issues** - Found a bug or inaccuracy? Open an issue
- **Add translations** - Help us reach more communities
- **Improve scrapers** - Add support for more federation websites

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [International Roundnet Federation](https://www.roundnetfederation.com/)
- All national federations and clubs who provided data
- The European Roundnet community

---

Made with ❤️ for the European Roundnet community
