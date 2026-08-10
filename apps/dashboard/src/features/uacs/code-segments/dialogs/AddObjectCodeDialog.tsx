import { useState } from 'react';
import { ResponsiveDialog } from '@/components/ResponsiveDialog';
import { ObjectCodeForm, ObjectCodeFormValues } from '../forms/ObjectCodeForm';
import { ExpenseClass } from '../types/commonTypes';
import type { ObjectCode } from '../types/objectCodeTypes';
import { autoTagExpenseClass } from '../../rules/utils/autoTaggingRules';

interface AddObjectCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allObjectCodes?: ObjectCode[];
  parentItem?: ObjectCode;
  onObjectCodeAdded?: (newCode: ObjectCode) => void;
}

export function AddObjectCodeDialog({
  open,
  onOpenChange,
  allObjectCodes = [],
  parentItem,
  onObjectCodeAdded,
}: AddObjectCodeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ObjectCodeFormValues) => {
    setIsLoading(true);
    try {
      // Determine expense class: auto-tag from code, inherit from parent, or default
      const autoTaggedClass = autoTagExpenseClass(data.code);
      const expenseClass = autoTaggedClass || parentItem?.expenseClass || ExpenseClass.PS;

      // When adding a child via parentItem, mark it as subsidiary and set parentId
      const isSubsidiary = !!parentItem;
      const parentId = parentItem?.id;

      const newCode: ObjectCode = {
        id: `${Date.now()}`,
        ...data,
        expenseClass,
        isSubsidiary,
        parentId,
        fiscalYear: new Date().getFullYear(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onObjectCodeAdded?.(newCode);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const dialogTitle = parentItem
    ? `Add Sub-Object Code (Parent: ${parentItem.code})`
    : 'Add Object Code';
  const dialogDescription = parentItem
    ? `Enter details for the new sub-object code under parent ${parentItem.code}. It will be marked as subsidiary and inherit expense class: ${parentItem.expenseClass}.`
    : 'Enter the details for the new object code. Expense class will be auto-tagged based on code prefix.';

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={dialogTitle}
      description={dialogDescription}
      size="sm"
      showCloseButton
    >
      <ObjectCodeForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={isLoading}
        parentItem={parentItem}
        allItems={allObjectCodes}
      />
    </ResponsiveDialog>
  );
}