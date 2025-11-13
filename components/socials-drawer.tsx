'use client';

import React, { useState } from 'react';
import { SocialIcon } from 'react-social-icons';
import { ChevronRight, ChevronLeft } from 'lucide-react';

import { siteConfig } from '@/config/site';

interface SocialsDrawerProps {
    children?: React.ReactNode;
}

export function SocialsDrawer(props: SocialsDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const socials = [
        siteConfig.links.discord
            ? {
            key: 'discord',
            url: siteConfig.links.discord,
            }
            : null,
        siteConfig.links.linkedin
            ? {
            key: 'linkedin',
            url: siteConfig.links.linkedin,
            }
            : null,
        siteConfig.links.facebook
            ? {
            key: 'facebook',
            url: siteConfig.links.facebook,
            }
            : null,
        siteConfig.links.instagram
            ? {
            key: 'instagram',
            url: siteConfig.links.instagram,
            }
            : null,
        siteConfig.links.threads
            ? {
            key: 'threads',
            url: siteConfig.links.threads,
            }
            : null,
        siteConfig.links.github
            ? {
            key: 'github',
            url: siteConfig.links.github,
            }
            : null,
    ].filter((item): item is { key: string; url: string } => item !== null);

    return (
        <nav className="flex items-center">
            <div className="relative overflow-hidden">
                <div
                    id="socialsDrawer"
                    className={`flex items-center transition-transform duration-500 ${
                        isOpen ? 'translate-x-0' : 'translate-x-[150%]'
                    }`}
                >
                    {socials.map((social, index) => (
                        <SocialIcon
                            key={social.key}
                            target="_blank"
                            url={social.url}
                            style={{ height: 25, width: 25 }}
                            className={index === 0 ? '' : 'ml-2'}
                        />
                    ))}
                </div>
            </div>

            <button
                onClick={toggleDrawer}
                className="ml-1 text-foreground/60 "
            >
                {isOpen ? <ChevronRight /> : <ChevronLeft />}
            </button>
            <div className="mr-4 text-foreground/60 text-sm">
                Social Networks
            </div>
            <div>{props.children}</div>
        </nav>
    );
}
