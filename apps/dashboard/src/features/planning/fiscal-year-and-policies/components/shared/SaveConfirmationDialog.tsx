import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ThresholdChangePreview } from '@/lib/fiscal-year-and-policies/types';

interface SaveConfirmationDialogProps {
  isOpen: boolean;
  preview: ThresholdChangePreview | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SaveConfirmationDialog({
  isOpen,
  preview,
  onConfirm,
  onCancel,
}: SaveConfirmationDialogProps) {
  if (!preview) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Confirm Changes</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            Review the changes for <span className="font-medium text-foreground">{preview.methodName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Change Preview */}
        <div className="space-y-3 bg-default-50 rounded-lg p-3 border border-default-200">
          {/* Min Change */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Minimum</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{preview.oldMin}</span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className="text-sm font-semibold text-primary">{preview.newMin}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-default-200" />

          {/* Max Change */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase">Maximum</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{preview.oldMax}</span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className="text-sm font-semibold text-primary">{preview.newMax}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            color="primary"
            size="sm"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
