import React from 'react';
import { Product } from '@/types/product';
import { Balancer } from 'react-wrap-balancer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { allBlogs } from 'content-collections';
import { Blog } from '@/.content-collections/generated';
import { GuitarImageGallery } from './guitar-image-gallery';
import { ProductRelatedPosts } from './product-related-posts';
import { ProductPurchase } from './product-purchase';

interface HamRadioKitPageProps {
    product: Product;
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

export function HamRadioKitPage({ product }: HamRadioKitPageProps) {
    const relatedPosts = getRelatedPosts(product);

    // Special handling for the dummy load kit
    const isDummyLoad = product.slug === 'dummy-load-20w-bnc';

    return (
        <main className="flex min-h-screen flex-col justify-between pl-4 pr-4 pt-4 md:pl-24 md:pr-24 md:pt-12">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1
                        className={cn(
                            'scroll-m-20 text-3xl font-bold tracking-tight'
                        )}
                    >
                        {product.name}
                    </h1>
                    <ProductPurchase product={product} />
                </div>

                {/* Images */}
                {product.images.length > 0 && (
                    <div className="px-12">
                        <GuitarImageGallery
                            images={product.images}
                            alt={product.name}
                        />
                    </div>
                )}

                {/* Key Features - only for dummy load */}
                {isDummyLoad && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Key Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Balancer>
                                <ul className="ml-8 list-disc">
                                    <li>
                                        <b>High-Quality Components:</b> Each kit
                                        includes precision resistors and robust,
                                        heat-resistant materials designed to
                                        withstand continuous usage at 20 watts.
                                    </li>
                                    <li>
                                        <b>Easy Assembly:</b> With clear,
                                        step-by-step instructions, you can assemble
                                        your dummy load in no time. No advanced
                                        tools required—just a soldering iron and
                                        some basic electronics skills.
                                    </li>
                                    <li>
                                        <b>Integrated Power Measurement:</b>{' '}
                                        Equipped with on-board measurement
                                        components, this kit allows for accurate
                                        measurement of power output via test pads
                                        with a multimeter (not included), ensuring
                                        your equipment operates at its best.
                                    </li>
                                    <li>
                                        <b>Compact and Efficient:</b> The sleek,
                                        compact design makes it easy to integrate
                                        into any ham radio setup without taking up
                                        unnecessary space.
                                    </li>
                                    <li>
                                        <b>Versatile Use: Perfect</b> for testing
                                        the output power of your transmitters,
                                        tuning antennas, or adjusting signal
                                        amplifiers without interference.
                                    </li>
                                    <li>
                                        <b>Educational Experience:</b> Not only is
                                        this a practical tool for your radio
                                        activities, but it's also a great project
                                        for learning more about the fundamentals of
                                        radio electronics and antenna theory.
                                    </li>
                                </ul>
                            </Balancer>
                        </CardContent>
                    </Card>
                )}

                {/* Specifications - only for dummy load */}
                {isDummyLoad && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Specifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="ml-8 list-disc">
                                <li>
                                    <b>Power Handling:</b> 20W continuous, 100W peak
                                    (momentary)
                                </li>
                                <li>
                                    <b>Impedance:</b> 50 ohms
                                </li>
                                <li>
                                    <b>Dimensions:</b> 4.5" x 2" x 0.75" (12cm x 5cm x 2cm)
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
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-base text-muted-foreground space-y-4">
                            {product.description.split('\n\n').map((paragraph, index) => (
                                <Balancer key={index}>
                                    <p>{paragraph.trim()}</p>
                                </Balancer>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Related posts */}
                <ProductRelatedPosts
                    product={product}
                    relatedPosts={relatedPosts}
                />
            </div>
        </main>
    );
}

