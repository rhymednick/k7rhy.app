'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch'; // Adjust the import path as needed
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip';

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
        <div className="flex items-center space-x-2">
            {isDarkMode ? (
                <Moon className="text-gray-800 dark:text-gray-200" />
            ) : (
                <Sun className="text-yellow-500 dark:text-yellow-400" />
            )}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Switch
                            checked={isDarkMode}
                            onCheckedChange={handleToggle}
                        />
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>
                            {isDarkMode
                                ? 'Switch to light mode '
                                : 'Switch to dark mode '}
                        </span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default DarkModeToggle;
