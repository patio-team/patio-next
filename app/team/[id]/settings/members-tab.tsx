'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useActionState, useState } from 'react';
import { useUpdateMemberRole } from '@/lib/hooks/use-teams';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import type { getTeam } from '@/db/team';
import { sendInvites } from '@/app/actions';

export default function MembersTab({
  userId,
  team,
}: {
  userId: string;
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
}) {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');

  const handleSendInvites = async () => {
    console.log('Sending invites for:', emailInput);
    const emails = emailInput
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) return;

    const result = await sendInvites(userId, team.id, emails);

    if (result.success) {
      toast.success('Invites sent successfully');
      setEmailInput('');
    } else {
      toast.error(
        `Failed to send invites: ${result.errors?.emails || 'Unknown error'}`,
      );
      console.error('Error sending invites:', result.errors);
    }

    router.refresh();
  };

  const [, formActions, pending] = useActionState(handleSendInvites, undefined);

  const updateMemberRoleMutation = useUpdateMemberRole();

  // Count admins in the team
  const adminCount = team?.members.filter(
    (member) => member.role === 'admin',
  ).length;

  // Handle role change
  const handleRoleChange = async (
    memberId: string,
    newRole: 'member' | 'admin',
  ) => {
    const memberToUpdate = team.members.find(
      (member) => member.userId === memberId,
    );
    if (!memberToUpdate) return;

    // If trying to demote the current user from admin and they're the only admin, prevent it
    if (
      memberId === userId &&
      memberToUpdate.role === 'admin' &&
      newRole === 'member' &&
      adminCount <= 1
    ) {
      toast.error(
        'You cannot demote yourself from admin if you are the only admin in the team.',
      );
      return;
    }

    try {
      await updateMemberRoleMutation.mutateAsync({
        teamId: team.id,
        memberId,
        role: newRole,
      });

      // If current user demoted themselves, redirect to team page
      if (memberId === userId && newRole === 'member') {
        router.push(`/team/${team.id}`);
      }
    } catch (error) {
      toast.error(
        `Failed to change role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      console.error('Error updating member role:', error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 py-4 xl:flex-row xl:gap-16">
      {/* Left section - Group info and members */}
      <div className="max-w-md flex-1 space-y-8">
        {/* Member counts */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-merriweather text-primary text-base leading-[22px]">
              Members:
            </span>
            <span className="text-base leading-[22px] font-medium text-[#948FB7]">
              {team.members.length}
            </span>
          </div>
        </div>
        {/* Members list */}
        <div className="space-y-6">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={member.user.image || ''}
                  alt={member.user.name || ''}
                />
                <AvatarFallback>
                  <User className="h-4 w-16" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-merriweather text-primary text-base leading-[22px]">
                      {member.user.name}
                    </h4>
                    <p className="text-sm leading-[20px] font-medium text-[#948FB7]">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(
                          member.userId,
                          e.target.value as 'member' | 'admin',
                        )
                      }
                      label="Role">
                      {['admin', 'member'].map((role) => (
                        <option
                          key={role}
                          value={role}>
                          {role === 'admin' ? 'Admin' : 'Member'}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-merriweather text-primary text-base leading-[22px]">
              Waiting:
            </span>
            <span className="text-base leading-[22px] font-medium text-[#948FB7]">
              {team.invitations.length}
            </span>
          </div>
        </div>

        {/* Waiting members */}
        <div className="space-y-6">
          {team.invitations.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
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
      <form action={formActions}>
        <div className="max-w-2xl flex-1 space-y-6">
          <h2 className="font-merriweather text-primary text-2xl leading-[30px] font-normal">
            Invite new members
          </h2>
          <div className="space-y-3">
            <label className="text-primary block text-base leading-[22px] font-medium">
              Enter multiple email addresses separated by comma.
            </label>
            <Input
              placeholder="e.g. username@mail.com, userpetname@mail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={pending}
            />
          </div>

          <Button
            type="submit"
            disabled={!emailInput.trim() || pending}>
            {pending ? 'Sending...' : 'Send invites'}
          </Button>
        </div>
      </form>
    </div>
  );
}
