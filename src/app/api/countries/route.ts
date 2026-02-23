import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data/provider';

// GET /api/countries - List all countries
export async function GET() {
  try {
    const countries = await dataProvider.getCountries();

    return NextResponse.json({
      countries,
      total: countries.length,
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}
