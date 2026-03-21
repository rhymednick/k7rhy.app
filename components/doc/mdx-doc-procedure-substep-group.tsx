import React from 'react';
import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';

export interface MdxDocProcedureSubstepGroupProps {
    children: React.ReactNode;
}

export const MdxDocProcedureSubstepGroup: React.FC<MdxDocProcedureSubstepGroupProps> = ({ children }) => {
    return (
        <ol className="relative mt-4 border-l-2 border-violet-100 pl-4 dark:border-violet-900/40" style={{ counterReset: 'substep 0' }}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === MdxDocProcedureStep) {
                    return React.cloneElement(child, { isSubstep: true } as React.Attributes);
                }
            })}
        </ol>
    );
};

MdxDocProcedureSubstepGroup.displayName = 'MdxDocProcedureSubstepGroup';
