const { NextResponse } = require('next/server');
const prisma = require('../../../lib/prisma');
const { getUserFromRequest } = require('../../../lib/auth');

export const dynamic = 'force-dynamic';

// GET /api/trips - get all trips for logged in user
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // filter by status

    const where = { userId: user.id };
    if (status && status !== 'all') {
      where.status = status;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        stops: {
          include: { city: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

// POST /api/trips - create a new trip
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, startDate, endDate, budget, coverImage } = body;

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Name, start date and end date are required' },
        { status: 400 }
      );
    }

    // generate a share slug from the name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ? parseFloat(budget) : null,
        coverImage: coverImage || null,
        shareSlug: slug,
        status: 'planning',
      },
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
