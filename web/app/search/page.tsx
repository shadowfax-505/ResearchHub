import { RouteView } from '@/components/routes/route-view';

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <RouteView kind="search" searchQuery={q} />;
}
