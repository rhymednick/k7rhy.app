import { renderPlatformSectionPage, generatePlatformSectionMetadata } from '../../_platform-section-page';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    return generatePlatformSectionMetadata(['assembly', ...slug]);
}

export default async function AssemblyPage({ params }: Props) {
    const { slug } = await params;
    return renderPlatformSectionPage(['assembly', ...slug]);
}
