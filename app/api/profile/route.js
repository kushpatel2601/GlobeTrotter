const { NextResponse } = require('next/server');
const prisma = require('../../../lib/prisma');
const { getUserFromRequest, hashPassword } = require('../../../lib/auth');

export const dynamic = 'force-dynamic';

// GET /api/profile - fetch current user profile
export async function GET(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        avatar: true,
        language: true,
        role: true,
        createdAt: true,
        _count: { select: { trips: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

// PUT /api/profile - update user profile fields
export async function PUT(request) {
  try {
    const decoded = getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, city, country, avatar, language, newPassword } = body;

    // build update data - only include fields that were actually sent
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (language !== undefined) updateData.language = language;

    // handle password change if provided
    if (newPassword && newPassword.length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        avatar: true,
        language: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updated, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
