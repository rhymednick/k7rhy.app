// components/doc/mdx-doc-procedure.tsx
import React from 'react';
import { DocSection } from '@/components/doc/doc-section';
import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';

export interface MdxDocProcedureProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const MdxDocProcedure: React.FC<MdxDocProcedureProps> = (props) => {
    return (
        <div>
            <DocSection title={props.title}>
                {props.description && (
                    <div className="mb-4 prose prose-slate prose-sm dark:prose-invert">{props.description}</div>
                )}
                <ol className="relative mb-8" style={{ counterReset: 'step 0' }}>
                    {React.Children.map(props.children, (child) => {
                        if (React.isValidElement(child) && child.type === MdxDocProcedureStep) {
                            return React.cloneElement(child, { isSubstep: false } as React.Attributes);
                        }
                    })}
                </ol>
            </DocSection>
        </div>
    );
};
