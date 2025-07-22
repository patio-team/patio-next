'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import {
  useActionState,
  useState,
  useOptimistic,
  startTransition,
} from 'react';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import type { getTeam } from '@/db/team';
import { changeMemberRole, sendInvites } from '@/app/actions';

export default function MembersTab({
  userId,
  team,
}: {
  userId: string;
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
}) {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');

  // Optimistic state for team data
  const [optimisticTeam, updateOptimisticTeam] = useOptimistic(
    team,
    (
      state,
      action:
        | { type: 'addInvitations'; emails: string[] }
        | { type: 'updateRole'; memberId: string; newRole: 'member' | 'admin' },
    ) => {
      if (action.type === 'addInvitations') {
        return {
          ...state,
          invitations: [
            ...state.invitations,
            ...action.emails.map((email, index) => ({
              id: `temp-${Date.now()}-${index}`,
              email,
              teamId: state.id,
              invitedBy: userId,
              token: `temp-token-${Date.now()}-${index}`,
              expiresAt: new Date(), // Fake date for optimistic update
              acceptedAt: null,
              rejectedAt: null,
              createdAt: new Date(),
            })),
          ],
        };
      } else if (action.type === 'updateRole') {
        return {
          ...state,
          members: state.members.map((member) =>
            member.userId === action.memberId
              ? { ...member, role: action.newRole }
              : member,
          ),
        };
      }
      return state;
    },
  );

  const handleSendInvites = async () => {
    const emails = emailInput
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) return;

    // Optimistically add invitations
    updateOptimisticTeam({ type: 'addInvitations', emails });
    setEmailInput('');

    const result = await sendInvites(userId, team.id, emails);

    if (result.success) {
      toast.success('Invites sent successfully');
      router.refresh();
    } else {
      toast.error(
        `Failed to send invites: ${result.errors?.emails || 'Unknown error'}`,
      );
      console.error('Error sending invites:', result.errors);
      // Revert optimistic update on error
      router.refresh();
    }
  };

  const [, formActions, pendingInvite] = useActionState(
    handleSendInvites,
    undefined,
  );

  // Count admins in the team
  const adminCount = optimisticTeam?.members.filter(
    (member) => member.role === 'admin',
  ).length;

  // Handle role change
  const handleRoleChange = async (
    memberId: string,
    newRole: 'member' | 'admin',
  ) => {
    const memberToUpdate = optimisticTeam.members.find(
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

    // Optimistically update the role
    updateOptimisticTeam({ type: 'updateRole', memberId, newRole });

    const result = await changeMemberRole(team.id, memberId, newRole);

    if (result.success) {
      toast.success('Member role updated successfully');
      router.refresh();
    } else {
      toast.error(
        `Failed to update member role: ${result.errors?.userId || 'Unknown error'}`,
      );
      console.error('Error updating member role:', result.errors);
      // Revert optimistic update on error
      router.refresh();
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
              {optimisticTeam.members.length}
            </span>
          </div>
        </div>
        {/* Members list */}
        <div className="space-y-6">
          {optimisticTeam.members.map((member) => (
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
                        startTransition(() =>
                          handleRoleChange(
                            member.userId,
                            e.target.value as 'member' | 'admin',
                          ),
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
              {optimisticTeam.invitations.length}
            </span>
          </div>
        </div>

        {/* Waiting members */}
        <div className="space-y-6">
          {optimisticTeam.invitations.map((member) => (
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
              disabled={pendingInvite}
            />
          </div>

          <Button
            type="submit"
            disabled={!emailInput.trim() || pendingInvite}>
            {pendingInvite ? 'Sending...' : 'Send invites'}
          </Button>
        </div>
      </form>
    </div>
  );
}
