/**
 * Create PR Modal
 * Dialog for creating new Purchase Requests with header details
 */

import { useEffect, useMemo, useState } from 'react'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import * as z from 'zod'
import { useCreatePurchaseRequest } from '../handlers/hooks'
import { toApiPrType } from '../types/apiTypes'
import { useDashboardRole } from '@/hooks/useDashboardRole'
import { categoryRequiresTorAttachment } from '../utils/torAttachment'
import type { PurchaseRequest } from '../types'
import type { ProcurementCategory } from '@/lib/fiscal-year-and-policies/types'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import FileUpload from '@/components/features/planning/file-upload/FileUpload'
import { createFileRequest } from '@/components/features/planning/file-upload/handlers/createFileRequest'
import { useToast } from '@/components/ui/use-toast'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useProcurementCategories } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementCategories'
import FieldInfo from '@/components/FieldInfo'
import {
  getOfficesRequest,
  type Office,
} from '@/features/planning/app-consolidation/handlers/getOfficesRequest'

// function generateUUID(): string {
//   const nativeId = globalThis.crypto?.randomUUID?.()
//   if (typeof nativeId === 'string') {
//     return nativeId
//   }

  // return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
  //   const r = (Math.random() * 16) | 0
  //   const v = c === 'x' ? r : (r & 0x3) | 0x8
  //   return v.toString(16)
  // })
// }

const createPRSchema = z.object({
  date: z.date(),
  prNumber: z.string().min(1, 'PR Number is required'),
  procurementCategoryId: z.string().min(1, 'Procurement category is required'),
  officeId: z.string().min(1, 'Office is required'),
  description: z.string().nullable(),
  purpose: z.string().min(1, 'Purpose is required'),
  torAttachment: z
    .object({
      name: z.string(),
      url: z.string(),
      mimeType: z.string(),
      size: z.number(),
      uploadedAt: z.string(),
    })
    .nullable(),
})

type CreatePRFormData = z.infer<typeof createPRSchema>
type TorAttachmentValue = CreatePRFormData['torAttachment']

const useUploadFile = createMutationHookFromTemplate(createFileRequest)
const useOffices = createQueryHookFromTemplate(getOfficesRequest)

interface CreatePRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prType: 'non-cse' | 'out-of-stock' | 'consolidated'
  onSuccess?: (pr: PurchaseRequest) => void
}

