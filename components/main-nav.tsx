"use client"
import React from 'react';

import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "../config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-2 md:mr-4 hidden md:flex">
      <Link href="/" className="mr-2 md:mr-4 flex items-center space-x-2 lg:mr-6">
        <Icons.logo className="h-9 w-9" />
        <span className="hidden text-lg font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/products"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/products" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Products
        </Link>
        <Link
          href="/docs"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/docs" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Docs
        </Link>
        {/* <Link
          href="/contact"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/contact" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Contact
        </Link> */}
      </nav>
    </div>
  )
}