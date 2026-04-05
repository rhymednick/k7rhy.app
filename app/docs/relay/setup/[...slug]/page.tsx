import { renderPlatformSectionPage, generatePlatformSectionMetadata } from '../../_platform-section-page';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    return generatePlatformSectionMetadata(['setup', ...slug]);
}

export default async function SetupPage({ params }: Props) {
    const { slug } = await params;
    return renderPlatformSectionPage(['setup', ...slug]);
}
