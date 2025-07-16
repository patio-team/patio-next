import { LoadingSpinner } from '@/components/ui/loading';

export default function Loading() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
