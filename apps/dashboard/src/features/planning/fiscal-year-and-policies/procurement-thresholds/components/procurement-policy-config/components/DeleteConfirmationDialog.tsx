import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ProcurementPolicyConfig } from '@/lib/fiscal-year-and-policies/types';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ProcurementPolicyConfig | null;
  modeName?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  config,
  modeName,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  if (!config) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Procurement Policy Config</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this procurement policy configuration for{' '}
            <span className="font-semibold text-foreground">{modeName}</span>?
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              <p>Min Amount: ₱{config.minAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              {config.maxAmount && (
                <p>Max Amount: ₱{config.maxAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              )}
            </div>
            <p className="mt-2 text-destructive">This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
