import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { updateFormDataAtom } from '../atoms'
import { getFundSourcesRequest } from '../handlers/getFundSourcesRequest'
import type { FundSource } from '../table/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SubmitButton from '@/components/SubmitButton'
import { cn } from '@/lib/utils'
import FieldInfo from '@/components/FieldInfo'

const useFundCluster = createQueryHookFromTemplate(getFundSourcesRequest)
const useFinancingSource = createQueryHookFromTemplate(getFundSourcesRequest)
const useAuthorizationCode = createQueryHookFromTemplate(getFundSourcesRequest)
const useFundCategory = createQueryHookFromTemplate(getFundSourcesRequest)

// Helper function to filter children by parent ID and exclude current item
const filterByParentId = (
  items: Array<any> | undefined,
  parentId: string | null | undefined,
  excludeId?: string,
) => {
  if (!items || !parentId) return []
  return items.filter(
    (item) => item.parentId === parentId && item.id !== excludeId,
  )
}

// Schema for FundSource update
export const updateFundSourceSchema = z.object({
  name: z
    .string()
    .min(1, 'Fund source name is required')
    .max(100, 'Name must be 100 characters or less'),
  code: z
    .string()
    .min(1, 'Code is required')
    .max(5, 'Code must be 5 characters or less'),
  parentId: z.string(),
  type: z.string(),
  isActive: z.boolean(),
})

export type UpdateFundSourceFormValues = z.infer<typeof updateFundSourceSchema>
export type UpdateFundSourceType = {
  name: string
  code: string
  type: string
  isActive: boolean
  parentId?: string
}

// Form data type
export type UpdateFundSourceFormType = Omit<FundSource, 'id'>

// Helper function to truncate text for display
const truncateText = (
  text: string | undefined,
  maxLength: number = 30,
): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

interface UpdateFundSourceFormProps {
  onSubmit: (data: UpdateFundSourceType) => void
  onCancel: () => void
  initialValues?: Partial<UpdateFundSourceFormType>
  isLoading?: boolean
  currentId?: string
  currentData?: FundSource
}

