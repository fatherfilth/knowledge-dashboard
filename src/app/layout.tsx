import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Ryder.AI',
  description: 'Curated AI documentation and resources for focused learning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white font-sans text-gray-900 antialiased">
        <header className="border-b border-gray-200">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-lg font-semibold text-gray-900">
              Ryder.AI
            </Link>
            <Suspense fallback={<div className="h-10 w-full max-w-md" />}>
              <SearchBar />
            </Suspense>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
