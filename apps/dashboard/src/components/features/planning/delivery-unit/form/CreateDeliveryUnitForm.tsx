import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useEffect } from 'react'
import { getOfficesRequest } from '../../office/office/handlers/getOfficesRequest'
import { Button } from '@/components/ui/button'

const useOffices = createQueryHookFromTemplate(getOfficesRequest)

export const createDeliveryUnitSchema = z.object({
  officeId: z.string().min(1, 'Office is required'),
  parentId: z.string().optional().nullable(),
})

export type CreateDeliveryUnitFormType = z.infer<
  typeof createDeliveryUnitSchema
>

interface CreateDeliveryUnitFormProps {
  onSubmit: (data: CreateDeliveryUnitFormType) => void
  onCancel: (form: any) => void
  mode?: 'create' | 'update'
  initialValues?: Partial<CreateDeliveryUnitFormType>
  officeId?: string
  parentId?: string
}

export default function CreateDeliveryUnitForm({
  onSubmit,
  onCancel,
  mode = 'create',
  initialValues,
  parentId,
  officeId,
}: CreateDeliveryUnitFormProps) {
  const form = useForm({
    defaultValues: {
      officeId: initialValues?.officeId || '',
      parentId: parentId ?? initialValues?.parentId ?? null,
    },
    onSubmit: async (values) => {
      const validationResult = createDeliveryUnitSchema.safeParse(values.value)
      if (validationResult.success) {
        onSubmit(validationResult.data)
      } else {
        console.error('Validation errors:', validationResult.error.flatten())
        throw new Error('Form validation failed')
      }
    },
  })

  useEffect(() => {
    if (officeId) {
      form.setFieldValue('officeId', officeId)
    }
  }, [officeId, form])

  const { data: officesData, isLoading: isLoadingOffices } = useOffices({
    pathParams: {},
    queryParams: {},
  })

  const isLoading = isLoadingOffices
  const handleSubmit = () => form.handleSubmit()
  const handleBackOrCancel = () => onCancel(form)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit()
      }}
      className="flex flex-col h-full space-y-6"
    >
      <div className="space-y-4 flex-1 overflow-y-auto">
        <form.Field
          name="officeId"
          children={(field: any) => (
            <div className="w-full">
              <label className="font-medium">Office</label>
              <select
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an office</option>
                {officesData?.data?.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleBackOrCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-green-700">
          {mode === 'create'
            ? parentId
              ? 'Submit Sub-Delivery Unit'
              : 'Submit Delivery Unit'
            : parentId
              ? 'Update Sub-Delivery Unit'
              : 'Update Delivery Unit'}
        </Button>
      </div>
    </form>
  )
}
