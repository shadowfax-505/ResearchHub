import { RouteView } from '@/components/routes/route-view';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RouteView kind="paper" paperId={id} />;
}
