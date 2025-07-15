import { NextRequest } from 'next/server';
import { db } from '@/db';
import { moodEntries, teamMembers } from '@/db/schema';
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
import { eq, and, gte, lte, avg, count } from 'drizzle-orm';
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
      visibility = 'public',
      allowContact = true,
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
        visibility,
        allowContact,
        entryDate: entryDateForDB,
      })
      .returning();

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
    const { entryId, rating, comment, visibility, allowContact } = body;

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
      visibility: 'public' | 'private';
      allowContact: boolean;
    }> = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (allowContact !== undefined) updateData.allowContact = allowContact;

    const [updatedEntry] = await db
      .update(moodEntries)
      .set(updateData)
      .where(eq(moodEntries.id, entryId))
      .returning();

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

// GET /api/mood-entries - Get average mood for a date range
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!teamId) {
      return createErrorResponse('Team ID is required', 400);
    }

    if (!startDate || !endDate) {
      return createErrorResponse('Start date and end date are required', 400);
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
      return createErrorResponse('You are not a member of this team', 403);
    }

    // Validate date format and parse dates
    let parsedStartDate, parsedEndDate;
    try {
      parsedStartDate = getDateInTimezone(startDate);
      parsedEndDate = getDateInTimezone(endDate);
    } catch {
      return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }

    // Ensure start date is not after end date
    if (parsedStartDate > parsedEndDate) {
      return createErrorResponse('Start date cannot be after end date', 400);
    }

    const startDateForDB = formatDateForDB(parsedStartDate);
    const endDateForDB = formatDateForDB(parsedEndDate);

    // Query for average mood and entry count in the date range
    const result = await db
      .select({
        averageRating: avg(moodEntries.rating),
        totalEntries: count(moodEntries.id),
      })
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.teamId, teamId),
          gte(moodEntries.entryDate, startDateForDB),
          lte(moodEntries.entryDate, endDateForDB),
          eq(moodEntries.visibility, 'public'), // Only include public entries
        ),
      );

    const averageRating = result[0]?.averageRating;
    const totalEntries = result[0]?.totalEntries || 0;

    return createResponse({
      teamId,
      startDate,
      endDate,
      averageRating: averageRating
        ? parseFloat(Number(averageRating).toFixed(2))
        : null,
      totalEntries,
    });
  } catch (error) {
    console.error('Error calculating average mood:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
