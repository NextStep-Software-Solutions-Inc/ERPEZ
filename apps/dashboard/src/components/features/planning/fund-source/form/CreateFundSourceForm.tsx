import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { useAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useState } from 'react'
import { createFormDataAtom } from '../atoms'
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

const useFundCluster = createQueryHookFromTemplate(getFundSourcesRequest)
const useFinancingSource = createQueryHookFromTemplate(getFundSourcesRequest)
const useAuthorizationCode = createQueryHookFromTemplate(getFundSourcesRequest)
const useFundCategory = createQueryHookFromTemplate(getFundSourcesRequest)

// Helper function to filter children by parent ID
const filterByParentId = (
  items: Array<any> | undefined,
  parentId: string | null | undefined,
) => {
  if (!items || !parentId) return []
  return items.filter((item) => item.parentId === parentId)
}
// Schema for FundSource creation
export const createFundSourceSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Fund source name is required')
      .max(100, 'Name must be 100 characters or less'),
    code: z.string(),
    // .min(1, 'Code is required')
    // .max(50, 'Code must be 50 characters or less'),
    parentId: z.string().nullable().optional(),
    category: z.string().optional().or(z.literal('')),
    type: z.string(),
    isActive: z.boolean().default(true),
    fundCluster: z.string().optional().or(z.literal('')),
    authorization: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    // If category is selected, other fields become required
    if (data.category && data.category !== '') {
      if (!data.authorization || data.authorization === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['authorization'],
          message: 'Authorization is required when Fund Category is selected',
        })
      }
      if (!data.type || data.type === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['type'],
          message:
            'Financing Source is required when Fund Category is selected',
        })
      }
      if (!data.fundCluster || data.fundCluster === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['fundCluster'],
          message: 'Fund Cluster is required when Fund Category is selected',
        })
      }
      if (!data.parentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['parentId'],
          message: 'Parent is required when Fund Category is selected',
        })
      }
    }
  })

export type CreateFundSourceFormValues = z.infer<typeof createFundSourceSchema>
export type CreateFundSourceType = {
  name: string
  code: string
  type: string
  isActive: boolean
  parentId: string | null
}

// Form data type
export type CreateFundSourceFormType = Omit<FundSource, 'id'>

interface CreateFundSourceFormProps {
  onSubmit: (data: CreateFundSourceFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  initialValues?: Partial<CreateFundSourceFormValues>
}

interface FundSourceFormConfig {
  onSubmit: (data: CreateFundSourceType) => void
  initialValues?: Partial<CreateFundSourceFormType>
}

// Helper function to truncate text for display
const truncateText = (
  text: string | undefined,
  maxLength: number = 30,
): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const createFormFactory = ({ onSubmit, initialValues }: FundSourceFormConfig) =>
  useForm({
    defaultValues: {
      name: '',
      code: '',
      category: '',
      type: '',
      isActive: true,
      fundCluster: '',
      authorization: '',
      parentId: null,

      ...initialValues,
    },
    onSubmit: (values) => {
      // Determine type and parentId based on field values hierarchy
      let type = 'FundCluster'
      let parentId: string | null = null

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
        parentId = null
      }

      const payload: CreateFundSourceType = {
        name: values.value.name,
        code: values.value.code,
        type,
        isActive: values.value.isActive,
        parentId,
      }

      onSubmit(payload)
    },
  })

export default function CreateFundSourceForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues = {},
}: CreateFundSourceFormProps) {
  const [formData, setFormData] = useAtom(createFormDataAtom)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const fundCluster = useFundCluster({
    pathParams: {},
    queryParams: { filters: 'type==FundCluster' },
  })
  const financingSource = useFinancingSource({
    pathParams: {},
    queryParams: { filters: 'type==FinancingSource' },
  })
  const authorizationCode = useAuthorizationCode({
    pathParams: {},
    queryParams: { filters: 'type==AuthorizationCode' },
  })
  const fundCategory = useFundCategory({
    pathParams: {},
    queryParams: { filters: 'type==FundCategory' },
  })

  const form = createFormFactory({
    onSubmit,
    initialValues: {
      name: '',
      code: '',
      category: '',
      type: '',
      isActive: true,
      fundCluster: '',
      authorization: '',
      ...initialValues,
      ...formData,
    },
  })

  const handleCancel = () => {
    onCancel()
  }

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
  //   const requiredLength = getRequiredCodeLength()
  //   const numericValue = value.replace(/\D/g, '')

  //   if (!value || value === '') {
  //     return 'Code is required'
  //   }

  //   // Check if code contains only numbers
  //   if (!/^\d+$/.test(value)) {
  //     return 'Code must contain only numbers'
  //   }

  //   // Check length
  //   if (numericValue.length !== requiredLength) {
  //     return `Code must be exactly ${requiredLength} digit${requiredLength !== 1 ? 's' : ''}`
  //   }

  //   if (value.length > 50) {
  //     return 'Code must be 50 characters or less'
  //   }

  //   return undefined
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
                        {fundCluster.data?.data.map((item) => (
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
        //   onChange: ({ value }) => {
        //     return validateCodeLength(value)
        //   },
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
              {field.state.meta.errors.length > 0 && (
                <p className="text-sm text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
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
        <SubmitButton type="submit" className="bg-(--button-green)">
          <Plus className="w-4 h-4 mr-1" />
          Create Fund Source
        </SubmitButton>
      </div>
    </form>
  )
}
