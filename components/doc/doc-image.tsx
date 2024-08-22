import React from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import Image from 'next/image';

export interface DocImageProps {
    title: string;
    triggerImageSize: number;
    popupImageSize: number;
    src: string;
    alt?: string;
}

export async function DocImage(props: DocImageProps) {
    return (
        <div>
            <AlertDialog>
                <AlertDialogTrigger>
                    <Image
                        src={props.src}
                        alt={props.alt || ''}
                        width={props.triggerImageSize}
                        height={props.triggerImageSize}
                    />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{props.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            <Image
                                src={props.src}
                                alt={props.alt || ''}
                                width={props.popupImageSize}
                                height={props.popupImageSize}
                            />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Done</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
