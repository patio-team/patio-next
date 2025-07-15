'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTeam } from '@/lib/hooks/use-teams';
import { useSession } from '@/lib/auth-client';
import { DaySelection } from '@/lib/api-types';
import TeamForm from '@/components/team-form';

export default function NewTeamPage() {
  const router = useRouter();
  const createTeamMutation = useCreateTeam();
  const { data: session, isPending: sessionLoading } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    pollDays: DaySelection;
  }) => {
    const response = await createTeamMutation.mutateAsync({
      name: data.name,
      description: data.description || undefined,
      pollDays: data.pollDays,
    });

    const team = response.data;
    router.push(`/team/${team.id}`);
  };

  // Show loading screen while checking session
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-lg text-[#34314C]">Loading...</div>
      </div>
    );
  }

  // Show nothing if not authenticated (useEffect will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className={`relative min-h-screen bg-white`}>
      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-16">
        {/* Title */}
        <h1 className="font-merriweather mb-8 text-[32px] leading-[42px] font-normal text-[#34314C]">
          New team
        </h1>

        <TeamForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={createTeamMutation.isPending}
          onCancel={() => router.push('/')}
          cancelLabel="Cancel"
        />
      </div>
    </div>
  );
}
