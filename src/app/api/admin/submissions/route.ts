import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace with actual database queries when Prisma is set up
// GET /api/admin/submissions - List submissions with filtering
export async function GET(request: NextRequest) {
  // Mock implementation - returns empty data until database is set up
  return NextResponse.json({
    submissions: [],
    total: 0,
    page: 1,
    totalPages: 0,
  });
}
