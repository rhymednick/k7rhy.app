import { renderPlatformSectionPage, generatePlatformSectionMetadata } from '../../_platform-section-page';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    return generatePlatformSectionMetadata(['build', ...slug]);
}

export default async function BuildPage({ params }: Props) {
    const { slug } = await params;
    return renderPlatformSectionPage(['build', ...slug]);
}
