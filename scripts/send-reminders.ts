import { db } from '../db';
import { moodEntries } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { sendReminderEmail } from '../lib/email';

interface TeamMemberData {
  userId: string;
  email: string;
  name: string;
  teamId: string;
  teamName: string;
}

async function getTodaysTeamMembers(): Promise<TeamMemberData[]> {
  const today = DateTime.now();
  const dayOfWeek = today.toFormat('cccc').toLowerCase(); // Gets day name like 'monday', 'tuesday', etc.
  const todayDate = today.toISODate(); // Gets YYYY-MM-DD format

  console.log(`Checking for reminders on ${dayOfWeek} (${todayDate})...`);

  // Get all team members with their user info and team info
  const results = await db.query.teamMembers.findMany({
    with: {
      user: true,
      team: true,
    },
  });

  // Filter teams where today is a poll day
  const membersOnPollDay = results.filter((member) => {
    const pollDays = member.team.pollDays as Record<string, boolean>;
    return pollDays[dayOfWeek] === true;
  });

  // Check who has already voted today and filter them out
  const membersToNotify: TeamMemberData[] = [];

  for (const member of membersOnPollDay) {
    // Check if this user has already submitted a mood entry for today in this team
    const existingEntry = await db
      .select({ userId: moodEntries.userId })
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, member.userId),
          eq(moodEntries.teamId, member.teamId),
          eq(moodEntries.entryDate, new Date(todayDate!)),
        ),
      )
      .limit(1);

    if (existingEntry.length === 0) {
      // User hasn't voted today, add to notification list
      membersToNotify.push({
        userId: member.userId,
        email: member.user.email,
        name: member.user.name,
        teamId: member.team.id,
        teamName: member.team.name,
      } as TeamMemberData);
    } else {
      console.log(`Skipping ${member.user.name} - already voted today`);
    }
  }

  console.log(
    `Found ${membersToNotify.length} members to send reminders to (${membersOnPollDay.length - membersToNotify.length} already voted)`,
  );

  return membersToNotify;
}

async function sendReminders() {
  try {
    console.log('Starting reminder email process...');

    const membersToNotify = await getTodaysTeamMembers();

    if (membersToNotify.length === 0) {
      console.log('No reminders to send today.');
      return;
    }

    const promises = membersToNotify.map(async (member) => {
      try {
        console.log(
          `Sending reminder to ${member.name} (${member.email}) for team ${member.teamName}`,
        );

        await sendReminderEmail({
          email: member.email,
          name: member.name,
          teamId: member.teamId,
          teamName: member.teamName,
        });

        console.log(`✅ Reminder sent to ${member.email}`);
      } catch (error) {
        console.error(`❌ Failed to send reminder to ${member.email}:`, error);
      }
    });

    await Promise.all(promises);

    console.log('✅ Reminder email process completed');
  } catch (error) {
    console.error('❌ Error in sendReminders:', error);
    process.exit(1);
  }
}

setTimeout(() => {
  // Run the script
  sendReminders()
    .then(() => {
      console.log('Script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}, 3000);
