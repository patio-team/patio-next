import type { Metadata } from 'next';
import './globals.css';
import { latoFont, merriweatherFont } from '@/lib/fonts';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Patio',
  description: 'Team mood tracking dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${latoFont.className} ${latoFont.variable} ${merriweatherFont.variable}`}
      suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors />
        <SpeedInsights />
      </body>
    </html>
  );
}
