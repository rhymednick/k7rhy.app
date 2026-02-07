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
                badge="Resonance Lab Dispatch"
                title="Bridging radio science and instrument craft."
                description={<Balancer>K7RHY Resonance Lab explores resonance across radio, audio, and tactile builds—shaping gear that invites you to hear and feel signal paths differently, whether you're chasing clean transmitters or dialing in guitar tone.</Balancer>}
                secondaryText={<Balancer>I'm K7RHY, an amateur radio tinkerer who splits time between bench-top RF explorations, 3D-printed guitar bodies, and documentation that keeps projects approachable. This space is where I collect the builds, notes, and playable results from ideas I'm working through.</Balancer>}
                actions={
                    <>
                        <Button asChild size="lg" className="min-w-[200px] flex-1">
                            <Link href="https://discord.gg/BuUxCG4W6w">Join the K7RHY Discord</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="min-w-[200px] flex-1">
                            <Link href="/products">Browse Resonant Gear</Link>
                        </Button>
                        <Button asChild size="lg" variant="ghost" className="min-w-[200px] flex-1">
                            <Link href="/blog">Read the Lab Notes</Link>
                        </Button>
                    </>
                }
                footer={
                    <>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Have an idea you'd like to see me explore? Drop it in the Discord and let's prototype it together.</div>
                        <div className="text-sm italic text-slate-600 dark:text-slate-400">Catch you on the airwaves—K7RHY</div>
                    </>
                }
            >
                <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
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
            </PageHero>
        </main>
    );
}
