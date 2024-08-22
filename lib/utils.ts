import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);

    // Define options for the date formatting
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long', // e.g., "Saturday"
        year: 'numeric', // e.g., "2024"
        month: 'long', // e.g., "August"
        day: 'numeric', // e.g., "17"
    };

    // Format the date with the options specified
    return date.toLocaleDateString('en-US', options);
}
