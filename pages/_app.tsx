/* eslint-disable react/no-unknown-property */
import React from 'react';
import { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import Head from 'next/head';
import '../app/globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import components from '@/components/mdx-components';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster component

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>K7RHY</title>
                <meta
                    name="description"
                    content="Resonant electronics — radio kits and crafted instruments from K7RHY."
                />
                <link
                    rel="apple-touch-icon"
                    sizes="180x180"
                    href="/apple-touch-icon.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                    href="/favicon-32x32.png"
                />
                <link
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                    href="/favicon-16x16.png"
                />
                <link
                    rel="manifest"
                    href="/site.webmanifest"
                />
                <link
                    rel="mask-icon"
                    href="/safari-pinned-tab.svg"
                    color="#5bbad5"
                />
                <meta
                    name="msapplication-TileColor"
                    content="#da532c"
                />
                <meta
                    name="theme-color"
                    content="#ffffff"
                />
            </Head>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <div vaul-drawer-wrapper="">
                    <div
                        className={`relative flex min-h-screen flex-col bg-background ${inter.className}`}
                    >
                        <SiteHeader />

                        <Component {...pageProps} />

                        <SiteFooter />
                    </div>
                    <Toaster />
                </div>
            </ThemeProvider>
        </>
    );
}
