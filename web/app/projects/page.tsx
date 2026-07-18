import { RouteView } from '@/components/routes/route-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | ResearchHub',
  description: 'Manage and discover research projects.',
};

export default function ProjectsPage() {
  return <RouteView kind="projects" />;
}
