import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const viewport: Viewport = {
  colorScheme: 'light',
};

export const metadata: Metadata = {
  title: {
    default: 'The Common Room',
    template: '%s — The Common Room',
  },
  description:
    'A space for reflection, clarity, and purpose. A companion app to The Common Room in-person workshops.',
  metadataBase: new URL('https://thecommonroom.app'),
  openGraph: {
    type: 'website',
    siteName: 'The Common Room',
    title: 'The Common Room',
    description: 'A space for reflection, clarity, and purpose.',
    images: [{ url: '/og-image.png', width: 1512, height: 756, alt: 'The Common Room' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Common Room',
    description: 'A space for reflection, clarity, and purpose.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  robots: {
    index: false, // private app — not for public search indexing
    follow: false,
  },
  other: {
    'darkreader-lock': '', // tells Dark Reader not to modify this page
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
