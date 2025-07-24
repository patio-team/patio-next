import Link from 'next/link';
import Logo from '@/components/ui/logo';

export default async function InvitationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ teamName: string; teamId: string }>;
}) {
  const params = await searchParams;
  const teamName = params.teamName;
  const teamId = params.teamId;

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-8">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="medium" />
        </div>

        {/* Success Icon */}
        <div className="mb-6 text-6xl">🎉</div>

        {/* Success Message */}
        <h1 className="font-merriweather mb-4 text-2xl text-[#34314C]">
          Welcome to {teamName}!
        </h1>

        <p className="mb-6 text-gray-600">
          You have successfully joined the team. You can now start sharing your
          daily mood and connect with your teammates.
        </p>

        <div className="space-y-3">
          <Link
            href={`/team/${teamId}`}
            className="inline-block rounded bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
            Go to Team Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
