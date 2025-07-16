import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { teamMembers, moodEntries } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Mood, Smile } from '@/components/smile';

interface PageProps {
  params: Promise<{
    id: string;
    memberId: string;
  }>;
}

export default async function MemberProfilePage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const { id: teamId, memberId } = await params;

  // Check if current user is member of the team
  const currentUserMembership = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, session.user.id),
      eq(teamMembers.teamId, teamId),
    ),
    with: {
      team: true,
    },
  });

  if (!currentUserMembership) {
    notFound();
  }

  // Get the member we want to view
  const member = await db.query.teamMembers.findFirst({
    where: and(
      eq(teamMembers.userId, memberId),
      eq(teamMembers.teamId, teamId),
    ),
    with: {
      user: true,
    },
  });

  if (!member) {
    notFound();
  }

  // Get all mood entries for this member in this team
  const memberMoodEntries = await db.query.moodEntries.findMany({
    where: and(
      eq(moodEntries.userId, memberId),
      eq(moodEntries.teamId, teamId),
      // Only show public entries unless it's the user's own profile or current user is admin
      currentUserMembership.role === 'admin' || session.user.id === memberId
        ? undefined
        : eq(moodEntries.visibility, 'public'),
    ),
    orderBy: desc(moodEntries.entryDate),
    limit: 50, // Show last 50 entries
  });

  const formatDateForDisplay = (date: Date) => {
    return DateTime.fromJSDate(date).toFormat('EEEE, MMMM dd, yyyy');
  };

  const formatRelativeDate = (date: Date) => {
    return DateTime.fromJSDate(date).toRelative();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FF] to-[#E8F2FF]">
      <div className="px-4 py-8 md:px-16">
        {/* Back Button */}
        <Link
          href={`/team/${teamId}`}
          className="mb-6 inline-flex items-center text-sm text-[#3FA2F7] hover:text-[#2563eb]">
          <svg
            className="mr-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to {currentUserMembership.team.name}
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-xl bg-white p-8 shadow-sm">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={member.user?.image || ''}
                  alt={member.user?.name || ''}
                />
                <AvatarFallback>
                  <User className="h-4 w-16" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Member Info */}
            <div className="flex-1">
              <h1 className="font-merriweather text-primary text-2xl font-normal md:text-3xl">
                {member.user.name}
              </h1>
              <p className="mt-1 text-[#948FB7]">{member.user.email}</p>
              <div className="mt-3 flex items-center space-x-4">
                <span className="text-sm text-[#948FB7] capitalize">
                  {member.role} • Joined{' '}
                  {DateTime.fromJSDate(member.joinedAt).toFormat('MMMM yyyy')}
                </span>
                {memberMoodEntries.length > 0 && (
                  <span className="text-sm text-[#948FB7]">
                    {memberMoodEntries.length} mood entr
                    {memberMoodEntries.length === 1 ? 'y' : 'ies'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mood Entries */}
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <h2 className="font-merriweather text-primary mb-6 text-xl font-normal">
            Mood History
          </h2>

          {memberMoodEntries.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 text-4xl">📊</div>
              <p className="text-[#948FB7]">
                {session.user.id === memberId
                  ? "You haven't submitted any mood entries yet."
                  : `${member.user.name} hasn't submitted any mood entries yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {memberMoodEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start space-x-4 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                  {/* Mood Circle and Emoji */}
                  <div className="flex flex-shrink-0 flex-col items-center space-y-2">
                    <Smile
                      mood={`mood${entry.rating}` as Mood}
                      size="small"
                    />
                  </div>

                  {/* Entry Details */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {formatDateForDisplay(entry.entryDate)}
                      </h3>
                      <span className="text-sm text-[#948FB7]">
                        {formatRelativeDate(entry.entryDate)}
                      </span>
                    </div>

                    {entry.comment && (
                      <p className="mt-2 text-sm text-gray-700">
                        {entry.comment}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-[#948FB7] capitalize">
                        {entry.visibility} entry
                      </span>
                      <span className="text-xs text-[#948FB7]">
                        Rating: {entry.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
