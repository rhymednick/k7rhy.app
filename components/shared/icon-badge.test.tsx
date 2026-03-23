import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { IconBadge } from './icon-badge';
import { Radio } from 'lucide-react';

describe('IconBadge', () => {
	it('applies default sky→emerald gradient', () => {
		const { container } = render(<IconBadge icon={Radio} />);
		const div = container.firstChild as HTMLElement;
		expect(div.className).toContain('from-sky-500');
		expect(div.className).toContain('to-emerald-600');
	});

	it('applies guitar sky→indigo gradient', () => {
		const { container } = render(<IconBadge icon={Radio} variant="guitar" />);
		const div = container.firstChild as HTMLElement;
		expect(div.className).toContain('from-sky-500');
		expect(div.className).toContain('to-indigo-600');
	});

	it('applies sm size classes', () => {
		const { container } = render(<IconBadge icon={Radio} size="sm" />);
		const div = container.firstChild as HTMLElement;
		expect(div.className).toContain('h-9');
		expect(div.className).toContain('w-9');
		expect(div.className).toContain('rounded-lg');
	});

	it('applies md size classes by default', () => {
		const { container } = render(<IconBadge icon={Radio} />);
		const div = container.firstChild as HTMLElement;
		expect(div.className).toContain('h-10');
		expect(div.className).toContain('w-10');
		expect(div.className).toContain('rounded-lg');
	});

	it('applies lg size classes', () => {
		const { container } = render(<IconBadge icon={Radio} size="lg" />);
		const div = container.firstChild as HTMLElement;
		expect(div.className).toContain('h-12');
		expect(div.className).toContain('w-12');
		expect(div.className).toContain('rounded-xl');
	});

	it('renders the icon', () => {
		const { container } = render(<IconBadge icon={Radio} />);
		expect(container.querySelector('svg')).toBeInTheDocument();
	});
});
