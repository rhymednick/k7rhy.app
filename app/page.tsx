/* eslint-disable react/no-unescaped-entities */
import { Balancer } from 'react-wrap-balancer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-2">
                <h1
                    className={cn(
                        'scroll-m-20 text-3xl pb-2 md:pb-6 font-bold tracking-tight'
                    )}
                >
                    Welcome to my Store!
                </h1>
                <Balancer>
                    <div className="mb-2">
                        I'm a US-based amateur radio operator located on Whidbey
                        Island, WA. With over 30 years of experience in the
                        software development industry, my passion for
                        electronics and embedded systems development naturally
                        led me to amateur radio. For the past 15 years, my focus
                        has been on technical user education, and I'm excited to
                        merge my interests here by sharing resonance-driven RF
                        projects and crafted instruments with you.
                    </div>
                    <div className="mb-2">
                        I've just released my first kit, a{' '}
                        <Link
                            className="hover:underline"
                            href="/products"
                        >
                            <b>20W Dummy Load</b>
                        </Link>
                        , and I'm developing new ways to explore resonance—
                        including 3D-printed guitars tuned for rich, sustained
                        tones.
                    </div>
                    <div className="mb-6">
                        Stop by the{' '}
                        <Link
                            className="hover:underline"
                            href="/blog"
                        >
                            <b>lab notes</b>
                        </Link>{' '}
                        to follow prototypes, discoveries, and what’s coming next.
                    </div>
                </Balancer>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                        asChild
                        size="lg"
                    >
                        <Link href="https://discord.gg/BuUxCG4W6w">
                            Join the K7RHY Discord
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                    >
                        <Link href="/products">Browse Resonant Gear</Link>
                    </Button>
                </div>
                <div className="mb-2">
                    Have an idea for a radio kit or build? Hop into the{' '}
                    <Link
                        className="hover:underline"
                        href="https://discord.gg/BuUxCG4W6w"
                    >
                        K7RHY Discord
                    </Link>{' '}
                    and let’s explore it together.
                </div>
                <div className="italic">73, K7RHY</div>
            </div>
        </main>
    );
}
