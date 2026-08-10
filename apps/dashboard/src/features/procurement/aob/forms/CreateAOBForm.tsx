/**
 * Create AOB Form
 * React Hook Form with Zod validation
 * 
 * Fields: AOB Number, Description, Date, Opening Date, Award Criterion
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { AwardCriterion } from '../types/aobTypes'

// ============================================
// VALIDATION SCHEMA
// ============================================

export const createAOBSchema = z.object({
  aobNumber: z
    .string()
    .min(1, 'AOB Number is required')
    .max(50, 'AOB Number cannot exceed 50 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  date: z
    .string()
    .min(1, 'AOB Date is required'),
  openingDate: z
    .string()
    .min(1, 'Opening Date is required'),
  awardCriterion: z
    .string()
    .min(1, 'Award Criterion is required'),
})

export type CreateAOBFormValues = z.infer<typeof createAOBSchema>

// ============================================
// FORM COMPONENT
// ============================================

interface CreateAOBFormProps {
  onSubmit: (data: CreateAOBFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CreateAOBForm({ onSubmit, onCancel, isLoading = false }: CreateAOBFormProps) {
  const [submitError, setSubmitError] = useState<string>('')

  const form = useForm<CreateAOBFormValues>({
    resolver: zodResolver(createAOBSchema),
    mode: 'onChange',
    defaultValues: {
      aobNumber: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      openingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      awardCriterion: AwardCriterion.LCRB,
    },
  })

  const handleFormSubmit = async (data: CreateAOBFormValues) => {
    setSubmitError('')
    try {
      // Validate opening date is after AOB date
      const aobDate = new Date(data.date)
      const openDate = new Date(data.openingDate)

      if (openDate <= aobDate) {
        setSubmitError('Opening Date must be after AOB Date')
        return
      }

      onSubmit(data)
    } catch (_error) {
      setSubmitError('An error occurred. Please try again.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Error Alert */}
        {submitError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {submitError}
          </div>
        )}

        {/* AOB Number */}
        <FormField
          control={form.control}
          name="aobNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">AOB Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., 2024-SVP-AOB-001"
                  disabled={isLoading}
                  type="text"
                  autoComplete="off"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Unique identifier for this Abstract of Bids
              </FormDescription>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the procurement (optional)"
                  disabled={isLoading}
                  className="min-h-24 resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional context or title for this AOB
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* AOB Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">AOB Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      disabled={isLoading}
                      {...field}
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </FormControl>
                <FormDescription>
                  When the AOB was created
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Opening Date */}
          <FormField
            control={form.control}
            name="openingDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Opening Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      disabled={isLoading}
                      {...field}
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </FormControl>
                <FormDescription>
                  When bids will be opened (must be after AOB Date)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Award Criterion */}
        <FormField
          control={form.control}
          name="awardCriterion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Award Criterion</FormLabel>
              <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select award criterion" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={AwardCriterion.LCRB}>
                    LCRB - Lowest Calculated and Responsive Bid
                  </SelectItem>
                  <SelectItem value={AwardCriterion.MEARB}>
                    MEARB - Most Economically Advantageous Responsive Bid
                  </SelectItem>
                  <SelectItem value={AwardCriterion.MARB}>
                    MARB - Most Advantageous Responsive Bid
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Determines how winning bids will be selected
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
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
            className="gap-2"
          >
            {isLoading && <span className="animate-spin">⏳</span>}
            {isLoading ? 'Creating...' : 'Create AOB'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
