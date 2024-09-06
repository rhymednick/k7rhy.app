// components/doc/mdx-doc-procedure.tsx
import React from 'react';
import { DocImage } from '@/components/doc/doc-image';
import { DocSection } from '@/components/doc/doc-section';
import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';
export interface MdxDocProcedureProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const MdxDocProcedure: React.FC<MdxDocProcedureProps> = (
    props: MdxDocProcedureProps
) => {
    // Validate that all children are of type MdxDocProcedureStep
    const steps = React.Children.map(props.children, (child) => {
        if (React.isValidElement(child) && child.type === MdxDocProcedureStep) {
            return child;
        } else {
            throw new Error(
                'MdxDocProcedure can only contain MdxDocProcedureStep components.'
            );
        }
    });

    const description: React.ReactNode = props.description
        ? props.description
        : null;

    return (
        <div>
            <DocSection title={props.title}>
                <div className="mb-2 md:mb-4">{description}</div>
                <ol
                    className="relative space-y-2 mb-8"
                    style={{ counterReset: 'step 0' }}
                >
                    {steps}
                </ol>
            </DocSection>
        </div>
    );
};

MdxDocProcedure.displayName = 'MdxDocProcedure';
