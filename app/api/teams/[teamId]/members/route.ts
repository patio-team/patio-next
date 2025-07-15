import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamMembers } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
} from '@/lib/utils';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

interface Context {
  params: Promise<{ teamId: string }>;
}

// GET /api/teams/[teamId]/members - Get team members
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!membership) {
      return createErrorResponse('You do not have access to this team', 403);
    }

    const members = await db.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId),
      with: {
        user: true,
      },
    });

    return createResponse(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// PUT /api/teams/[teamId]/members - Update member role
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;

    // Check if user is admin of the team
    const adminMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, 'admin'),
      ),
    });

    if (!adminMembership) {
      return createErrorResponse('Only admins can change roles', 403);
    }

    const body = await getRequestBody(request);
    const { memberId, role } = body;

    if (!memberId || !role) {
      return createErrorResponse('Member ID and role are required', 400);
    }

    if (!['member', 'admin'].includes(role)) {
      return createErrorResponse('Invalid role', 400);
    }

    const [updatedMember] = await db
      .update(teamMembers)
      .set({ role })
      .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)))
      .returning();

    if (!updatedMember) {
      return createErrorResponse('Member not found', 404);
    }

    return createResponse(updatedMember);
  } catch (error) {
    console.error('Error updating member role:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/teams/[teamId]/members - Remove member from team
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const { teamId } = await params;

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;

    // Check if user is admin of the team
    const adminMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, 'admin'),
      ),
    });

    if (!adminMembership) {
      return createErrorResponse('Only admins can remove members', 403);
    }

    const body = await getRequestBody(request);
    const { memberId } = body;

    if (!memberId) {
      return createErrorResponse('Member ID is required', 400);
    }

    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)));

    return createResponse({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
