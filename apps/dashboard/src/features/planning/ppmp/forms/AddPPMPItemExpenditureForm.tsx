import { useEffect, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getObjectCodesRequest } from '@/components/features/planning/procurement-library/item-master/handlers/getObjectCodesRequest'
import { getLIBActivityObjectsRequest } from '../handlers/getLIBActivityObjectsRequest'

const useObjectCodesQuery = createQueryHookFromTemplate(getObjectCodesRequest)
const useLIBActivityObjectsQuery = createQueryHookFromTemplate(
  getLIBActivityObjectsRequest,
)

export const ppmpExpenditureItemSchema = z.object({
  isProcurable: z.boolean(),
  objectId: z.string().min(1, 'Object code is required'),
})

export type PPMPExpenditureItemFormValues = z.infer<
  typeof ppmpExpenditureItemSchema
>

interface AddPPMPItemExpenditureFormProps {
  formId?: string
  libActivityId?: string
  initialValues?: Partial<PPMPExpenditureItemFormValues>
  onSubmit: (values: PPMPExpenditureItemFormValues) => void
  isLoading?: boolean
}

export function AddPPMPItemExpenditureForm({
  formId = 'add-ppmp-expenditure-form',
  libActivityId,
  initialValues,
  onSubmit,
  isLoading = false,
}: AddPPMPItemExpenditureFormProps) {
  const hasLibActivity = Boolean(libActivityId)

  const { data: libActivityObjectsResponse, isLoading: isLibActivityObjectsLoading } =
    useLIBActivityObjectsQuery(
      {
        pathParams: {},
        queryParams: { LIBActivityId: libActivityId! },
        enabled: hasLibActivity,
      },

    )

  const { data: objectCodesResponse, isLoading: isObjectCodesLoading } =
    useObjectCodesQuery(
      {
        pathParams: {},
        queryParams: {},
        enabled: !hasLibActivity,
      },

    )

  const isObjectsLoading = hasLibActivity
    ? isLibActivityObjectsLoading
    : isObjectCodesLoading

  const objectCodeOptions = useMemo(() => {
    if (hasLibActivity) {
      return (
        libActivityObjectsResponse?.data?.map((item) => ({
          id: item.objectId,
          label: `${item.objectCode || ''} - ${item.objectName || ''} (Budget: ₱${(item.totalBudget ?? 0).toLocaleString()})`,
        })) ?? []
      )
    }

    return (
      objectCodesResponse?.data
        ?.filter((item) => item.isActive)
        .map((item) => ({
          id: item.id,
          label: `${item.code} - ${item.name}`,
        })) ?? []
    )
  }, [hasLibActivity, libActivityObjectsResponse?.data, objectCodesResponse?.data])

  const form = useForm({
    defaultValues: {
      isProcurable: initialValues?.isProcurable ?? true,
      objectId: initialValues?.objectId ?? '',
    } as PPMPExpenditureItemFormValues,
    validators: { onChange: ppmpExpenditureItemSchema },
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  useEffect(() => {
    form.reset({
      isProcurable: initialValues?.isProcurable ?? true,
      objectId: initialValues?.objectId ?? '',
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
        name="objectId"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="text-xs font-semibold">
              Object Code <span className="text-destructive">*</span>
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(val) => field.handleChange(val)}
              disabled={isLoading || isObjectsLoading}
            >
              <SelectTrigger id={field.name} className="w-full text-xs">
                <SelectValue
                  placeholder={
                    isObjectsLoading
                      ? 'Loading object codes...'
                      : 'Select Object Code'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {objectCodeOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.state.meta.isTouched &&
              field.state.meta.errors.length > 0 && (
                <p className="text-[10px] text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
          </div>
        )}
      />

      <form.Field
        name="isProcurable"
        children={(field) => (
          <div className="space-y-2 py-1">
            <Label className="text-xs font-semibold">
              Procurement Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={field.state.value ? 'true' : 'false'}
              onValueChange={(val) => field.handleChange(val === 'true')}
              disabled={isLoading}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="true" id="procurable-true" />
                <Label
                  htmlFor="procurable-true"
                  className="text-xs font-medium cursor-pointer"
                >
                  Procurable Group (CSE/Non-CSE Catalog)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="false" id="procurable-false" />
                <Label
                  htmlFor="procurable-false"
                  className="text-xs font-medium cursor-pointer"
                >
                  Non-Procurable Group
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      />
    </form>
  )
}

