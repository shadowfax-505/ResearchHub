import { RouteView } from '@/components/routes/route-view';

export default async function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RouteView kind="author" authorId={id} />;
}