export function CreatePRModal({
  open,
  onOpenChange,
  prType,
  onSuccess,
}: CreatePRModalProps) {
  const createPRMutation = useCreatePurchaseRequest()
  const { departmentId } = useDashboardRole()
  const { toast } = useToast()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [torUploadResetKey, setTorUploadResetKey] = useState(0)
  const uploadMutation = useUploadFile()

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useProcurementCategories({
      pathParams: {},
      queryParams: {},
    })

  const { data: officesResponse, isLoading: isOfficesLoading } = useOffices({})

  const procurementCategories = useMemo<Array<ProcurementCategory>>(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse],
  )

  const offices = useMemo<Array<Office>>(() => officesResponse ?? [], [officesResponse])

  const defaultValues: CreatePRFormData = {
    date: new Date(),
    prNumber: '',
    procurementCategoryId: '',
    officeId: '',
    description: null,
    purpose: '',
    torAttachment: null,
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createPRSchema,
    },
    onSubmit: async ({ value }) => {
      const selectedCategory = procurementCategories.find(
        (category) => category.id === value.procurementCategoryId,
      )
      const requiresTor = categoryRequiresTorAttachment(selectedCategory)

      try {
        const officeId = value.officeId
        const officeNameById = new Map(offices.map((office) => [office.id, office.name]))
        const result = await createPRMutation.mutateAsync({
          pathParams: {},
          payload: {
            requestedDate: format(value.date, 'yyyy-MM-dd'),
            prNumber: value.prNumber,
            procurementCategoryId: value.procurementCategoryId,
            description: value.description ?? '',
            purpose: value.purpose,
            officeId,
            prType: toApiPrType(prType),
            // TODO: add fundClusterId + uacsCodeCombinationId selectors to this form
          },
        })

        if (!result.succeeded || !result.data) {
          throw new Error(result.message || 'Failed to create PR')
        }

        const newPR: PurchaseRequest = {
          id: result.data,
          type: prType as PurchaseRequest['type'],
          status: 'draft',
          headerDetails: {
            date: format(value.date, 'yyyy-MM-dd'),
            prNumber: value.prNumber,
            description: value.description ?? '',
            purpose: value.purpose,
            officeId,
            officeName: officeNameById.get(officeId) ?? '',
            procurementCategoryId: selectedCategory?.id,
            procurementCategoryName: selectedCategory?.name,
            torRequired: requiresTor,
            isHighlyTechnicalGoodsServices:
              selectedCategory?.isHighlyTechnicalGoodsServices,
          },
          items: [],
          totalAmount: 0,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          torAttachment: requiresTor ? value.torAttachment : null,
        }

        toast({
          title: 'Purchase Request Created',
          description: `PR ${value.prNumber} has been created as draft. You can now add items.`,
        })

        form.reset()
        onOpenChange(false)
        onSuccess?.(newPR)
      } catch (error) {
        console.error('Failed to create PR:', error)
        toast({
          title: 'Error Creating PR',
          description:
            'An error occurred while creating the purchase request. Please try again.',
        })
      }
    },
  })

  useEffect(() => {
    if (!departmentId || offices.length === 0) return
    const selected = form.getFieldValue('officeId')
    if (
      !selected &&
      offices.some((office) => office.id === departmentId)
    ) {
      form.setFieldValue('officeId', departmentId)
    }
  }, [departmentId, offices, form])

  const isSubmitting = form.state.isSubmitting || createPRMutation.isPending

  const uploadTorFile = async (
    file: File | null,
    onChange: (value: TorAttachmentValue) => void,
  ) => {
    if (!file) {
      onChange(null)
      return
    }

    try {
      const result = await uploadMutation.mutateAsync({
        pathParams: {},
        payload: { file },
      })

      if (!result.succeeded || !result.data) {
        throw new Error(result.message || 'Failed to upload TOR')
      }

      onChange({
        name: file.name,
        url: result.data,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })
      setTorUploadResetKey((value) => value + 1)
    } catch (error) {
      console.error('Failed to upload TOR:', error)
      toast({
        title: 'TOR Upload Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Unable to attach the Terms of Reference. Please try again.',
      })
      setTorUploadResetKey((value) => value + 1)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Purchase Request"
      description={
        prType === 'non-cse'
          ? 'Create a Purchase Request for Non-CSE items'
          : prType === 'out-of-stock'
            ? 'Create a Purchase Request for Out-of-Stock items'
            : 'Create a Consolidated Purchase Request'
      }
      fitContent={true}
      className="max-w-[980px] w-full"
      footer={
        <div className="mt-6 flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-pr-form"
            disabled={isSubmitting || uploadMutation.isPending}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      }
      showCloseButton
      size="lg"
    >
      <form
        id="create-pr-form"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()

          form.handleSubmit()
        }}
        className="max-h-[calc(90vh-180px)] overflow-y-auto pr-1"
      >
        <div className="space-y-6">
            <form.Field name="date">
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    PR Date <span className="text-red-500">*</span>
                  </label>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.state.value
                          ? format(field.state.value, 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.state.value}
                        onSelect={(date) => {
                          field.handleChange(date ?? new Date())
                          setIsDatePickerOpen(false)
                        }}
                        disabled={(date: Date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="prNumber">
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    PR Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., PR-2024-001"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Unique identifier for this Purchase Request
                  </p>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="procurementCategoryId">
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Procurement Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    disabled={
                      isCategoriesLoading ||
                      isSubmitting ||
                      uploadMutation.isPending
                    }
                    onValueChange={(value) => {
                      field.handleChange(value)
                      const nextCategory = procurementCategories.find(
                        (category) => category.id === value,
                      )

                      if (!categoryRequiresTorAttachment(nextCategory)) {
                        form.setFieldValue('torAttachment', null)
                      }
                    }}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isCategoriesLoading
                            ? 'Loading procurement categories...'
                            : 'Select a procurement category'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {procurementCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select the procurement category to determine whether TOR is
                    required.
                  </p>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="officeId">
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Office <span className="text-red-500">*</span>
                  </label>
                  <Select
                    disabled={
                      isOfficesLoading ||
                      isSubmitting ||
                      uploadMutation.isPending
                    }
                    onValueChange={(value) => field.handleChange(value)}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isOfficesLoading
                            ? 'Loading offices...'
                            : 'Select an office'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {offices.map((office) => (
                        <SelectItem key={office.id} value={office.id}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Select one office for this purchase request.
                  </p>
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe the purpose of this PR..."
                    className="resize-none"
                    rows={3}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      field.handleChange(nextValue === '' ? null : nextValue)
                    }}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Field name="purpose">
              {(field) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Explain the purpose and justification..."
                    className="resize-none"
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => {
                const selectedCategory = procurementCategories.find(
                  (category) =>
                    category.id === state.values?.procurementCategoryId,
                )

                return categoryRequiresTorAttachment(selectedCategory)
              }}
            >
              {(requiresTor) => {
                if (!requiresTor) {
                  return null
                }

                return (
                  <form.Field
                    name="torAttachment"
                    validators={{
                      onSubmit: ({ value }) => {
                        if (!value?.url) {
                          return 'Terms of Reference is required for the selected category.'
                        }
                        return undefined
                      },
                    }}
                  >
                    {(field) => (
                      <div
                        className={`space-y-4 rounded-xl border p-4 ${
                          field.state.meta.errors.length > 0
                            ? 'border-destructive bg-destructive/5'
                            : 'border-amber-200 bg-linear-to-br from-amber-50 to-orange-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-amber-900">
                            Terms of Reference (TOR) - Required for this
                            category
                          </p>
                          <p className="text-xs text-amber-800">
                            Upload a PDF or Word document up to 10 MB before
                            creating this PR draft.
                          </p>
                        </div>

                        <FileUpload
                          key={torUploadResetKey}
                          acceptedTypes=".pdf,.doc,.docx"
                          disabled={isSubmitting || uploadMutation.isPending}
                          existingFileName={field.state.value?.name}
                          existingFileUrl={field.state.value?.url}
                          maxSize={10}
                          validationState={
                            field.state.meta.errors.length > 0
                              ? 'error'
                              : 'default'
                          }
                          onFileChange={(file) => {
                            void uploadTorFile(file, field.handleChange)
                          }}
                        />

                        {uploadMutation.isPending && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading TOR...
                          </div>
                        )}

                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                )
              }}
            </form.Subscribe>
        </div>
      </form>
    </ResponsiveDialog>
  )
}
