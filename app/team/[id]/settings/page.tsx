'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSession } from '@/lib/auth-client';
import router from 'next/router';
import { use, useEffect } from 'react';

export default function ManageGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, isPending: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  const id = use(params).id;

  const members = [];
  const invitations = [];

  // const [emailInput, setEmailInput] = useState('');

  return (
    <div className={`min-h-screen bg-white relative`}>
      {/* Main content */}
      <div className="flex flex-col xl:flex-row gap-8 xl:gap-16 px-6 sm:px-16 py-16">
        {/* Left section - Group info and members */}
        <div className="flex-1 max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="font-merriweather text-primary text-[32px] leading-[42px] font-normal">
              Manage group
            </h1>
            <p className="text-[#948FB7] text-base leading-[22px] font-medium">
              Tracks on weekdays from 14:00 pm to 12:00 am
            </p>
          </div>

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
            <Input placeholder="e.g. username@mail.com, userpetname@mail.com" />
          </div>

          <Button>Send invites</Button>
        </div>
      </div>
    </div>
  );
}
