import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { teams, teamMembers } from '@/db/schema';
import {
  createResponse,
  createErrorResponse,
  getRequestBody,
  generateInviteCode,
  generateId,
} from '@/lib/utils';
import { eq } from 'drizzle-orm';

// GET /api/teams - Get user's teams
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return createErrorResponse('No authorized', 401);
    }

    const userId = session.user.id;

    const userTeams = await db.query.teamMembers.findMany({
      where: eq(teamMembers.userId, userId),
      with: {
        team: true,
      },
    });

    const teamsData = userTeams.map((tm) => ({
      ...tm.team,
      role: tm.role,
      joinedAt: tm.joinedAt,
    }));

    return createResponse(teamsData);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// POST /api/teams - Create new team
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return createErrorResponse('No authorized', 401);
    }

    const userId = session.user.id;
    const body = await getRequestBody(request);
    const { name, description } = body;

    if (!name) {
      return createErrorResponse('Team name required', 400);
    }

    // Create team
    const [newTeam] = await db
      .insert(teams)
      .values({
        id: generateId(),
        name,
        description,
        inviteCode: generateInviteCode(),
      })
      .returning();

    // Add creator as admin
    await db.insert(teamMembers).values({
      id: generateId(),
      userId,
      teamId: newTeam.id,
      role: 'admin',
    });

    return createResponse(newTeam, 201);
  } catch (error) {
    console.error('Error creating team:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}
