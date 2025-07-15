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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#34314C] text-lg">Loading...</div>
      </div>
    );
  }

  // Show nothing if not authenticated (useEffect will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-white relative`}>
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-16 py-16">
        {/* Title */}
        <h1 className="font-merriweather text-[#34314C] text-[32px] leading-[42px] font-normal mb-8">
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
