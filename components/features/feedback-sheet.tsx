'use client';

import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

type FeedbackType = 'comment' | 'question' | 'report'; // Explicit feedback type

interface FeedbackSheetProps {
    onSubmit: (title: string, body: string, feedbackType: FeedbackType, selectedText: string, pageUrl: string) => Promise<void>; // Include selectedText and pageUrl
    selectedText: string;
    initialFeedbackType: FeedbackType; // Also ensure initialFeedbackType matches FeedbackType
    isOpen: boolean;
    onClose: () => void;
}

// Define schema using zod with required comments
const formSchema = z.object({
    title: z.string().min(1, { message: 'Title is required.' }),
    additionalComments: z.string().min(1, { message: 'Additional comments are required.' }),
    feedbackType: z.enum(['comment', 'question', 'report']),
    pageUrl: z.string().url().nonempty({ message: 'URL is required.' }),
});

type FeedbackFormData = z.infer<typeof formSchema>;

const FeedbackSheet: React.FC<FeedbackSheetProps> = ({ onSubmit, selectedText, initialFeedbackType, isOpen, onClose }) => {
    const [showSelectedText, setShowSelectedText] = useState(true);
    const [currentUrl, setCurrentUrl] = useState(''); // Use state to manage the URL
    const { toast } = useToast();

    // Initialize form with zod resolver
    const form = useForm<FeedbackFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            additionalComments: '',
            feedbackType: initialFeedbackType,
            pageUrl: '',
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: '',
                additionalComments: '',
                feedbackType: initialFeedbackType,
                pageUrl: window.location.href, // Set the current URL here
            });
            setCurrentUrl(window.location.href); // Update currentUrl after component mounts
            setShowSelectedText(true); // Reset selected text visibility when the form is opened
        }
    }, [isOpen, initialFeedbackType, form]);

    const onSubmitForm: SubmitHandler<FeedbackFormData> = async (data) => {
        try {
            const selectedTextToSend = showSelectedText ? selectedText : '';
            const combinedBody = `**Page URL:** ${data.pageUrl}\n\n${selectedTextToSend ? `**Selected Text:** ${selectedTextToSend}\n\n` : ''}**Comments:** ${data.additionalComments || ''}`;

            await onSubmit(data.title, combinedBody, data.feedbackType, selectedTextToSend, data.pageUrl);
            onClose(); // Close the sheet on success
        } catch (err) {
            console.error('Error submitting feedback:', err);
            toast({
                title: 'Error',
                description: 'Failed to submit feedback. Please try again.',
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right">
                <SheetHeader className="mb-4">
                    <SheetTitle>Site Feedback Form</SheetTitle>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feedback Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter a title for your feedback." {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="feedbackType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feedback Type</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select feedback type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="comment">Comment</SelectItem>
                                                <SelectItem value="question">Question</SelectItem>
                                                <SelectItem value="report">Problem Report</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>Choose the type of feedback.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Display the selected text with an option to remove it */}
                        <FormItem>
                            <FormLabel>Selected Text</FormLabel>
                            {showSelectedText && (
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 text-sm text-gray-700 bg-gray-100 p-2 rounded">{selectedText}</div>
                                    <button type="button" className="text-red-500" onClick={() => setShowSelectedText(false)}>
                                        ✕
                                    </button>
                                </div>
                            )}
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="additionalComments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Comments</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Provide any additional comments for your feedback." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Display the URL of the current page */}
                        <FormItem>
                            <FormLabel>Page URL</FormLabel>
                            <FormControl>
                                <Input value={currentUrl} readOnly />
                            </FormControl>
                            <FormDescription>This is the URL of the page you are commenting on.</FormDescription>
                        </FormItem>

                        <Button type="submit">Submit Feedback</Button>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};

export default FeedbackSheet;
