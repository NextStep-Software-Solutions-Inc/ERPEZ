import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { calculateTimeRemaining } from '@/lib/fiscal-year-and-policies/utils';

interface CountdownCellProps {
  deadline: string | Date;
  compact?: boolean;
}

export function CountdownCell({ deadline, compact = false }: CountdownCellProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (timeRemaining.isExpired) {
    return (
      <div className="flex items-center gap-1 text-destructive text-sm font-medium">
        <Clock className="h-3 w-3" />
        Expired
      </div>
    );
  }

  if (compact) {
    // Compact format: "5d 3h 20m" for table cells
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        <Clock className="h-3 w-3" />
        <span>
          {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
        </span>
      </div>
    );
  }

  // Full format with grid (optional, if needed for detail view)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1 text-sm font-medium">
        <Clock className="h-4 w-4" />
        Remaining
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs text-center">
        <div>
          <p className="font-bold">{timeRemaining.days}</p>
          <p className="text-muted-foreground">d</p>
        </div>
        <div>
          <p className="font-bold">{timeRemaining.hours}</p>
          <p className="text-muted-foreground">h</p>
        </div>
        <div>
          <p className="font-bold">{timeRemaining.minutes}</p>
          <p className="text-muted-foreground">m</p>
        </div>
        <div>
          <p className="font-bold">{timeRemaining.seconds}</p>
          <p className="text-muted-foreground">s</p>
        </div>
      </div>
    </div>
  );
}
