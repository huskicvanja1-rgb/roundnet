import { NextRequest, NextResponse } from 'next/server';

// GET /api/events - List events
// TODO: Implement with database when Prisma is set up
export async function GET() {
  return NextResponse.json({
    events: [],
    total: 0,
  });
}
