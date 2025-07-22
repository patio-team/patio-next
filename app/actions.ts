'use server';

import { db } from '@/db';
import {
  createMoodSchema,
  createTeamSchema,
  moodEntries,
  NewTeam,
  teamMembers,
  teams,
  type NewMoodEntry,
} from '@/db/schema';
import { generateId, getDayOfWeek, transformToDateTime } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

import { and, eq } from 'drizzle-orm';
import z from 'zod';

export async function createMoodEntry(
  moodEntry: Omit<NewMoodEntry, 'id' | 'userId'>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  const newMoodEntry: NewMoodEntry = {
    id: generateId(),
    userId: session.user.id,
    ...moodEntry,
  };

  const { success, error, data } = createMoodSchema.safeParse(newMoodEntry);

  if (!success) {
    return {
      errors: z.treeifyError(error),
      success: false,
    };
  }

  // Check if user is member of the team
  const membership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, data.userId),
      eq(teamMembers.teamId, data.teamId),
    ),
    with: {
      team: true,
    },
  });

  if (!membership) {
    return {
      errors: { teamId: 'You are not a member of this team' },
      success: false,
    };
  }

  const targetDate = transformToDateTime(data.entryDate);
  const targetDayOfTheWeek = getDayOfWeek(targetDate);

  if (membership?.team.pollDays?.[targetDayOfTheWeek] === false) {
    return {
      errors: {
        entryDate: `Mood entries are not allowed on ${targetDayOfTheWeek}`,
      },
      success: false,
    };
  }

  // Check if the target date is not older than the team creation date
  const teamCreationDate = transformToDateTime(membership.team.createdAt);

  if (targetDate < teamCreationDate) {
    return {
      errors: {
        entryDate:
          'Cannot create mood entries for dates before the team was created',
      },
      success: false,
    };
  }

  // Check if the user already has an entry for today
  const existingEntry = await db.query.moodEntries.findFirst({
    where: and(
      eq(moodEntries.userId, data.userId),
      eq(moodEntries.teamId, data.teamId),
      eq(moodEntries.entryDate, data.entryDate),
    ),
  });

  if (existingEntry) {
    return {
      errors: { entryDate: 'You have already submitted your mood for today' },
      success: false,
    };
  }

  const [newEntry] = await db.insert(moodEntries).values(data).returning();

  return {
    success: true,
    data: newEntry,
  };
}

export async function updateMoodEntry(moodEntry: Omit<NewMoodEntry, 'userId'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  const newMoodEntry: NewMoodEntry = {
    userId: session.user.id,
    ...moodEntry,
  };

  const { success, error, data } = createMoodSchema.safeParse(newMoodEntry);
  if (!success) {
    return {
      errors: z.treeifyError(error),
      success: false,
    };
  }

  // Check if the user is a member of the team
  const membership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, session.user.id),
      eq(teamMembers.teamId, data.teamId),
    ),
    with: {
      team: true,
    },
  });

  if (!membership) {
    return {
      errors: { teamId: 'You are not a member of this team' },
      success: false,
    };
  }

  const targetDate = transformToDateTime(data.entryDate);
  const targetDayOfTheWeek = getDayOfWeek(targetDate);
  if (membership.team.pollDays?.[targetDayOfTheWeek] === false) {
    return {
      errors: {
        entryDate: `Mood entries are not allowed on ${targetDayOfTheWeek}`,
      },
      success: false,
    };
  }

  // Check if the target date is not older than the team creation date
  const teamCreationDate = transformToDateTime(membership.team.createdAt);
  if (targetDate < teamCreationDate) {
    return {
      errors: {
        entryDate:
          'Cannot update mood entries for dates before the team was created',
      },
      success: false,
    };
  }
  // Check if the user has an entry for the target date
  const existingEntry = await db.query.moodEntries.findFirst({
    where: and(
      eq(moodEntries.userId, session.user.id),
      eq(moodEntries.teamId, data.teamId),
      eq(moodEntries.entryDate, data.entryDate),
    ),
  });

  if (!existingEntry) {
    return {
      errors: { entryDate: 'No mood entry found for the specified date' },
      success: false,
    };
  }

  // Update the mood entry
  const [updatedEntry] = await db
    .update(moodEntries)
    .set({
      rating: data.rating,
      comment: data.comment,
      visibility: data.visibility,
      allowContact: data.allowContact,
    })
    .where(eq(moodEntries.id, existingEntry.id))
    .returning();

  return {
    success: true,
    data: updatedEntry,
  };
}

export async function createTeam(team: Omit<NewTeam, 'id'>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  const newTeamData: NewTeam = {
    id: generateId(),
    ...team,
  };

  const { success, error, data } = createTeamSchema.safeParse(newTeamData);
  if (!success) {
    return {
      errors: z.treeifyError(error),
      success: false,
    };
  }

  const [newTeam] = await db.insert(teams).values(data).returning();

  // Add creator as admin
  await db.insert(teamMembers).values({
    id: generateId(),
    userId: session.user.id,
    teamId: data.id,
    role: 'admin',
  });

  return {
    success: true,
    data: newTeam,
  };
}

export async function updateTeam(teamData: NewTeam) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  const { success, error, data } = createTeamSchema.safeParse(teamData);

  if (!success) {
    return {
      errors: z.treeifyError(error),
      success: false,
    };
  }

  // Check if the user is an admin of the team
  const membership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, session.user.id),
      eq(teamMembers.teamId, data.id),
      eq(teamMembers.role, 'admin'),
    ),
  });

  if (!membership) {
    return {
      errors: { teamId: 'You are not an admin of this team' },
      success: false,
    };
  }

  const [updatedTeam] = await db
    .update(teams)
    .set(data)
    .where(eq(teams.id, data.id))
    .returning();

  return {
    success: true,
    data: updatedTeam,
  };
}
