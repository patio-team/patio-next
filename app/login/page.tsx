import Image from 'next/image';
import Logo from '@/components/ui/logo';
import GoogleSignInButton from '@/components/ui/google-sign-in-button';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ invitation?: string; returnTo?: string }>;
}) {
  const params = await searchParams;
  const invitationToken = params.invitation;
  const returnTo = params.returnTo;

  // Determine callback URL based on invitation context
  let callbackURL = '/';
  if (returnTo) {
    callbackURL = returnTo;
  } else if (invitationToken) {
    callbackURL = `/api/invitations/accept?token=${invitationToken}`;
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-center gap-8 py-8 lg:flex-row">
      {/* Left section - Branding (hidden on mobile, shows on tablet/desktop) */}
      <div className="flex w-[430px] flex-col justify-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="medium" />
        </div>

        {/* Tagline */}
        <p className="font-merriweather text-primary mb-8 text-center text-xl leading-relaxed xl:text-2xl">
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

      {/* Right section - Login Form */}
      <div className="flex flex-col justify-center">
        <div className="w-full max-w-md">
          {/* Invitation Context */}
          {invitationToken && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-700">
                🎉 You&apos;ve been invited to join a team!
              </p>
              <p className="mt-1 text-xs text-blue-600">
                Sign in to accept your invitation
              </p>
            </div>
          )}

          {/* Form Title */}
          <h1 className="font-merriweather text-primary mb-8 text-center text-2xl lg:mb-12 lg:text-[32px] lg:leading-[42px]">
            {invitationToken ? 'Sign in to join the team' : 'Sign in to patio'}
          </h1>

          {/* Google Sign In Button */}
          <GoogleSignInButton
            callbackURL={callbackURL}
            buttonText="Sign up with Google"
            loadingText="Signing in..."
          />
        </div>
      </div>
    </div>
  );
}
