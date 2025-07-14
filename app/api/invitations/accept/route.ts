import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamInvitations, teamMembers, users } from '@/db/schema';
import { createResponse, createErrorResponse } from '@/lib/utils';
import { eq, and, gt, isNull } from 'drizzle-orm';

// GET /api/invitations/accept?token=... - Accept invitation via email link
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return createErrorResponse('Token de invitación requerido', 400);
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
      return createErrorResponse('Invitación no válida o expirada', 404);
    }

    // Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.email, invitation.email),
    });

    // If user doesn't exist, create one
    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: invitation.email,
          name: invitation.email.split('@')[0], // Use email prefix as default name
          emailVerified: true,
        })
        .returning();
      user = newUser;
    }

    // Check if user is already a member
    const existingMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.id),
        eq(teamMembers.teamId, invitation.teamId),
      ),
    });

    if (existingMembership) {
      return createErrorResponse('Ya eres miembro de este equipo', 409);
    }

    // Add user to team
    await db.insert(teamMembers).values({
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
      process.env.NEXT_PUBLIC_APP_URL + '/login?message=invitation-accepted';
    return Response.redirect(redirectUrl);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// POST /api/invitations/accept - Accept invitation via API
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return createErrorResponse('Token de invitación requerido', 400);
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
      return createErrorResponse('Invitación no válida o expirada', 404);
    }

    // Get current user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || user.email !== invitation.email) {
      return createErrorResponse('Esta invitación no es para tu cuenta', 403);
    }

    // Check if user is already a member
    const existingMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.id),
        eq(teamMembers.teamId, invitation.teamId),
      ),
    });

    if (existingMembership) {
      return createErrorResponse('Ya eres miembro de este equipo', 409);
    }

    // Add user to team
    await db.insert(teamMembers).values({
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
      message: 'Te has unido al equipo correctamente',
      team: invitation.team,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}
