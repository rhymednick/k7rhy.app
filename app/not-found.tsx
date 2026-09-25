import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { navConfig } from '@/config/navigation';

const sections = navConfig.mainNav.flatMap((item) => (item.href ? [{ title: item.title, href: item.href }] : []));

export const metadata: Metadata = {
    title: 'Page not found | K7RHY',
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center md:px-12">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">404</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">Page not found</h1>
            <p className="mt-4 max-w-md text-base text-slate-600 dark:text-slate-400">The page you asked for doesn’t exist or has moved. Check the address, or start from one of these sections.</p>
            <Button asChild size="lg" className="mt-8">
                <Link href="/">Go to the home page</Link>
            </Button>
            <nav aria-label="Site sections" className="mt-6 flex flex-wrap justify-center gap-3">
                {sections.map((item) => (
                    <Button key={item.href} asChild variant="outline">
                        <Link href={item.href}>{item.title}</Link>
                    </Button>
                ))}
            </nav>
        </main>
    );
}
