'use client';
import React, { createContext } from 'react';
import { MdxDocProcedureStep } from '@/components/doc/mdx-doc-procedure-step';

export interface MdxDocProcedureSubstepGroupProps {
    children: React.ReactElement<typeof MdxDocProcedureStep>[];
}
export const SubstepGroupContext = createContext<boolean>(false);

export const MdxDocProcedureSubstepGroup: React.FC<
    MdxDocProcedureSubstepGroupProps
> = (props: MdxDocProcedureSubstepGroupProps) => {
    return (
        <ol
            className="relative space-y-2 mt-4"
            style={{ counterReset: 'substep 0' }}
        >
            <SubstepGroupContext.Provider value={true}>
                {props.children}
            </SubstepGroupContext.Provider>
        </ol>
    );
};

MdxDocProcedureSubstepGroup.displayName = 'MdxDocProcedureSubstepGroup';
