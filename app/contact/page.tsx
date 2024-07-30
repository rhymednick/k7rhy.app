/* eslint-disable react/no-unescaped-entities */
import { cn } from "@/lib/utils"
import Link from "next/link"
import React from 'react';


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between pl-24 pr-24 pt-12">
      <div className="space-y-2">
        <h1 className={cn("scroll-m-20 text-3xl pb-2 font-bold tracking-tight")}>Contact Links</h1>


        <ul className="ml-6 mt-4">
          <li>
            <b>Twitter:</b> <Link href="https://twitter.com/de_k7rhy" className="ml-2">@de_k7rhy</Link>
          </li>
          {/* <li>
            <b>Facebook:</b> <Link href="https://www.facebook.com/k7rhy" className="ml-2">@k7rhy</Link>
          </li> */}
          <li>
            <b>Email:</b> <Link href="mailto:de.k7rhy@gmail.com" className="ml-2">de.k7rhy@gmail.com</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
