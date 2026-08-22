const { NextResponse } = require('next/server');
const prisma = require('../../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../../lib/auth');

// GET /api/trips/[id]/stops
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const stops = await prisma.stop.findMany({
      where: { tripId: id },
      include: {
        city: true,
        activities: {
          include: { template: true },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({ stops });
  } catch (error) {
    console.error('Error fetching stops:', error);
    return NextResponse.json({ error: 'Failed to fetch stops' }, { status: 500 });
  }
}

// POST /api/trips/[id]/stops - Add a city stop to trip
export async function POST(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: tripId } = params;
    const body = await request.json();
    const { cityId, arrivalDate, departureDate, transportCost, accommodationCost, mealBudgetPerDay } = body;

    if (!cityId || !arrivalDate || !departureDate) {
      return NextResponse.json(
        { error: 'City, arrival date and departure date are required' },
        { status: 400 }
      );
    }

    const currentCount = await prisma.stop.count({ where: { tripId } });

    const stop = await prisma.stop.create({
      data: {
        tripId,
        cityId,
        orderIndex: currentCount,
        arrivalDate: new Date(arrivalDate),
        departureDate: new Date(departureDate),
        transportCost: transportCost ? parseFloat(transportCost) : 0,
        accommodationCost: accommodationCost ? parseFloat(accommodationCost) : 0,
        mealBudgetPerDay: mealBudgetPerDay ? parseFloat(mealBudgetPerDay) : 0,
      },
      include: {
        city: true,
        activities: true,
      },
    });

    return NextResponse.json({ stop }, { status: 201 });
  } catch (error) {
    console.error('Error adding stop:', error);
    return NextResponse.json({ error: 'Failed to add stop' }, { status: 500 });
  }
}
