import { Skeleton } from '@/components/ui/skeleton';

export function MonthLoadingSkeleton() {
  return (
    <div className="mt-2 space-y-4">
      <div className="space-y-2 flex flex-col items-end">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
