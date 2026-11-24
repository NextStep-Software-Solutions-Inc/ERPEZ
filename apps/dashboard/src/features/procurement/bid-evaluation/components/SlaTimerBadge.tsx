import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useBidEvaluationStore } from '../store/bidEvaluationStore';

interface SlaTimerBadgeProps {
  projectId: string;
  supplierId: string;
  startDate: string; // ISO string
  slaDays: number;
  timerType: 'Bidder' | 'BAC';
  statusLabel: string;
}

export function SlaTimerBadge({
  projectId,
  supplierId,
  startDate,
  slaDays,
  timerType,
  statusLabel,
}: SlaTimerBadgeProps) {
  const logComplianceEvent = useBidEvaluationStore((state) => state.logComplianceEvent);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isOverdue: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isOverdue: false });

  useEffect(() => {
    const calculateTime = () => {
      const startMs = new Date(startDate).getTime();
      const allowedMs = slaDays * 24 * 60 * 60 * 1000;
      const endMs = startMs + allowedMs;
      const nowMs = Date.now();
      const diffMs = endMs - nowMs;

      if (diffMs <= 0) {
        // Overdue
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isOverdue: true,
        });

        // Trigger log compliance event once
        logComplianceEvent(
          projectId,
          supplierId,
          timerType === 'Bidder' ? 'BIDDER_SLA_EXPIRED' : 'BAC_SLA_EXPIRED',
          `SLA Timer EXPIRED: ${timerType} SLA deadline reached (${slaDays} days limit exceeded) while status was "${statusLabel}".`
        );
      } else {
        const totalSecs = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSecs / (24 * 3600));
        const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalSeconds: totalSecs,
          isOverdue: false,
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [startDate, slaDays, projectId, supplierId, timerType, statusLabel, logComplianceEvent]);

  if (timeLeft.isOverdue) {
    return (
      <Badge color="destructive" className="animate-pulse gap-1 font-mono font-medium shadow-sm">
        <span>🚨 Overdue: {timerType} SLA</span>
      </Badge>
    );
  }

  // Color logic:
  // Green > 3 days (259200 seconds)
  // Yellow <= 2 days (172800 seconds)
  // Otherwise between 2 and 3 days, it's also green or transitioning.
  // The acceptance criteria states: "Green for > 3 days remaining, Yellow for <= 2 days"
  const isYellow = timeLeft.totalSeconds <= 2 * 24 * 3600;
  const color = isYellow ? 'warning' : 'success';

  return (
    <Badge color={color} variant="outline" className="font-mono font-medium gap-1 shadow-sm">
      <span>⏳ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
      <span className="text-[10px] opacity-75">({timerType})</span>
    </Badge>
  );
}
