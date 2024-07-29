/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import Image from 'next/image'
import { Balancer } from "react-wrap-balancer"
import { cn } from "@/lib/utils"

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
        const image: React.ReactNode = step.image ? <Image src={step.image} alt={step.text} width={400} height={400} /> : null;

        return (
            <div key={stepIndex} className="mb-4 pl-1 relative flex items-start">
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
                <div key={substepIndex} className="mb-2 mt-2 mr-2 ml-4">
                    <h4 className={cn("text-lg font-bold tracking-tight")}>
                    ({String.fromCharCode(97 + substepIndex)}) {substep.text}
                    </h4>
                    <div className="flex items-center">
                    <div className="mr-2">
                        {substep.description}
                    </div>
                    <div>
                        {substep.image && <Image src={substep.image} alt={substep.text} width={200} height={200} />}
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
            <div className='mb-4'>{description}</div>
            {props.docProcedureSteps?.map((step, index) => renderStep(step, index))}
        </div>
    );
}