import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import type { LocationCode } from '../types/locationCodeTypes';

const locationSchema = z.object({
  parentId: z.string().optional().nullable(),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(2, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  isActive: z.boolean(),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

interface LocationFormProps {
  onSubmit: (data: LocationFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<LocationCode>;
}

export function LocationForm({ onSubmit, onCancel, isLoading, initialData }: LocationFormProps) {
  const isEditMode = !!initialData;
  
  const parentSuggestions = [
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Main Location' },
    { id: 'b2c963f6-6afa-4e85-8f64-5717456b3fc2', name: 'Sub Location' },
    { id: 'c963f66a-fa6b-4e85-8f64-5717456b3fc2', name: 'Other Location' },
  ];
  const typeOptions = [
    { value: 'Region', label: 'Region' },
    { value: 'Province', label: 'Province' },
    { value: 'Municipality', label: 'Municipality' },
    { value: 'Barangay', label: 'Barangay' },
    { value: 'Other', label: 'Other' },
  ];
  const [parentInput, setParentInput] = useState('');
  const [showParentSuggestions, setShowParentSuggestions] = useState(false);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { 
      code: '', 
      name: '', 
      type: '', 
      parentId: '', 
      isActive: true 
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code || '',
        name: initialData.name || '',
        type: initialData.type || '',
        parentId: initialData.parentId || '',
        isActive: initialData.isActive !== false,
      })
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Parent ID with suggestions */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <div className="relative">
              <label className="block text-sm font-medium">Parent (optional)</label>
              <Input
                {...field}
                value={parentInput !== undefined ? parentInput : field.value || ''}
                onChange={e => {
                  field.onChange(e.target.value || null);
                  setParentInput(e.target.value);
                  setShowParentSuggestions(true);
                }}
                onFocus={() => setShowParentSuggestions(true)}
                onBlur={() => setTimeout(() => setShowParentSuggestions(false), 150)}
                placeholder="Search by parent name"
                autoComplete="off"
              />
              {showParentSuggestions && parentInput && (
                <div className="absolute z-50 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-y-auto">
                  {parentSuggestions
                    .filter(s =>
                      s.name.toLowerCase().includes(parentInput.toLowerCase()) ||
                      s.id.toLowerCase().includes(parentInput.toLowerCase())
                    )
                    .map(s => (
                      <div
                        key={s.id}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onMouseDown={() => {
                          field.onChange(s.id);
                          setParentInput(s.name);
                          setShowParentSuggestions(false);
                        }}
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="ml-2 text-xs text-gray-400">{s.id}</span>
                      </div>
                    ))}
                  {parentSuggestions.filter(s =>
                    s.name.toLowerCase().includes(parentInput.toLowerCase()) ||
                    s.id.toLowerCase().includes(parentInput.toLowerCase())
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter location code" disabled={isEditMode} />
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
                <Input {...field} placeholder="Enter location name" />
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
                <Select value={field.value} onValueChange={field.onChange}>
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
