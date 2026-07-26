import Link from 'next/link';
import { AnnouncementFeed } from '@/components/community/announcement-feed';
import { PageHero } from '@/components/shared/page-hero';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { fetchRecentAnnouncements } from '@/lib/discord';

const ANNOUNCEMENT_CHANNEL_ID = '1432603806704603248';

export default async function CommunityPage() {
    const announcements = await fetchRecentAnnouncements(ANNOUNCEMENT_CHANNEL_ID, 10);

    return (
        <main className="flex min-h-screen flex-col gap-10 px-4 pb-24 pt-8 md:px-12 lg:px-20">
            <PageHero
                badge="Community"
                title="Follow the work. Join the conversation."
                description="The K7RHY Discord is where new work is announced, ideas are explored, and builders compare notes. Announcements are shown here read-only; discussion happens on the server."
                actions={
                    <Button asChild>
                        <Link href={siteConfig.links.discord}>Join the K7RHY Discord</Link>
                    </Button>
                }
            />
            <section className="mx-auto w-full max-w-4xl">
                <h2 className="mb-2 text-2xl font-semibold tracking-tight">Recent announcements</h2>
                <p className="mb-6 text-muted-foreground">The newest posts from the Discord announcement channel.</p>
                <AnnouncementFeed result={announcements} />
            </section>
        </main>
    );
}
