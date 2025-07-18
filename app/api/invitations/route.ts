import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamInvitations, teamMembers, users, teams } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
  generateToken,
  generateId,
  isValidEmail,
} from '@/lib/utils';
import { sendTeamInvitationEmail } from '@/lib/email';
import { eq, and, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// POST /api/invitations - Send team invitation
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not autorized', 401);
    }

    const userId = session.user.id;

    const body = await getRequestBody(request);
    const { teamId, email } = body;

    if (!teamId || !email) {
      return createErrorResponse('Team ID and email are required', 400);
    }

    if (!isValidEmail(email)) {
      return createErrorResponse('Invalid email', 400);
    }

    // Check if user is admin of the team
    const adminMembership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.role, 'admin'),
      ),
    });

    if (!adminMembership) {
      return createErrorResponse('Only admins can send invitations', 403);
    }

    // Check if user is already a member
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      const existingMembership = await db.query.teamMembers.findFirst({
        where: and(
          eq(teamMembers.userId, existingUser.id),
          eq(teamMembers.teamId, teamId),
        ),
      });

      if (existingMembership) {
        return createErrorResponse('User is already a member of the team', 409);
      }
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.query.teamInvitations.findFirst({
      where: and(
        eq(teamInvitations.teamId, teamId),
        eq(teamInvitations.email, email),
        isNull(teamInvitations.acceptedAt),
        isNull(teamInvitations.rejectedAt),
      ),
    });

    if (existingInvitation) {
      return createErrorResponse(
        'Invitation already exists for this email',
        409,
      );
    }

    // Get team and inviter info
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    const inviter = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!team || !inviter) {
      return createErrorResponse('Team or user not found', 404);
    }

    // Create invitation
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const [invitation] = await db
      .insert(teamInvitations)
      .values({
        id: generateId(),
        teamId,
        invitedBy: userId,
        email,
        token,
        expiresAt,
      })
      .returning();

    // Send invitation email
    await sendTeamInvitationEmail(email, team.name, inviter.name, token);

    return createResponse(
      {
        message: 'Invitación enviada correctamente',
        invitation: {
          id: invitation.id,
          email: invitation.email,
          expiresAt: invitation.expiresAt,
        },
      },
      201,
    );
  } catch (error) {
    console.error('Error sending invitation:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}