export default function UpdateFundSourceForm({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
  currentId,
  currentData,
}: UpdateFundSourceFormProps) {
  const [formData, setFormData] = useAtom(updateFormDataAtom)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const fundCluster = useFundCluster({
    pathParams: {},
    queryParams: { filters: 'type==FundCluster', pageSize: 2000 },
  })
  const financingSource = useFinancingSource({
    pathParams: {},
    queryParams: { filters: 'type==FinancingSource', pageSize: 2000 },
  })
  const authorizationCode = useAuthorizationCode({
    pathParams: {},
    queryParams: { filters: 'type==AuthorizationCode', pageSize: 2000 },
  })
  const fundCategory = useFundCategory({
    pathParams: {},
    queryParams: { filters: 'type==FundCategory', pageSize: 2000 },
  })

  // Helper function to build default values with parent hierarchy
  const buildDefaultValues = () => {
    const defaults = {
      name: '',
      code: '',
      type: '',
      isActive: true,
      parentId: null,
      ...initialValues,
      ...formData,
    }

    if (!currentData) return defaults

    // Helper to find item by ID
    const findItem = (
      id: string | null | undefined,
    ): FundSource | undefined => {
      if (!id) return undefined
      const allItems = [
        ...(fundCluster.data?.data || []),
        ...(financingSource.data?.data || []),
        ...(authorizationCode.data?.data || []),
        ...(fundCategory.data?.data || []),
      ]
      return allItems.find((item) => item.id === id)
    }

    // Build the hierarchy chain from current item upward
    const hierarchyChain: Array<FundSource> = [currentData]
    let currentItem = currentData

    while (currentItem.parentId) {
      const parentItem = findItem(currentItem.parentId)
      if (!parentItem) break
      hierarchyChain.push(parentItem)
      currentItem = parentItem
    }

    // Map hierarchy to form fields
    for (let i = 1; i < hierarchyChain.length; i++) {
      const ancestor = hierarchyChain[i]

      if (ancestor.type === 'FundCluster') {
        defaults.fundCluster = ancestor.id
      } else if (ancestor.type === 'FinancingSource') {
        defaults.type = ancestor.id
      } else if (ancestor.type === 'AuthorizationCode') {
        defaults.authorization = ancestor.id
      } else if (ancestor.type === 'FundCategory') {
        defaults.category = ancestor.id
      }
    }

    return defaults
  }

  const form = useForm({
    defaultValues: buildDefaultValues(),
    validators: {
      onChange: updateFundSourceSchema,
    },
    onSubmit: (values) => {
      // Determine type and parentId based on field values hierarchy
      let type = 'FundCluster'
      let parentId: string | undefined

      // Check which fields are filled to determine the type and parentId
      const hasCluster =
        values.value.fundCluster && values.value.fundCluster !== ''
      const hasSource = values.value.type && values.value.type !== ''
      const hasAuth =
        values.value.authorization && values.value.authorization !== ''
      const hasCategory = values.value.category && values.value.category !== ''

      if (hasCluster) {
        parentId = values.value.fundCluster // Start with fund cluster as parent

        if (hasSource) {
          type = 'AuthorizationCode'
          parentId = values.value.type // Parent is financing source ID

          if (hasAuth) {
            type = 'FundCategory'
            parentId = values.value.authorization // Parent is authorization code ID

            if (hasCategory) {
              type = 'FundSubCategory'
              parentId = values.value.category // Parent is fund category ID
            }
          }
        } else {
          // Only cluster is filled
          type = 'FinancingSource'
          parentId = values.value.fundCluster // Parent is fund cluster ID
        }
      } else {
        // All blank - default to FundCluster
        type = 'FundCluster'
        parentId = undefined
      }

      const payload: UpdateFundSourceType = {
        name: values.value.name,
        code: values.value.code,
        type,
        isActive: values.value.isActive,
        parentId,
      }

      onSubmit(payload)
    },
  })

  const handleCancel = () => {
    onCancel()
  }

  // Helper function to find an item by ID from any data array
  const findItemById = (
    id: string | null | undefined,
  ): FundSource | undefined => {
    if (!id) return undefined
    const allItems = [
      ...(fundCluster.data?.data || []),
      ...(financingSource.data?.data || []),
      ...(authorizationCode.data?.data || []),
      ...(fundCategory.data?.data || []),
    ]
    return allItems.find((item) => item.id === id)
  }

  // Pre-select all parents from the hierarchy chain in the form fields
  useEffect(() => {
    if (!currentData) return

    // Build the full hierarchy chain from current item upward
    const hierarchyChain: Array<FundSource> = [currentData]
    let currentItem = currentData

    // Trace upward through parents
    while (currentItem.parentId) {
      const parentItem = findItemById(currentItem.parentId)
      if (!parentItem) break
      hierarchyChain.push(parentItem)
      currentItem = parentItem
    }

    // Log the entire chain
    console.log(
      'Full Hierarchy Chain:',
      hierarchyChain.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        parentId: item.parentId,
      })),
    )

    // Pre-select form fields based on the complete hierarchy chain
    // The chain is: [currentItem, parent, grandparent, greatGrandparent, ...]
    for (let i = 1; i < hierarchyChain.length; i++) {
      const ancestor = hierarchyChain[i]

      if (ancestor.type === 'FundCluster') {
        form.setFieldValue('fundCluster', ancestor.id)
        console.log(`Set fundCluster = ${ancestor.id} (${ancestor.name})`)
      } else if (ancestor.type === 'FinancingSource') {
        form.setFieldValue('type', ancestor.id)
        console.log(`Set type = ${ancestor.id} (${ancestor.name})`)
      } else if (ancestor.type === 'AuthorizationCode') {
        form.setFieldValue('authorization', ancestor.id)
        console.log(`Set authorization = ${ancestor.id} (${ancestor.name})`)
      } else if (ancestor.type === 'FundCategory') {
        form.setFieldValue('category', ancestor.id)
        console.log(`Set category = ${ancestor.id} (${ancestor.name})`)
      }
    }
  }, [
    currentData,
    fundCluster.data,
    financingSource.data,
    authorizationCode.data,
    fundCategory.data,
    form,
  ])

  // Update Jotai atom whenever form values change (automatically persisted via atomWithStorage)
  const updateFormData = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value })
  }

  // Calculate the required code length based on selected fields
  const getRequiredCodeLength = (): number => {
    let length = 2 // Base: 2 digits

    const hasFundCluster =
      form.state.values.fundCluster && form.state.values.fundCluster !== ''
    const hasFinancingSource =
      form.state.values.type && form.state.values.type !== ''
    const hasAuthorization =
      form.state.values.authorization && form.state.values.authorization !== ''

    if (hasFundCluster) {
      length += 1 // +1 if fund cluster selected
    }

    if (hasFinancingSource) {
      length += 2 // +2 if financing source (type) selected
    }

    if (hasAuthorization) {
      length += 3 // +3 if authorization included
    }

    return length
  }

  // Validate code based on dynamic length requirement
  // const validateCodeLength = (value: string): string | undefined => {
  //     const requiredLength = getRequiredCodeLength()
  //     const numericValue = value.replace(/\D/g, '')

  //     if (!value || value === '') {
  //         return 'Code is required'
  //     }

  //     // Check if code contains only numbers
  //     if (!/^\d+$/.test(value)) {
  //         return 'Code must contain only numbers'
  //     }

  //     // Check length
  //     if (numericValue.length !== requiredLength) {
  //         return `Code must be exactly ${requiredLength} digit${requiredLength !== 1 ? 's' : ''}`
  //     }

  //     if (value.length > 50) {
  //         return 'Code must be 50 characters or less'
  //     }

  //     return undefined
  // }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <div className="grid gap-4">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const result = z
                .string()
                .min(1, 'Fund source name is required')
                .max(100, 'Name must be 100 characters or less')
                .safeParse(value)
              return result.success
                ? undefined
                : result.error.issues[0]?.message
            },
          }}
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Fund Source Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  updateFormData('name', e.target.value)
                }}
                placeholder="Enter fund source name"
                disabled={isLoading}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <form.Field
            name="fundCluster"
            validators={{
              onChange: ({ value }) => {
                // If category is selected, fundCluster becomes required
                if (selectedCategory && selectedCategory !== '') {
                  if (!value || value === '') {
                    return 'Fund Cluster is required when Fund Category is selected'
                  }
                }
                const result = z
                  .string()
                  .optional()
                  .or(z.literal(''))
                  .safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
            children={(field) => {
              const selectedItem = fundCluster.data?.data.find(
                (item) => item.id === field.state.value,
              )
              return (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Fund Cluster{' '}
                    {selectedCategory && selectedCategory !== '' && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={field.state.value || ''}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        updateFormData('fundCluster', value)
                        // Reset dependent fields when parent changes
                        form.setFieldValue('type', '')
                        form.setFieldValue('authorization', '')
                        form.setFieldValue('category', '')
                        updateFormData('type', '')
                        updateFormData('authorization', '')
                        updateFormData('category', '')
                      }}
                      disabled={isLoading || fundCluster.isLoading}
                    >
                      <SelectTrigger
                        onBlur={field.handleBlur}
                        className={cn(
                          field.state.meta.errors.length > 0
                            ? 'border-destructive'
                            : '',
                          'w-full',
                        )}
                      >
                        <SelectValue placeholder="Select Fund Cluster">
                          {selectedItem
                            ? truncateText(selectedItem.name)
                            : 'Select Fund Cluster'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {fundCluster.data?.data
                          .filter((item) => item.id !== currentId)
                          .map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {truncateText(item.name)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {field.state.value && field.state.value !== '' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          field.handleChange('')
                          updateFormData('fundCluster', '')
                          // Reset dependent fields
                          form.setFieldValue('type', '')
                          form.setFieldValue('authorization', '')
                          form.setFieldValue('category', '')
                          updateFormData('type', '')
                          updateFormData('authorization', '')
                          updateFormData('category', '')
                        }}
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </Button>
                    )}
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )
            }}
          />

          <form.Field
            name="type"
            validators={{
              onChange: ({ value }) => {
                // If category is selected, type becomes required
                if (selectedCategory && selectedCategory !== '') {
                  if (!value || value === '') {
                    return 'Financing Source is required when Fund Category is selected'
                  }
                }
                const result = z
                  .string()
                  .optional()
                  .or(z.literal(''))
                  .safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
            children={(field) => {
              const childFinancingSources = filterByParentId(
                financingSource.data?.data,
                form.state.values.fundCluster,
                currentId,
              )
              const selectedItem = childFinancingSources.find(
                (item) => item.id === field.state.value,
              )
              const hasChildren = childFinancingSources.length > 0
              return (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Financing Source{' '}
                    {selectedCategory && selectedCategory !== '' && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={field.state.value || ''}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        updateFormData('type', value)
                        // Reset dependent fields when parent changes
                        form.setFieldValue('authorization', '')
                        form.setFieldValue('category', '')
                        updateFormData('authorization', '')
                        updateFormData('category', '')
                      }}
                      disabled={
                        isLoading || financingSource.isLoading || !hasChildren
                      }
                    >
                      <SelectTrigger
                        onBlur={field.handleBlur}
                        className={cn(
                          field.state.meta.errors.length > 0
                            ? 'border-destructive'
                            : '',
                          'w-full',
                        )}
                      >
                        <SelectValue
                          placeholder={
                            hasChildren
                              ? 'Select Financing Source'
                              : 'No children available'
                          }
                        >
                          {selectedItem
                            ? truncateText(selectedItem.name)
                            : hasChildren
                              ? 'Select Financing Source'
                              : 'No children available'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {childFinancingSources.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {truncateText(item.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.value && field.state.value !== '' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          field.handleChange('')
                          updateFormData('type', '')
                          // Reset dependent fields
                          form.setFieldValue('authorization', '')
                          form.setFieldValue('category', '')
                          updateFormData('authorization', '')
                          updateFormData('category', '')
                        }}
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </Button>
                    )}
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <form.Field
            name="authorization"
            validators={{
              onChange: ({ value }) => {
                // If category is selected, authorization becomes required
                if (selectedCategory && selectedCategory !== '') {
                  if (!value || value === '') {
                    return 'Authorization is required when Fund Category is selected'
                  }
                }
                const result = z
                  .string()
                  .optional()
                  .or(z.literal(''))
                  .safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
            children={(field) => {
              const childAuthCodes = filterByParentId(
                authorizationCode.data?.data,
                form.state.values.type,
                currentId,
              )
              const selectedItem = childAuthCodes.find(
                (item) => item.id === field.state.value,
              )
              const hasChildren = childAuthCodes.length > 0
              return (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>
                    Authorization{' '}
                    {selectedCategory && selectedCategory !== '' && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <div className="flex gap-2">
                    <Select
                      value={field.state.value || ''}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        updateFormData('authorization', value)
                        // Reset dependent fields when parent changes
                        form.setFieldValue('category', '')
                        updateFormData('category', '')
                      }}
                      disabled={
                        isLoading || authorizationCode.isLoading || !hasChildren
                      }
                    >
                      <SelectTrigger
                        onBlur={field.handleBlur}
                        className={cn(
                          field.state.meta.errors.length > 0
                            ? 'border-destructive'
                            : '',
                          'w-full',
                        )}
                      >
                        <SelectValue
                          placeholder={
                            hasChildren
                              ? 'Select Authorization'
                              : 'No children available'
                          }
                        >
                          {selectedItem
                            ? truncateText(selectedItem.name)
                            : hasChildren
                              ? 'Select Authorization'
                              : 'No children available'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {childAuthCodes.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {truncateText(item.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.value && field.state.value !== '' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          field.handleChange('')
                          updateFormData('authorization', '')
                          // Reset dependent fields
                          form.setFieldValue('category', '')
                          updateFormData('category', '')
                        }}
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </Button>
                    )}
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )
            }}
          />

          <form.Field
            name="category"
            validators={{
              onChange: ({ value }) => {
                const result = z
                  .string()
                  .optional()
                  .or(z.literal(''))
                  .safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
            children={(field) => {
              const childCategories = filterByParentId(
                fundCategory.data?.data,
                form.state.values.authorization,
                currentId,
              )
              const selectedItem = childCategories.find(
                (item) => item.id === field.state.value,
              )
              const hasChildren = childCategories.length > 0
              return (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Fund Category</Label>
                  <div className="flex gap-2">
                    <Select
                      value={field.state.value || ''}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        updateFormData('category', value)
                        // Update the selectedCategory state to trigger validation
                        setSelectedCategory(value)
                      }}
                      disabled={
                        isLoading || fundCategory.isLoading || !hasChildren
                      }
                    >
                      <SelectTrigger
                        onBlur={field.handleBlur}
                        className={cn(
                          field.state.meta.errors.length > 0
                            ? 'border-destructive'
                            : '',
                          'w-full',
                        )}
                      >
                        <SelectValue
                          placeholder={
                            hasChildren
                              ? 'Select Fund Category'
                              : 'No children available'
                          }
                        >
                          {selectedItem
                            ? truncateText(selectedItem.name)
                            : hasChildren
                              ? 'Select Fund Category'
                              : 'No children available'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {childCategories.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {truncateText(item.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.value && field.state.value !== '' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          field.handleChange('')
                          updateFormData('category', '')
                          setSelectedCategory('')
                        }}
                        disabled={isLoading}
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </Button>
                    )}
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-destructive">
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )
            }}
          />
        </div>
      </div>

      <form.Field
        name="code"
        // validators={{
        //     onChange: ({ value }) => {
        //         return validateCodeLength(value)
        //     },
        // }}
        children={(field) => {
          const requiredLength = getRequiredCodeLength()
          const currentLength = (field.state.value || '').replace(
            /\D/g,
            '',
          ).length

          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>
                Fund Source Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  // Only allow numeric input
                  const numericValue = e.target.value.replace(/\D/g, '')
                  field.handleChange(numericValue)
                  updateFormData('code', numericValue)
                }}
                placeholder={`Enter ${requiredLength}-digit code`}
                disabled={isLoading}
                maxLength={50}
                className={
                  field.state.meta.errors.length > 0 ? 'border-destructive' : ''
                }
              />
              <div className="text-xs text-muted-foreground">
                Required format: {requiredLength} digit
                {requiredLength !== 1 ? 's' : ''}
                {form.state.values.fundCluster &&
                  form.state.values.fundCluster !== '' &&
                  ' (Cluster: +1)'}
                {form.state.values.type &&
                  form.state.values.type !== '' &&
                  ' (Source: +2)'}
                {form.state.values.authorization &&
                  form.state.values.authorization !== '' &&
                  ' (Auth: +3)'}
                • {currentLength}/{requiredLength}
              </div>

              <FieldInfo field={field} />
            </div>
          )
        }}
      />
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <SubmitButton type="submit" loading={isLoading}>
          Update Fund Source
        </SubmitButton>
      </div>
    </form>
  )
}
