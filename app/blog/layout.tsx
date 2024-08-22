import React from 'react';
interface BlogLayoutProps {
    children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
    return <div className="border-b">{children}</div>;
}
