import { useForm } from 'react-hook-form';
import { Form, FormField } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const organizationSchema = z.object({
  parentId: z.string(),
  code: z.string().length(12, 'Code must be 12 digits'),
  name: z.string().min(2, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  isActive: z.boolean(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  onSubmit: (data: OrganizationFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OrganizationForm({ onSubmit, onCancel, isLoading }: OrganizationFormProps) {
  const parentSuggestions = [
    { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', name: 'Main Organization' },
    { id: 'b2c963f6-6afa-4e85-8f64-5717456b3fc2', name: 'Sub Organization' },
    { id: 'c963f66a-fa6b-4e85-8f64-5717456b3fc2', name: 'Other Org' },
  ];
  const typeOptions = [
    { value: 'Department', label: 'Department' },
    { value: 'Division', label: 'Division' },
    { value: 'Section', label: 'Section' },
    { value: 'Other', label: 'Other' },
  ];
  const [parentInput, setParentInput] = useState('');
  const [showParentSuggestions, setShowParentSuggestions] = useState(false);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { code: '', name: '', type: '', parentId: '', isActive: true },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Parent ID with suggestions */}
        <FormField
          control={form.control}
          name={"parentId"}
          render={({ field }) => (
            <div className="relative">
              <label className="block text-sm font-medium">Parent (optional)</label>
              <Input
                {...field}
                value={parentInput !== undefined ? parentInput : field.value}
                onChange={e => {
                  field.onChange(e.target.value);
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
          name={"code"}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Code</label>
              <Input {...field} maxLength={12} />
            </div>
          )}
        />
        {/* Name */}
        <FormField
          control={form.control}
          name={"name"}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input {...field} />
            </div>
          )}
        />
        {/* Type as dropdown */}
        <FormField
          control={form.control}
          name={"type"}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium">Type</label>
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
            </div>
          )}
        />
        {/* isActive as switch */}
        <FormField
          control={form.control}
          name={"isActive"}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <label className="text-sm">Active</label>
            </div>
          )}
        />
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Form>
  );
}
