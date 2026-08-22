const { NextResponse } = require('next/server');
const prisma = require('../../../lib/prisma');

// GET /api/cities - search/list cities
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const region = searchParams.get('region') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {};

    // search by name or country
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { country: { contains: query } },
      ];
    }

    if (region) {
      where.region = region;
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: { popularity: 'desc' },
      take: limit,
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
