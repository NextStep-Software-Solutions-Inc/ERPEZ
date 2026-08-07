import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import type { OrganizationCode } from '../types/organizationCodeTypes'

const organizationSchema = z.object({
  parentId: z.string().optional().nullable(),
  code: z.string().length(12, 'Code must be 12 digits'),
  name: z.string().min(2, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  isActive: z.boolean(),
})

export type UpdateOrganizationFormValues = z.infer<typeof organizationSchema>

interface UpdateOrganizationFormProps {
  onSubmit: (data: UpdateOrganizationFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<OrganizationCode>
}

export function UpdateOrganizationForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: UpdateOrganizationFormProps) {
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
  ]

  const [parentInput, setParentInput] = useState('');
  const [showParentSuggestions, setShowParentSuggestions] = useState(false);

  const form = useForm<UpdateOrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      parentId: '',
      code: '',
      name: '',
      type: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        parentId: initialData.parentId || '',
        code: initialData.code || '',
        name: initialData.name || '',
        type: initialData.type || initialData.description || '',
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
              <FormLabel>Parent (optional)</FormLabel>
              <FormControl>
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
              </FormControl>
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
              <FormMessage />
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code (12 digits)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter 12-digit code" maxLength={12} disabled={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter organization code name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Type</option>
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
