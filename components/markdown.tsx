import React from 'react';
//import { MDXProvider } from '@mdx-js/react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';

export interface MarkdownProps {
    children: string;
}

const Markdown: React.FC<MarkdownProps> = ({ children }) => {
    const [source, setSource] = React.useState<MDXRemoteSerializeResult | null>(null);

    React.useEffect(() => {
        const renderMDX = async () => {
            const mdxSource = await serialize(children);
            setSource(mdxSource);
        };
        renderMDX();
    }, [children]);

    return (
        <div className="prose">
            {source && <MDXRemote {...source} />}
        </div>
    );
};

export default Markdown;