import React from 'react';

interface TagFilterProps {
    tags: string[];
    selectedTags: string[];
    disabledTags: string[];
    onToggleTag: (tag: string) => void;
    onClearTags: () => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, disabledTags, onToggleTag, onClearTags }) => {
    return (
        <div className="mb-8">
            <h2 className="mb-2 text-sm font-semibold text-foreground">Filter by Tags:</h2>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => onToggleTag(tag)}
                        disabled={disabledTags.includes(tag) && !selectedTags.includes(tag)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${selectedTags.includes(tag) ? 'border-sky-500 bg-sky-500 text-white' : 'border-border bg-background text-foreground hover:bg-accent'} ${disabledTags.includes(tag) && !selectedTags.includes(tag) ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                        #{tag}
                    </button>
                ))}
            </div>
            {selectedTags.length > 0 && (
                <button onClick={onClearTags} className="mt-4 text-xs text-sky-600 underline dark:text-sky-400">
                    Clear Filter
                </button>
            )}
        </div>
    );
};

export default TagFilter;
