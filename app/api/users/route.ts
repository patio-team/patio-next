import { db } from '@/db';
import { users } from '@/db/schema';
import { createResponse, createErrorResponse } from '@/lib/utils';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// GET /api/users - Get current user profile
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('Not authorized', 401);
    }

    const userId = session.user.id;

    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        settings: true,
        teamMembers: {
          with: {
            team: true,
          },
        },
      },
    });

    if (!currentUser) {
      return createErrorResponse('User not found', 404);
    }

    return createResponse(currentUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
