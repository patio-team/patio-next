import { redirect } from 'next/navigation';
import TeamForm from '@/components/team-form';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function NewTeamPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div className={`min-h-scree relative`}>
      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-16">
        {/* Title */}
        <h1 className="font-merriweather mb-8 text-[32px] leading-[42px] font-normal text-[#34314C]">
          New team
        </h1>

        <TeamForm
          mode="create"
          cancelLabel="Cancel"
        />
      </div>
    </div>
  );
}
