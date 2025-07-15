'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import {
  useTeam,
  useSendInvitations,
  useUpdateTeam,
} from '@/lib/hooks/use-teams';
import { DaySelection } from '@/lib/api-types';
import TeamForm from '@/components/team-form';
import { X } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ManageGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const teamId = use(params).id;

  // State for email input
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch team data
  const {
    data: teamResponse,
    isLoading: teamLoading,
    error: teamError,
  } = useTeam(teamId);
  const sendInvitationsMutation = useSendInvitations();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Check if current user is admin
  const currentUserMembership = teamResponse?.data?.members?.find(
    (member) => member.userId === session?.user?.id,
  );
  const isAdmin = currentUserMembership?.role === 'admin';

  // Extract members and invitations from team data
  const members = teamResponse?.data?.members || [];
  const invitations = teamResponse?.data?.invitations || [];
  const teamData = teamResponse?.data;
  const updateTeamMutation = useUpdateTeam();

  console.log(teamData);

  const handleUpdateTeam = async (data: {
    name: string;
    description?: string;
    pollDays: DaySelection;
  }) => {
    await updateTeamMutation.mutateAsync({
      teamId,
      name: data.name,
      description: data.description,
      pollDays: data.pollDays,
    });
  };

  const handleSendInvites = async () => {
    if (!emailInput.trim() || !isAdmin) return;

    setIsSubmitting(true);

    // Parse emails from input (comma-separated)
    const emails = emailInput
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      await sendInvitationsMutation.mutateAsync({
        teamId,
        emails,
      });

      // Clear input on success
      setEmailInput('');
    } catch (error) {
      console.error('Error sending invitations:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (sessionLoading || teamLoading) {
    return (
      // TODO: Loading component
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (teamError || !teamData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500">Error loading Team</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500">You do not have access to this team</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white relative`}>
      <Link
        href="/"
        className="absolute top-8 right-8">
        <X />
      </Link>
      {/* Main content */}
      <div className="px-6 sm:px-16 py-16">
        <h1 className="font-merriweather text-primary text-[32px] leading-[42px] font-normal pb-4">
          Manage team
        </h1>
        <Tabs
          defaultValue="general"
          className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-16 w-full py-4">
              <div className="flex-1 max-w-2xl">
                <h2 className="font-merriweather text-primary text-2xl leading-[30px] font-normal mb-6">
                  Team Settings
                </h2>
                <TeamForm
                  mode="edit"
                  initialData={teamData}
                  onSubmit={handleUpdateTeam}
                  isLoading={updateTeamMutation.isPending}
                  submitLabel="Update team"
                  loadingLabel="Updating..."
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="members">
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-16 w-full py-4">
              {/* Left section - Group info and members */}
              <div className="flex-1 max-w-md space-y-8">
                {/* Member counts */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-merriweather text-primary text-base leading-[22px]">
                      Members:
                    </span>
                    <span className="text-[#948FB7] text-base leading-[22px] font-medium">
                      {members.length}
                    </span>
                  </div>
                </div>

                {/* Members list */}
                <div className="space-y-6">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={member.user.image || ''}
                          alt={member.user.name || ''}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-16" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h4 className="font-merriweather text-primary text-base leading-[22px]">
                          {member.user.name}
                        </h4>
                        <p className="text-[#948FB7] text-sm leading-[20px] font-medium">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-merriweather text-primary text-base leading-[22px]">
                      Waiting:
                    </span>
                    <span className="text-[#948FB7] text-base leading-[22px] font-medium">
                      {invitations.length}
                    </span>
                  </div>
                </div>

                {/* Waiting members */}
                <div className="space-y-6">
                  {invitations.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          <User className="h-4 w-16" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h4 className="font-merriweather text-primary text-base leading-[22px]">
                          {member.email}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right section - Invite members */}
              <div className="flex-1 max-w-2xl space-y-6">
                <h2 className="font-merriweather text-primary text-2xl leading-[30px] font-normal">
                  Invite new members
                </h2>

                <div className="space-y-3">
                  <label className="block text-primary text-base leading-[22px] font-medium">
                    Enter multiple email addresses separated by comma.
                  </label>
                  <Input
                    placeholder="e.g. username@mail.com, userpetname@mail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={!isAdmin || isSubmitting}
                  />
                  {!isAdmin && (
                    <p className="text-sm text-red-500">
                      Only admins can send invitations
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSendInvites}
                  disabled={!isAdmin || !emailInput.trim() || isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Send invites'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
