import { useEffect, useMemo, useState } from 'react'
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
import { getLIBActivityObjectsRequest } from '@/features/planning/line-item-budgeting/line-item-budget-details/handlers/getLIBActivityObjectsRequest'
import FieldInfo from '@/components/FieldInfo'

const useObjectCodesQuery = createQueryHookFromTemplate(getObjectCodesRequest)
const useLIBActivityObjectsQuery = createQueryHookFromTemplate(
  getLIBActivityObjectsRequest,
)

export const ppmpExpenditureItemSchema = z.object({
  isProcurable: z.boolean(),
  objectId: z.string().min(1, 'Item of expenditure is required'),
})

export type PPMPExpenditureItemFormValues = z.infer<
  typeof ppmpExpenditureItemSchema
>

import type { OrphanLineItemDetail } from '@/features/planning/line-item-budgeting/line-item-budget/types'

interface AddPPMPItemExpenditureFormProps {
  formId?: string
  initialValues?: Partial<PPMPExpenditureItemFormValues>
  libActivityId?: string
  orphanDetails?: OrphanLineItemDetail[]
  existingObjectIds?: string[]
  onSubmit: (values: PPMPExpenditureItemFormValues) => void
  isLoading?: boolean
}

export interface ParentObjectInfo {
  id: string
  name: string
  code: string
  parent?: ParentObjectInfo | null
}

export function resolveTypeOfExpenditure(
  objId: string,
  objName: string,
  objCode: string,
  parentHierarchy?: ParentObjectInfo | null,
): { id: string; name: string; code: string } {
  // 1. If parent hierarchy is present, traverse to highest non-root ancestor
  if (parentHierarchy && parentHierarchy.name) {
    let curr: ParentObjectInfo | null = parentHierarchy
    let highest: ParentObjectInfo = parentHierarchy

    while (curr) {
      const pName = curr.name.toLowerCase()
      const pCode = curr.code || ''
      if (
        pName === 'expenses' ||
        pCode === 'cls:expenses' ||
        pCode === '50000000' ||
        pCode.startsWith('50000000')
      ) {
        break
      }
      highest = curr
      curr = curr.parent ?? null
    }

    if (highest && highest.name) {
      return {
        id: highest.id || highest.code || highest.name,
        name: highest.name,
        code: highest.code,
      }
    }
  }

  // 2. Authoritative UACS standard expense class mapping by Code prefix
  const cleanCode = (objCode || '').replace(/[-:]/g, '').trim()
  if (cleanCode.startsWith('501') || cleanCode.startsWith('51')) {
    return {
      id: 'type-ps',
      name: 'Personnel Services (PS)',
      code: '5010000000',
    }
  }
  if (cleanCode.startsWith('502') || cleanCode.startsWith('52')) {
    return {
      id: 'type-mooe',
      name: 'Maintenance and Other Operating Expenses (MOOE)',
      code: '5020000000',
    }
  }
  if (cleanCode.startsWith('503') || cleanCode.startsWith('53')) {
    return {
      id: 'type-fe',
      name: 'Financial Expenses (FE)',
      code: '5030000000',
    }
  }
  if (
    cleanCode.startsWith('506') ||
    cleanCode.startsWith('56') ||
    cleanCode.startsWith('106') ||
    cleanCode.startsWith('16') ||
    cleanCode.startsWith('107')
  ) {
    return {
      id: 'type-co',
      name: 'Capital Outlays (CO)',
      code: '5060000000',
    }
  }

  return {
    id: objId,
    name: objName || 'General Expenditures',
    code: objCode || '',
  }
}

