const { NextResponse } = require('next/server');
const prisma = require('../../../../lib/prisma');
const { getUserFromRequest } = require('../../../../lib/auth');

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - admin-only analytics data
export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check admin role
    const currentUser = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // aggregate stats in parallel
    const [totalUsers, totalTrips, totalCities, totalActivities, users, popularCities, categoryStats] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.count(),
      prisma.activity.count(),
      prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { trips: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.city.findMany({
        select: {
          id: true,
          name: true,
          country: true,
          region: true,
          popularity: true,
          _count: { select: { stops: true } },
        },
        orderBy: { popularity: 'desc' },
        take: 10,
      }),
      prisma.activity.groupBy({
        by: ['category'],
        _count: { id: true },
        _sum: { cost: true },
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    // calculate some extra metrics
    const publicTrips = await prisma.trip.count({ where: { isPublic: true } });
    const avgBudget = await prisma.trip.aggregate({ _avg: { budget: true } });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTrips,
        totalCities,
        totalActivities,
        publicTrips,
        avgBudget: Math.round(avgBudget._avg.budget || 0),
      },
      users,
      popularCities,
      categoryStats,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load admin stats' }, { status: 500 });
  }
}
