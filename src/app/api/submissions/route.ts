import { NextRequest, NextResponse } from 'next/server';

// POST /api/submissions - Submit a new club
// TODO: Implement with database when Prisma is set up
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'Submissions are not available until database is set up' },
    { status: 503 }
  );
}
