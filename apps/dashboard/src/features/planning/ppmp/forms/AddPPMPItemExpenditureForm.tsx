import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export const ppmpExpenditureItemSchema = z.object({
  isProcurable: z.boolean(),
})

export type PPMPExpenditureItemFormValues = z.infer<
  typeof ppmpExpenditureItemSchema
>

interface AddPPMPItemExpenditureFormProps {
  formId?: string
  initialValues?: Partial<PPMPExpenditureItemFormValues>
  onSubmit: (values: PPMPExpenditureItemFormValues) => void
  isLoading?: boolean
}

export function AddPPMPItemExpenditureForm({
  formId = 'add-ppmp-expenditure-form',
  initialValues,
  onSubmit,
  isLoading = false,
}: AddPPMPItemExpenditureFormProps) {
  const form = useForm({
    defaultValues: {
      isProcurable: initialValues?.isProcurable ?? true,
    } as PPMPExpenditureItemFormValues,
    validators: { onChange: ppmpExpenditureItemSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  useEffect(() => {
    form.reset({
      isProcurable: initialValues?.isProcurable ?? true,
    } as PPMPExpenditureItemFormValues)
  }, [initialValues, form])

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4 font-sans"
    >
      <form.Field
        name="isProcurable"
        children={(field) => (
          <div className="flex items-center gap-2 py-1">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(!!checked)}
              disabled={isLoading}
            />
            <Label
              htmlFor={field.name}
              className="text-xs font-semibold leading-none cursor-pointer select-none"
            >
              Is Procurable Group (CSE/Non-CSE Catalog)
            </Label>
          </div>
        )}
      />
    </form>
  )
}
