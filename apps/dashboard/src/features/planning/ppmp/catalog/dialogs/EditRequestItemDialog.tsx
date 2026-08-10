/**
 * EditRequestItemDialog
 * Modal for editing draft or returned item requests
 * Only accessible when request status === 'Draft' or 'Returned'
 *
 * Features:
 * - Pre-fills form with existing request data
 * - Same validation as RequestItemDialog
 * - Updates request in itemRequestsAtom
 */

import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { useForm } from '@tanstack/react-form'
import { Image as ImageIcon, X, Upload } from 'lucide-react'

import {
  ResponsiveDialogDashtail,
  //   type ResponsiveDialogDashtailProps,
} from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

import {
  editRequestDialogOpenAtom,
  editingRequestIdAtom,
  imagePreviewUrlAtom,
  selectedImageFileAtom,
} from '../atoms/requestAtoms'
import { itemRequestsAtom } from '../atoms/catalogAtoms'
import { updateItemRequest } from '../handlers/requestWorkflow'
import {
  UACS_CASCADE_MAP,
  getUacsItemCategories,
  PROCUREMENT_CATEGORIES,
} from '../utils/cascadingUacs'

import type { CreateItemRequestInput } from '../types/catalog.types'
import type { RequestItemEditFormValues } from '../forms/requestItemFormSchema'

