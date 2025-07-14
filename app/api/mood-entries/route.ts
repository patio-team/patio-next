import { NextRequest } from 'next/server';
import { db } from '@/db';
import {
  moodEntries,
  teamMembers,
  mentions,
  users,
  notifications,
  teams,
} from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
  getDayOfWeek,
} from '@/lib/utils';
import { sendMentionNotificationEmail } from '@/lib/email';
import { eq, and, desc } from 'drizzle-orm';

// GET /api/mood-entries - Get mood entries for a team
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    if (!teamId) {
      return createErrorResponse('ID del equipo es requerido', 400);
    }

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!membership) {
      return createErrorResponse('No tienes acceso a este equipo', 403);
    }

    const entries = await db.query.moodEntries.findMany({
      where: eq(moodEntries.teamId, teamId),
      with: {
        user: true,
        mentions: {
          with: {
            mentionedUser: true,
          },
        },
      },
      orderBy: [desc(moodEntries.entryDate)],
      limit,
      offset,
    });

    // Hide user info for anonymous entries
    const processedEntries = entries.map((entry) => ({
      ...entry,
      user: entry.isAnonymous ? null : entry.user,
    }));

    return createResponse(processedEntries);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// POST /api/mood-entries - Create new mood entry
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    const body = await getRequestBody(request);
    const {
      teamId,
      rating,
      comment,
      isAnonymous = false,
      allowContact = true,
      mentionedUserIds = [],
    } = body;

    if (!teamId || !rating) {
      return createErrorResponse(
        'ID del equipo y calificación son requeridos',
        400,
      );
    }

    if (!['1', '2', '3', '4', '5'].includes(rating)) {
      return createErrorResponse('Calificación debe ser entre 1 y 5', 400);
    }

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!membership) {
      return createErrorResponse('No eres miembro de este equipo', 403);
    }

    const today = new Date();
    const dayOfWeek = getDayOfWeek(today);

    // Create mood entry
    const [newEntry] = await db
      .insert(moodEntries)
      .values({
        userId,
        teamId,
        rating,
        comment,
        isAnonymous,
        allowContact,
        dayOfWeek: dayOfWeek as
          | 'monday'
          | 'tuesday'
          | 'wednesday'
          | 'thursday'
          | 'friday'
          | 'saturday'
          | 'sunday',
        entryDate: today,
      })
      .returning();

    // Handle mentions
    if (mentionedUserIds.length > 0) {
      // Verify mentioned users are team members
      const teamMemberIds = await db.query.teamMembers.findMany({
        where: and(
          eq(teamMembers.teamId, teamId),
          // We would need an 'in' operator here for proper validation
        ),
      });

      const validMemberIds = teamMemberIds.map((tm) => tm.userId);
      const validMentions = mentionedUserIds.filter((id: string) =>
        validMemberIds.includes(id),
      );

      // Create mentions
      const mentionPromises = validMentions.map(
        async (mentionedUserId: string) => {
          // Create mention record
          await db.insert(mentions).values({
            moodEntryId: newEntry.id,
            mentionedUserId,
            mentionedByUserId: userId,
          });

          // Create notification
          await db.insert(notifications).values({
            userId: mentionedUserId,
            type: 'mention',
            title: 'Te han mencionado',
            message: isAnonymous
              ? 'Alguien te ha mencionado en un comentario anónimo'
              : `Te han mencionado en un comentario`,
            metadata: {
              moodEntryId: newEntry.id,
              teamId,
              mentionedBy: userId,
            },
          });

          // Send email notification if user has them enabled
          const mentionedUser = await db.query.users.findFirst({
            where: eq(users.id, mentionedUserId),
            with: { settings: true },
          });

          if (
            mentionedUser?.settings?.emailNotifications &&
            mentionedUser?.settings?.mentionNotifications
          ) {
            const currentUser = await db.query.users.findFirst({
              where: eq(users.id, userId),
            });

            const team = await db.query.teams.findFirst({
              where: eq(teams.id, teamId),
            });

            if (currentUser && team) {
              await sendMentionNotificationEmail(
                mentionedUser.email,
                isAnonymous ? 'Usuario anónimo' : currentUser.name,
                team.name,
                typeof comment === 'string' ? comment : JSON.stringify(comment),
              );
            }
          }
        },
      );

      await Promise.all(mentionPromises);
    }

    return createResponse(newEntry, 201);
  } catch (error) {
    console.error('Error creating mood entry:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}
