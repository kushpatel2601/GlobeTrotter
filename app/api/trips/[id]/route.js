const { NextResponse } = require('next/server');
const prisma = require('../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../lib/auth');

// GET /api/trips/[id] - get single trip with all details
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        stops: {
          include: {
            city: true,
            activities: {
              include: { template: true },
              orderBy: { date: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}

// PUT /api/trips/[id] - update a trip
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // make sure user owns this trip
    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
        endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
        budget: body.budget !== undefined ? parseFloat(body.budget) : existing.budget,
        coverImage: body.coverImage ?? existing.coverImage,
        isPublic: body.isPublic !== undefined ? body.isPublic : existing.isPublic,
        status: body.status ?? existing.status,
      },
    });

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

// DELETE /api/trips/[id]
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    await prisma.trip.delete({ where: { id } });

    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
