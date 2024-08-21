import React from 'react';

import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import DarkModeToggle from "@/components/dark-mode-toggle"
import { SocialsDrawer } from '@/components/socials-drawer';
import ViewportDebugLabel from '@/components/ViewportDebugLabel';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <ViewportDebugLabel />
          </div>
          <div>



            <SocialsDrawer>

              <DarkModeToggle />
            </SocialsDrawer>

          </div>
        </div>
      </div>
    </header >
  )
}