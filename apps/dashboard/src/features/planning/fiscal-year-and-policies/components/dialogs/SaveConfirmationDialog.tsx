import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SaveConfirmationDialogProps {
  isOpen: boolean;
  functionType: 'strategic' | 'core' | 'support';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const functionLabels = {
  strategic: 'Strategic Functions',
  core: 'Core Functions',
  support: 'Support Functions',
};

/**
 * Confirmation dialog before saving function configuration changes
 * Presentational component - no state management
 */
export default function SaveConfirmationDialog({
  isOpen,
  functionType,
  onConfirm,
  onCancel,
  isLoading = false,
}: SaveConfirmationDialogProps) {
  const functionLabel = functionLabels[functionType];

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Save Changes</DialogTitle>
          <DialogDescription>
            Are you sure you want to save changes to <strong>{functionLabel}</strong>?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Cancel save"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label={`Save ${functionLabel} configuration`}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
