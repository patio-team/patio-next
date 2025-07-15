import type { Metadata } from 'next';
import './globals.css';
import { latoFont, merriweatherFont } from '@/lib/fonts';
import { Providers } from '@/components/providers';

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
      </body>
    </html>
  );
}
