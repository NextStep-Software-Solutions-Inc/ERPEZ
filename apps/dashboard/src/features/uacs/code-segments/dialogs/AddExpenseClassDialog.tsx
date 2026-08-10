import { useState } from 'react';
import { ResponsiveDialog } from '@/components/ResponsiveDialog';
import { ExpenseClassForm, ExpenseClassFormValues } from '../forms/ExpenseClassForm';
import { toast } from 'sonner';

interface AddExpenseClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExpenseClassFormValues) => Promise<void>;
}

export function AddExpenseClassDialog({ open, onOpenChange, onSubmit }: AddExpenseClassDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (data: ExpenseClassFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast.success('Expense class created successfully!');
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to create expense class.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Expense Class"
      description="Enter the details for the new expense class."
      size="sm"
      showCloseButton
    >
      <ExpenseClassForm
        onSubmit={handleFormSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isLoading}
      />
    </ResponsiveDialog>
  );
}