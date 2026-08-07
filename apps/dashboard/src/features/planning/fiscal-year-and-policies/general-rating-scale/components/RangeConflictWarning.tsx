import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { decimalToPercentage, formatDecimalScore } from '@/lib/fiscal-year-and-policies/utils';

interface RangeConflictWarningProps {
  conflictingScaleName: string;
  conflictingMin: number;
  conflictingMax: number;
  suggestion: string;
  onDismiss: () => void;
}

/**
 * RangeConflictWarning - Presentational component for displaying range overlap warnings
 * 
 * Responsibilities:
 * - Display conflicting scale name and range
 * - Show suggested alternative range
 * - Provide dismiss button
 * 
 * Does NOT contain:
 * - Conflict detection logic
 * - Form handling
 * - State management (beyond local dismiss)
 */
export default function RangeConflictWarning({
  conflictingScaleName,
  conflictingMin,
  conflictingMax,
  suggestion,
  onDismiss,
}: RangeConflictWarningProps) {
  const conflictingMinPercentage = decimalToPercentage(conflictingMin);
  const conflictingMaxPercentage = decimalToPercentage(conflictingMax);

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-amber-900 mb-2">Range Overlap Detected</p>
          <p className="text-sm text-amber-800 mb-2">
            This range overlaps with <strong>{conflictingScaleName}</strong>{' '}
            <span className="font-mono">
              ({formatDecimalScore(conflictingMin)}–{formatDecimalScore(conflictingMax)} / {Math.round(conflictingMinPercentage)}–{Math.round(conflictingMaxPercentage)}%)
            </span>
          </p>
          <p className="text-sm text-amber-800 mb-4">
            <strong>Suggested fix:</strong> {suggestion}
          </p>
          <Button
            onClick={onDismiss}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-amber-100 border-amber-200 text-amber-900"
            aria-label="Acknowledge and close warning"
          >
            Acknowledge &amp; Try Different Range
          </Button>
        </div>
      </div>
    </div>
  );
}
