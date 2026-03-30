import { redirect } from 'next/navigation';

export default function RelayPlatformPage() {
    // While only one model exists, redirect to it directly.
    // When multiple models exist, replace with a model-picker index.
    redirect('/docs/relay/lipstick');
}
