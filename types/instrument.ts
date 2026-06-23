export interface InstrumentSerial {
    serial: string;
    modelCode: string;
    modelDescription: string;
    year: number;
    index: number;
}

export interface InstrumentImage {
    src: string;
    alt: string;
}

export interface InstrumentRelatedLink {
    label: string;
    href: string;
}

export interface InstrumentFrontmatter {
    publish: boolean;
    name: string;
    completed: string;
    origin: string;
    theme: string;
    images: InstrumentImage[];
    related?: InstrumentRelatedLink;
    content: string;
}

export interface InstrumentRecord extends InstrumentFrontmatter, InstrumentSerial {}
