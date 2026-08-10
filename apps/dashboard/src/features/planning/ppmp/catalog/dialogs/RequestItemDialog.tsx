/**
 * RequestItemDialog
 * Modal for submitting new item requests
 * Used from UserCatalogTab and UserRequestsTab (User role)
 *
 * Features:
 * - TanStack Form + Zod validation
 * - Cascading Procurement Category → Item Category dropdowns
 * - Image upload with URL.createObjectURL preview
 * - Form reset after successful submission
 */

import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { useForm } from '@tanstack/react-form'
import { Image as ImageIcon, X, Upload } from 'lucide-react'

import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
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
  requestItemDialogOpenAtom,
  imagePreviewUrlAtom,
  selectedImageFileAtom,
} from '../atoms/requestAtoms'
import { itemRequestsAtom, currentUserAtom } from '../atoms/catalogAtoms'
import { buildItemRequest } from '../handlers/requestWorkflow'
import {
  UACS_CASCADE_MAP,
  getUacsItemCategories,
  PROCUREMENT_CATEGORIES,
} from '../utils/cascadingUacs'

import type { CreateItemRequestInput } from '../types/catalog.types'
import type { RequestItemFormValues } from '../forms/requestItemFormSchema'

export function RequestItemDialog() {
  const [isOpen, setIsOpen] = useAtom(requestItemDialogOpenAtom)
  const [imagePreviewUrl, setImagePreviewUrl] = useAtom(imagePreviewUrlAtom)
  const [selectedImageFile, setSelectedImageFile] = useAtom(
    selectedImageFileAtom,
  )
  const [, setRequests] = useAtom(itemRequestsAtom)
  const currentUser = useAtom(currentUserAtom)[0]
  const [selectedProcCategory, setSelectedProcCategory] = useState<
    keyof typeof UACS_CASCADE_MAP | ''
  >('')
  const [itemCategories, setItemCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toRequestInput = (values: RequestItemFormValues): CreateItemRequestInput => ({
    name: values.name,
    procurementCategory: values.procurementCategory,
    itemCategory: values.itemCategory,
    unitOfMeasure: values.unitOfMeasure,
    estimatedUnitCost: values.estimatedUnitCost,
    specifications: values.specifications,
    imageUrl: imagePreviewUrl,
  })

  const form = useForm({
    defaultValues: {
      name: '',
      procurementCategory: 'Goods' as const,
      itemCategory: '',
      unitOfMeasure: '',
      estimatedUnitCost: 0,
      specifications: '',
    },
    onSubmit: async ({ value }) => {
      await handleSubmit(value)
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
      // Reset item category when procurement changes
      form.setFieldValue('itemCategory', '')
    }
  }, [form.getFieldValue('procurementCategory')])

  async function handleSubmit(values: RequestItemFormValues) {
    try {
      setIsSubmitting(true)
      const requestInput = toRequestInput(values)
      const newRequest = buildItemRequest(requestInput, currentUser, 'Submitted')
      setRequests((prev) => [newRequest, ...prev])

      // Show success toast
      toast.success(
        'Request submitted! Track its status in the Item Requests tab.',
        {
          duration: 4000,
        },
      )

      // Reset form and close dialog
      form.reset()
      setImagePreviewUrl(null)
      setSelectedImageFile(null)
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to submit request. Please try again.')
      console.error('Request submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveDraft() {
    try {
      setIsSubmitting(true)
      const draftValues = form.state.values as RequestItemFormValues
      const requestInput = toRequestInput(draftValues)
      const newRequest = buildItemRequest(requestInput, currentUser, 'Draft')
      setRequests((prev) => [newRequest, ...prev])

      toast.success('Draft saved. You can finish it later from My Requests.', {
        duration: 4000,
      })

      form.reset()
      setImagePreviewUrl(null)
      setSelectedImageFile(null)
      setIsOpen(false)
    } catch (error) {
      toast.error('Failed to save draft. Please try again.')
      console.error('Draft save error:', error)
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
      setIsOpen(false)
    }
  }

  return (
    <ResponsiveDialogDashtail
      open={isOpen}
      onOpenChange={handleClose}
      title="Request New Item"
      description="Save a draft or submit a new Non-CSE item request for Technical Working Group review."
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
                placeholder="e.g., Dell Latitude 5000 Series Laptop"
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
        <form.Field
          name="procurementCategory"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Please select a category'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="procCategory">
                Procurement Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value as any)
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="procCategory">
                  <SelectValue placeholder="Select category..." />
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

        {/* Item Category (Cascading) */}
        <form.Field
          name="itemCategory"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'Please select an item category'
              return undefined
            },
          }}
        >
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
                  <SelectValue
                    placeholder={
                      selectedProcCategory
                        ? 'Select item category...'
                        : 'Select procurement category first'
                    }
                  />
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
        <form.Field
          name="unitOfMeasure"
          validators={{
            onChange: ({ value }) => {
              if (!value) return 'UoM is required'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="uom">
                Unit of Measurement <span className="text-destructive">*</span>
              </Label>
              <Input
                id="uom"
                placeholder="e.g., unit, piece, set, ream"
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
        <form.Field
          name="estimatedUnitCost"
          validators={{
            onChange: ({ value }) => {
              if (value === undefined || value === null || value <= 0)
                return 'Cost must be greater than 0'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="cost">
                Estimated Unit Cost (₱)
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
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

        {/* Specifications/Justification */}
        <form.Field
          name="specifications"
          validators={{
            onChange: ({ value }) => {
              if (!value || value.length < 20)
                return 'Specifications must be at least 20 characters'
              if (value.length > 1000)
                return 'Specifications must not exceed 1000 characters'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="specs">
                Technical Specifications/Justification
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="specs"
                placeholder="Describe the item specifications, features, and why it's needed..."
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
          <Label>
            Item Image <span className="text-muted-foreground">(Optional)</span>
          </Label>
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
                {selectedImageFile?.name}
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
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Draft...' : 'Save as Draft'}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Upload className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </ResponsiveDialogDashtail>
  )
}
