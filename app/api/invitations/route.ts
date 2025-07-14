import { NextRequest } from 'next/server';
import { db } from '@/db';
import { teamInvitations, teamMembers, users, teams } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
  generateToken,
  isValidEmail,
} from '@/lib/utils';
import { sendTeamInvitationEmail } from '@/lib/email';
import { eq, and, isNull } from 'drizzle-orm';

// POST /api/invitations - Send team invitation
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    const body = await getRequestBody(request);
    const { teamId, email } = body;

    if (!teamId || !email) {
      return createErrorResponse('ID del equipo y email son requeridos', 400);
    }

    if (!isValidEmail(email)) {
      return createErrorResponse('Email inválido', 400);
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
      return createErrorResponse(
        'Solo los administradores pueden enviar invitaciones',
        403,
      );
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
        return createErrorResponse('El usuario ya es miembro del equipo', 409);
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
        'Ya existe una invitación pendiente para este email',
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
      return createErrorResponse('Equipo o usuario no encontrado', 404);
    }

    // Create invitation
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const [invitation] = await db
      .insert(teamInvitations)
      .values({
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
