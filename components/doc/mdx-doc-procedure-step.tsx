// components/doc/mdx-doc-procedure-step.tsx
'use client';
import React, { useContext } from 'react';
import { DocImage } from '@/components/doc/doc-image';
import { MdxDocProcedureSubstepGroup, SubstepGroupContext } from '@/components/doc/mdx-doc-procedure-substep-group';

export interface MdxDocProcedureStepProps {
    text: string;
    image?: string;
    description?: string;
    children: React.ReactNode;
}

export const MdxDocProcedureStep: React.FC<MdxDocProcedureStepProps> = (props: MdxDocProcedureStepProps) => {
    const nonSubStepChildren: React.ReactNode[] = [];
    let substepGroup: React.ReactNode | null = null;

    console.log('Child count for step:', React.Children.count(props.children));
    React.Children.forEach(props.children, (child) => {
        if (React.isValidElement(child)) {
            console.log('componentTypeName:', child.props.componentTypeName);

            if (child.type === MdxDocProcedureSubstepGroup) {
                console.log('child is MdxDocProcedureSubstepGroup');
                if (substepGroup) {
                    throw new Error('Only one MdxDocProcedureSubstepGroup is allowed per MdxDocProcedureStep.');
                }
                substepGroup = child;
            } else if (child.type === MdxDocProcedureStep) {
                console.log('child is MdxDocProcedureStep');
                throw new Error(
                    'MdxDocProcedureStep is not a valid child a MdxDocProcedureStep component. Substeps must be wrapped in an MdxDocProcedureSubstepGroup component.'
                );
            } else {
                console.log('child is not MdxDocProcedureStep');
                nonSubStepChildren.push(child);
            }
        } else {
            console.log('child is not valid element');
            nonSubStepChildren.push(child);
        }
    });

    const image: React.ReactNode = props.image ? (
        // <DocImage
        //     src={props.image}
        //     title={props.text}
        //     alt={props.text}
        //     triggerImageSize={400}
        //     popupImageSize={1000}
        // />
        <img
            src={props.image}
            alt={props.text}
            width={200}
        />
    ) : null;

    const substepGroupContext = useContext(SubstepGroupContext);
    console.log('substepGroupContext for', props.text, substepGroupContext);
    if (substepGroupContext) {
        return (
            <li
                style={{ counterIncrement: 'substep 1' }}
                className="relative pl-8 gap-16 before:content-[counter(substep,lower-alpha)] before:absolute before:left-0 before:flex before:items-center before:justify-center before:w-[calc(1.375rem+1px)] before:h-[calc(1.375rem+1px)] before:text-sm before:font-bold before:text-slate-700 before:rounded-md before:shadow-sm before:ring-1 before:ring-slate-900/5 before:bg-blue-100 dark:before:bg-slate-700 dark:before:text-slate-200 dark:before:ring-0 dark:before:shadow-none dark:before:highlight-white/5 pb-4 last:pb-0 after:absolute after:top-[calc(1.875rem+1px)] after:bottom-0 after:left-[0.6875rem] after:w-px after:bg-slate-200 dark:after:bg-slate-200/5"
            >
                <div className="col-span-2">
                    <h4 className="text-lg leading-6 text-slate-900 font-semibold mb-2 dark:text-slate-200">
                        {props.text}
                    </h4>
                    <div className="md:clearfix">
                        <div className="mt-4 md:mt-0 md:float-right md:ml-4 flex-shrink-0">
                            {image}
                            {/* {props.image && (
                                <DocImage
                                    title={props.text}
                                    src={props.image}
                                    alt={props.text}
                                    triggerImageSize={200}
                                    popupImageSize={1000}
                                />
                            )} */}
                        </div>
                        <div className="prose prose-slate prose-sm dark:prose-dark mb-2 md:mr-4">
                            {/* {props.description} */}
                            {nonSubStepChildren}
                        </div>
                    </div>
                </div>
                <div className="clear-both" />
            </li>
        );
    }

    return (
        <li
            style={{ counterIncrement: 'step 1' }}
            className="last:pb-0 relative pl-8  gap-6 before:content-[counter(step)] before:absolute before:left-0 before:flex before:items-center before:justify-center before:w-[calc(1.375rem+1px)] before:h-[calc(1.375rem+1px)] before:text-sm before:font-bold before:text-slate-700 before:rounded-md before:shadow-sm before:ring-1 before:ring-slate-900/6 dark:before:bg-slate-700 dark:before:text-slate-200 dark:before:ring-0 dark:before:shadow-none dark:before:highlight-white/5 pb-2 after:absolute after:top-[calc(1.875rem+1px)] after:bottom-0 after:left-[0.6875rem] after:w-px after:bg-slate-300 dark:after:bg-slate-200/4"
        >
            <div className="col-span-2">
                <h3 className="text-xl leading-6 text-slate-700 font-semibold mb-2 dark:text-slate-200">
                    {props.text}
                </h3>
                <div className="flex items-center ">
                    <div className="prose prose-slate prose-sm dark:prose-dark">{props.description}</div>
                    <div>{image}</div>
                </div>
                {nonSubStepChildren}
                <SubstepGroupContext.Provider value={true}>{substepGroup}</SubstepGroupContext.Provider>
            </div>
        </li>
    );
};
