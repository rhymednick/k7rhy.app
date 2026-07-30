import { redirect } from 'next/navigation';

/** Documentation is discovered from subject landings; keep concise /docs/... document URLs. */
export default function DocsIndexPage() {
    redirect('/ham-radio');
}
