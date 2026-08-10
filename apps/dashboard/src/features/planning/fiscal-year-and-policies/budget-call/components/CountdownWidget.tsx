import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateTimeRemaining } from '@/lib/fiscal-year-and-policies/utils';

interface CountdownWidgetProps {
  deadline: Date | string;
  title?: string;
}

export function CountdownWidget({ deadline, title = 'Time Remaining' }: CountdownWidgetProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(deadline));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(deadline));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  if (timeRemaining.isExpired) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-destructive">Deadline Passed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{timeRemaining.days}</p>
            <p className="text-xs text-muted-foreground">Days</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{timeRemaining.hours}</p>
            <p className="text-xs text-muted-foreground">Hours</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{timeRemaining.minutes}</p>
            <p className="text-xs text-muted-foreground">Minutes</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{timeRemaining.seconds}</p>
            <p className="text-xs text-muted-foreground">Seconds</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
