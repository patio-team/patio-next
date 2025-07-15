'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { unstable_ViewTransition as ViewTransition } from 'react';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ViewTransition>{children}</ViewTransition>
    </QueryClientProvider>
  );
}
