import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function LoadingScreen() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
