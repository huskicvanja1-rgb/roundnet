import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data/provider';

export const dynamic = 'force-dynamic';

// GET /api/clubs - List clubs with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const country = searchParams.get('country');
    const city = searchParams.get('city');

    let clubs = await dataProvider.getAllClubs();

    // Filter by country if specified
    if (country) {
      clubs = clubs.filter((club) => club.countrySlug === country.toLowerCase());
    }

    // Filter by city if specified
    if (city) {
      clubs = clubs.filter((club) => club.citySlug === city.toLowerCase());
    }

    return NextResponse.json({
      clubs,
      total: clubs.length,
    });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}
