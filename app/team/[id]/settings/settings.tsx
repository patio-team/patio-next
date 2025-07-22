'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { getTeam } from '@/db/team';
import GeneralTab from './general-tab';
import MembersTab from './members-tab';

export default function Settings({
  userId,
  team,
}: {
  userId: string;
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
}) {
  return (
    <div className={`relative min-h-screen`}>
      <Link
        href={`/team/${team.id}`}
        className="absolute top-8 right-8">
        <X />
      </Link>
      {/* Main content */}
      <div className="px-6 py-16 sm:px-16">
        <h1 className="font-merriweather text-primary pb-4 text-[32px] leading-[42px] font-normal">
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
            <GeneralTab team={team} />
          </TabsContent>
          <TabsContent value="members">
            <MembersTab
              userId={userId}
              team={team}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
