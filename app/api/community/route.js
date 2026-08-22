const { NextResponse } = require('next/server');
const prisma = require('../../../lib/prisma');
const { getUserFromRequest } = require('../../../lib/auth');

export const dynamic = 'force-dynamic';

// GET /api/community - Get all public trips shared by travelers
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      isPublic: true,
    };

    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        stops: {
          include: {
            city: true,
            activities: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error fetching community trips:', error);
    return NextResponse.json({ error: 'Failed to fetch community trips' }, { status: 500 });
  }
}

// POST /api/community - Clone / Copy a public trip to logged-in user's account
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sourceTripId } = body;

    if (!sourceTripId) {
      return NextResponse.json({ error: 'Source trip ID is required' }, { status: 400 });
    }

    // 1. Fetch original trip with stops & activities
    const sourceTrip = await prisma.trip.findUnique({
      where: { id: sourceTripId },
      include: {
        stops: {
          include: { activities: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!sourceTrip) {
      return NextResponse.json({ error: 'Source trip not found' }, { status: 404 });
    }

    // 2. Generate new slug and create duplicated trip under logged-in user
    const slug = sourceTrip.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      + '-copy-' + Date.now().toString(36);

    const clonedTrip = await prisma.trip.create({
      data: {
        userId: user.id,
        name: `${sourceTrip.name} (My Copy)`,
        description: sourceTrip.description,
        coverImage: sourceTrip.coverImage,
        startDate: sourceTrip.startDate,
        endDate: sourceTrip.endDate,
        budget: sourceTrip.budget,
        isPublic: false,
        shareSlug: slug,
        status: 'planning',
      },
    });

    // 3. Clone all stops and activities
    for (const stop of sourceTrip.stops) {
      const newStop = await prisma.stop.create({
        data: {
          tripId: clonedTrip.id,
          cityId: stop.cityId,
          orderIndex: stop.orderIndex,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          transportCost: stop.transportCost,
          accommodationCost: stop.accommodationCost,
          mealBudgetPerDay: stop.mealBudgetPerDay,
        },
      });

      for (const act of stop.activities) {
        await prisma.activity.create({
          data: {
            stopId: newStop.id,
            templateId: act.templateId,
            name: act.name,
            category: act.category,
            cost: act.cost,
            durationMinutes: act.durationMinutes,
            date: act.date,
            notes: act.notes,
          },
        });
      }
    }

    return NextResponse.json({ trip: clonedTrip, message: 'Trip successfully cloned to your account!' }, { status: 201 });
  } catch (error) {
    console.error('Error cloning trip:', error);
    return NextResponse.json({ error: 'Failed to clone trip' }, { status: 500 });
  }
}
