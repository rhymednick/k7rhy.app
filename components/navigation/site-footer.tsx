import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/version';
import React from 'react';
import Link from 'next/link';
import { Radio, Github, Linkedin, Facebook, Instagram } from 'lucide-react';

const socialLinks = [
    { href: siteConfig.links.discord, icon: Radio, label: 'Discord' },
    { href: siteConfig.links.github, icon: Github, label: 'GitHub' },
    { href: siteConfig.links.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: siteConfig.links.facebook, icon: Facebook, label: 'Facebook' },
    { href: siteConfig.links.instagram, icon: Instagram, label: 'Instagram' },
];

const quickLinks = [
    { href: '/products', label: 'Products' },
    { href: '/blog', label: 'Lab Notes' },
    { href: '/docs', label: 'Documentation' },
];

export function SiteFooter() {
    const buildTimestampLabel = buildMetadata.buildTimeUTC ?? 'unknown time';
    const currentYear = new Date().getFullYear();
    const copyrightYear = currentYear > 2024 ? `2024–${currentYear}` : '2024';

    return (
        <footer className="border-t border-border/60 bg-muted/30">
            <div className="container mx-auto px-4 py-10 md:px-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="sm:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-sm">
                                <Radio className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold text-foreground">{siteConfig.name}</span>
                        </div>
                        <p className="mt-3 max-w-sm text-sm text-muted-foreground">{siteConfig.description}</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Links</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold text-foreground">Connect</h3>
                        <div className="flex flex-wrap gap-2">
                            {socialLinks.map((link) => (
                                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                                    <link.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
                    <p>Copyright {copyrightYear} {siteConfig.name}. All rights reserved.</p>
                    <p>
                        Version{' '}
                        {buildMetadata.commitUrl ? (
                            <a href={buildMetadata.commitUrl} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                                {buildMetadata.shortCommitHash}
                            </a>
                        ) : (
                            buildMetadata.shortCommitHash
                        )}{' '}
                        built {buildTimestampLabel} UTC
                        {!buildMetadata.isPublicBuild && ' (local build)'}
                    </p>
                </div>
            </div>
        </footer>
    );
}
