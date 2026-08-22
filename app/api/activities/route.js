const { NextResponse } = require('next/server');
const prisma = require('../../../lib/prisma');

// GET /api/activities - Search and filter activity templates
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const cityId = searchParams.get('cityId') || '';
    const maxCost = searchParams.get('maxCost');
    const limit = parseInt(searchParams.get('limit') || '30');

    const where = {};

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    if (cityId) {
      where.cityId = cityId;
    }

    if (maxCost) {
      where.estimatedCost = { lte: parseFloat(maxCost) };
    }

    const activities = await prisma.activityTemplate.findMany({
      where,
      include: {
        city: true,
      },
      orderBy: { estimatedCost: 'asc' },
      take: limit,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