export function AddPPMPItemExpenditureForm({
  formId = 'add-ppmp-expenditure-form',
  initialValues,
  libActivityId,
  orphanDetails,
  existingObjectIds,
  onSubmit,
  isLoading = false,
}: AddPPMPItemExpenditureFormProps) {
  // 1. Strict eligible object query for the selected LIB activity
  const { data: activityObjectsResponse, isLoading: isActivityObjectsLoading } =
    useLIBActivityObjectsQuery({
      pathParams: {},
      queryParams: { LIBActivityId: libActivityId || '' },
      enabled: !!libActivityId,
    })

  // 2. Comprehensive UACS object lookup containing parent hierarchy
  const { data: objectCodesResponse, isLoading: isObjectCodesLoading } =
    useObjectCodesQuery({
      pathParams: {},
      queryParams: { pageSize: 1000 },
    })

  // Fast map to resolve object details and parent hierarchy
  const objectMap = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string
        name: string
        code: string
        parent: ParentObjectInfo | null
      }
    >()

    objectCodesResponse?.data?.forEach((item) => {
      const parentRaw = item.parent as
        | { id?: string; name?: string; code?: string; parent?: any }
        | null
        | undefined

      const parentInfo: ParentObjectInfo | null =
        parentRaw && parentRaw.name
          ? {
              id: parentRaw.id || '',
              name: parentRaw.name,
              code: parentRaw.code || '',
              parent: parentRaw.parent ?? null,
            }
          : null

      map.set(item.id, {
        id: item.id,
        name: item.name,
        code: item.code,
        parent: parentInfo,
      })
    })

    return map
  }, [objectCodesResponse?.data])

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  const isEditing = !!initialValues?.objectId

  // Derive available Parent Objects (Types of Expenditure: PS, MOOE, CO, FE)
  const parentOptions = useMemo(() => {
    const parentsMap = new Map<string, { id: string; name: string; code: string }>()

    if (libActivityId && activityObjectsResponse?.data) {
      activityObjectsResponse.data.forEach((item) => {
        // Exclude objects already added to this activity (unless currently editing)
        if (!isEditing && existingObjectIds?.includes(item.objectId)) {
          return
        }
        const resolved = objectMap.get(item.objectId)
        const typeOfExp = resolveTypeOfExpenditure(
          item.objectId,
          item.objectName,
          item.objectCode,
          resolved?.parent,
        )

        parentsMap.set(typeOfExp.id, typeOfExp)
      })
    } else if (orphanDetails && orphanDetails.length > 0) {
      orphanDetails.forEach((item) => {
        if (!isEditing && existingObjectIds?.includes(item.objectId)) {
          return
        }
        const resolved = objectMap.get(item.objectId)
        const typeOfExp = resolveTypeOfExpenditure(
          item.objectId,
          item.object?.name || resolved?.name || '',
          item.object?.code || resolved?.code || '',
          resolved?.parent,
        )

        parentsMap.set(typeOfExp.id, typeOfExp)
      })
    } else {
      objectCodesResponse?.data
        ?.filter((item) => {
          if (!item.isActive) return false
          if (!isEditing && existingObjectIds?.includes(item.id)) return false
          return true
        })
        .forEach((item) => {
          const resolved = objectMap.get(item.id)
          const typeOfExp = resolveTypeOfExpenditure(
            item.id,
            item.name,
            item.code,
            resolved?.parent,
          )

          parentsMap.set(typeOfExp.id, typeOfExp)
        })
    }

    return Array.from(parentsMap.values())
  }, [
    libActivityId,
    orphanDetails,
    activityObjectsResponse?.data,
    objectCodesResponse?.data,
    objectMap,
    existingObjectIds,
    isEditing,
  ])

  // Automatically select parent if there is only 1 available or initialize from initialValues
  useEffect(() => {
    if (initialValues?.objectId) {
      const resolved = objectMap.get(initialValues.objectId)
      const typeOfExp = resolveTypeOfExpenditure(
        initialValues.objectId,
        resolved?.name || '',
        resolved?.code || '',
        resolved?.parent,
      )
      if (typeOfExp?.id) {
        setSelectedParentId(typeOfExp.id)
        return
      }
    }

    if (parentOptions.length === 1 && !selectedParentId) {
      setSelectedParentId(parentOptions[0].id)
    }
  }, [parentOptions, selectedParentId, initialValues?.objectId, objectMap])

  // Derive child items (Items of Expenditure) under the selected Type of Expenditure
  const childOptions = useMemo(() => {
    if (!selectedParentId) return []

    if (libActivityId && activityObjectsResponse?.data) {
      return activityObjectsResponse.data
        .filter((item) => {
          // Exclude objects already added to this activity (unless currently editing)
          if (!isEditing && existingObjectIds?.includes(item.objectId)) {
            return false
          }
          const resolved = objectMap.get(item.objectId)
          const typeOfExp = resolveTypeOfExpenditure(
            item.objectId,
            item.objectName,
            item.objectCode,
            resolved?.parent,
          )
          return typeOfExp.id === selectedParentId
        })
        .map((item) => ({
          id: item.objectId,
          label: `${item.objectCode} - ${item.objectName}`,
        }))
    }

    if (orphanDetails && orphanDetails.length > 0) {
      return orphanDetails
        .filter((item) => {
          if (!isEditing && existingObjectIds?.includes(item.objectId)) {
            return false
          }
          const resolved = objectMap.get(item.objectId)
          const typeOfExp = resolveTypeOfExpenditure(
            item.objectId,
            item.object?.name || resolved?.name || '',
            item.object?.code || resolved?.code || '',
            resolved?.parent,
          )
          return typeOfExp.id === selectedParentId
        })
        .map((item) => {
          const resolved = objectMap.get(item.objectId)
          const code = item.object?.code || resolved?.code || ''
          const name = item.object?.name || resolved?.name || ''
          return {
            id: item.objectId,
            label: code ? `${code} - ${name}` : name,
          }
        })
    }

    return (
      objectCodesResponse?.data
        ?.filter((item) => {
          if (!isEditing && existingObjectIds?.includes(item.id)) {
            return false
          }
          const resolved = objectMap.get(item.id)
          const typeOfExp = resolveTypeOfExpenditure(
            item.id,
            item.name,
            item.code,
            resolved?.parent,
          )
          return typeOfExp.id === selectedParentId
        })
        .map((item) => ({
          id: item.id,
          label: `${item.code} - ${item.name}`,
        })) ?? []
    )
  }, [
    selectedParentId,
    libActivityId,
    orphanDetails,
    activityObjectsResponse?.data,
    objectCodesResponse?.data,
    objectMap,
    existingObjectIds,
    isEditing,
  ])

  const isOptionsLoading = libActivityId
    ? isActivityObjectsLoading || isObjectCodesLoading
    : isObjectCodesLoading

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

  // If childOptions has only 1 item, auto-select it if none selected
  useEffect(() => {
    if (childOptions.length === 1 && !form.getFieldValue('objectId')) {
      form.setFieldValue('objectId', childOptions[0].id)
    }
  }, [childOptions, form])

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
      {/* 1. Type of Expenditure (Parent Object) Selection */}
      <div className="space-y-1.5 text-left">
        <Label htmlFor="type-of-expenditure" className="text-xs font-semibold text-default-700 block">
          Type of Expenditure <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedParentId || ''}
          onValueChange={(val) => {
            setSelectedParentId(val)
            form.setFieldValue('objectId', '')
          }}
          disabled={isLoading || isOptionsLoading}
        >
          <SelectTrigger id="type-of-expenditure" className="w-full text-xs text-left justify-between">
            <SelectValue
              placeholder={
                isOptionsLoading
                  ? 'Loading types of expenditure...'
                  : 'Select Type of Expenditure'
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {parentOptions.map((parent) => (
              <SelectItem key={parent.id} value={parent.id} className="text-xs text-left">
                {parent.name} {parent.code ? `(${parent.code})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Item of Expenditure / Child Object Selection */}
      <form.Field
        name="objectId"
        children={(field) => (
          <div className="space-y-1.5 text-left ml-3 pl-3 border-l-2 border-default-200">
            <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 block">
              Item of Expenditure <span className="text-destructive">*</span>
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(val) => field.handleChange(val)}
              disabled={
                isLoading || isOptionsLoading || !selectedParentId || childOptions.length === 0
              }
            >
              <SelectTrigger id={field.name} className="w-full text-xs text-left justify-between">
                <SelectValue
                  placeholder={
                    !selectedParentId
                      ? 'Select Type of Expenditure first'
                      : isOptionsLoading
                        ? 'Loading items...'
                        : childOptions.length === 0
                          ? 'No items available'
                          : 'Select Item of Expenditure'
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {childOptions.map((item) => (
                  <SelectItem key={item.id} value={item.id} className="text-xs text-left">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* 3. Procurement Type Radio */}
      <form.Field
        name="isProcurable"
        children={(field) => (
          <div className="space-y-2 pt-2 text-left">
            <Label className="text-xs font-semibold text-default-700 block">
              Procurement Type <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={field.state.value ? 'true' : 'false'}
              onValueChange={(val) => field.handleChange(val === 'true')}
              disabled={isLoading}
              className="flex flex-col gap-2.5 items-start"
            >
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="true" id="procurable-true" />
                <Label
                  htmlFor="procurable-true"
                  className="text-xs font-medium text-default-800 cursor-pointer"
                >
                  Procurable Group (CSE/Non-CSE Catalog)
                </Label>
              </div>
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="false" id="procurable-false" />
                <Label
                  htmlFor="procurable-false"
                  className="text-xs font-medium text-default-800 cursor-pointer"
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
