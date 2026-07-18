import { RouteView } from '@/components/routes/route-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | ResearchHub',
  description: 'Communicate securely with your peers.',
};

export default function MessagesPage() {
  return <RouteView kind="messages" />;
}
