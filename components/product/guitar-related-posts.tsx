'use client';

import React, { useState } from 'react';
import { Guitar } from '@/types/product';
import { Blog } from '@/.content-collections/generated';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

interface GuitarRelatedPostsProps {
    guitar: Guitar;
    relatedPosts: Blog[];
}

export function GuitarRelatedPosts({
    guitar,
    relatedPosts,
}: GuitarRelatedPostsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);

    if (relatedPosts.length === 0) {
        return null;
    }

    const currentPost = relatedPosts[currentPostIndex];
    const canGoPrevious = currentPostIndex > 0;
    const canGoNext = currentPostIndex < relatedPosts.length - 1;

    const handlePrevious = () => {
        if (canGoPrevious) {
            setCurrentPostIndex(currentPostIndex - 1);
        }
    };

    const handleNext = () => {
        if (canGoNext) {
            setCurrentPostIndex(currentPostIndex + 1);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            // Reset to first post when closing
            setCurrentPostIndex(0);
        }
    };

    return (
        <div className="mt-8">
            <Sheet open={isOpen} onOpenChange={handleOpenChange}>
                <SheetTrigger asChild>
                    <Button variant="outline">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Related Blog Posts ({relatedPosts.length})
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Related Blog Posts</SheetTitle>
                        <SheetDescription>
                            {relatedPosts.length} post{relatedPosts.length !== 1 ? 's' : ''} related to this guitar
                        </SheetDescription>
                    </SheetHeader>

                    {/* Navigation Controls */}
                    <div className="flex items-center justify-between my-4 pb-4 border-b">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            disabled={!canGoPrevious}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {currentPostIndex + 1} of {relatedPosts.length}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            disabled={!canGoNext}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>

                    {/* Post List Navigation */}
                    {relatedPosts.length > 1 && (
                        <div className="mb-4 pb-4 border-b">
                            <div className="text-sm font-semibold mb-2">All Posts:</div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {relatedPosts.map((post, index) => (
                                    <button
                                        key={post._meta.path}
                                        onClick={() => setCurrentPostIndex(index)}
                                        className={`w-full text-left px-2 py-1 rounded text-sm ${
                                            index === currentPostIndex
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-muted'
                                        }`}
                                    >
                                        {post.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Post Content */}
                    <div className="mt-4">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-2">{currentPost.title}</h2>
                            <div className="text-sm text-muted-foreground mb-4">
                                <time dateTime={new Date(currentPost.date).toISOString()}>
                                    {formatDate(currentPost.date)}
                                </time>
                            </div>
                            {currentPost.tags && currentPost.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {currentPost.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {currentPost.summary && (
                                <div className="prose prose-slate dark:prose-dark mb-4">
                                    {currentPost.summary}
                                </div>
                            )}
                            <Link
                                href={`/blog/${currentPost._meta.path}`}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Read full post →
                            </Link>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

