import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users, userSettings } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
} from '@/lib/utils';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

// GET /api/users/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('No autorizado', 401);
    }

    const userId = session.user.id;

    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });

    if (!settings) {
      return createErrorResponse('Configuración no encontrada', 404);
    }

    return createResponse(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// PUT /api/users/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return createErrorResponse('No autorizado', 401);
    }

    const userId = session.user.id;

    const body = await getRequestBody(request);
    const { allowedDays, timezone, emailNotifications, mentionNotifications } =
      body;

    const [updatedSettings] = await db
      .update(userSettings)
      .set({
        allowedDays,
        timezone,
        emailNotifications,
        mentionNotifications,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning();

    if (!updatedSettings) {
      return createErrorResponse('Configuración no encontrada', 404);
    }

    return createResponse(updatedSettings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// POST /api/users/settings/pause-notifications - Pause notifications
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    const body = await getRequestBody(request);
    const { reason, pausedUntil } = body;

    const [updatedUser] = await db
      .update(users)
      .set({
        notificationsPaused: true,
        pauseReason: reason,
        pausedUntil: pausedUntil ? new Date(pausedUntil) : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return createErrorResponse('Usuario no encontrado', 404);
    }

    return createResponse({ message: 'Notificaciones pausadas correctamente' });
  } catch (error) {
    console.error('Error pausing notifications:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}
