// components/context-menu.tsx

import React from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface ContextMenuProps {
    onSelectOption: (option: string) => void;
    position: { x: number; y: number }; // Accept position as a prop
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    onSelectOption,
    position,
}) => {
    return (
        <DropdownMenu open>
            <DropdownMenuTrigger asChild>
                <button
                    id="context-menu-trigger"
                    className="hidden"
                >
                    Open Context Menu
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                id="context-menu"
                style={{
                    position: 'absolute',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    zIndex: 1000,
                    display: 'block',
                    backgroundColor: 'white',
                    border: '1px solid black',
                }}
            >
                <DropdownMenuItem onSelect={() => onSelectOption('comment')}>
                    Comment
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSelectOption('report')}>
                    Report a Problem
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSelectOption('question')}>
                    Ask a Question
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ContextMenu;
