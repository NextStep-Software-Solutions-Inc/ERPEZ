/**
 * Fiscal Year Form Component
 * Uses TanStack Form with Zod validation
 */

import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FiscalYear } from '@/lib/fiscal-year-and-policies/shared';
import { createFiscalYearSchema, type CreateFiscalYearFormValues } from '@/lib/fiscal-year-and-policies/shared/types/validation';

interface FiscalYearFormProps {
  mode: 'create' | 'edit';
  initialValues?: FiscalYear;
  onSubmit: (data: CreateFiscalYearFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function FiscalYearForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: FiscalYearFormProps) {
  const form = useForm({
    defaultValues: initialValues
      ? {
          yearNumber: initialValues.yearNumber,
          description: initialValues.description || '',
          startDate: initialValues.startDate,
          endDate: initialValues.endDate,
        }
      : {
          yearNumber: new Date().getFullYear(),
          description: '',
          startDate: '',
          endDate: '',
        },
    onSubmit: async (values) => {
      await onSubmit(values);
    },
    validators: {
      onSubmit: createFiscalYearSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Year Number */}
      <form.Field name="yearNumber">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="yearNumber">Fiscal Year</Label>
            <Input
              id="yearNumber"
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              disabled={isLoading}
              placeholder="2024"
              min={2000}
              max={2100}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Description */}
      <form.Field name="description">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
              placeholder="Optional description for this fiscal year"
              rows={3}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Start Date */}
      <form.Field name="startDate">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* End Date */}
      <form.Field name="endDate">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

      {/* Form-level errors */}
      {form.state.submissionFailureCount > 0 && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">Failed to {mode === 'create' ? 'create' : 'update'} fiscal year</p>
          <p className="text-xs mt-1">Please review the form and try again</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </div>
    </form>
  );
}

