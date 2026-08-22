const { NextResponse } = require('next/server');
const prisma = require('../../../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../../../lib/auth');

// DELETE /api/trips/[id]/stops/[stopId] - Delete a stop
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stopId } = params;

    // Delete associated activities first, then stop
    await prisma.activity.deleteMany({ where: { stopId } });
    await prisma.stop.delete({ where: { id: stopId } });

    return NextResponse.json({ message: 'Stop deleted successfully' });
  } catch (error) {
    console.error('Error deleting stop:', error);
    return NextResponse.json({ error: 'Failed to delete stop' }, { status: 500 });
  }
}
