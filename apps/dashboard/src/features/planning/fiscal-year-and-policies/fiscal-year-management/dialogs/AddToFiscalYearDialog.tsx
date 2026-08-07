import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/fiscal-year-and-policies/utils';
import type { FiscalYear, ProcurementMethod } from '@/lib/fiscal-year-and-policies/types';

interface AddToFiscalYearDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMethodId: string;
  selectedMethod: ProcurementMethod | null;
  thresholdValue: number;
  availableFiscalYears: FiscalYear[];
  onConfirm: (selectedFYIds: string[]) => void;
}

export function AddToFiscalYearDialog({
  isOpen,
  onClose,
  selectedMethod,
  thresholdValue,
  availableFiscalYears,
  onConfirm,
}: AddToFiscalYearDialogProps) {
  const [selectedFYIds, setSelectedFYIds] = useState<Set<string>>(new Set());
  const [validationError, setValidationError] = useState<string>('');

  const handleCheckboxChange = (fyId: string, checked: boolean) => {
    const newSet = new Set(selectedFYIds);
    if (checked) {
      newSet.add(fyId);
    } else {
      newSet.delete(fyId);
    }
    setSelectedFYIds(newSet);
    setValidationError(''); // Clear error when user selects a FY
  };

  const handleConfirm = () => {
    if (selectedFYIds.size === 0) {
      setValidationError('Please select at least one fiscal year.');
      return;
    }

    onConfirm(Array.from(selectedFYIds));
    // Reset dialog state
    setSelectedFYIds(new Set());
    setValidationError('');
    onClose();
  };

  const handleCancel = () => {
    // Reset dialog state
    setSelectedFYIds(new Set());
    setValidationError('');
    onClose();
  };

  const getStatusBadgeColor = (status: FiscalYear['status']) => {
    switch (status) {
      case 'Closed':
        return 'bg-red-100 text-red-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'Setup':
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Procurement Method to Fiscal Year(s)</DialogTitle>
          <DialogDescription>
            Select fiscal year(s) to assign {selectedMethod?.name} with threshold{' '}
            {formatCurrency(thresholdValue)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fiscal Year Selection */}
          {availableFiscalYears.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <p className="text-sm text-slate-600">
                No unassigned fiscal years available.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-4">
              {availableFiscalYears.map((fy) => (
                <label
                  key={fy.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    id={`fy-${fy.id}`}
                    checked={selectedFYIds.has(fy.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(fy.id, checked as boolean)
                    }
                    aria-label={`Assign to FY${fy.year} - ${fy.status} status`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">FY{fy.year}</p>
                    <Badge className={`${getStatusBadgeColor(fy.status)} text-xs mt-1`}>
                      {fy.status}
                    </Badge>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}

          {/* Selection Summary */}
          {selectedFYIds.size > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Summary: {selectedFYIds.size} fiscal year(s) selected
              </p>
              <div className="space-y-1">
                {Array.from(selectedFYIds)
                  .map((id) => availableFiscalYears.find((fy) => fy.id === id))
                  .filter(Boolean)
                  .map((fy) => (
                    <p key={fy!.id} className="text-xs text-blue-800">
                      ✓ FY{fy!.year}
                    </p>
                  ))}
              </div>
            </div>
          )}

          {/* Assignment Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs font-medium text-slate-600 mb-1">Assignment Details</p>
            <p className="text-sm text-slate-900">
              <span className="font-semibold">{selectedMethod?.name}</span>
              <br />
              Threshold: {formatCurrency(thresholdValue)}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedFYIds.size === 0 || availableFiscalYears.length === 0}
          >
            Assign to {selectedFYIds.size || 'Selected'} FY(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
