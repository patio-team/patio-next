import { NextRequest } from 'next/server';
import { db } from '@/db';
import { moodEntries, teamMembers, users } from '@/db/schema';
import { createErrorResponse } from '@/lib/utils';
import { eq, and, desc } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// GET /api/teams/[teamId]/mood-entries/csv - Download mood entries as CSV (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const { teamId } = await params;
    const userId = session.user.id;

    // Check if user is a member of the team and has admin role
    const memberResult = await db
      .select({
        role: teamMembers.role,
      })
      .from(teamMembers)
      .where(
        and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)),
      )
      .limit(1);

    if (memberResult.length === 0) {
      return createErrorResponse('You are not a member of this team', 403);
    }

    if (memberResult[0].role !== 'admin') {
      return createErrorResponse(
        'Only team admins can download mood entries',
        403,
      );
    }

    // Fetch all mood entries for the team with user information
    const entries = await db
      .select({
        id: moodEntries.id,
        rating: moodEntries.rating,
        comment: moodEntries.comment,
        visibility: moodEntries.visibility,
        allowContact: moodEntries.allowContact,
        entryDate: moodEntries.entryDate,
        updatedAt: moodEntries.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(moodEntries)
      .innerJoin(users, eq(moodEntries.userId, users.id))
      .where(eq(moodEntries.teamId, teamId))
      .orderBy(desc(moodEntries.entryDate));

    // Convert to CSV format
    const csvHeaders = [
      'Entry ID',
      'User Name',
      'User Email',
      'Rating',
      'Comment',
      'Visibility',
      'Allow Contact',
      'Entry Date',
      'Created At',
      'Updated At',
    ];

    const csvRows = entries.map((entry) => {
      return [
        entry.id,
        entry.userName,
        entry.userEmail,
        entry.rating,
        (entry.comment || '').replace(/(<([^>]+)>)/gi, ''),
        entry.visibility,
        entry.allowContact.toString(),
        entry.entryDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        entry.updatedAt.toISOString(),
      ];
    });

    // Escape CSV values that contain commas, quotes, or newlines
    const escapeCsvValue = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) =>
        row.map((cell) => escapeCsvValue(cell.toString())).join(','),
      ),
    ].join('\n');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `mood-entries-team-${teamId}-${currentDate}.csv`;

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return createErrorResponse('Failed to generate CSV', 500);
  }
}
