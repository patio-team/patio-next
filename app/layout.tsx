import type { Metadata } from 'next';
import './globals.css';
import { latoFont } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Patio',
  description: 'Team mood tracking dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${latoFont.className}`}
      suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
