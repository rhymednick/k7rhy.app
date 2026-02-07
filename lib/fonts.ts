import { JetBrains_Mono as FontMono, Inter } from 'next/font/google';

export const fontSans = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const fontMono = FontMono({
    subsets: ['latin'],
    variable: '--font-mono',
});
