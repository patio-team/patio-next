import { Merriweather, Lato } from 'next/font/google';

export const merriweatherFont = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather-next',
  display: 'swap',
});

export const latoFont = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato-next',
  display: 'swap',
});
