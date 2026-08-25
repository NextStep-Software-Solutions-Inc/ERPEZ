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
import { getLIBActivityObjectsRequest } from '@/features/planning/line-item-budgeting/line-item-budget-details/handlers/getLIBActivityObjectsRequest'
import FieldInfo from '@/components/FieldInfo'

const useLIBActivityObjectsQuery = createQueryHookFromTemplate(
  getLIBActivityObjectsRequest,
)

export const ppmpExpenditureItemSchema = z.object({
  isProcurable: z.boolean(),
  typeOfExpenditureId: z
    .string()
    .min(1, 'Type of Expenditure is required'),
  objectId: z.string().min(1, 'Item of Expenditure is required'),
})

export type PPMPExpenditureItemFormValues = z.infer<
  typeof ppmpExpenditureItemSchema
>

interface AddPPMPItemExpenditureFormProps {
  formId?: string
  libActivityId: string
  initialValues?: Partial<PPMPExpenditureItemFormValues>
  onSubmit: (values: PPMPExpenditureItemFormValues) => void
  isLoading?: boolean
}

/**
 * Formats expenditure labels to remove redundant category prefixes (e.g., "SC:", "GRP:")
 * and avoids duplicating code and name if they are identical.
 */
export function formatExpenditureDisplayName(name?: string, code?: string): string {
  const safeName = name?.trim() || ''
  const safeCode = code?.trim() || ''

  if (!safeName && !safeCode) return ''
  if (!safeCode) return safeName
  if (!safeName) return safeCode

  // Remove prefixes like "SC:", "GRP:", "CAT:"
  const cleanCode = safeCode.replace(/^(SC|GRP|CAT):\s*/i, '').trim()

  // If code duplicates name or is identical, display just the clean name
  if (
    cleanCode.toLowerCase() === safeName.toLowerCase() ||
    safeCode.toLowerCase() === safeName.toLowerCase()
  ) {
    return safeName
  }

  // If code is numeric (e.g. standard UACS code "50205030"), display "50205030 - Cloud Compute Subscriptions"
  return `${safeCode} - ${safeName}`
}

export function AddPPMPItemExpenditureForm({
  formId = 'add-ppmp-expenditure-form',
  libActivityId,
  initialValues,
  onSubmit,
  isLoading = false,
}: AddPPMPItemExpenditureFormProps) {
  const { data: activityObjectsResponse, isLoading: isActivityObjectsLoading } =
    useLIBActivityObjectsQuery({
      pathParams: {},
      queryParams: { LIBActivityId: libActivityId || '' },
      enabled: !!libActivityId,
    })

  const parentGroups = useMemo(() => {
    return activityObjectsResponse?.data ?? []
  }, [activityObjectsResponse?.data])

  // Derive initial parent ID if an initial objectId was passed (edit mode)
  const resolvedInitialParentId = useMemo(() => {
    if (initialValues?.typeOfExpenditureId) {
      return initialValues.typeOfExpenditureId
    }
    if (initialValues?.objectId && parentGroups.length > 0) {
      const match = parentGroups.find((g) =>
        g.items.some((item) => item.id === initialValues.objectId),
      )
      if (match) return match.parentObjectId
    }
    return ''
  }, [initialValues?.typeOfExpenditureId, initialValues?.objectId, parentGroups])

  const form = useForm({
    defaultValues: {
      isProcurable: initialValues?.isProcurable ?? true,
      typeOfExpenditureId: resolvedInitialParentId,
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
      typeOfExpenditureId: resolvedInitialParentId,
      objectId: initialValues?.objectId ?? '',
    } as PPMPExpenditureItemFormValues)
  }, [initialValues, resolvedInitialParentId, form])

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4 font-sans text-left"
    >
      {/* 1. Type of Expenditure */}
      <form.Field
        name="typeOfExpenditureId"
        children={(field) => (
          <div className="space-y-1.5 text-left">
            <Label
              htmlFor={field.name}
              className="text-xs font-semibold text-foreground block text-left"
            >
              Type of Expenditure <span className="text-destructive">*</span>
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(val) => {
                field.handleChange(val)
                form.setFieldValue('objectId', '')
              }}
              disabled={isLoading || isActivityObjectsLoading || !libActivityId}
            >
              <SelectTrigger
                id={field.name}
                className="w-full h-10 px-3 text-xs text-left justify-between items-center [&>span]:truncate [&>span]:text-left [&>span]:block [&>span]:flex-1 [&>span]:min-w-0"
              >
                <SelectValue
                  placeholder={
                    isActivityObjectsLoading
                      ? 'Loading types of expenditure...'
                      : !libActivityId
                        ? 'No LIB Activity selected'
                        : 'Select Type of Expenditure'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {parentGroups.map((group) => (
                  <SelectItem
                    key={group.parentObjectId}
                    value={group.parentObjectId}
                    className="text-xs text-left"
                  >
                    {formatExpenditureDisplayName(
                      group.parentObjectName,
                      group.parentObjectCode,
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* 2. Item of Expenditure */}
      <form.Field
        name="objectId"
        children={(field) => {
          const selectedParentId = form.getFieldValue('typeOfExpenditureId')
          const selectedGroup = parentGroups.find(
            (g) => g.parentObjectId === selectedParentId,
          )
          const childOptions = selectedGroup?.items ?? []
          const isChildDisabled =
            isLoading ||
            isActivityObjectsLoading ||
            !selectedParentId ||
            childOptions.length === 0

          return (
            <div className="space-y-1.5 text-left">
              <Label
                htmlFor={field.name}
                className="text-xs font-semibold text-foreground block text-left"
              >
                Item of Expenditure <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val)}
                disabled={isChildDisabled}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full h-10 px-3 text-xs text-left justify-between items-center [&>span]:truncate [&>span]:text-left [&>span]:block [&>span]:flex-1 [&>span]:min-w-0"
                >
                  <SelectValue
                    placeholder={
                      !selectedParentId
                        ? 'Select Type of Expenditure first'
                        : childOptions.length === 0
                          ? 'No items configured under this type'
                          : 'Select Item of Expenditure'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {childOptions.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      className="text-xs text-left"
                    >
                      {formatExpenditureDisplayName(item.name, item.code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedParentId && childOptions.length === 0 && (
                <p className="text-[11px] text-destructive font-medium mt-1 text-left">
                  No expenditure items are configured under this type for the selected LIB Activity.
                </p>
              )}
              <FieldInfo field={field} />
            </div>
          )
        }}
      />

      {/* 3. Procurement Type */}
      <form.Field
        name="isProcurable"
        children={(field) => (
          <div className="space-y-2 pt-1 text-left">
            <Label className="text-xs font-semibold text-foreground block text-left">
              Procurement Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={field.state.value ? 'true' : 'false'}
              onValueChange={(val) => field.handleChange(val === 'true')}
              disabled={isLoading}
              className="flex flex-col gap-2.5 pt-0.5"
            >
              <div className="flex items-center space-x-2.5 text-left">
                <RadioGroupItem value="true" id="procurable-true" />
                <Label
                  htmlFor="procurable-true"
                  className="text-xs font-normal text-foreground cursor-pointer select-none text-left"
                >
                  Procurable Group (CSE/Non-CSE Catalog)
                </Label>
              </div>
              <div className="flex items-center space-x-2.5 text-left">
                <RadioGroupItem value="false" id="procurable-false" />
                <Label
                  htmlFor="procurable-false"
                  className="text-xs font-normal text-foreground cursor-pointer select-none text-left"
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

