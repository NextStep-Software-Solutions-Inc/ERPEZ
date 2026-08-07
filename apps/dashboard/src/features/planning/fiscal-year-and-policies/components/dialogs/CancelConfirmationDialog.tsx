import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CancelConfirmationDialogProps {
  isOpen: boolean;
  functionType: 'strategic' | 'core' | 'support';
  onKeepEditing: () => void;
  onDiscard: () => void;
}

const functionLabels = {
  strategic: 'Strategic Functions',
  core: 'Core Functions',
  support: 'Support Functions',
};

/**
 * Confirmation dialog before discarding unsaved changes
 * Allows user to keep editing or discard all changes
 * Presentational component - no state management
 */
export default function CancelConfirmationDialog({
  isOpen,
  functionType,
  onKeepEditing,
  onDiscard,
}: CancelConfirmationDialogProps) {
  const functionLabel = functionLabels[functionType];

  return (
    <Dialog open={isOpen} onOpenChange={onKeepEditing}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Unsaved Changes</DialogTitle>
          <DialogDescription>
            You have unsaved changes to <strong>{functionLabel}</strong>. Keep editing or discard changes?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            onClick={onDiscard}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            aria-label="Discard changes"
          >
            Discard
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onKeepEditing}
            aria-label="Keep editing"
          >
            Keep Editing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
