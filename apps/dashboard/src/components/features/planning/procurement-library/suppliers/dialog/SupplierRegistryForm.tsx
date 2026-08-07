import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { toast } from 'sonner'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import FileUpload from '../../../file-upload/FileUpload'
import { createFileRequest } from '../../../file-upload/handlers/createFileRequest'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PlusCircle, Trash2 } from 'lucide-react'
import {
  useCreateSupplier,
  useSupplierById,
  useSupplierCategories,
  useUpdateSupplier,
} from '../useSuppliers'
import {
  SUPPLIER_STATUS_OPTIONS,
  SupplierStatus,
  type SupplierFormValues,
  type SupplierRequirementFormValue,
} from '../types'

const useUploadFile = createMutationHookFromTemplate(createFileRequest)

interface SupplierRegistryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId?: string | null
  onSaved?: () => void
}

const generateRequirementId = () =>
  `requirement-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const createRequirementRow = (
  overrides: Partial<SupplierRequirementFormValue> = {},
): SupplierRequirementFormValue => ({
  id: generateRequirementId(),
  requirementName: '',
  file: null,
  fileId: null,
  ...overrides,
})

const createEmptyValues = (): SupplierFormValues => ({
  name: '',
  businessPermitNo: '',
  contactPerson: '',
  contactNumber: '',
  address: '',
  email: '',
  tinNumber: '',
  philGEPSNumber: '',
  supplierCategoryId: '',
  status: 'Pending',
  isBlacklisted: false,
  requirements: [createRequirementRow()],
})

const normalizeSupplierStatus = (
  value: string | null | undefined,
): SupplierStatus => {
  const normalizedValue = value?.trim().toLowerCase()

  if (normalizedValue === 'approved') {
    return 'Approved'
  }

  if (normalizedValue === 'declined') {
    return 'Declined'
  }

  return 'Pending'
}

const toNullable = (value: string | null | undefined) => {
  const trimmedValue = value?.trim()
  return trimmedValue ? trimmedValue : null
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'string' && error.trim()) {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  return fallback
}

export function SupplierRegistryForm({
  open,
  onOpenChange,
  supplierId,
  onSaved,
}: SupplierRegistryFormProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(supplierId)

  const { data: categoriesData } = useSupplierCategories({
    pathParams: {},
    queryParams: {},
  })

  const { data: supplierData, isLoading: isSupplierLoading } = useSupplierById({
    pathParams: { id: supplierId ?? '' },
    queryParams: {},
    enabled: open && isEditing,
  })

  const createMutation = useCreateSupplier()
  const updateMutation = useUpdateSupplier()
  const { mutateAsync: uploadFile, isPending: isUploadingFile } =
    useUploadFile()
  const categoryOptions = categoriesData?.data ?? []
  const supplierRecord = supplierData?.data

  const [formData, setFormData] =
    useState<SupplierFormValues>(createEmptyValues())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      setFormData(createEmptyValues())
      setErrors({})
      return
    }

    if (isEditing && supplierRecord) {
      setFormData({
        name: supplierRecord.name ?? '',
        businessPermitNo: supplierRecord.businessPermitNo ?? '',
        contactPerson: supplierRecord.contactPerson ?? '',
        contactNumber: supplierRecord.contactNumber ?? '',
        address: supplierRecord.address ?? '',
        email: supplierRecord.email ?? '',
        tinNumber: supplierRecord.tinNumber ?? '',
        philGEPSNumber: supplierRecord.philGEPSNumber ?? '',
        supplierCategoryId:
          supplierRecord.supplierCategory?.id ??
          supplierRecord.supplierCategoryId,
        status: normalizeSupplierStatus(supplierRecord.status),
        isBlacklisted: supplierRecord.isBlacklisted,
        requirements:
          supplierRecord.supplierRequirements?.map((requirement) => ({
            id: requirement.supplierRequirementId,
            requirementName: requirement.requirementName ?? '',
            file: null,
            fileId: requirement.fileId ?? null,
          })) ?? [],
      })
      setErrors({})
    }

    if (!isEditing) {
      setFormData(createEmptyValues())
      setErrors({})
    }
  }, [isEditing, open, supplierRecord])

  const handleClose = () => {
    onOpenChange(false)
    setFormData(createEmptyValues())
    setErrors({})
  }

  const validate = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.name.trim()) nextErrors.name = 'Supplier name is required'
    if (!formData.supplierCategoryId)
      nextErrors.supplierCategoryId = 'Supplier category is required'
    if (!formData.businessPermitNo.trim())
      nextErrors.businessPermitNo = 'Business permit number is required'
    if (!formData.philGEPSNumber.trim())
      nextErrors.philGEPSNumber = 'PhilGEPS number is required'
    if (!formData.contactPerson.trim())
      nextErrors.contactPerson = 'Contact person is required'
    if (!formData.contactNumber.trim())
      nextErrors.contactNumber = 'Contact number is required'
    if (!formData.address.trim()) nextErrors.address = 'Address is required'
    if (!formData.tinNumber.trim())
      nextErrors.tinNumber = 'TIN number is required'

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Invalid email format'
    }

    if (!isEditing) {
      if (!formData.requirements || formData.requirements.length === 0) {
        nextErrors.requirements = 'At least one requirement is required'
      } else {
        formData.requirements.forEach((requirement, index) => {
          if (!requirement.requirementName.trim()) {
            nextErrors[`supplierRequirements.${index}.requirementName`] =
              'Requirement name is required'
          }

          if (!requirement.file) {
            nextErrors[`supplierRequirements.${index}.file`] =
              'File is required'
          }
        })
      }
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    try {
      const uploadedRequirements = isEditing
        ? formData.requirements.map((requirement) => ({
            requirementName: toNullable(requirement.requirementName),
            fileId: toNullable(requirement.fileId),
          }))
        : await Promise.all(
            formData.requirements.map(async (requirement) => {
              if (!requirement.file) {
                throw new Error('File is required for each requirement')
              }
              const uploadResult = await uploadFile({
                pathParams: {},
                payload: { file: requirement.file },
              })

              if (!uploadResult?.data) {
                throw new Error('File upload failed')
              }

              return {
                requirementName: toNullable(requirement.requirementName),
                fileId: uploadResult.data,
              }
            }),
          )

      const createPayload = {
        name: toNullable(formData.name),
        businessPermitNo: toNullable(formData.businessPermitNo),
        contactPerson: toNullable(formData.contactPerson),
        contactNumber: toNullable(formData.contactNumber),
        address: toNullable(formData.address),
        email: toNullable(formData.email),
        tinNumber: toNullable(formData.tinNumber),
        philGEPSNumber: toNullable(formData.philGEPSNumber),
        supplierCategoryId: formData.supplierCategoryId,
        supplierRequirements: uploadedRequirements,
      }

      if (isEditing) {
        await updateMutation.mutateAsync({
          pathParams: { id: supplierId ?? '' },
          payload: {
            name: createPayload.name,
            businessPermitNo: createPayload.businessPermitNo,
            contactPerson: createPayload.contactPerson,
            contactNumber: createPayload.contactNumber,
            address: createPayload.address,
            email: createPayload.email,
            tinNumber: createPayload.tinNumber,
            philGEPSNumber: createPayload.philGEPSNumber,
            supplierCategoryId: createPayload.supplierCategoryId,
            isBlacklisted: formData.isBlacklisted,
            status: normalizeSupplierStatus(formData.status),
          },
        })
      } else {
        await createMutation.mutateAsync(
          {
            pathParams: {},
            payload: createPayload,
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) => {
                  const key = query.queryKey[0]
                  return typeof key === 'string' && key.startsWith('/suppliers')
                },
              })
            },
          },
        )
      }

      setErrors({})
      onSaved?.()
      handleClose()
    } catch (error) {
      const message = getErrorMessage(
        error,
        isEditing
          ? 'Unable to update supplier. Please try again.'
          : 'Unable to create supplier. Please try again.',
      )
      toast.error(message)
      setErrors((current) => ({
        ...current,
        submit: message,
      }))
    }
  }

  const removeRequirement = (index: number) => {
    setFormData((current) => {
      if (current.requirements.length === 1) {
        return current
      }

      return {
        ...current,
        requirements: current.requirements.filter((_, i) => i !== index),
      }
    })
  }

  const addRequirement = () => {
    setFormData((current) => ({
      ...current,
      requirements: [...current.requirements, createRequirementRow()],
    }))
  }

  const updateRequirement = (
    index: number,
    updates: Partial<SupplierRequirementFormValue>,
  ) => {
    setFormData((current) => ({
      ...current,
      requirements: current.requirements.map((requirement, i) =>
        i === index ? { ...requirement, ...updates } : requirement,
      ),
    }))
  }

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isUploadingFile

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={handleClose}
      title={isEditing ? 'Edit Supplier' : 'Create Supplier'}
      description={
        isEditing
          ? 'Update the supplier profile and compliance status.'
          : 'Register a new supplier in the procurement library.'
      }
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" form="supplier-form" disabled={isSaving}>
            {isSaving
              ? 'Saving...'
              : isEditing
                ? 'Update Supplier'
                : 'Create Supplier'}
          </Button>
        </div>
      }
    >
      {isEditing && isSupplierLoading ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
          Loading supplier details...
        </div>
      ) : (
        <form
          id="supplier-form"
          onSubmit={handleSubmit}
          className="space-y-5 p-2"
        >
          {errors.submit && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errors.submit}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="supplierCategoryId">
                Supplier Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.supplierCategoryId}
                disabled={isEditing}
                onValueChange={(value) =>
                  setFormData((current) => ({
                    ...current,
                    supplierCategoryId: value,
                  }))
                }
              >
                <SelectTrigger id="supplierCategoryId" disabled={isEditing}>
                  <SelectValue placeholder="Select supplier category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.length === 0 ? (
                    <SelectItem value="__loading" disabled>
                      {categoriesData
                        ? 'No supplier categories found'
                        : 'Loading categories...'}
                    </SelectItem>
                  ) : (
                    categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name || 'Unnamed category'}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.supplierCategoryId && (
                <p className="text-sm text-destructive">
                  {errors.supplierCategoryId}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">
                Supplier Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Enter supplier name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessPermitNo">
                Business Permit No <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessPermitNo"
                value={formData.businessPermitNo}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    businessPermitNo: event.target.value,
                  }))
                }
                placeholder="Enter business permit number"
                className={errors.businessPermitNo ? 'border-destructive' : ''}
              />
              {errors.businessPermitNo && (
                <p className="text-sm text-destructive">
                  {errors.businessPermitNo}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="philGEPSNumber">
                PhilGEPS Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="philGEPSNumber"
                value={formData.philGEPSNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    philGEPSNumber: event.target.value,
                  }))
                }
                placeholder="Enter PhilGEPS number"
              />
              {errors.philGEPSNumber && (
                <p className="text-sm text-destructive">
                  {errors.philGEPSNumber}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">
                Contact Person <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    contactPerson: event.target.value,
                  }))
                }
                placeholder="Enter contact person"
              />
              {errors.contactPerson && (
                <p className="text-sm text-destructive">
                  {errors.contactPerson}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">
                Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    contactNumber: event.target.value,
                  }))
                }
                placeholder="Enter contact number"
              />
              {errors.contactNumber && (
                <p className="text-sm text-destructive">
                  {errors.contactNumber}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Enter supplier address"
                rows={3}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="contact@company.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tinNumber">
                TIN Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tinNumber"
                value={formData.tinNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    tinNumber: event.target.value,
                  }))
                }
                placeholder="Enter TIN number"
              />
              {errors.tinNumber && (
                <p className="text-sm text-destructive">{errors.tinNumber}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              {!isEditing && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <Label className="mb-0">
                      Requirements <span className="text-destructive">*</span>
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="inline-flex items-center gap-2 text-primary"
                      onClick={addRequirement}
                      disabled={isSaving}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="text-sm">Add Requirement</span>
                    </Button>
                  </div>

                  {errors.requirements && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.requirements}
                    </p>
                  )}

                  <div className="mt-2 space-y-3">
                    {formData.requirements.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No requirements added yet.
                      </p>
                    )}

                    {formData.requirements.map((requirement, index) => (
                      <div
                        key={requirement.id}
                        className="space-y-3 rounded-md border border-border bg-muted/30 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Input
                            id={`req-name-${requirement.id}`}
                            value={requirement.requirementName}
                            onChange={(event) =>
                              updateRequirement(index, {
                                requirementName: event.target.value,
                              })
                            }
                            placeholder="Enter requirement name"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                            className="shrink-0 text-destructive"
                            aria-label="Remove requirement"
                            disabled={
                              formData.requirements.length === 1 || isSaving
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {errors[
                          `supplierRequirements.${index}.requirementName`
                        ] && (
                          <p className="text-sm text-destructive">
                            {
                              errors[
                                `supplierRequirements.${index}.requirementName`
                              ]
                            }
                          </p>
                        )}

                        <FileUpload
                          onFileChange={(file: File | null) =>
                            updateRequirement(index, {
                              file,
                              fileId: null,
                            })
                          }
                          acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          maxSize={10}
                          disabled={isSaving}
                        />
                        {errors[`supplierRequirements.${index}.file`] && (
                          <p className="text-sm text-destructive">
                            {errors[`supplierRequirements.${index}.file`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    disabled={isEditing}
                    onValueChange={(value) =>
                      setFormData((current: SupplierFormValues) => ({
                        ...current,
                        status: value as SupplierStatus,
                      }))
                    }
                  >
                    <SelectTrigger id="status" disabled={isEditing}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPLIER_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label ?? status.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <Checkbox
                    id="isBlacklisted"
                    checked={formData.isBlacklisted}
                    onCheckedChange={(checked) =>
                      setFormData((current) => ({
                        ...current,
                        isBlacklisted: !!checked,
                      }))
                    }
                  />
                  <Label htmlFor="isBlacklisted" className="font-normal">
                    Mark as blacklisted
                  </Label>
                </div>
              </>
            )}
          </div>
        </form>
      )}
    </ResponsiveDialogDashtail>
  )
}
