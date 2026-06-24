const YEAR_ONLY = /^\d{4}$/;

export function formatInstrumentDate(value: string): string {
    if (YEAR_ONLY.test(value)) return value;

    return new Date(`${value}T00:00:00Z`).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

export function instrumentDateLabel(dateLabel?: string): string {
    const label = dateLabel?.trim();
    return label && label.length > 0 ? label : 'Completed';
}
