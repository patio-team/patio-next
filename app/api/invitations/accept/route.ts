import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamInvitations, teamMembers, users } from '@/db/schema';
import { createResponse, createErrorResponse, generateId } from '@/lib/utils';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// GET /api/invitations/accept?token=... - Accept invitation via email link
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return createErrorResponse('Token invitation required', 400);
    }

    // Find invitation
    const invitation = await db.query.teamInvitations.findFirst({
      where: and(
        eq(teamInvitations.token, token),
        gt(teamInvitations.expiresAt, new Date()),
        isNull(teamInvitations.acceptedAt),
        isNull(teamInvitations.rejectedAt),
      ),
      with: {
        team: true,
      },
    });

    if (!invitation) {
      return createErrorResponse('Invalid or expired invitation', 404);
    }

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, invitation.email),
    });

    // redirect to login if user does not exist
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is already a member
    const existingMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.id),
        eq(teamMembers.teamId, invitation.teamId),
      ),
    });

    if (existingMembership) {
      return createErrorResponse('You are already a member of this team', 409);
    }

    // Add user to team
    await db.insert(teamMembers).values({
      id: generateId(),
      userId: user.id,
      teamId: invitation.teamId,
      role: 'member',
    });

    // Mark invitation as accepted
    await db
      .update(teamInvitations)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(teamInvitations.id, invitation.id));

    // Redirect to login or team page
    const redirectUrl =
      process.env.NEXT_PUBLIC_APP_URL + 'team/' + invitation.teamId;
    return Response.redirect(redirectUrl);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return createErrorResponse('Internal Server Error', 500);
  }
}

// POST /api/invitations/accept - Accept invitation via API
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return createErrorResponse('Invitation token is required', 400);
    }

    // Find invitation
    const invitation = await db.query.teamInvitations.findFirst({
      where: and(
        eq(teamInvitations.token, token),
        gt(teamInvitations.expiresAt, new Date()),
        isNull(teamInvitations.acceptedAt),
        isNull(teamInvitations.rejectedAt),
      ),
      with: {
        team: true,
      },
    });

    if (!invitation) {
      return createErrorResponse('Invalid or expired invitation', 404);
    }

    // Get current user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user || user.email !== invitation.email) {
      return createErrorResponse(
        'This invitation is not for your account',
        403,
      );
    }

    // Check if user is already a member
    const existingMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.id),
        eq(teamMembers.teamId, invitation.teamId),
      ),
    });

    if (existingMembership) {
      return createErrorResponse('You are already a member of this team', 409);
    }

    // Add user to team
    await db.insert(teamMembers).values({
      id: generateId(),
      userId: user.id,
      teamId: invitation.teamId,
      role: 'member',
    });

    // Mark invitation as accepted
    await db
      .update(teamInvitations)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(teamInvitations.id, invitation.id));

    return createResponse({
      message: 'You have successfully joined the team',
      team: invitation.team,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return createErrorResponse('Internal Server Error', 500);
  }
}
