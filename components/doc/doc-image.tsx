import React from 'react';
import {
	AlertDialog, AlertDialogCancel, AlertDialogContent,
	AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
	AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ZoomIn } from 'lucide-react';
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
				<AlertDialogTrigger asChild>
					<div className="group relative inline-block cursor-pointer rounded-lg overflow-hidden border border-indigo-200 shadow-[0_2px_8px_rgba(99,102,241,0.15)] dark:border-indigo-900">
						<Image
							src={props.src}
							alt={props.alt || ''}
							width={props.triggerImageSize}
							height={props.triggerImageSize}
							className="block"
						/>
						<div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors duration-200 flex items-center justify-center">
							<div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-slate-800/90 rounded-full w-8 h-8 flex items-center justify-center shadow">
								<ZoomIn className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
							</div>
						</div>
					</div>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{props.title}</AlertDialogTitle>
						<AlertDialogDescription>
							<Image src={props.src} alt={props.alt || ''} width={props.popupImageSize} height={props.popupImageSize} />
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
