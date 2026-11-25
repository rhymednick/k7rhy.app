import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { DocPage } from './doc-page';

describe('DocPage heading anchors', () => {
    const scrollIntoView = vi.fn();

    beforeEach(() => {
        scrollIntoView.mockClear();
        Element.prototype.scrollIntoView = scrollIntoView;
    });

    afterEach(() => {
        window.location.hash = '';
    });

    it('gives h2 and h3 headings an id made from their text', () => {
        const { container } = render(
            <DocPage title="Page">
                <h2>Tuning by ear</h2>
                <h3>Choose your bleed values</h3>
            </DocPage>
        );
        expect(container.querySelector('h2')).toHaveAttribute('id', 'tuning-by-ear');
        expect(container.querySelector('h3')).toHaveAttribute('id', 'choose-your-bleed-values');
    });

    it('scrolls to the heading named in the URL hash once the ids exist', () => {
        window.location.hash = '#tuning-by-ear';
        const { container } = render(
            <DocPage title="Page">
                <h2>Intro</h2>
                <h2>Tuning by ear</h2>
            </DocPage>
        );
        expect(scrollIntoView).toHaveBeenCalledTimes(1);
        expect(scrollIntoView.mock.contexts[0]).toBe(container.querySelector('#tuning-by-ear'));
    });

    it('does not scroll when there is no hash or the hash matches nothing', () => {
        render(
            <DocPage title="Page">
                <h2>Tuning by ear</h2>
            </DocPage>
        );
        expect(scrollIntoView).not.toHaveBeenCalled();
        window.location.hash = '#no-such-heading';
        render(
            <DocPage title="Page">
                <h2>Tuning by ear</h2>
            </DocPage>
        );
        expect(scrollIntoView).not.toHaveBeenCalled();
    });
});
