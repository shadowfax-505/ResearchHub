import { RouteView } from '@/components/routes/route-view';
import { AdminOnly } from '@/components/auth/admin-only';

export default function Page() {
  return (
    <AdminOnly>
      <RouteView kind="dashboard" />
    </AdminOnly>
  );
}
