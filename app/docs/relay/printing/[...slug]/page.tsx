import { renderPlatformSectionPage, generatePlatformSectionMetadata } from '../../_platform-section-page';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    return generatePlatformSectionMetadata(['printing', ...slug]);
}

export default async function PrintingPage({ params }: Props) {
    const { slug } = await params;
    return renderPlatformSectionPage(['printing', ...slug]);
}
