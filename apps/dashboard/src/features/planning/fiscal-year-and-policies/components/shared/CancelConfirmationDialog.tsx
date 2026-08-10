import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface CancelConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CancelConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
}: CancelConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Discard Changes?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            You have unsaved changes to this threshold. Discarding will remove all modifications.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            Keep Editing
          </Button>
          <Button
            onClick={onConfirm}
            color="destructive"
            size="sm"
          >
            Discard Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
