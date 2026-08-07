/**
 * Fiscal Year Dialog Component
 * Responsive modal/drawer using Dashtail components
 */

import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FiscalYearForm } from '../../forms/fiscal-year-form';
import {
  fiscalYearDialogAtom,
  editingFiscalYearIdAtom,
  resetFiscalYearFormAtom,
  resetFiscalYearDialogAtom,
} from '../atoms';
import type { CreateFiscalYearFormValues } from '@/lib/fiscal-year-and-policies/shared/types/validation';

// TODO: Import actual mutation hooks when available from shared-lib
// For now, mock success with toast
import { toast } from 'sonner'; // or your toast library

interface FiscalYearDialogProps {
  onSuccess?: () => void;
}

export function FiscalYearDialog({ onSuccess }: FiscalYearDialogProps) {
  const dialog = useAtomValue(fiscalYearDialogAtom);
  const editingFiscalYearId = useAtomValue(editingFiscalYearIdAtom);
  const setDialog = useSetAtom(fiscalYearDialogAtom);
  const resetForm = useSetAtom(resetFiscalYearFormAtom);
  const resetDialog = useSetAtom(resetFiscalYearDialogAtom);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mode = editingFiscalYearId ? 'edit' : 'create';

  const handleSubmit = async (data: CreateFiscalYearFormValues) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual mutation hook
      // For now, mock success
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success(
        mode === 'create'
          ? 'Fiscal year created successfully'
          : 'Fiscal year updated successfully'
      );

      resetForm();
      setDialog({ isOpen: false, mode: 'create' });
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to save fiscal year');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Check if form has unsaved changes
      const hasChanges = false; // TODO: Implement form dirty tracking
      if (hasChanges) {
        setShowConfirmation(true);
      } else {
        resetDialog();
      }
    } else {
      setDialog({ ...dialog, isOpen: true });
    }
  };

  const handleDiscardChanges = () => {
    resetDialog();
    setShowConfirmation(false);
  };

  return (
    <>
      <Dialog open={dialog.isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create Fiscal Year' : 'Edit Fiscal Year'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create'
                ? 'Add a new fiscal year to the system'
                : 'Update the fiscal year details'}
            </DialogDescription>
          </DialogHeader>

          <FiscalYearForm
            mode={mode}
            onSubmit={handleSubmit}
            onCancel={() => handleOpenChange(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Confirmation */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Do you want to discard them?
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end pt-4">
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              Discard
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
