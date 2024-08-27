'use client';

import React, { useState, useEffect } from 'react';
import ContextMenu from '@/components/context-menu';
import FeedbackSheet from '@/components/feedback-sheet';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import CopyToClipboardButton from '@/components/copy-to-clipboard-button';

type FeedbackType = 'comment' | 'question' | 'report';
// Type guard to check if a string is a valid FeedbackType
const isFeedbackType = (value: string): value is FeedbackType => {
    return ['comment', 'question', 'report'].includes(value);
};
const InlineCommentHandler = () => {
    const [selectedText, setSelectedText] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [showSheet, setShowSheet] = useState(false);
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('comment'); // Default feedback type
    const { toast } = useToast();

    useEffect(() => {
        const handleMouseUp = (event: MouseEvent) => {
            // Disable selection while feedback sheet is open
            if (showSheet) {
                return;
            }

            const text = window.getSelection()?.toString();
            if (text) {
                setSelectedText(text);
                setMenuPosition({ x: event.clientX, y: event.clientY });
                setShowMenu(true);
            } else {
                setShowMenu(false);
            }
        };

        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [showSheet]); // Dependency on showSheet

    const handleOptionSelect = (option: string) => {
        if (isFeedbackType(option)) {
            setFeedbackType(option); // Set the initial feedback type based on the selected option
            setShowSheet(true); // Show feedback sheet
            setShowMenu(false); // Hide context menu
        } else {
            console.error(`Invalid feedback type: ${option}`);
        }
    };

    const handleSubmitFeedback = async (
        title: string,
        body: string,
        feedbackType: FeedbackType,
        selectedText: string,
        pageUrl: string
    ) => {
        try {
            const response = await fetch('/api/github-create-issue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    body,
                    feedbackType,
                    selectedText,
                    pageUrl,
                }), // Pass additional data
            });

            if (!response.ok) {
                const errorText = await response.text(); // Capture error text
                console.error('Failed to create GitHub issue:', errorText); // Log error details
                throw new Error(`Failed to create GitHub issue: ${errorText}`);
            }

            const data = await response.json();
            const issueUrl = data.html_url; // Get the GitHub issue URL

            toast({
                title: 'Feedback submitted successfully!',
                description: (
                    <>
                        <p>Your feedback has been sent.</p>
                        <Link
                            href={issueUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                        >
                            View issue on GitHub
                        </Link>
                    </>
                ),
                action: (
                    <CopyToClipboardButton
                        label="Copy Link"
                        textToCopy={issueUrl}
                    />
                ),
            });
        } catch (err) {
            console.error('Error submitting feedback:', err); // Log the caught error
            toast({
                title: 'Error',
                description: 'Failed to submit feedback. Please try again.',
            });
        }
    };

    return (
        <>
            {showMenu && (
                <ContextMenu
                    onSelectOption={handleOptionSelect}
                    position={menuPosition}
                />
            )}
            <FeedbackSheet
                onSubmit={handleSubmitFeedback}
                selectedText={selectedText} // Pass the selected text
                initialFeedbackType={feedbackType} // Pass the initial feedback type
                isOpen={showSheet}
                onClose={() => setShowSheet(false)}
            />
        </>
    );
};

export default InlineCommentHandler;
