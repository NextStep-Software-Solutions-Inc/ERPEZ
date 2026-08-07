import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useState } from 'react'
import BasicInformationSection from './BasicOfficeSection'
import ClusterAndDeliveryUnitSection from './ClusterAndDeliveryUnitSection'
import { Button } from '@/components/ui/button'

// Export schema and type for reuse
export const officeFormSchema = z.object({
  name: z.string().min(2, 'Office name is required'),
  description: z.string().optional().nullable(),
  address: z.string().min(5, 'Address is required'),
  country: z.string().min(2, 'Country is required'),
  email: z.string().email('Valid email is required'),
  contactNumber: z.string().min(10, 'Contact number is required'),
  officeHead: z.string().min(2, 'Office head name is required'),
  clusterId: z.string().nullable().optional(),
  isDeliveryUnit: z.boolean().default(false),
  responsibilityCenterCode: z.string().nullable().optional(),
})

export type OfficeFormType = z.infer<typeof officeFormSchema>

interface OfficeFormProps {
  onSubmit: (data: OfficeFormType) => void
  onCancel: (form: any) => void
  isLoading?: boolean
  initialValues?: Partial<OfficeFormType>
  mode?: 'create' | 'update'
}

export default function OfficeForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues,
  mode = 'create',
}: OfficeFormProps) {
  const [step, setStep] = useState(1)

  const form = useForm({
    defaultValues: initialValues ?? {
      name: '',
      description: '',
      address: '',
      email: '',
      contactNumber: '',
      officeHead: '',
      country: '',
      clusterId: null,
      isDeliveryUnit: false,
      responsibilityCenterCode: null,
    },
    onSubmit: async (values) => {
      // Validate form data with Zod
      const validationResult = officeFormSchema.safeParse(values.value)

      if (validationResult.success) {
        onSubmit(validationResult.data)
      } else {
        // Handle validation errors
        console.error('Validation errors:', validationResult.error.flatten())
        throw new Error('Form validation failed')
      }
    },
  })

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else {
      form.handleSubmit()
    }
  }

  const handleBackOrCancel = () => {
    if (step === 1) onCancel(form)
    else setStep(step - 1)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleNext()
      }}
      className="flex flex-col h-full space-y-6"
    >
      {/* Step Indicator */}
      <div className="flex justify-between items-center">
        <span>
          {mode === 'create'
            ? 'Create New Office'
            : 'Edit office important details.'}
        </span>
        <span className="text-sm text-muted-foreground">Step {step} of 2</span>
      </div>

      {/* Form Content */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {step === 1 && (
          <BasicInformationSection form={form} isLoading={isLoading} />
        )}
        {step === 2 && <ClusterAndDeliveryUnitSection form={form} />}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleBackOrCancel}
          disabled={isLoading}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {step === 2
            ? mode === 'create'
              ? 'Create Office'
              : 'Update Office'
            : 'Next'}
        </Button>
      </div>
    </form>
  )
}
