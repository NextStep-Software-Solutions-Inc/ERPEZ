'use client';

import { CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { FiscalYear, DataRolloverOptions } from '@/lib/fiscal-year-and-policies/types';

interface RolloverCompletionModalProps {
  isOpen: boolean;
  sourceYear: FiscalYear | null;
  targetYear: FiscalYear | null;
  options: DataRolloverOptions;
  onClose: () => void;
}

export default function RolloverCompletionModal({
  isOpen,
  sourceYear,
  targetYear,
  options,
  onClose,
}: RolloverCompletionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">Rollover Complete!</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Data transfer completed successfully
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 py-4">
          {/* Transfer Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide">Transfer Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">From:</span>
                <span className="font-semibold text-blue-900">FY {sourceYear?.year || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-800">To:</span>
                <span className="font-semibold text-blue-900">FY {targetYear?.year || '—'}</span>
              </div>
            </div>
          </div>

          {/* Items Copied */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Items Copied</p>
            <div className="space-y-2">
              {options.copyOrgStructure && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-900">Organizational Structure</span>
                </div>
              )}
              {options.copyUACSLibrary && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-900">UACS Library</span>
                </div>
              )}
              {options.copyRecurringExpenses && (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-sm text-green-900">Recurring Expenses</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full"
            autoFocus
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
