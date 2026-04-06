import { renderPlatformSectionPage, generatePlatformSectionMetadata } from '../../_platform-section-page';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    return generatePlatformSectionMetadata(['electronics', ...slug]);
}

export default async function ElectronicsPage({ params }: Props) {
    const { slug } = await params;
    return renderPlatformSectionPage(['electronics', ...slug]);
}
