import React from 'react';
import { Guitar } from '@/types/product';
import { Balancer } from 'react-wrap-balancer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { allBlogs } from 'content-collections';
import { Blog } from '@/.content-collections/generated';
import { GuitarImageGallery } from './guitar-image-gallery';
import { GuitarSpecs } from './guitar-specs';
import { GuitarPickups } from './guitar-pickups';
import { GuitarControls } from './guitar-controls';
import { GuitarPurchase } from './guitar-purchase';
import { GuitarRelatedPosts } from './guitar-related-posts';
import { Guitar as GuitarIcon, Info, BookOpen } from 'lucide-react';

interface GuitarPageProps {
    guitar: Guitar;
    Description?: React.ComponentType;
}

function getRelatedPosts(guitar: Guitar): Blog[] {
    if (!guitar.relatedBlogTag) {
        return [];
    }

    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
    const allPosts =
        environment === 'production'
            ? allBlogs.filter((post) => post.publish)
            : allBlogs;

    return allPosts
        .filter((post) => post.tags?.includes(guitar.relatedBlogTag!))
        .sort(
            (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
        );
}

export function GuitarPage({ guitar, Description }: GuitarPageProps) {
    const relatedPosts = getRelatedPosts(guitar);
    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-6">
                {/* Enhanced Header Section */}
                <div className="relative isolate overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 py-8 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:from-slate-950/70 dark:via-slate-900/50 dark:to-slate-950/70 dark:ring-white/10">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100/50 via-transparent to-purple-100/50 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10" />
                    <div className="absolute -right-20 top-0 -z-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
                    <div className="absolute -left-20 bottom-0 -z-10 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-500/10" />
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                <GuitarIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className={cn('scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300')}>
                                    {guitar.name}
                                </h1>
                                <Badge variant="secondary" className="mt-2">
                                    {guitar.pickups.length} Pickup{guitar.pickups.length !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </div>
                        <GuitarPurchase guitar={guitar} />
                    </div>
                </div>

                {/* Compact layout: Images and specs side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Images */}
                    <div>
                        {guitar.images.length > 0 && (
                            <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <GuitarImageGallery
                                        images={guitar.images}
                                        alt={guitar.name}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right: Compact specs, pickups, controls */}
                    <div className="space-y-4">
                        <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                            <GuitarSpecs guitar={guitar} />
                        </Card>
                        <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                            <GuitarPickups guitar={guitar} />
                        </Card>
                        <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                            <GuitarControls guitar={guitar} />
                        </Card>
                    </div>
                </div>

                {/* Description below the fold */}
                <Card className="border-2 shadow-md bg-gradient-to-br from-slate-50/50 to-white dark:from-slate-900/50 dark:to-slate-950/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            <CardTitle>Description</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {Description ? (
                            <Description />
                        ) : (
                            <div className="text-base text-muted-foreground space-y-4">
                                {guitar.description.split('\n\n').map((paragraph, index) => (
                                    <Balancer key={index}>
                                        <p>{paragraph.trim()}</p>
                                    </Balancer>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Related posts */}
                {relatedPosts.length > 0 && (
                    <Card className="border-2 shadow-md bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <CardTitle>Related Content</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <GuitarRelatedPosts
                                guitar={guitar}
                                relatedPosts={relatedPosts}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}

