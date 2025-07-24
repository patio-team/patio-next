'use server';

import { db } from '@/db';
import {
  createMoodSchema,
  createTeamSchema,
  moodEntries,
  NewTeam,
  teamInvitations,
  teamMembers,
  teams,
  users,
  type NewMoodEntry,
} from '@/db/schema';
import {
  generateId,
  generateToken,
  getDayOfWeek,
  transformToDateTime,
} from '@/lib/utils';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

import { and, count, eq } from 'drizzle-orm';
import z from 'zod';
import { sendTeamInvitationEmail } from '@/lib/email';

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

export async function deleteTeam(teamId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  // Check if the user is an admin of the team
  const membership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, session.user.id),
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.role, 'admin'),
    ),
  });

  if (!membership) {
    return {
      errors: { teamId: 'You are not an admin of this team' },
      success: false,
    };
  }

  try {
    // Delete the team (cascade will handle related records)
    await db.delete(teams).where(eq(teams.id, teamId));

    return {
      success: true,
      data: { teamId },
    };
  } catch (error) {
    console.error('Error deleting team:', error);
    return {
      errors: { teamId: 'Failed to delete team' },
      success: false,
    };
  }
}

export async function sendInvites(
  userId: string,
  teamId: string,
  emails: string[],
): Promise<{ success: boolean; errors?: Record<string, string> }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  const emailValidation = z.array(z.email()).safeParse(emails);

  if (!emailValidation.success) {
    return {
      errors: { emails: 'Invalid email addresses' },
      success: false,
    };
  }

  // Check if user is admin of the team
  const adminMembership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, userId),
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.role, 'admin'),
    ),
  });

  if (!adminMembership) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  // Get team and inviter info
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  const inviter = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!team || !inviter) {
    return {
      errors: { userId: 'User or team not found' },
      success: false,
    };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  // Create invitations
  const invitations = emailValidation.data.map((email) => {
    const token = generateToken();

    return {
      id: generateId(),
      teamId,
      email,
      invitedBy: userId,
      token,
      expiresAt,
    };
  });

  await db.insert(teamInvitations).values(invitations).onConflictDoNothing();

  // Send invitation emails
  invitations.forEach((invitation) => {
    sendTeamInvitationEmail(
      invitation.email,
      team.name,
      inviter.name,
      invitation.token,
    );
  });

  return {
    success: true,
  };
}

export async function changeMemberRole(
  teamId: string,
  memberId: string,
  newRole: 'member' | 'admin',
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

  // Check if the user is an admin of the team
  const adminMembership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, session.user.id),
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.role, 'admin'),
    ),
  });

  if (!adminMembership) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  // Get the member to update
  const memberToUpdate = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, memberId),
      eq(teamMembers.teamId, teamId),
    ),
  });

  if (!memberToUpdate) {
    return {
      errors: { memberId: 'Member not found' },
      success: false,
    };
  }

  // If trying to demote current user from admin to member, check if there are other admins
  if (
    session.user.id === memberId &&
    memberToUpdate.role === 'admin' &&
    newRole === 'member'
  ) {
    const adminCount = await db
      .select({ count: count() })
      .from(teamMembers)
      .where(
        and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, 'admin')),
      );

    if (adminCount[0].count <= 1) {
      return {
        errors: {
          userId:
            'Cannot demote yourself. There must be at least one admin in the team.',
        },
        success: false,
      };
    }
  }

  // Update the member role
  await db
    .update(teamMembers)
    .set({
      role: newRole,
    })
    .where(
      and(eq(teamMembers.userId, memberId), eq(teamMembers.teamId, teamId)),
    );

  // Get updated member data
  const updatedMember = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, memberId),
      eq(teamMembers.teamId, teamId),
    ),
    with: {
      user: true,
    },
  });

  return {
    success: true,
    data: updatedMember,
  };
}

export async function leaveTeam(teamId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      errors: { userId: 'Not authorized' },
      success: false,
    };
  }

  const userId = session.user.id;

  // Check if user is member of the team
  const membership = await db.query.teamMembers.findFirst({
    where: and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)),
  });

  if (!membership) {
    return {
      errors: { teamId: 'You are not a member of this team' },
      success: false,
    };
  }

  // If user is admin, check if they are the last admin
  if (membership.role === 'admin') {
    const adminMembers = await db.query.teamMembers.findMany({
      where: and(eq(teamMembers.teamId, teamId), eq(teamMembers.role, 'admin')),
    });

    if (adminMembers.length <= 1) {
      return {
        errors: { userId: 'You cannot leave the team as the last admin' },
        success: false,
      };
    }
  }

  // Remove user from team
  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)));

  return {
    success: true,
  };
}
