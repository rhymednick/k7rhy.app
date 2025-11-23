'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ProductImage } from '@/types/product';
import { ImageIcon } from 'lucide-react';

interface GuitarImageGalleryProps {
    images: string[] | ProductImage[];
    alt: string;
}

// Helper to normalize images to ProductImage format
function normalizeImage(
    image: string | ProductImage,
    index: number,
    defaultAlt: string
): ProductImage {
    if (typeof image === 'string') {
        return {
            src: image,
            alt: `${defaultAlt} - Image ${index + 1}`,
        };
    }
    return {
        src: image.src,
        description: image.description,
        alt: image.alt || `${defaultAlt} - Image ${index + 1}`,
    };
}

export function GuitarImageGallery({
    images,
    alt,
}: GuitarImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<ProductImage | null>(
        null
    );
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    const normalizedImages = images.map((img, idx) =>
        normalizeImage(img, idx, alt)
    );

    const handleImageError = (index: number) => {
        setImageErrors((prev) => new Set(prev).add(index));
    };

    const handleImageClick = (image: ProductImage) => {
        setSelectedImage(image);
    };

    if (normalizedImages.length === 0) {
        return null;
    }

    return (
        <>
            <div className="relative">
                <Carousel
                    orientation="horizontal"
                    className="w-full"
                    opts={{
                        align: 'start',
                        loop: true,
                    }}
                >
                    <CarouselPrevious className="left-2" />
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {normalizedImages.map((image, index) => {
                            const hasError = imageErrors.has(index);
                            const showPlaceholder = hasError;

                            return (
                                <CarouselItem
                                    key={index}
                                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                                >
                                    <div className="space-y-2">
                                        <div
                                            className="relative aspect-square cursor-pointer group"
                                            onClick={() => handleImageClick(image)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    handleImageClick(image);
                                                }
                                            }}
                                        >
                                            {showPlaceholder ? (
                                                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                                                    <div className="text-center p-4">
                                                        <ImageIcon className="w-12 h-12 mx-auto mb-2 text-muted-foreground/40" />
                                                        <p className="text-sm text-muted-foreground">
                                                            Image not found
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Image
                                                        src={image.src}
                                                        width={350}
                                                        height={350}
                                                        alt={image.alt || ''}
                                                        className="rounded-md object-cover transition-opacity group-hover:opacity-90"
                                                        onError={() =>
                                                            handleImageError(index)
                                                        }
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-md transition-colors flex items-center justify-center">
                                                        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded transition-opacity">
                                                            Click to enlarge
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {image.description && (
                                            <p className="text-sm text-muted-foreground text-center">
                                                {image.description}
                                            </p>
                                        )}
                                    </div>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselNext className="right-2" />
                </Carousel>
            </div>

            {/* Full-screen image dialog */}
            <Dialog
                open={selectedImage !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedImage(null);
                    }
                }}
            >
                <DialogContent className="max-w-7xl w-full p-0">
                    {selectedImage && (
                        <>
                            <DialogHeader className="px-6 pt-6">
                                <DialogTitle>{selectedImage.alt}</DialogTitle>
                                {selectedImage.description && (
                                    <DialogDescription>
                                        {selectedImage.description}
                                    </DialogDescription>
                                )}
                            </DialogHeader>
                            <div className="relative w-full aspect-video max-h-[80vh] overflow-hidden">
                                {(() => {
                                    const selectedIndex = normalizedImages.findIndex(
                                        (img) => img.src === selectedImage.src
                                    );
                                    return imageErrors.has(selectedIndex) ? (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-16 h-16 mx-auto mb-2 text-muted-foreground/40" />
                                                <p className="text-muted-foreground">
                                                    Image not found
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <Image
                                            src={selectedImage.src}
                                            alt={selectedImage.alt || ''}
                                            fill
                                            className="object-contain"
                                            sizes="100vw"
                                        />
                                    );
                                })()}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
