import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ObjectCode } from '../types/objectCodeTypes'
import { autoTagExpenseClass } from '../../rules/utils/autoTaggingRules'

const objectCodeSchema = z.object({
  code: z.string().length(10, 'Code must be 10 digits'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  expenseClass: z.enum(['PS', 'MOOE', 'CO', 'FE']).optional(),
  isActive: z.boolean(),
})

export type UpdateObjectCodeFormValues = z.infer<typeof objectCodeSchema>

interface UpdateObjectCodeFormProps {
  onSubmit: (data: UpdateObjectCodeFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  initialData?: Partial<ObjectCode>
}

export function UpdateObjectCodeForm({
  onSubmit,
  onCancel,
  isLoading,
  initialData,
}: UpdateObjectCodeFormProps) {
  const form = useForm<UpdateObjectCodeFormValues>({
    resolver: zodResolver(objectCodeSchema),
    defaultValues: {
      code: '',
      name: '',
      expenseClass: undefined,
      isActive: true,
    },
  })

  const [autoTaggedClass, setAutoTaggedClass] = useState<string | undefined>()
  const [isManualOverride, setIsManualOverride] = useState(false)

  useEffect(() => {
    if (initialData) {
      form.reset({
        code: initialData.code || '',
        name: initialData.name || '',
        expenseClass: initialData.expenseClass as any,
        isActive: initialData.isActive !== false,
      })

      // Calculate auto-tagged value
      const code = initialData.code || ''
      const autoTagged = autoTagExpenseClass(code)
      setAutoTaggedClass(autoTagged)
      setIsManualOverride(autoTagged !== initialData.expenseClass)
    }
  }, [initialData, form])

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value
    form.setValue('code', newCode)

    // Recalculate auto-tagged value when code changes
    const autoTagged = autoTagExpenseClass(newCode)
    setAutoTaggedClass(autoTagged)

    // Auto-fill expense class if no manual override
    if (!isManualOverride && autoTagged) {
      form.setValue('expenseClass', autoTagged as any)
    }
  }

  const handleExpenseClassChange = (value: string) => {
    form.setValue('expenseClass', value as any)
    // Mark as manual override if different from auto-tagged
    if (value !== autoTaggedClass) {
      setIsManualOverride(true)
    } else {
      setIsManualOverride(false)
    }
  }

  const expenseClassOptions = [
    { value: 'PS', label: 'PS (Personal Services)' },
    { value: 'MOOE', label: 'MOOE (Maintenance & Other Operating Expenses)' },
    { value: 'CO', label: 'CO (Capital Outlay)' },
    { value: 'FE', label: 'FE (Financial Expenses)' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code (10 digits)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={handleCodeChange}
                  placeholder="Enter 10-digit code"
                  maxLength={10}
                  disabled={true}
                />
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
                <Input {...field} placeholder="Enter object code name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expenseClass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Class</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <select
                    value={field.value || ''}
                    onChange={(e) => handleExpenseClassChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Expense Class</option>
                    {expenseClassOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {autoTaggedClass && (
                    <div className="space-y-2">
                      {isManualOverride ? (
                        <Alert className="bg-yellow-50 border-yellow-200">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            <strong>Manual Override Applied:</strong> Code prefix suggests{' '}
                            <span className="font-semibold">{autoTaggedClass}</span>, but you
                            selected <span className="font-semibold">{field.value}</span>. This
                            will affect budget categorization.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-green-50 border-green-200">
                          <Check className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            Auto-tagged as <span className="font-semibold">{autoTaggedClass}</span>{' '}
                            based on code prefix.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
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
