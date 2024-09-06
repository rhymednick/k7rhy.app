import React from 'react';
import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';

export interface MdxDocProcedureSubstepGroupProps {
    children: React.ReactNode;
}

export const MdxDocProcedureSubstepGroup: React.FC<MdxDocProcedureSubstepGroupProps> = ({ children }) => {
    // Validate that all children are of type MdxDocProcedureStep and add substep context

    return (
        <ol
            className="relative space-y-2 mt-4"
            style={{ counterReset: 'substep 0' }}
        >
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === MdxDocProcedureStep) {
                    return React.cloneElement(child, { isSubstep: true } as React.Attributes); // Pass context prop with type assertion
                } else {
                    console.log('Ignoring invalid child in MdxDocProcedureSubstepGroup');
                }
            })}
        </ol>
    );
};

MdxDocProcedureSubstepGroup.displayName = 'MdxDocProcedureSubstepGroup';
