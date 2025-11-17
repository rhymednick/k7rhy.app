import React from 'react';
import { Guitar } from '@/types/product';
import { Balancer } from 'react-wrap-balancer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { allBlogs } from 'content-collections';
import { Blog } from '@/.content-collections/generated';
import { GuitarImageGallery } from './guitar-image-gallery';
import { GuitarSpecs } from './guitar-specs';
import { GuitarPickups } from './guitar-pickups';
import { GuitarControls } from './guitar-controls';
import { GuitarPurchase } from './guitar-purchase';
import { GuitarRelatedPosts } from './guitar-related-posts';

interface GuitarPageProps {
    guitar: Guitar;
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

export function GuitarPage({ guitar }: GuitarPageProps) {
    const relatedPosts = getRelatedPosts(guitar);
    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1
                        className={cn(
                            'scroll-m-20 text-3xl font-bold tracking-tight'
                        )}
                    >
                        {guitar.name}
                    </h1>
                    <GuitarPurchase guitar={guitar} />
                </div>

                {/* Compact layout: Images and specs side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Images */}
                    <div>
                        {guitar.images.length > 0 && (
                            <GuitarImageGallery
                                images={guitar.images}
                                alt={guitar.name}
                            />
                        )}
                    </div>

                    {/* Right: Compact specs, pickups, controls */}
                    <div className="space-y-4">
                        <GuitarSpecs guitar={guitar} />
                        <GuitarPickups guitar={guitar} />
                        <GuitarControls guitar={guitar} />
                    </div>
                </div>

                {/* Description below the fold */}
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-base text-muted-foreground space-y-4">
                            {guitar.description.split('\n\n').map((paragraph, index) => (
                                <Balancer key={index}>
                                    <p>{paragraph.trim()}</p>
                                </Balancer>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Related posts */}
                <GuitarRelatedPosts
                    guitar={guitar}
                    relatedPosts={relatedPosts}
                />
            </div>
        </main>
    );
}

