/**
 * Add RFQ to AOB Form
 * Allows users to search/filter RFQs and select categories to link
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useMemo } from 'react'
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

// ============================================
// VALIDATION SCHEMA
// ============================================

export const addRFQSchema = z.object({
  rfqId: z.string().min(1, 'RFQ is required'),
  selectedCategories: z.array(z.string()).min(1, 'Select at least one category'),
})

export type AddRFQFormValues = z.infer<typeof addRFQSchema>

// ============================================
// MOCK RFQs FOR DEMO
// ============================================

const MOCK_RFQS = [
  {
    id: 'rfq-001',
    rfqNumber: '2024-SVP-RFQ-001',
    title: 'IT Equipment and Office Furniture',
    status: 'Closed',
    closingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [
      { id: 'cat-001', name: 'IT Equipment' },
      { id: 'cat-002', name: 'Office Furniture' },
    ],
  },
  {
    id: 'rfq-002',
    rfqNumber: '2024-SVP-RFQ-002',
    title: 'Office Supplies and Consumables',
    status: 'Closed',
    closingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [
      { id: 'cat-003', name: 'Office Supplies' },
      { id: 'cat-004', name: 'Consumables' },
    ],
  },
  {
    id: 'rfq-003',
    rfqNumber: '2024-SVP-RFQ-003',
    title: 'Consulting Services - IT Infrastructure',
    status: 'Closed',
    closingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    categories: [
      { id: 'cat-005', name: 'Consulting Services' },
    ],
  },
]

// ============================================
// FORM COMPONENT
// ============================================

interface AddRFQFormProps {
  onSubmit: (data: AddRFQFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function AddRFQForm({ onSubmit, onCancel, isLoading = false }: AddRFQFormProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [submitError, setSubmitError] = useState<string>('')

  const form = useForm<AddRFQFormValues>({
    resolver: zodResolver(addRFQSchema),
    mode: 'onChange',
    defaultValues: {
      rfqId: '',
      selectedCategories: [],
    },
  })

  const selectedRfqId = form.watch('rfqId')
  const selectedRfq = MOCK_RFQS.find((rfq) => rfq.id === selectedRfqId)

  // Filter RFQs by search query
  const filteredRfqs = useMemo(() => {
    return MOCK_RFQS.filter(
      (rfq) =>
        !searchQuery ||
        rfq.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfq.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleFormSubmit = async (data: AddRFQFormValues) => {
    setSubmitError('')
    try {
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

        {/* RFQ Search */}
        <div className="space-y-3">
          <Label>Search RFQ</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by RFQ Number or Title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-500">
            Found {filteredRfqs.length} closed RFQ(s)
          </p>
        </div>

        {/* RFQ Selection */}
        <FormField
          control={form.control}
          name="rfqId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="required">Select RFQ</FormLabel>
              <div className="space-y-2 border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                {filteredRfqs.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No RFQs found</p>
                ) : (
                  filteredRfqs.map((rfq) => (
                    <div
                      key={rfq.id}
                      className={`p-3 border rounded cursor-pointer transition ${
                        field.value === rfq.id
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => {
                        field.onChange(rfq.id)
                        form.setValue('selectedCategories', [])
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="rfq"
                          checked={field.value === rfq.id}
                          onChange={() => {
                            field.onChange(rfq.id)
                            form.setValue('selectedCategories', [])
                          }}
                          disabled={isLoading}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{rfq.rfqNumber}</p>
                          <p className="text-sm text-gray-600">{rfq.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Closed: {new Date(rfq.closingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category Selection (if RFQ is selected) */}
        {selectedRfq && (
          <FormField
            control={form.control}
            name="selectedCategories"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="required">Select Categories</FormLabel>
                <FormDescription>
                  Choose which categories from this RFQ to include in the AOB
                </FormDescription>
                <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                  {selectedRfq.categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-3">
                      <Checkbox
                        id={category.id}
                        checked={field.value.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            field.onChange([...field.value, category.id])
                            return
                          }

                          if (checked === false) {
                            field.onChange(
                              field.value.filter((id) => id !== category.id)
                            )
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={category.id}
                        className="font-normal cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
            disabled={isLoading || !selectedRfq}
            className="gap-2"
          >
            {isLoading && <span className="animate-spin">⏳</span>}
            {isLoading ? 'Linking...' : 'Link RFQ'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
