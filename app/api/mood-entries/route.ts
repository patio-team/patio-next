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
  getTodayInTimezone,
  getDateInTimezone,
  canPostOnDate,
  formatDateForDB,
  generateId,
} from '@/lib/utils';
import { sendMentionNotificationEmail } from '@/lib/email';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// POST /api/mood-entries - Create new mood entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;

    const body = await getRequestBody(request);
    const {
      teamId,
      rating,
      comment,
      isAnonymous = false,
      allowContact = true,
      mentionedUserIds = [],
      entryDate, // Optional: if not provided, defaults to today
    } = body;

    if (!teamId || !rating) {
      return createErrorResponse('Team ID and rating are required', 400);
    }

    if (!['1', '2', '3', '4', '5'].includes(rating)) {
      return createErrorResponse('Rating must be between 1 and 5', 400);
    }

    // Check if user is member of the team
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
      ),
    });

    if (!membership) {
      return createErrorResponse('You are not a member of this team', 403);
    }

    // Handle entry date
    let targetDate;
    if (entryDate) {
      try {
        targetDate = getDateInTimezone(entryDate);
        if (!canPostOnDate(targetDate)) {
          return createErrorResponse(
            'Cannot create entries for future dates',
            400,
          );
        }
      } catch {
        return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
      }
    } else {
      targetDate = getTodayInTimezone();
    }

    const entryDateForDB = formatDateForDB(targetDate);

    // Create mood entry
    const [newEntry] = await db
      .insert(moodEntries)
      .values({
        id: generateId(),
        userId,
        teamId,
        rating,
        comment,
        isAnonymous,
        allowContact,
        entryDate: entryDateForDB,
      })
      .returning();

    // Handle mentions
    if (mentionedUserIds.length > 0) {
      // Verify mentioned users are team members
      const teamMemberIds = await db.query.teamMembers.findMany({
        where: eq(teamMembers.teamId, teamId),
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
            id: generateId(),
            moodEntryId: newEntry.id,
            mentionedUserId,
            mentionedByUserId: userId,
          });

          // Create notification
          await db.insert(notifications).values({
            id: generateId(),
            userId: mentionedUserId,
            type: 'mention',
            title: 'You have been mentioned',
            message: isAnonymous
              ? 'Someone mentioned you in an anonymous comment'
              : 'You have been mentioned in a comment',
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
                isAnonymous ? 'Anonymous User' : currentUser.name,
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
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/mood-entries - Update existing mood entry
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;
    const body = await getRequestBody(request);
    const {
      entryId,
      rating,
      comment,
      isAnonymous,
      allowContact,
      mentionedUserIds = [],
    } = body;

    if (!entryId) {
      return createErrorResponse('Entry ID is required', 400);
    }

    if (rating && !['1', '2', '3', '4', '5'].includes(rating)) {
      return createErrorResponse('Rating must be between 1 and 5', 400);
    }

    // Find the existing entry and verify ownership
    const existingEntry = await db.query.moodEntries.findFirst({
      where: eq(moodEntries.id, entryId),
    });

    if (!existingEntry) {
      return createErrorResponse('Mood entry not found', 404);
    }

    if (existingEntry.userId !== userId) {
      return createErrorResponse('You can only edit your own entries', 403);
    }

    // Check if the entry date allows editing (not future date)
    const entryDate = getDateInTimezone(
      existingEntry.entryDate.toISOString().split('T')[0],
    );
    if (!canPostOnDate(entryDate)) {
      return createErrorResponse('Cannot edit entries for future dates', 400);
    }

    // Update the entry
    const updateData: Partial<{
      rating: '1' | '2' | '3' | '4' | '5';
      comment: string;
      isAnonymous: boolean;
      allowContact: boolean;
    }> = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;
    if (allowContact !== undefined) updateData.allowContact = allowContact;

    const [updatedEntry] = await db
      .update(moodEntries)
      .set(updateData)
      .where(eq(moodEntries.id, entryId))
      .returning();

    // Handle mention updates (simplified - remove old mentions and add new ones)
    if (mentionedUserIds.length >= 0) {
      // Remove existing mentions
      await db.delete(mentions).where(eq(mentions.moodEntryId, entryId));

      // Add new mentions (similar to POST logic)
      if (mentionedUserIds.length > 0) {
        const teamMemberIds = await db.query.teamMembers.findMany({
          where: eq(teamMembers.teamId, existingEntry.teamId),
        });

        const validMemberIds = teamMemberIds.map((tm) => tm.userId);
        const validMentions = mentionedUserIds.filter((id: string) =>
          validMemberIds.includes(id),
        );

        const mentionPromises = validMentions.map(
          async (mentionedUserId: string) => {
            await db.insert(mentions).values({
              id: generateId(),
              moodEntryId: entryId,
              mentionedUserId,
              mentionedByUserId: userId,
            });

            // Create notification for the update
            await db.insert(notifications).values({
              id: generateId(),
              userId: mentionedUserId,
              type: 'mention',
              title: 'You have been mentioned',
              message: isAnonymous
                ? 'Someone mentioned you in an updated anonymous comment'
                : 'You have been mentioned in an updated comment',
              metadata: {
                moodEntryId: entryId,
                teamId: existingEntry.teamId,
                mentionedBy: userId,
              },
            });
          },
        );

        await Promise.all(mentionPromises);
      }
    }

    return createResponse(updatedEntry);
  } catch (error) {
    console.error('Error updating mood entry:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/mood-entries - Delete mood entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return createErrorResponse('Entry ID is required', 400);
    }

    const userId = session.user.id;

    // Find the existing entry and verify ownership
    const existingEntry = await db.query.moodEntries.findFirst({
      where: eq(moodEntries.id, entryId),
    });

    if (!existingEntry) {
      return createErrorResponse('Mood entry not found', 404);
    }

    if (existingEntry.userId !== userId) {
      return createErrorResponse('You can only delete your own entries', 403);
    }

    // Delete the entry (mentions and notifications will be cascade deleted)
    await db.delete(moodEntries).where(eq(moodEntries.id, entryId));

    return createResponse({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
