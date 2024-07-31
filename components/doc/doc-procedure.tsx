import React from 'react';
import { cn } from "@/lib/utils"
import { DocImage } from '@/components/doc/doc-image';  


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

export const DocProcedure: React.FC<DocProcedureProps> = (props: DocProcedureProps) => {
    const renderStep = (step: DocProcedureStep, stepIndex: number): React.ReactNode => {
        const description: React.ReactNode = step.description ? step.description : null;
        const image: React.ReactNode = step.image ? <DocImage src={step.image} title={step.text} alt={step.text} triggerImageSize={400} popupImageSize={1000} /> : null;

        return (
            <div key={stepIndex} className="mb-2 md:mb-4 pl-1 relative flex items-start">
            <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-400 text-center font-bold mr-2">
                {stepIndex + 1}
                </div>
            </div>
            <div className="border-l-2 border-gray-400 pl-2">
                <h3 className={cn("text-xl font-bold tracking-tight")}>
                {step.text}
                </h3>
                <div className="flex items-center mt-2 mb-2">
                <div className="mr-2.5">
                    {description}
                </div>
                <div>
                    {image}
                </div>
                </div>
                {step.children}
                {step.substeps?.map((substep: DocProcedureSubstep, substepIndex: number) => (
                <div key={substepIndex} className="mb-2 mt-2 md:mb-4 md:mt-4 md:ml-4">

                    <div className="flex flex-col md:flex-row md:items-start">
                        <div className="align-text-top mb-2 md:w-3/4 md:mr-4">
                            <h4 className={cn("text-lg font-bold tracking-tight mb-2")}>
                                ({String.fromCharCode(97 + substepIndex)}) {substep.text}
                            </h4>
                            
                            {substep.description}
                            
                        </div>
                        <div className='ml-4 md:ml-0'>
                            {substep.image && <DocImage title={substep.text} src={substep.image} alt={substep.text} triggerImageSize={200} popupImageSize={1000} />}
                        </div>
                    </div>
                    {substep.children}
                </div>
                ))}
                
            </div>
            </div>
        );
    };

    const description: React.ReactNode = props.description ? props.description : null;

    return (
        <div>
            <h2 className={cn("text-2xl font-bold tracking-tight")}>
                {props.title}
            </h2>
            <div className='mb-2 md:mb-4'>{description}</div>
            {props.docProcedureSteps?.map((step, index) => renderStep(step, index))}
        </div>
    );
}