import React from 'react';
import { DocImage } from '@/components/doc/doc-image';
import { DocSection } from "@/components/doc/doc-section";

export interface DocProcedureSubstep {
    text: string;
    description?: string;
    image?: string;
    children?: React.ReactNode;
}

export interface DocProcedureStep {
    text: string;
    description?: string;
    image?: string;
    substeps?: DocProcedureSubstep[];
    children?: React.ReactNode;
}

export interface DocProcedureProps {
    title: string;
    description?: string;
    docProcedureSteps?: DocProcedureStep[];
}

const renderSubsteps = (substeps?: DocProcedureSubstep[]): React.ReactNode => {
    if (!substeps) {
        return null;
    }
    return (
        <ol className="relative space-y-2 mt-4" style={{ counterReset: 'substep 0' }}>
            {substeps.map((substep: DocProcedureSubstep, substepIndex: number) => (
                <li
                    key={substepIndex}
                    style={{ counterIncrement: 'substep 1' }}
                    className="relative pl-8 xl:grid grid-cols-5 gap-16 before:content-[counter(substep,lower-alpha)] before:absolute before:left-0 before:flex before:items-center before:justify-center before:w-[calc(1.375rem+1px)] before:h-[calc(1.375rem+1px)] before:text-sm before:font-bold before:text-slate-700 before:rounded-md before:shadow-sm before:ring-1 before:ring-slate-900/5 before:bg-blue-100 dark:before:bg-slate-700 dark:before:text-slate-200 dark:before:ring-0 dark:before:shadow-none dark:before:highlight-white/5 pb-4 last:pb-0 after:absolute after:top-[calc(1.875rem+1px)] after:bottom-0 after:left-[0.6875rem] after:w-px after:bg-slate-200 dark:after:bg-slate-200/5"
                >
                    <div className="col-span-2">
                        <h5 className="text-base leading-6 text-slate-900 font-semibold mb-2 dark:text-slate-200">
                            {substep.text}
                        </h5>
                        <div className="flex flex-col md:flex-row md:items-start">
                            <div className="prose prose-slate prose-sm dark:prose-dark align-text-top mb-2 md:w-3/4 md:mr-4">
                                {substep.description}
                            </div>
                            <div>
                                {substep.image && (
                                    <DocImage
                                        title={substep.text}
                                        src={substep.image}
                                        alt={substep.text}
                                        triggerImageSize={200}
                                        popupImageSize={1000}
                                    />
                                )}
                            </div>
                        </div>

                        {substep.children}
                    </div>
                </li>
            ))}
        </ol>
    );
};

export const DocProcedure: React.FC<DocProcedureProps> = (props: DocProcedureProps) => {
    const renderStep = (step: DocProcedureStep, stepIndex: number): React.ReactNode => {
        const description: React.ReactNode = step.description ? step.description : null;
        const image: React.ReactNode = step.image ? <DocImage src={step.image} title={step.text} alt={step.text} triggerImageSize={400} popupImageSize={1000} /> : null;
        return (
            <li key={stepIndex} style={{ counterIncrement: 'step 1' }} className="last:pb-0 relative pl-8 xl:grid grid-cols-5 gap-6 before:content-[counter(step)] before:absolute before:left-0 before:flex before:items-center before:justify-center before:w-[calc(1.375rem+1px)] before:h-[calc(1.375rem+1px)] before:text-sm before:font-bold before:text-slate-700 before:rounded-md before:shadow-sm before:ring-1 before:ring-slate-900/5 dark:before:bg-slate-700 dark:before:text-slate-200 dark:before:ring-0 dark:before:shadow-none dark:before:highlight-white/5 pb-2 after:absolute after:top-[calc(1.875rem+1px)] after:bottom-0 after:left-[0.6875rem] after:w-px after:bg-slate-200 dark:after:bg-slate-200/5">
                <div className="col-span-2">
                    <h4 className="text-lg leading-6 text-slate-900 font-semibold mb-2 dark:text-slate-200">
                        {step.text}
                    </h4>
                    <div className="flex items-center ">
                        <div className="prose prose-slate prose-sm dark:prose-dark">
                            {description}
                        </div>
                        <div>
                            {image}
                        </div>
                    </div>
                    {step.children}

                    {renderSubsteps(step.substeps)}
                </div>
            </li>
        );
    };

    const description: React.ReactNode = props.description ? props.description : null;

    return (
        <div>
            <DocSection title={props.title}>
                <div className="mb-2 md:mb-4">{description}</div>
                <ol className="relative space-y-2 mb-8" style={{ counterReset: 'step 0' }}>
                    {props.docProcedureSteps?.map((step, index) => renderStep(step, index))}
                </ol>
            </DocSection>
        </div>
    );
};