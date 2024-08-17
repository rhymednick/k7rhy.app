"use client"
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus, materialDark, materialLight, materialOceanic } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BiCopy } from 'react-icons/bi';

type CodeBlockProps = {
    className?: string;
    children: string; // Ensuring that children is of type string
    showLineNumbers?: boolean;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children, showLineNumbers = true }) => {
    const [isCopied, setIsCopied] = useState(false);
    const language = className?.replace('language-', '') || 'text';

    const handleCopy = () => {
        navigator.clipboard.writeText(children.trim());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset copy state after 2 seconds
    };

    return (
        <div className="relative bg-white rounded-md border border-gray-400 my-4 overflow-hidden">
            <div className="flex justify-between items-center bg-gray-200 text-gray-600 px-4 py-1">
                <span className="text-sm font-semibold uppercase">{language}</span>
                <button
                    onClick={handleCopy}
                    className="text-gray-600 hover:text-white transition-colors flex items-center"
                    aria-label="Copy to clipboard"
                >
                    <BiCopy className="mr-1" />
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={materialLight}
                showLineNumbers={showLineNumbers}
                wrapLines={true}
                customStyle={{
                    padding: '8px',
                    margin: 0,
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.9em',
                }}
            >
                {children.trim()}
            </SyntaxHighlighter>
        </div>
    );
};

export default CodeBlock;