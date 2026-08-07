'use client';

import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';

interface RolloverStep3Props {
  formData: {
    sourceYearId: string;
    targetYearId: string;
    copyOrgStructure: boolean;
    copyUACSLibrary: boolean;
    copyRecurringExpenses: boolean;
  };
  sourceYear: FiscalYear | null;
  targetYear: FiscalYear | null;
  isRollingOver: boolean;
  rolloverProgress: number;
}

export default function RolloverStep3({
  formData,
  sourceYear,
  targetYear,
  isRollingOver,
  rolloverProgress,
}: RolloverStep3Props) {
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Transfer Summary</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">From:</span>
              <span className="font-semibold">FY {sourceYear?.year || '—'} ({sourceYear?.status || '—'})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">To:</span>
              <span className="font-semibold">FY {targetYear?.year || '—'} ({targetYear?.status || '—'})</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Items to Copy</p>
          <div className="space-y-2">
            {formData.copyOrgStructure && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm">Organizational Structure</span>
              </div>
            )}
            {formData.copyUACSLibrary && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm">UACS Library</span>
              </div>
            )}
            {formData.copyRecurringExpenses && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-sm">Recurring Expenses</span>
              </div>
            )}
          </div>
        </div>

        {isRollingOver && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-sm font-medium">Processing rollover...</p>
            </div>
            <div className="space-y-1">
              <Progress value={rolloverProgress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {rolloverProgress}% Complete
              </p>
            </div>
          </div>
        )}

        {!isRollingOver && rolloverProgress === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Confirm Before Proceeding</p>
              <p className="text-xs mt-1">
                This action will copy the selected data to the target fiscal year. Please ensure you have reviewed all settings.
              </p>
            </div>
          </div>
        )}

        {rolloverProgress === 100 && !isRollingOver && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium">Data Transfer Complete!</p>
              <p className="text-xs mt-1">
                All selected data has been successfully copied. The dialog will close shortly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
