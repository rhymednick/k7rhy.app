/* eslint-disable react/no-unescaped-entities */
import { Balancer } from 'react-wrap-balancer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col gap-16 px-4 pb-24 pt-8 md:px-12 lg:px-20">
            <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-white/80 px-6 py-12 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-950/70 dark:ring-white/10 md:px-12">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-100 via-white to-emerald-100 opacity-90 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-900" />
                <div className="absolute -right-24 top-10 -z-10 h-64 w-64 rounded-full bg-sky-400/30 blur-3xl dark:bg-sky-500/10" />
                <div className="absolute -left-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
                <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
                    <div className="flex-1 space-y-6">
                        <Badge className="w-fit border border-slate-300/70 bg-white/80 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
                            Resonance Lab Dispatch
                        </Badge>
                        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
                            Bridging radio science and instrument craft.
                        </h1>
                        <p className="text-lg text-slate-700 dark:text-slate-300">
                            <Balancer>
                                K7RHY Resonance Lab explores resonance across radio, audio,
                                and tactile builds—shaping gear that invites you to hear and
                                feel signal paths differently, whether you're chasing clean
                                transmitters or dialing in guitar tone.
                            </Balancer>
                        </p>
                        <p className="text-base text-slate-600 dark:text-slate-400">
                            <Balancer>
                                I'm K7RHY, an amateur radio tinkerer who splits time between
                                bench-top RF explorations, 3D-printed guitar bodies, and
                                documentation that keeps projects approachable. This space is
                                where I collect the builds, notes, and playable results from
                                ideas I'm working through.
                            </Balancer>
                        </p>
                        <div className="flex w-full flex-wrap gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="min-w-[200px] flex-1"
                            >
                                <Link href="https://discord.gg/BuUxCG4W6w">
                                    Join the K7RHY Discord
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="min-w-[200px] flex-1"
                            >
                                <Link href="/products">Browse Resonant Gear</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="ghost"
                                className="min-w-[200px] flex-1"
                            >
                                <Link href="/blog">Read the Lab Notes</Link>
                            </Button>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Have an idea you'd like to see me explore? Drop it in the Discord
                            and let's prototype it together.
                        </div>
                        <div className="text-sm italic text-slate-600 dark:text-slate-400">
                            Stay resonant, K7RHY
                        </div>
                    </div>
                    <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Snapshot from the Lab
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Notes and projects from the bench whenever a new idea takes hold.
                        </p>
                        <dl className="mt-5 space-y-3 text-sm">
                            <div className="flex items-start justify-between gap-4">
                                <dt className="font-medium text-slate-700 dark:text-slate-200">
                                    Home base
                                </dt>
                                <dd className="text-right text-slate-600 dark:text-slate-400">
                                    Whidbey Island, WA (Grid CN88)
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="font-medium text-slate-700 dark:text-slate-200">
                                    Passions
                                </dt>
                                <dd className="text-right text-slate-600 dark:text-slate-400">
                                    Resonant electronics · 3D-printed guitars · Approachable documentation
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="font-medium text-slate-700 dark:text-slate-200">
                                    Latest release
                                </dt>
                                <dd className="text-right text-slate-600 dark:text-slate-400">
                                    20W Dummy Load kit
                                </dd>
                            </div>
                            <div className="flex items-start justify-between gap-4">
                                <dt className="font-medium text-slate-700 dark:text-slate-200">
                                    In the works
                                </dt>
                                <dd className="text-right text-slate-600 dark:text-slate-400">
                                    One-of-a-kind 3D printed guitars
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>
        </main>
    );
}
