// components/doc/mdx-doc-procedure-step.tsx
import React from 'react';
import { DocImage } from '@/components/doc/doc-image';
import { MdxDocProcedureSubstepGroup } from '@/components/doc/mdx-doc-procedure-substep-group';

export interface MdxDocProcedureStepProps {
    text: string;
    image?: string;
    isSubstep?: boolean;
    children?: React.ReactNode;
}

export const MdxDocProcedureStep: React.FC<MdxDocProcedureStepProps> = ({ text, image, isSubstep = false, children }) => {
    const descriptionChildren: React.ReactNode[] = [];
    let substepGroup: React.ReactNode | null = null;

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === MdxDocProcedureSubstepGroup) {
            substepGroup = child;
        } else {
            descriptionChildren.push(child);
        }
    });

    if (isSubstep) {
        return (
            <li
                style={{ counterIncrement: 'substep 1' }}
                className="relative pl-10 pb-4 last:pb-0
                    before:content-[counter(substep,lower-alpha)] before:absolute before:left-0 before:top-0
                    before:w-[26px] before:h-[26px] before:rounded-full
                    before:bg-violet-100 before:text-violet-700 before:text-xs before:font-bold
                    before:border before:border-violet-300
                    before:flex before:items-center before:justify-center
                    dark:before:bg-violet-900/40 dark:before:text-violet-300 dark:before:border-violet-700
                    after:absolute after:top-[26px] after:bottom-0 after:left-[12px] after:w-[1.5px]
                    after:bg-gradient-to-b after:from-violet-300 after:to-violet-300/5
                    last:after:hidden"
            >
                <div>
                    <h4 className="text-sm font-semibold text-violet-900 mb-2 dark:text-violet-200">{text}</h4>
                    <div className="flex flex-col md:flex-row md:items-start gap-3">
                        <div className="prose prose-slate prose-sm dark:prose-invert flex-1">{descriptionChildren}</div>
                        {image && (
                            <div className="flex-shrink-0">
                                <DocImage title={text} src={image} alt={text} triggerImageSize={80} popupImageSize={1000} />
                            </div>
                        )}
                    </div>
                </div>
            </li>
        );
    }

    return (
        <li
            style={{ counterIncrement: 'step 1' }}
            className="relative pl-12 pb-8 last:pb-0
                before:content-[counter(step)] before:absolute before:left-0 before:top-0
                before:w-[34px] before:h-[34px] before:rounded-full
                before:bg-gradient-to-br before:from-indigo-500 before:to-violet-500
                before:text-white before:text-sm before:font-bold
                before:flex before:items-center before:justify-center
                before:shadow-[0_2px_8px_rgba(99,102,241,0.35)]
                after:absolute after:top-[34px] after:bottom-0 after:left-[16px] after:w-[2px]
                after:bg-gradient-to-b after:from-violet-500 after:to-violet-500/5
                last:after:hidden"
        >
            <div>
                <h3 className="text-base font-bold text-indigo-950 mb-2 mt-1 dark:text-slate-100">{text}</h3>
                <div className="flex flex-col md:flex-row md:items-start gap-3">
                    <div className="prose prose-slate prose-sm dark:prose-invert flex-1">{descriptionChildren}</div>
                    {image && (
                        <div className="flex-shrink-0">
                            <DocImage title={text} src={image} alt={text} triggerImageSize={120} popupImageSize={1000} />
                        </div>
                    )}
                </div>
                {substepGroup}
            </div>
        </li>
    );
};
