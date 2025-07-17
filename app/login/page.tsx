'use client';

import { useState } from 'react';
import { signIn } from '@/lib/auth-client';
import Image from 'next/image';
import Logo from '@/components/ui/logo';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      await signIn.social({
        provider: 'google',
        callbackURL: '/',
      });

      // The redirect will happen automatically
    } catch (error) {
      console.error('Error signing in:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-center gap-8 py-8 lg:flex-row">
      {/* Left section - Branding (hidden on mobile, shows on tablet/desktop) */}
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

      {/* Right section - Login Form */}
      <div className="flex flex-col justify-center">
        <div className="w-full max-w-md">
          {/* Form Title */}
          <h1 className="font-merriweather mb-8 text-center text-2xl text-[#34314C] lg:mb-12 lg:text-[32px] lg:leading-[42px]">
            Sign in to patio
          </h1>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="relative mx-auto mb-6 flex h-[39px] w-full max-w-[322px] items-center justify-center rounded border border-[#C4C4C4] bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <svg
              className="absolute left-4 h-[18px] w-[18px]"
              viewBox="0 0 18 18"
              fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.64 9.20419C17.64 8.56601 17.5827 7.95237 17.4764 7.36328H9V10.8446H13.8436C13.635 11.9696 13.0009 12.9228 12.0477 13.561V15.8192H14.9564C16.6582 14.2524 17.64 11.9451 17.64 9.20419Z"
                fill="#4285F4"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z"
                fill="#34A853"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40664 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z"
                fill="#FBBC05"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-roboto text-[15px] text-[#333]">
              {isLoading ? 'Signing in...' : 'Sign up with Google'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
