import React from 'react';

interface TagFilterProps {
    tags: string[];
    selectedTags: string[];
    disabledTags: string[];
    onToggleTag: (tag: string) => void;
    onClearTags: () => void;
}

const TagFilter: React.FC<TagFilterProps> = ({
    tags,
    selectedTags,
    disabledTags,
    onToggleTag,
    onClearTags,
}) => {
    return (
        <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">
                Filter by Tags:
            </h2>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => onToggleTag(tag)}
                        disabled={
                            disabledTags.includes(tag) &&
                            !selectedTags.includes(tag)
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedTags.includes(tag)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                        } ${
                            disabledTags.includes(tag) &&
                            !selectedTags.includes(tag)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-blue-300'
                        }`}
                    >
                        #{tag}
                    </button>
                ))}
            </div>
            {selectedTags.length > 0 && (
                <button
                    onClick={onClearTags}
                    className="mt-4 text-blue-600 dark:text-blue-400 underline text-xs"
                >
                    Clear Filter
                </button>
            )}
        </div>
    );
};

export default TagFilter;