export function EditRequestItemDialog() {
  const [isOpen, setIsOpen] = useAtom(editRequestDialogOpenAtom)
  const [editingRequestId, setEditingRequestId] = useAtom(editingRequestIdAtom)
  const [imagePreviewUrl, setImagePreviewUrl] = useAtom(imagePreviewUrlAtom)
  const [selectedImageFile, setSelectedImageFile] = useAtom(
    selectedImageFileAtom,
  )
  const [requests, setRequests] = useAtom(itemRequestsAtom)
  const [selectedProcCategory, setSelectedProcCategory] = useState<
    keyof typeof UACS_CASCADE_MAP | ''
  >('')
  const [itemCategories, setItemCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the request being edited
  const requestToEdit = requests.find((r) => r.id === editingRequestId)
  const isDraftRequest = requestToEdit?.status === 'Draft'
  const isReturnedRequest = requestToEdit?.status === 'Returned'
  const canEditRequest = isDraftRequest || isReturnedRequest

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      id: editingRequestId || '',
      name: requestToEdit?.name || '',
      procurementCategory: (requestToEdit?.procurementCategory || 'Goods') as
        | 'Goods'
        | 'Infra'
        | 'Consulting',
      itemCategory: requestToEdit?.itemCategory || '',
      unitOfMeasure: requestToEdit?.unitOfMeasure || '',
      estimatedUnitCost: requestToEdit?.estimatedUnitCost || 0,
      specifications: requestToEdit?.specifications || '',
    },
    onSubmit: async ({ value }) => {
      if (isReturnedRequest) {
        await handleSubmit(value)
        return
      }

      await handleSaveDraft()
    },
  })

  // Update item categories when procurement category changes
  useEffect(() => {
    const procCat = form.getFieldValue(
      'procurementCategory',
    ) as keyof typeof UACS_CASCADE_MAP
    if (procCat && PROCUREMENT_CATEGORIES.includes(procCat)) {
      setSelectedProcCategory(procCat)
      const categories = getUacsItemCategories(procCat)
      setItemCategories(categories)
    }
  }, [form.getFieldValue('procurementCategory')])

  // Initialize image preview and categories on mount
  useEffect(() => {
    if (isOpen && requestToEdit) {
      const procCat =
        requestToEdit.procurementCategory as keyof typeof UACS_CASCADE_MAP
      setSelectedProcCategory(procCat)
      const categories = getUacsItemCategories(procCat)
      setItemCategories(categories)

      if (requestToEdit.imageUrl) {
        setImagePreviewUrl(requestToEdit.imageUrl)
      }
    }
  }, [isOpen, requestToEdit])

  async function handleSubmit(values: RequestItemEditFormValues) {
    try {
      setIsSubmitting(true)
      const requestInput: CreateItemRequestInput = {
        name: values.name,
        procurementCategory: values.procurementCategory,
        itemCategory: values.itemCategory,
        unitOfMeasure: values.unitOfMeasure,
        estimatedUnitCost: values.estimatedUnitCost,
        specifications: values.specifications,
        imageUrl: imagePreviewUrl,
      }

      // Find and update request
      setRequests((prev) =>
        prev.map((req) =>
          req.id === editingRequestId
            ? updateItemRequest(
                req,
                {
                  ...requestInput,
                  imageUrl: imagePreviewUrl ?? req.imageUrl ?? null,
                },
                'Submitted',
              )
            : req,
        ),
      )

      toast.success(
        isReturnedRequest
          ? 'Request resubmitted successfully!'
          : 'Draft updated successfully!',
        { duration: 4000 },
      )

      // Reset form and close dialog
      form.reset()
      setImagePreviewUrl(null)
      setSelectedImageFile(null)
      setEditingRequestId(null)
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to update request. Please try again.')
      console.error('Request update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveDraft() {
    try {
      setIsSubmitting(true)

      const values = form.state.values as RequestItemEditFormValues
      const requestInput: CreateItemRequestInput = {
        name: values.name,
        procurementCategory: values.procurementCategory,
        itemCategory: values.itemCategory,
        unitOfMeasure: values.unitOfMeasure,
        estimatedUnitCost: values.estimatedUnitCost,
        specifications: values.specifications,
        imageUrl: imagePreviewUrl,
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.id === editingRequestId
            ? updateItemRequest(
                req,
                {
                  ...requestInput,
                  imageUrl: imagePreviewUrl ?? req.imageUrl ?? null,
                },
                'Draft',
              )
            : req,
        ),
      )

      toast.success('Draft updated successfully!', { duration: 4000 })

      form.reset()
      setImagePreviewUrl(null)
      setSelectedImageFile(null)
      setEditingRequestId(null)
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to update draft. Please try again.')
      console.error('Draft update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleImageChange(file: File | undefined) {
    if (!file) {
      setImagePreviewUrl(null)
      setSelectedImageFile(null)
      return
    }

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Image must be JPEG or PNG')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreviewUrl(previewUrl)
    setSelectedImageFile(file)
  }

  function handleRemoveImage() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setImagePreviewUrl(null)
    setSelectedImageFile(null)
  }

  function handleClose(open: boolean) {
    if (!open) {
      // Clean up image URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
      // Reset form
      form.reset()
      setImagePreviewUrl(null)
      setSelectedImageFile(null)
      setEditingRequestId(null)
      setIsOpen(false)
    }
  }

  // Don't render if no request selected
  if (!requestToEdit || !canEditRequest) {
    return null
  }

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={handleClose}
      title="Edit Item Request"
      description={
        isReturnedRequest
          ? 'Update your returned item request and resubmit it for review.'
          : 'Update your draft item request and save it for later.'
      }
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Item Name */}
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              if (value && value.length < 3) return 'Minimum 3 characters'
              if (value && value.length > 100) return 'Maximum 100 characters'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="name">
                Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={isSubmitting}
              />
              {field.state.meta.errors && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Procurement Category */}
        <form.Field name="procurementCategory">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="procCategory">
                Procurement Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="procCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROCUREMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Item Category */}
        <form.Field name="itemCategory">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="itemCategory">
                Item Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                disabled={!selectedProcCategory || isSubmitting}
              >
                <SelectTrigger id="itemCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Unit of Measurement */}
        <form.Field name="unitOfMeasure">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="uom">
                Unit of Measurement <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uom"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={isSubmitting}
              />
              {field.state.meta.errors && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Estimated Unit Cost */}
        <form.Field name="estimatedUnitCost">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="cost">
                Estimated Unit Cost (₱)
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost"
                type="number"
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value ? parseFloat(e.target.value) : 0,
                  )
                }
                onBlur={field.handleBlur}
                disabled={isSubmitting}
                step="0.01"
                min="0"
              />
              {field.state.meta.errors && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Specifications */}
        <form.Field name="specifications">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="specs">
                Technical Specifications{' '}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="specs"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                disabled={isSubmitting}
                rows={4}
                className="min-h-24"
              />
              <div className="text-xs text-muted-foreground">
                {field.state.value.length}/1000 characters
              </div>
              {field.state.meta.errors && (
                <p className="text-xs text-destructive">
                  {field.state.meta.errors.join(', ')}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Item Image (Optional)</Label>
          {imagePreviewUrl ? (
            <div className="space-y-2">
              <div className="relative w-full max-w-xs rounded-lg border border-border overflow-hidden bg-muted">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedImageFile?.name || 'Image preview'}
              </p>
            </div>
          ) : (
            <label className="flex flex-col gap-3 items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageChange(file)
                }}
                disabled={isSubmitting}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {isReturnedRequest ? (
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Upload className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Resubmitting...' : 'Resubmit Request'}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={isSubmitting}
              className="gap-2"
              onClick={handleSaveDraft}
            >
              {isSubmitting && <Upload className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </Button>
          )}
        </div>
      </form>
    </ResponsiveDialogDashtail>
  )
}
