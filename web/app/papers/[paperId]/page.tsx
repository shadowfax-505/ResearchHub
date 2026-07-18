import { RouteView } from '@/components/routes/route-view';

export default async function Page({ params }: { params: Promise<{ paperId: string }> }) {
  const { paperId } = await params;
  return <RouteView kind="paper" paperId={paperId} />;
}
