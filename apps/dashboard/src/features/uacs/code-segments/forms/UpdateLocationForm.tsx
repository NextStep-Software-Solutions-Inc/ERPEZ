import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'
import type { LocationCode } from '../types/locationCodeTypes'

const locationSchema = z.object({
  code: z.string().length(9, 'Code must be 9 digits'),
  name: z.string().min(2, 'Name is required'),
  region: z.string().optional(),
  province: z.string().optional(),
  municipality: z.string().optional(),
  isActive: z.boolean(),
})

export type UpdateLocationFormValues = z.infer<typeof locationSchema>

interface UpdateLocationFormProps {
  onSubmit: (data: UpdateLocationFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<LocationCode>
}

export function UpdateLocationForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: UpdateLocationFormProps) {
  const form = useForm<UpdateLocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      code: '',
      name: '',
      region: '',
      province: '',
      municipality: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code || '',
        name: initialData.name || '',
        region: initialData.description || '',
        province: '',
        municipality: '',
        isActive: initialData.isActive !== false,
      })
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code (9 digits)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter 9-digit code" maxLength={9} disabled={true} />
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
                <Input {...field} placeholder="Enter location code name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter region" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter province" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="municipality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Municipality (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter municipality" />
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
