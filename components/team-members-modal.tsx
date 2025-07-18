'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { DateTime } from 'luxon';
import { TeamMemberWithLastVote } from '@/lib/api-types';
import { LoadingSpinner } from './ui/loading';
import { Mood, Smile } from './smile';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface TeamMembersModalProps {
  teamId: string;
  children: React.ReactNode;
  date: string;
}

interface LocalTeamMember
  extends Omit<TeamMemberWithLastVote, 'joinedAt' | 'lastVote'> {
  joinedAt: Date;
  lastVote: {
    date: Date;
    rating: number;
    comment?: string;
  } | null;
}

export function TeamMembersModal({
  date,
  teamId,
  children,
}: TeamMembersModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: membersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => apiClient.getTeamMembersWithVotes(teamId),
    enabled: isOpen, // Only fetch when modal is open
  });

  const members: LocalTeamMember[] =
    membersResponse?.data.map((member) => ({
      ...member,
      joinedAt: new Date(member.joinedAt),
      lastVote: member.lastVote
        ? {
            ...member.lastVote,
            date: new Date(member.lastVote.date),
          }
        : null,
    })) || [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-merriweather text-primary text-xl">
            Team Members
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-red-500">Failed to load team members</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 transition-shadow hover:shadow-md">
                  <div className="flex items-center space-x-4">
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
                      <h3 className="font-medium text-gray-900">
                        {member.user.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {member.user.email}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {member.role} • Joined{' '}
                        {DateTime.fromJSDate(member.joinedAt).toFormat(
                          'MMM dd, yyyy',
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Last Vote Info */}
                  <div className="flex items-center space-x-4">
                    {member.lastVote ? (
                      <div className="flex flex-col items-center">
                        <Smile
                          mood={`mood${member.lastVote.rating}` as Mood}
                          size="small"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                          Last vote:{' '}
                          {DateTime.fromJSDate(member.lastVote.date).toFormat(
                            'MMM dd, yyyy',
                          )}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-400">No votes yet</p>
                      </div>
                    )}

                    {/* View Profile Button */}
                    <Link
                      href={`/team/${teamId}/member/${member.userId}?date=${date}`}
                      className="rounded-md px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      onClick={() => setIsOpen(false)}>
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
