'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export function AuthNav() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/login');
          },
        },
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">Welcome, {user.name}</span>
      {user.image && (
        <img
          src={user.image}
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
      )}
      <button
        onClick={handleSignOut}
        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
        Sign Out
      </button>
    </div>
  );
}
