import Link from 'next/link';
import Logo from '@/components/ui/logo';

export default function InvitationNotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center py-8">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="medium" />
        </div>

        {/* Error Icon */}
        <div className="mb-6 text-6xl">❌</div>

        {/* Error Message */}
        <h1 className="font-merriweather mb-4 text-2xl text-[#34314C]">
          Invitation Not Found
        </h1>

        <p className="mb-6 text-gray-600">
          This invitation link is invalid, expired, or has already been used.
        </p>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact the person who sent
            you the invitation.
          </p>

          <Link
            href="/login"
            className="inline-block rounded bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
