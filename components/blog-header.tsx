import React from 'react';

const BlogHeader: React.FC = () => {
    return (
        <header className="py-8 sm:text-center">
            <h1 className="mb-4 text-3xl sm:text-4xl tracking-tight text-slate-900 font-bold dark:text-slate-200">
                Latest Updates
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-400">
                All the latest news, straight from K7RHY.
            </p>
        </header>
    );
};

export default BlogHeader;
