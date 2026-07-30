/* eslint-disable react/no-unescaped-entities */
import { Balancer } from 'react-wrap-balancer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';
import { PageHero } from '@/components/shared/page-hero';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col gap-16 px-4 pb-24 pt-8 md:px-12 lg:px-20">
            <PageHero
                badge="K7RHY Resonance Lab"
                title="Resonance across radio and instruments."
                description={<Balancer>Explore ham radio kits and crafted guitars from the same lab bench.</Balancer>}
                actions={
                    <>
                        <Button asChild size="lg" className="min-w-[200px] flex-1">
                            <Link href="/ham-radio">Ham Radio</Link>
                        </Button>
                        <Button asChild size="lg" className="min-w-[200px] flex-1">
                            <Link href="/guitars">Guitars</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="min-w-[200px] flex-1">
                            <Link href="/shop">Shop</Link>
                        </Button>
                    </>
                }
            />

            <section className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">From the lab</h2>
                    <p className="text-base text-slate-600 dark:text-slate-400">
                        <Balancer>I'm K7RHY, an amateur radio tinkerer who splits time between bench-top RF explorations, 3D-printed guitar bodies, and documentation that keeps projects approachable. This space collects the builds, notes, and playable results from ideas I'm working through.</Balancer>
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline">
                            <Link href="/community">Community &amp; Announcements</Link>
                        </Button>
                        <Button asChild variant="ghost">
                            <Link href="https://discord.gg/BuUxCG4W6w">Join the Discord</Link>
                        </Button>
                    </div>
                    <p className="text-sm italic text-slate-600 dark:text-slate-400">Catch you on the airwaves—K7RHY</p>
                </div>

                <div className="w-full rounded-2xl border border-border/60 bg-muted/30 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Snapshot from the Lab</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Notes and projects from the bench whenever a new idea takes hold.</p>
                    <dl className="mt-5 space-y-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                            <dt className="font-medium text-slate-700 dark:text-slate-200">Home base</dt>
                            <dd className="text-right text-slate-600 dark:text-slate-400">Whidbey Island, WA (Grid CN88)</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="font-medium text-slate-700 dark:text-slate-200">Passions</dt>
                            <dd className="text-right text-slate-600 dark:text-slate-400">Resonant electronics · 3D-printed guitars · Approachable documentation</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="font-medium text-slate-700 dark:text-slate-200">Latest release</dt>
                            <dd className="text-right text-slate-600 dark:text-slate-400">20W Dummy Load kit</dd>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <dt className="font-medium text-slate-700 dark:text-slate-200">In the works</dt>
                            <dd className="text-right text-slate-600 dark:text-slate-400">One-of-a-kind 3D printed guitars</dd>
                        </div>
                    </dl>
                </div>
            </section>
        </main>
    );
}
