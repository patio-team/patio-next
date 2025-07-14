"use client";

import { useSession as useBetterAuthSession } from "@/lib/auth-client";

export function useAuth() {
  const { data: session, error, isPending } = useBetterAuthSession();

  return {
    user: session?.user || null,
    session: session?.session || null,
    isLoading: isPending,
    error,
    isAuthenticated: !!session?.user,
  };
}
