import { NextRequest, NextResponse } from 'next/server';
import { dataProvider } from '@/lib/data/provider';

// GET /api/clubs/[slug] - Get a single club by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const club = await dataProvider.getClubBySlug(params.slug);

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error('Error fetching club:', error);
    return NextResponse.json(
      { error: 'Failed to fetch club' },
      { status: 500 }
    );
  }
}
