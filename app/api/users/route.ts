import { NextRequest } from 'next/server';
import { db } from '@/db';
import { users, userSettings } from '@/db/schema';
import { createResponse, createErrorResponse, getRequestBody, isValidEmail } from '@/lib/utils';
import { eq } from 'drizzle-orm';

// GET /api/users - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id'); // Assuming auth middleware sets this
    
    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    const user = await db.query.users.findFirst({
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

    if (!user) {
      return createErrorResponse('Usuario no encontrado', 404);
    }

    return createResponse(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await getRequestBody(request);
    const { email, name, avatar } = body;

    if (!email || !name) {
      return createErrorResponse('Email y nombre son requeridos', 400);
    }

    if (!isValidEmail(email)) {
      return createErrorResponse('Email inválido', 400);
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return createErrorResponse('El usuario ya existe', 409);
    }

    // Create user
    const [newUser] = await db.insert(users).values({
      email,
      name,
      avatar,
      emailVerified: false,
    }).returning();

    // Create default user settings
    await db.insert(userSettings).values({
      userId: newUser.id,
      allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'UTC',
      emailNotifications: true,
      mentionNotifications: true,
    });

    return createResponse(newUser, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// PUT /api/users - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return createErrorResponse('No autorizado', 401);
    }

    const body = await getRequestBody(request);
    const { name, avatar } = body;

    const [updatedUser] = await db.update(users)
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
