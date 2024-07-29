/* eslint-disable react/no-unescaped-entities */
import { Balancer } from "react-wrap-balancer"
import { cn } from "@/lib/utils"
import Link from "next/link"
import React from 'react';


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pl-24 pr-24 pt-12">
<div className="space-y-2">
    <h1 className={cn("scroll-m-20 text-3xl pb-6 font-bold tracking-tight")}>Welcome to my store</h1>
    <Balancer>
      <div className="mb-2">
    I'm a US-based amateur radio operator operating on Whidbey Island, WA. I have been a software development professional for over 30 years. I've always been drawn to electronics and embedded systems, so amateur radio was a natrual fit for me. My recent focus has been on user education, so I'm excited to merge my interests here and share my kits and assembly guides with you.
    </div>
<div className="mb-2">I've just completed my first kit, the 20W Dummy Load, but several more are nearly ready for production.
</div>
<div className="mb-2"><span className="font-bold">Coming soon:</span>
<ul className="ml-8 list-disc">
<li>Dummy load with SMA connector</li>
<li>Dummy load with OLED power output display and multiple connector options</li>
<li>Alternate kit form factors</li>
</ul>
</div><div className="mb-2">
If you have questions or ideas for kits that you'd like to see, send me an email and tell me about it - 
<Link href="mailto:de.k7rhy@gmail.com">
 &nbsp;de.k7rhy@gmail.com.
</Link>
</div></Balancer>
</div>
    </main>
  );
}
