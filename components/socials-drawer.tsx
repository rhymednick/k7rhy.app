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

    return (
        <nav className="flex items-center">
            <div className="relative overflow-hidden">
                <div
                    id="socialsDrawer"
                    className={`flex items-center transition-transform duration-500 ${
                        isOpen ? 'translate-x-0' : 'translate-x-[150%]'
                    }`}
                >
                    <SocialIcon
                        target="_blank"
                        url={siteConfig.links.linkedin}
                        style={{ height: 25, width: 25 }}
                    />
                    <SocialIcon
                        target="_blank"
                        url={siteConfig.links.facebook}
                        style={{ height: 25, width: 25 }}
                        className="ml-2"
                    />
                    <SocialIcon
                        target="_blank"
                        url={siteConfig.links.instagram}
                        style={{ height: 25, width: 25 }}
                        className="ml-2"
                    />
                    <SocialIcon
                        target="_blank"
                        url={siteConfig.links.threads}
                        style={{ height: 25, width: 25 }}
                        className="ml-2"
                    />
                    <SocialIcon
                        target="_blank"
                        network="x"
                        url={siteConfig.links.twitter}
                        style={{ height: 25, width: 25 }}
                        className="ml-2"
                    />
                    <SocialIcon
                        target="_blank"
                        url={siteConfig.links.github}
                        style={{ height: 25, width: 25 }}
                        className="ml-2 "
                    />
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
