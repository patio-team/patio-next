'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, unstable_ViewTransition as ViewTransition } from 'react';
import { BgDecoration } from './ui/bg-decoration';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ViewTransition>
        <div className="relative z-10 min-h-screen">{children}</div>
      </ViewTransition>
      <BgDecoration />
    </QueryClientProvider>
  );
}
