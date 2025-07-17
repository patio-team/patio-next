import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { teamMembers, moodEntries } from '@/db/schema';
import { eq, and, desc, lt, count } from 'drizzle-orm';
import { z } from 'zod';

const getMemberDataSchema = z.object({
  teamId: z.string(),
  memberId: z.string(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['member', 'admin']),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, memberId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');

    getMemberDataSchema.parse({
      teamId,
      memberId,
      cursor,
      limit,
    });

    // Check if current user is member of the team
    const currentUserMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, session.user.id),
        eq(teamMembers.teamId, teamId),
      ),
      with: {
        team: true,
      },
    });

    if (!currentUserMembership) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Get the member we want to view
    const member = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, memberId),
        eq(teamMembers.teamId, teamId),
      ),
      with: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Build mood entries query
    const whereConditions = [
      eq(moodEntries.userId, memberId),
      eq(moodEntries.teamId, teamId),
    ];

    // Only show public entries unless it's the user's own profile or current user is admin
    if (
      currentUserMembership.role !== 'admin' &&
      session.user.id !== memberId
    ) {
      whereConditions.push(eq(moodEntries.visibility, 'public'));
    }

    // Add cursor condition for pagination
    if (cursor) {
      whereConditions.push(lt(moodEntries.createdAt, new Date(cursor)));
    }

    // Get mood entries with pagination
    const memberMoodEntries = await db.query.moodEntries.findMany({
      where: and(...whereConditions),
      orderBy: desc(moodEntries.entryDate),
      limit: limit + 1, // Get one extra to check if there are more
    });

    // Check if there are more entries
    const hasMore = memberMoodEntries.length > limit;
    const entries = hasMore
      ? memberMoodEntries.slice(0, limit)
      : memberMoodEntries;

    // Get the cursor for the next page
    const nextCursor = hasMore
      ? entries[entries.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      member: {
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        role: member.role,
        joinedAt: member.joinedAt.toISOString(),
        user: member.user,
      },
      team: currentUserMembership.team,
      moodEntries: entries.map((entry) => ({
        id: entry.id,
        userId: entry.userId,
        teamId: entry.teamId,
        rating: entry.rating,
        comment: entry.comment,
        visibility: entry.visibility,
        allowContact: entry.allowContact,
        entryDate: entry.entryDate.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
      pagination: {
        hasMore,
        nextCursor,
      },
    });
  } catch (error) {
    console.error('Error fetching member data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; memberId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId, memberId } = await params;
    const body = await request.json();

    const validatedData = updateMemberRoleSchema.parse(body);

    // Check if current user is admin of the team
    const currentUserMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, session.user.id),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!currentUserMembership || currentUserMembership.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get the member to update
    const memberToUpdate = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, memberId),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!memberToUpdate) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // If trying to demote current user from admin to member, check if there are other admins
    if (
      session.user.id === memberId &&
      memberToUpdate.role === 'admin' &&
      validatedData.role === 'member'
    ) {
      const adminCount = await db
        .select({ count: count() })
        .from(teamMembers)
        .where(
          and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, 'admin')),
        );

      if (adminCount[0].count <= 1) {
        return NextResponse.json(
          {
            error:
              'Cannot demote yourself. There must be at least one admin in the team.',
          },
          { status: 400 },
        );
      }
    }

    // Update the member role
    await db
      .update(teamMembers)
      .set({
        role: validatedData.role,
      })
      .where(
        and(eq(teamMembers.userId, memberId), eq(teamMembers.teamId, teamId)),
      );

    // Get updated member data
    const updatedMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, memberId),
        eq(teamMembers.teamId, teamId),
      ),
      with: {
        user: true,
      },
    });

    return NextResponse.json({
      message: 'Member role updated successfully',
      member: updatedMember,
    });
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
