import React from 'react';
import { Product } from '@/types/product';
import { Balancer } from 'react-wrap-balancer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { allBlogs } from 'content-collections';
import { Blog } from '@/.content-collections/generated';
import { GuitarImageGallery } from './guitar-image-gallery';
import { ProductRelatedPosts } from './product-related-posts';
import { ProductPurchase } from './product-purchase';
import { Radio, Info, BookOpen, Zap, CheckCircle2 } from 'lucide-react';

interface HamRadioKitPageProps {
    product: Product;
    Description?: React.ComponentType;
}

function getRelatedPosts(product: Product): Blog[] {
    if (!product.relatedBlogTag) {
        return [];
    }

    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;
    const allPosts =
        environment === 'production'
            ? allBlogs.filter((post) => post.publish)
            : allBlogs;

    return allPosts
        .filter((post) => post.tags?.includes(product.relatedBlogTag!))
        .sort(
            (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
        );
}

export function HamRadioKitPage({ product, Description }: HamRadioKitPageProps) {
    const relatedPosts = getRelatedPosts(product);

    // Special handling for the dummy load kit
    const isDummyLoad = product.slug === 'dummy-load-20w-bnc';

    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-6">
                {/* Enhanced Header Section */}
                <div className="relative isolate overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 via-white to-slate-50 px-6 py-8 shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:from-slate-950/70 dark:via-slate-900/50 dark:to-slate-950/70 dark:ring-white/10">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-100/50 via-transparent to-orange-100/50 dark:from-amber-900/10 dark:via-transparent dark:to-orange-900/10" />
                    <div className="absolute -right-20 top-0 -z-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10" />
                    <div className="absolute -left-20 bottom-0 -z-10 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10" />
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                                <Radio className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className={cn('scroll-m-20 text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300')}>
                                    {product.name}
                                </h1>
                                <Badge variant="secondary" className="mt-2">
                                    Ham Radio Kit
                                </Badge>
                            </div>
                        </div>
                        <ProductPurchase product={product} />
                    </div>
                </div>

                {/* Images */}
                {product.images.length > 0 && (
                    <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <GuitarImageGallery
                                images={product.images}
                                alt={product.name}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Key Features - only for dummy load */}
                {isDummyLoad && (
                    <Card className="border-2 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-primary" />
                                <CardTitle>Key Features</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Balancer>
                                <ul className="ml-8 list-disc space-y-2">
                                    <li>
                                        <b>High-Quality Components:</b> Each kit includes precision resistors and robust, heat-resistant materials designed to withstand continuous usage at 20 watts.
                                    </li>
                                    <li>
                                        <b>Easy Assembly:</b> With clear, step-by-step instructions, you can assemble your dummy load in no time. No advanced tools required—just a soldering iron and some basic electronics skills.
                                    </li>
                                    <li>
                                        <b>Integrated Power Measurement:</b>{' '}
                                        Equipped with on-board measurement components, this kit allows for accurate measurement of power output via test pads with a multimeter (not included), ensuring your equipment operates at its best.
                                    </li>
                                    <li>
                                        <b>Compact and Efficient:</b> The sleek, compact design makes it easy to integrate into any ham radio setup without taking up unnecessary space.
                                    </li>
                                    <li>
                                        <b>Versatile Use: Perfect</b> for testing the output power of your transmitters, tuning antennas, or adjusting signal amplifiers without interference.
                                    </li>
                                    <li>
                                        <b>Educational Experience:</b> Not only is this a practical tool for your radio activities, but it&apos;s also a great project for learning more about the fundamentals of radio electronics and antenna theory.
                                    </li>
                                </ul>
                            </Balancer>
                        </CardContent>
                    </Card>
                )}

                {/* Specifications - only for dummy load */}
                {isDummyLoad && (
                    <Card className="border-2 shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <CardTitle>Specifications</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="ml-8 list-disc space-y-2">
                                <li>
                                    <b>Power Handling:</b> 20W continuous, 100W peak
                                    (momentary)
                                </li>
                                <li>
                                    <b>Impedance:</b> 50 ohms
                                </li>
                                <li>
                                    <b>Dimensions:</b> 4.5&quot; x 2&quot; x 0.75&quot; (12cm x 5cm x 2cm)
                                </li>
                                <li>
                                    <b>Frequency Range:</b> 0-455 MHz
                                </li>
                                <li>
                                    <b>SWR:</b>
                                </li>
                                <ul className="ml-8 list-disc">
                                    <li>&lt;1.1 for HF bands (160m - 10m)</li>
                                    <li>&lt;1.5 for 6m band</li>
                                    <li>&lt;2.5 for 2m band</li>
                                    <li>&lt;1.3 for 70cm band</li>
                                </ul>
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Description */}
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
                                {product.description.split('\n\n').map((paragraph, index) => (
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
                    <Card className="border-2 shadow-md bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-primary" />
                                <CardTitle>Related Content</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ProductRelatedPosts
                                product={product}
                                relatedPosts={relatedPosts}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    );
}

