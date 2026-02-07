/* eslint-disable react/no-unknown-property */
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster
import InlineCommentHandler from '@/components/features/inline-comment-handler'; // Import InlineCommentHandler

import { SiteFooter } from '@/components/navigation/site-footer';
import { SiteHeader } from '@/components/navigation/site-header';
import { fontSans } from '@/lib/fonts';
import React from 'react';

export const metadata: Metadata = {
    title: 'K7RHY',
    description: 'Resonant electronics — radio kits and crafted instruments from K7RHY.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="manifest" href="/site.webmanifest" />
                    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
                    <meta name="msapplication-TileColor" content="#da532c" />
                    <meta name="theme-color" content="#ffffff" />
                </head>
                <body className={fontSans.className}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <div>
                            <div className="relative flex min-h-screen flex-col bg-background">
                                <SiteHeader />
                                <InlineCommentHandler /> {/* Keep InlineCommentHandler here for site-wide functionality */}
                                {children}
                                <SiteFooter />
                            </div>
                        </div>
                        <Toaster /> {/* Include the Toaster component here */}
                    </ThemeProvider>
                </body>
            </html>
        </>
    );
}
