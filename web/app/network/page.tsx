import { RouteView } from '@/components/routes/route-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Network | ResearchHub',
  description: 'Discover and connect with researchers in your field.',
};

export default function NetworkPage() {
  return <RouteView kind="network" />;
}
