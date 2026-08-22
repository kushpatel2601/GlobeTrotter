const { NextResponse } = require('next/server');
const prisma = require('../../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../../lib/auth');

// POST /api/trips/[id]/share - Toggle trip public status and generate share link
export async function POST(request, { params }) {
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

    // Toggle public visibility
    const updated = await prisma.trip.update({
      where: { id },
      data: { isPublic: !existing.isPublic },
    });

    return NextResponse.json({
      isPublic: updated.isPublic,
      shareSlug: updated.shareSlug,
      shareUrl: `/share/${updated.shareSlug || updated.id}`,
    });
  } catch (error) {
    console.error('Error sharing trip:', error);
    return NextResponse.json({ error: 'Failed to update share status' }, { status: 500 });
  }
}
