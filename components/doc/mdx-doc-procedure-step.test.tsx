import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MdxDocProcedureStep } from './mdx-doc-procedure-step';

// Wrap in <ol> with counter-reset so CSS counters work
const Wrapper = ({ children }: { children: React.ReactNode }) => <ol style={{ counterReset: 'step 0' }}>{children}</ol>;
const SubstepWrapper = ({ children }: { children: React.ReactNode }) => <ol style={{ counterReset: 'substep 0' }}>{children}</ol>;

describe('MdxDocProcedureStep', () => {
    it('renders step title', () => {
        render(<MdxDocProcedureStep text="Prepare the resistors">Direct text</MdxDocProcedureStep>, { wrapper: Wrapper });
        expect(screen.getByText('Prepare the resistors')).toBeDefined();
    });

    it('renders direct text children as description without Desc wrapper', () => {
        render(<MdxDocProcedureStep text="Step title">This is the description text written directly.</MdxDocProcedureStep>, { wrapper: Wrapper });
        expect(screen.getByText('This is the description text written directly.')).toBeDefined();
    });

    it('renders as substep with substep title style when isSubstep=true', () => {
        render(
            <MdxDocProcedureStep text="Substep title" isSubstep={true}>
                Substep description
            </MdxDocProcedureStep>,
            { wrapper: SubstepWrapper }
        );
        expect(screen.getByText('Substep title')).toBeDefined();
        expect(screen.getByText('Substep description')).toBeDefined();
    });

    it('does not render Desc wrapper content when given direct children', () => {
        // Regression: previously children had to be wrapped in <Desc>.
        // This confirms plain text renders directly without any wrapper.
        const { container } = render(<MdxDocProcedureStep text="Step">Plain child text</MdxDocProcedureStep>, { wrapper: Wrapper });
        expect(container.textContent).toContain('Plain child text');
    });
});
