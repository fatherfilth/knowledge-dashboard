import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/search/SearchBar';
import './globals.css';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,700,800&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy font-sans text-primary antialiased">
        <a href="#main-content" className="skip-nav">Skip to content</a>
        <div className="bg-mesh" aria-hidden="true" />

        <header className="sticky top-0 z-50 px-4 py-3 md:px-6">
          <nav
            className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/[0.08] bg-navy/85 px-6 py-3 backdrop-blur-xl"
            aria-label="Main navigation"
          >
            <Link href="/" className="flex items-center gap-3">
              {/* Brand mark: gradient square */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal to-purple">
                <svg className="h-4 w-4 text-navy" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display text-lg font-extrabold tracking-tight text-primary">
                Ryder.AI
              </span>
            </Link>

            {/* Nav links — hidden on mobile */}
            <div className="hidden items-center gap-1 md:flex">
              <Link href="/" className="rounded-pill px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-primary">
                Home
              </Link>
              <Link href="/search" className="rounded-pill px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-white/[0.05] hover:text-primary">
                Search
              </Link>
            </div>

            {/* Search bar */}
            <Suspense fallback={<div className="h-10 w-full max-w-xs" />}>
              <SearchBar />
            </Suspense>
          </nav>
        </header>

        <main id="main-content" className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
