import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import type { ExpenseClass } from '../types/expenseClassTypes';

const expenseClassSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  type: z.number().int().min(1, 'Type is required'),
  isActive: z.boolean(),
});

export type ExpenseClassFormValues = z.infer<typeof expenseClassSchema>;

interface ExpenseClassFormProps {
  onSubmit: (data: ExpenseClassFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<ExpenseClass>;
}

export function ExpenseClassForm({ onSubmit, onCancel, isLoading, initialData }: ExpenseClassFormProps) {
  const isEditMode = !!initialData;

  const typeOptions = [
    { value: '1', label: 'Personnel Services (PS)' },
    { value: '2', label: 'Maintenance & Operations (MOOE)' },
    { value: '3', label: 'Capital Outlay (CO)' },
    { value: '4', label: 'Financial Expenditure (FE)' },
  ];

  const form = useForm<ExpenseClassFormValues>({
    resolver: zodResolver(expenseClassSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      type: 1,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        type: initialData.type || 1,
        isActive: initialData.isActive !== false,
      })
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., PS" disabled={isEditMode} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Personnel Services" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Select value={String(field.value)} onValueChange={(val) => field.onChange(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter description" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* isActive as switch */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
