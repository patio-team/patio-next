import Image from 'next/image';
import Logo from '@/components/ui/logo';
import GoogleSignInButton from '@/components/ui/google-sign-in-button';

interface InvitationPageProps {
  invitation: {
    teamName: string;
    inviterName: string;
    email: string;
    token: string;
  };
}

export default function InvitationPage({ invitation }: InvitationPageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col justify-center gap-8 py-8 lg:flex-row">
      {/* Left section - Branding */}
      <div className="flex w-[430px] flex-col justify-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="medium" />
        </div>

        {/* Tagline */}
        <p className="font-merriweather mb-8 text-center text-xl leading-relaxed text-[#34314C] xl:text-2xl">
          The bottom-up temperature check tool made by teams for teams
        </p>

        {/* Illustration */}
        <div className="flex justify-center">
          <Image
            src="/login-deco.png"
            alt="Team collaboration illustration"
            className="h-auto w-full max-w-[350px] rounded-[20px] xl:max-w-[430px]"
            width={430}
            height={300}
          />
        </div>
      </div>

      {/* Right section - Invitation Details */}
      <div className="flex flex-col justify-center">
        <div className="w-full max-w-md">
          {/* Invitation Details */}
          <div className="mb-8 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center">
            <div className="mb-4 text-4xl">🎉</div>
            <h2 className="font-merriweather mb-3 text-xl text-[#34314C]">
              You&apos;re invited!
            </h2>
            <p className="mb-2 text-gray-700">
              <strong>{invitation.inviterName}</strong> has invited you to join
            </p>
            <p className="mb-4 text-lg font-semibold text-indigo-700">
              {invitation.teamName}
            </p>
            <p className="text-sm text-gray-600">
              This invitation is for: <strong>{invitation.email}</strong>
            </p>
          </div>

          {/* Form Title */}
          <h1 className="font-merriweather mb-8 text-center text-2xl text-[#34314C] lg:mb-12 lg:text-[32px] lg:leading-[42px]">
            Sign in to join the team
          </h1>

          {/* Google Sign In Button */}
          <GoogleSignInButton
            callbackURL={`/api/invitations/accept?token=${invitation.token}`}
            buttonText="Accept invitation with Google"
            loadingText="Signing in..."
          />

          {/* Warning note */}
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Please sign in with the same Google account
              associated with <strong>{invitation.email}</strong> to accept this
              invitation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
