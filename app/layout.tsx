/* eslint-disable react/no-unknown-property */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";


import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"


const inter = Inter({ subsets: ["latin"],variable: "--font-sans" });
import React from 'react';


export const metadata: Metadata = {
  title: "K7RHY",
  description: "Ham radio electronics kits and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head/>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div vaul-drawer-wrapper="">
              <div className="relative flex min-h-screen flex-col bg-background">
                <SiteHeader />
                  {children}
                <SiteFooter />
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
