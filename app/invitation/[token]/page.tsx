import { db } from '@/db';
import { teamInvitations } from '@/db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import InvitationPage from './components';

interface InvitationPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitationTokenPage({
  params,
}: InvitationPageProps) {
  const { token } = await params;

  // Find invitation
  const invitation = await db.query.teamInvitations.findFirst({
    where: and(
      eq(teamInvitations.token, token),
      gt(teamInvitations.expiresAt, new Date()),
      isNull(teamInvitations.acceptedAt),
      isNull(teamInvitations.rejectedAt),
    ),
    with: {
      team: true,
      inviter: true,
    },
  });

  if (!invitation) {
    notFound();
  }

  // Check if user is already logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    // If logged in, redirect to the API route to process the invitation
    redirect(`/api/invitations/accept?token=${token}`);
  }

  return (
    <InvitationPage
      invitation={{
        teamName: invitation.team.name,
        inviterName: invitation.inviter.name || invitation.inviter.email,
        email: invitation.email,
        token: token,
      }}
    />
  );
}
