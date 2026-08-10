
import { Switch } from '@/components/ui/switch'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FundSourceType } from '@/features/uacs/code-segments/types/fundingSourceTypes'
import { ParentFundingSourceSelect } from '../components/ParentFundingSourceSelect'

const fundingSourceSchema = z.object({
  parentId: z.string().optional().nullable().superRefine((val, ctx) => {
    if (val && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Parent ID must be a valid UUID if provided',
      })
    }
  }),
  code: z.string().min(1, 'Code is required').max(5, 'Code cannot exceed 5 characters'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum([
    FundSourceType.FUND_CLUSTER,
    FundSourceType.FINANCING_SOURCE,
    FundSourceType.AUTHORIZATION_CODE,
    FundSourceType.FUND_CATEGORY,
    FundSourceType.FUND_SUB_CATEGORY,
  ]),
  isActive: z.boolean(),
})

export type FundingSourceFormValues = z.infer<typeof fundingSourceSchema>

interface FundingSourceFormProps {
  onSubmit: (data: FundingSourceFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function FundingSourceForm({ onSubmit, onCancel, isLoading }: FundingSourceFormProps) {
  const form = useForm<FundingSourceFormValues>({
    resolver: zodResolver(fundingSourceSchema),
    defaultValues: { code: '', name: '', type: FundSourceType.FINANCING_SOURCE, parentId: '', isActive: true },
  })

  const typeOptions = [
    { value: FundSourceType.FUND_CLUSTER, label: 'Fund Cluster' },
    { value: FundSourceType.FINANCING_SOURCE, label: 'Financing Source' },
    { value: FundSourceType.AUTHORIZATION_CODE, label: 'Authorization Code' },
    { value: FundSourceType.FUND_CATEGORY, label: 'Fund Category' },
    { value: FundSourceType.FUND_SUB_CATEGORY, label: 'Fund Sub Category' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Parent Funding Source */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <ParentFundingSourceSelect
              value={field.value || ''}
              onChange={field.onChange}
              isRequired={false}
              disabled={isLoading}
              label="Parent Funding Source"
            />

          )}
        />
        {/* Code */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Code <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  maxLength={5} 
                  placeholder="Enter funding source code (max 5 characters)"
                  required
                />
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
              <FormLabel className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter funding source name"
                  required
                />
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
              <FormLabel className="text-sm font-medium">
                Type <span className="text-red-500">*</span>
              </FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormLabel className="text-sm font-medium">Active</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Form>
  );
}
