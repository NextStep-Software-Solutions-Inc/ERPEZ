import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const createOPCRActivityExpenditureSchema = {
  amount: { required: true, min: 0.01 },
  description: { required: true, minLength: 1 },
  date: { required: true },
}

export type CreateOPCRActivityExpenditureValues = {
  amount: number
  description: string
  date: string
}

type FormErrors = Partial<Record<keyof CreateOPCRActivityExpenditureValues, string>>

interface CreateOPCRActivityExpenditureFormProps {
  onSubmit: (data: CreateOPCRActivityExpenditureValues) => void
  isSubmitting?: boolean
  onFormChange?: (hasChanges: boolean) => void
}

export default function CreateOPCRActivityExpenditureForm({
  onSubmit,
  isSubmitting = false,
  onFormChange,
}: CreateOPCRActivityExpenditureFormProps) {
  const [formData, setFormData] = useState<CreateOPCRActivityExpenditureValues>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Track form changes for unsaved changes warning
  useEffect(() => {
    const hasChanges = formData.amount !== 0 || formData.description.trim() !== '' || formData.date !== new Date().toISOString().split('T')[0]
    onFormChange?.(hasChanges)
  }, [formData, onFormChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: FormErrors = {}

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  const handleChange = (field: keyof CreateOPCRActivityExpenditureValues, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Amount ($)</label>
        <Input
          type="number"
          step="0.01"
          placeholder="Enter expenditure amount"
          value={formData.amount}
          onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
        />
        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          placeholder="Enter expenditure description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <Input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Expenditure'}
        </Button>
      </div>
    </form>
  )
}