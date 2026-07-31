import { Suspense } from 'react';
import { RouteView } from '@/components/routes/route-view';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Profile...</div>}>
      <RouteView kind="profile" />
    </Suspense>
  );
}
