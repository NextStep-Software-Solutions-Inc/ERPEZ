import { useState } from 'react';
import { ResponsiveDialog } from '@/components/ResponsiveDialog';
import { MfoPapForm, MfoPapFormValues } from '../forms/MfoPapForm';
import type { MfoPap } from '../types/mfoPapTypes';

interface AddMfoPapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: MfoPapFormValues) => Promise<void>;
  parentItem?: MfoPap;
  allItems?: MfoPap[];
}

export function AddMfoPapDialog({ open, onOpenChange, onSubmit, parentItem, allItems = [] }: AddMfoPapDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: MfoPapFormValues) => {
    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const dialogTitle = parentItem ? `Add Child MFO/PAP (Parent: ${parentItem.code})` : "Add MFO/PAP";
  const dialogDescription = parentItem 
    ? "Enter the details for the new child MFO/PAP under the selected parent."
    : "Enter the details for the new MFO/PAP.";

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      description={dialogDescription}
      size="sm"
      showCloseButton
    >
      <MfoPapForm
        onSubmit={handleFormSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isLoading}
        parentItem={parentItem}
        allItems={allItems}
      />
    </ResponsiveDialog>
  );
}
