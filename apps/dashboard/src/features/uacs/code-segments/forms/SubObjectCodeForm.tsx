/**
 * SubObjectCodeForm
 * Form for adding/editing sub-object codes under a parent
 * Sub-objects inherit expense class from parent
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { ObjectCode } from '../../code-segments/types/objectCodeTypes'
import { expenseClassColors } from '../../code-segments/utils/expenseClassColors'

const subObjectCodeSchema = z.object({
  code: z.string().length(10, 'Code must be exactly 10 digits').regex(/^\d+$/, 'Code must contain only digits'),
  name: z.string().min(2, 'Name is required'),
  description: z.string(),
  isActive: z.boolean(),
})

export type SubObjectCodeFormValues = z.infer<typeof subObjectCodeSchema>

interface SubObjectCodeFormProps {
  parentCode: ObjectCode
  initialValues?: SubObjectCodeFormValues
  onSubmit: (data: SubObjectCodeFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  isEditing?: boolean
}

export function SubObjectCodeForm({
  parentCode,
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}: SubObjectCodeFormProps) {
  const form = useForm<SubObjectCodeFormValues>({
    resolver: zodResolver(subObjectCodeSchema),
    defaultValues: initialValues || {
      code: '',
      name: '',
      description: '',
      isActive: true,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Parent Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-blue-600 mb-2">PARENT CODE</p>
          <div className="flex items-center gap-3">
            <div className="flex-grow">
              <div className="font-mono font-semibold text-sm">{parentCode.code}</div>
              <div className="text-sm text-gray-600">{parentCode.name}</div>
            </div>
            <Badge
              color="secondary"
              variant="soft"
              className={`text-white font-semibold ${expenseClassColors[parentCode.expenseClass]}`}
            >
              {parentCode.expenseClass}
            </Badge>
          </div>
          <p className="text-xs text-blue-600 mt-3">
            ℹ️ This sub-object will inherit the expense class <strong>{parentCode.expenseClass}</strong> from the
            parent.
          </p>
        </div>

        {/* Code Field */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Code <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="10 digits (e.g., 5010000001)"
                  maxLength={10}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Sub-object name"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Optional description for this sub-object"
                  className="resize-none"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Toggle */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
              </FormControl>
              <FormLabel className="m-0">Active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Sub-Object' : 'Add Sub-Object'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
