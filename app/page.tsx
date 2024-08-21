/* eslint-disable react/no-unescaped-entities */
import { Balancer } from "react-wrap-balancer"
import { cn } from "@/lib/utils"
import Link from "next/link"
import React from 'react';
import { SocialsDrawer } from "@/components/socials-drawer";
import DarkModeToggle from "@/components/dark-mode-toggle";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
      <div className="space-y-2">
        <h1 className={cn("scroll-m-20 text-3xl pb-2 md:pb-6 font-bold tracking-tight")}>Welcome to my Store!</h1>
        <Balancer>
          <div className="mb-2">
            I'm a US-based amateur radio operator located on Whidbey Island, WA. With over 30 years of experience in the software
            development industry, my passion for electronics and embedded systems development naturally led me to amateur radio.
            For the past 15 years, my focus has been on technical user education, and I'm excited to merge my interests here
            by sharing my kits and assembly guides with you!
          </div>
          <div className="mb-2">I've just released my first kit, a <Link className="hover:underline" href="/products"><b>20W Dummy Load</b></Link>, with more on the way:
          </div>
          <div className="mb-2"><span className="font-bold">Coming soon:</span>
            <ul className="ml-8 list-disc">
              <li>Dummy load with SMA connector</li>
              <li>Dummy load with automatic OLED power output display, and multiple connector options</li>
              <li>Alternate kit form factors</li>
            </ul>
          </div>
        </Balancer>

        <div className="mb-2">

          If you have questions or ideas for kits that you'd like to see, send me an email at <Link className="hover:underline" href="mailto:de.k7rhy@gmail.com">de.k7rhy@gmail.com</Link>. I'd love to hear from you!
        </div>
        <div className="italic">
          73, K7RHY
        </div>
      </div>


    </main >
  );
}
