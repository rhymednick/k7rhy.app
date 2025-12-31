// components/doc/mdx-doc-procedure-step.tsx
import React from 'react';
import { DocImage } from '@/components/doc/doc-image';
import { MdxDocProcedureSubstepGroup } from '@/components/doc/mdx-doc-procedure-substep-group';

export const StepDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

export interface MdxDocProcedureStepProps {
    text: string;
    image?: string;
    isSubstep?: boolean;
    children: React.ReactNode;
}

export const MdxDocProcedureStep: React.FC<MdxDocProcedureStepProps> = ({ text, image, isSubstep = false, children }: MdxDocProcedureStepProps) => {
    const nonSubStepChildren: React.ReactNode[] = [];
    let substepGroup: React.ReactNode | null = null;
    let stepDescription: React.ReactNode | null = null;

    console.log('Child count for step:', React.Children.count(children));
    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
            console.log('>>TypeName:', child.type);

            if (child.type === MdxDocProcedureSubstepGroup) {
                // console.log('child is MdxDocProcedureSubstepGroup');
                if (substepGroup) {
                    throw new Error('Only one MdxDocProcedureSubstepGroup is allowed per MdxDocProcedureStep.');
                }
                substepGroup = child;
            } else if (child.type === MdxDocProcedureStep) {
                console.log("[MdxDocProcedureStep/Child_Ingored] MdxDocProcedureStep isn't a valid child.");
            } else if (child.type === StepDescription) {
                // console.log('child is StepDescription');
                if (stepDescription) {
                    throw new Error('Only one StepDescription is allowed per MdxDocProcedureStep.');
                }
                stepDescription = child;
            } else {
                // console.log('child is not MdxDocProcedureStep');
                nonSubStepChildren.push(child);
            }
        } else {
            console.log('child is not valid element');
            nonSubStepChildren.push(child);
        }
    });

    console.log('substepGroupContext for', text, isSubstep);
    if (isSubstep) {
        return (
            <li style={{ counterIncrement: 'substep 1' }} className="relative pl-8 gap-16 before:content-[counter(substep,lower-alpha)] before:absolute before:left-0 before:flex before:items-center before:justify-center before:w-[calc(1.375rem+1px)] before:h-[calc(1.375rem+1px)] before:text-sm before:font-bold before:text-slate-700 before:rounded-md before:shadow-sm before:ring-1 before:ring-slate-900/5 before:bg-blue-100 dark:before:bg-slate-700 dark:before:text-slate-200 dark:before:ring-0 dark:before:shadow-none dark:before:highlight-white/5 pb-4 last:pb-0 after:absolute after:top-[calc(1.875rem+1px)] after:bottom-0 after:left-[0.6875rem] after:w-px after:bg-slate-200 dark:after:bg-slate-200/5">
                <div className="col-span-2">
                    <h4 className="text-lg leading-6 text-slate-900 font-semibold mb-2 dark:text-slate-200">{text}</h4>
                    <div className="flex flex-col md:flex-row md:items-start">
                        <div className="prose prose-slate prose-sm dark:prose-dark align-text-top mb-2 md:w-3/4 md:mr-4">{stepDescription}</div>
                        <div>{image && <DocImage title={text} src={image} alt={text} triggerImageSize={200} popupImageSize={1000} />}</div>
                    </div>

                    {nonSubStepChildren}
                </div>
            </li>
        );
    }

    return (
        <li style={{ counterIncrement: 'step 1' }} className="last:pb-0 relative pl-8  gap-6 before:content-[counter(step)] before:absolute before:left-0 before:flex before:items-center before:justify-center before:w-[calc(1.375rem+1px)] before:h-[calc(1.375rem+1px)] before:text-sm before:font-bold before:text-slate-700 before:rounded-md before:shadow-sm before:ring-1 before:ring-slate-900/6 dark:before:bg-slate-700 dark:before:text-slate-200 dark:before:ring-0 dark:before:shadow-none dark:before:highlight-white/5 pb-2 after:absolute after:top-[calc(1.875rem+1px)] after:bottom-0 after:left-[0.6875rem] after:w-px after:bg-slate-300 dark:after:bg-slate-200/4">
            <div className="col-span-2">
                <h3 className="text-xl leading-6 text-slate-700 font-semibold mb-2 dark:text-slate-200">{text}</h3>
                <div className="flex items-center ">
                    <div className="prose prose-slate prose-sm dark:prose-dark">{stepDescription}</div>
                    {image && <DocImage title={text} src={image} alt={text} triggerImageSize={400} popupImageSize={1000} />}
                </div>
                {nonSubStepChildren}
                {substepGroup}
            </div>
        </li>
    );
};
