'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const DarkModeToggle = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Ensure component is mounted before rendering
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDarkMode = theme === 'dark';

    const handleToggle = () => {
        setTheme(isDarkMode ? 'light' : 'dark');
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleToggle} className="h-9 w-9">
                        {isDarkMode ? <Moon className="h-5 w-5 text-sky-400" /> : <Sun className="h-5 w-5 text-amber-500" />}
                        <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <span>{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default DarkModeToggle;
