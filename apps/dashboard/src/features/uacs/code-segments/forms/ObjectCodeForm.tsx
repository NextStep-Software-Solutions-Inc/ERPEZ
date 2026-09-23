import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import type { ObjectCode } from '../types/objectCodeTypes';

const createObjectCodeSchema = (isAddingChild: boolean) => {
  return z.object({
    parentId: isAddingChild
      ? z.string().min(1, 'Parent is required when adding a sub-object')
      : z.string().optional(),
    code: z.string().length(10, 'Code must be 10 digits'),
    name: z.string().min(3, 'Name must be at least 3 characters'),
    isActive: z.boolean(),
  });
};

export type ObjectCodeFormValues = z.infer<ReturnType<typeof createObjectCodeSchema>>;

interface ObjectCodeFormProps {
  onSubmit: (data: ObjectCodeFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  parentItem?: ObjectCode;
  allItems?: ObjectCode[];
}

export function ObjectCodeForm({
  onSubmit,
  onCancel,
  isLoading,
  parentItem,
  allItems = [],
}: ObjectCodeFormProps) {
  const isAddingChild = !!parentItem;

  // Generate next code based on parent code by treating the last 2 digits as a sequence
  const generateNextCode = (parent: ObjectCode): string => {
    const parentCode = parent.code;

    // If the parent code is too short to safely split into prefix + 2-digit sequence,
    // just return it unchanged.
    if (parentCode.length < 2) {
      return parentCode;
    }

    const prefix = parentCode.slice(0, -2);

    // Find existing sub-objects under this parent
    const siblings = allItems.filter((item) => item.parentId === parent.id);

    if (siblings.length === 0) {
      // First sub-object: start sequence at "01"
      return prefix + '01';
    } else {
      // Get the next sequence number from existing siblings (based on last 2 digits)
      const maxSiblingCode = siblings.reduce((max, sibling) => {
        const siblingNum = parseInt(sibling.code.slice(-2), 10);
        const maxNum = parseInt(max.slice(-2), 10);
        return siblingNum > maxNum ? sibling.code : max;
      }, parentCode);

      const nextNum = (parseInt(maxSiblingCode.slice(-2), 10) + 1)
        .toString()
        .padStart(2, '0');
      return prefix + nextNum;
    }
  };

  // Use allItems to generate parent suggestions
  const parentSuggestions = allItems.filter((item) => !item.parentId);

  const [parentInput, setParentInput] = useState(parentItem ? parentItem.name : '');
  const [showParentSuggestions, setShowParentSuggestions] = useState(false);

  const objectCodeSchema = createObjectCodeSchema(isAddingChild);

  // Generate next code if adding child
  const nextCode = isAddingChild && parentItem ? generateNextCode(parentItem) : '';

  const form = useForm<ObjectCodeFormValues>({
    resolver: zodResolver(objectCodeSchema),
    defaultValues: {
      code: nextCode,
      name: '',
      parentId: parentItem?.id || '',
      isActive: true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Parent ID with suggestions */}
        <FormField
          control={form.control}
          name={'parentId'}
          render={({ field }) => (
            <div className="relative">
              <label className="block text-sm font-medium">
                Parent {isAddingChild && <span className="text-red-500">*</span>}
                {!isAddingChild && <span className="text-gray-500">(optional)</span>}
              </label>
              <Input
                {...field}
                value={parentInput !== undefined ? parentInput : field.value}
                onChange={(e) => {
                  if (!isAddingChild) {
                    field.onChange(e.target.value);
                    setParentInput(e.target.value);
                    setShowParentSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (!isAddingChild) {
                    setShowParentSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowParentSuggestions(false), 150)}
                placeholder={isAddingChild ? 'Auto-filled - not changeable' : 'Search by parent name'}
                autoComplete="off"
                disabled={isAddingChild}
              />
              {!isAddingChild && showParentSuggestions && parentInput && (
                <div className="absolute z-50 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
                  {parentSuggestions
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(parentInput.toLowerCase()) ||
                        s.code.toLowerCase().includes(parentInput.toLowerCase())
                    )
                    .map((s) => (
                      <div
                        key={s.id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={() => {
                          // Set parent ID
                          field.onChange(s.id);
                          setParentInput(s.name);
                          setShowParentSuggestions(false);

                          // Auto-fill code based on selected parent
                          const nextCode = generateNextCode(s);

                          // Update form fields
                          form.setValue('code', nextCode);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="ml-2 text-xs text-gray-400">{s.code}</span>
                      </div>
                    ))}
                  {parentSuggestions.filter(
                    (s) =>
                      s.name.toLowerCase().includes(parentInput.toLowerCase()) ||
                      s.code.toLowerCase().includes(parentInput.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-gray-400 text-sm">No matches</div>
                  )}
                </div>
              )}
            </div>
          )}
        />
        {/* Code */}
        <FormField
          control={form.control}
          name={'code'}
          render={({ field }) => {
            const parentIdValue = form.getValues('parentId');
            const isParentSelected = !!parentIdValue && !isAddingChild;

            return (
              <div>
                <label className="block text-sm font-medium">
                  Code{' '}
                  {isParentSelected && (
                    <span className="text-gray-500 text-xs">(auto-generated)</span>
                  )}
                </label>
                <Input {...field} maxLength={10} disabled={isParentSelected} />
              </div>
            );
          }}
        />
        {/* Name */}
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input {...field} />
            </div>
          )}
        />
        {/* isActive as switch */}
        <FormField
          control={form.control}
          name={'isActive'}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <label className="text-sm">Active</label>
            </div>
          )}
        />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || (isAddingChild && !form.getValues('parentId'))}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
