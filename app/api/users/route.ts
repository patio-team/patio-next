import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users, userSettings } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
  isValidEmail,
} from '@/lib/utils';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// GET /api/users - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('No autorizado', 401);
    }

    const userId = session.user.id;

    const currentUser = await db.query.user.findFirst({
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
      return createErrorResponse('Usuario no encontrado', 404);
    }

    return createResponse(currentUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    const body = await getRequestBody(request);
    const { name, avatar } = body;

    const [updatedUser] = await db
      .update(users)
      .set({
        name,
        avatar,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return createErrorResponse('Usuario no encontrado', 404);
    }

    return createResponse(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}
