import { RouteView } from '@/components/routes/route-view';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <RouteView kind="researcher" researcherSlug={slug} />;
}
