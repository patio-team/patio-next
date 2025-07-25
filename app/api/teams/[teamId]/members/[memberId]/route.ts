import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { teamMembers, moodEntries } from '@/db/schema';
import { eq, and, desc, lt } from 'drizzle-orm';
import { z } from 'zod';
import { MembersPagination } from '@/lib/api-types';

const getMemberDataSchema = z.object({
  teamId: z.string(),
  memberId: z.string(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
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

    const response: MembersPagination = {
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
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching member data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
