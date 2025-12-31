'use client';

import React, { useState } from 'react';
import { ClipboardCheck, Clipboard } from 'lucide-react';

const CopyToClipboardButton: React.FC<{
    label: string;
    textToCopy: string;
}> = ({ label, textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button onClick={handleCopy} className="flex text-xs items-center justify-center p-2 mt-2 border border-solid border-slate-500/50 rounded bg-slate-200 hover:bg-gray-300 text-black">
            {copied ? <ClipboardCheck className="mr-2" /> : <Clipboard className="mr-2" />}
            {copied ? 'Copied!' : label}
        </button>
    );
};
export default CopyToClipboardButton;
