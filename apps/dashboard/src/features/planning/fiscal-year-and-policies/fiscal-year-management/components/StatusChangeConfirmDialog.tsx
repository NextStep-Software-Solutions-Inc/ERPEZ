import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/types';
import { formatStatusText } from '../utils/validation';

interface StatusChangeConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingChange: {
    fiscalYear: FiscalYear;
    newStatus: FiscalYear['status'];
  } | null;
  warning: string;
  onConfirm: () => void;
}

/**
 * Dialog component for confirming fiscal year status changes
 */
export function StatusChangeConfirmDialog({
  open,
  onOpenChange,
  pendingChange,
  warning,
  onConfirm,
}: StatusChangeConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
          <AlertDialogDescription>{warning}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {pendingChange && (
              <>
                Changing FY {pendingChange.fiscalYear.year} from{' '}
                <span className="font-semibold">
                  {formatStatusText(pendingChange.fiscalYear.status)}
                </span>{' '}
                to{' '}
                <span className="font-semibold">
                  {formatStatusText(pendingChange.newStatus)}
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Change
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
