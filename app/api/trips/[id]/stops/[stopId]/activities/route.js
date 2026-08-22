const { NextResponse } = require('next/server');
const prisma = require('../../../../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../../../../lib/auth');

// POST /api/trips/[id]/stops/[stopId]/activities - Add activity to stop
export async function POST(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stopId } = params;
    const body = await request.json();
    const { name, category, cost, durationMinutes, date, notes, templateId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Activity name is required' }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        stopId,
        templateId: templateId || null,
        name,
        category: category || 'sightseeing',
        cost: cost !== undefined ? parseFloat(cost) : 0,
        durationMinutes: durationMinutes ? parseInt(durationMinutes) : 60,
        date: date ? new Date(date) : null,
        notes: notes || null,
      },
      include: {
        template: true,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Error adding activity:', error);
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 });
  }
}
