/**
 * CatalogItemForm
 * Shared TanStack Form component used by both CreateItemDialog and EditItemDialog.
 * Validates with Zod via safeParse on submit.
 * Matches CreateCatalogItemInput / UpdateCatalogItemInput contracts.
 */

import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { Image as ImageIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  CATALOG_UOM_OPTIONS,
  PROCUREMENT_CATEGORY_OPTIONS,
} from '../types/catalog.types'
import {
  catalogItemFormSchema,
  type CatalogItemFormValues,
} from './CatalogItemFormSchema'

interface CatalogItemFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<CatalogItemFormValues>
  onSubmit: (data: CatalogItemFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CatalogItemForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: CatalogItemFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    (defaultValues?.imageUrl as string | null) ?? null,
  )

  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? '',
      itemType: defaultValues?.itemType ?? 'Goods',
      category: defaultValues?.category ?? '',
      subcategory: defaultValues?.subcategory ?? '',
      unitOfMeasure: defaultValues?.unitOfMeasure ?? 'piece',
      currentPrice: defaultValues?.currentPrice ?? 0,
      specification: defaultValues?.specification ?? '',
      supplier: defaultValues?.supplier ?? '',
      uacsCode: defaultValues?.uacsCode ?? '',
      unspscCode: defaultValues?.unspscCode ?? '',
      isCSE: defaultValues?.isCSE ?? false,
      imageUrl: defaultValues?.imageUrl ?? null,
    } as CatalogItemFormValues,
    onSubmit: async ({ value }) => {
      const result = catalogItemFormSchema.safeParse(value)
      if (result.success) {
        onSubmit(result.data)
      } else {
        console.error('Validation failed:', result.error.flatten())
      }
    },
  })

  function handleImageChange(file: File | undefined) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Image must be JPEG, PNG, or WebP')
      return
    }
    const url = URL.createObjectURL(file)
    setImagePreviewUrl(url)
    form.setFieldValue('imageUrl', url)
  }

  function handleRemoveImage() {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setImagePreviewUrl(null)
    form.setFieldValue('imageUrl', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      {/* Name */}
      <form.Field name="name">
        {(field) => (
          <div className="space-y-1.5">
            <Label>
              Item Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={field.state.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="e.g. Dell Latitude 5000 Laptop"
              disabled={isLoading}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive">
                {String(field.state.meta.errors[0])}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        {/* Item Type */}
        <form.Field name="itemType">
          {(field) => (
            <div className="space-y-1.5">
              <Label>
                Item Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value as string}
                onValueChange={(v) =>
                  field.handleChange(
                    v as (typeof PROCUREMENT_CATEGORY_OPTIONS)[number],
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROCUREMENT_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Category */}
        <form.Field name="category">
          {(field) => (
            <div className="space-y-1.5">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Input
                value={field.state.value as string}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. IT Equipment"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Subcategory */}
        <form.Field name="subcategory">
          {(field) => (
            <div className="space-y-1.5">
              <Label>Subcategory</Label>
              <Input
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value || null)}
                placeholder="e.g. Computers"
                disabled={isLoading}
              />
            </div>
          )}
        </form.Field>

        {/* Supplier */}
        <form.Field name="supplier">
          {(field) => (
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <Input
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value || null)}
                placeholder="e.g. Dell Philippines"
                disabled={isLoading}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Unit of Measure */}
        <form.Field name="unitOfMeasure">
          {(field) => (
            <div className="space-y-1.5">
              <Label>
                Unit of Measure <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value as string}
                onValueChange={(v) =>
                  field.handleChange(v as typeof field.state.value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UoM" />
                </SelectTrigger>
                <SelectContent>
                  {CATALOG_UOM_OPTIONS.map((uom) => (
                    <SelectItem key={uom} value={uom} className="capitalize">
                      {uom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Current Price */}
        <form.Field name="currentPrice">
          {(field) => (
            <div className="space-y-1.5">
              <Label>
                Unit Price (₱) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={field.state.value as number}
                onChange={(e) =>
                  field.handleChange(parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive">
                  {String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Specification */}
      <form.Field name="specification">
        {(field) => (
          <div className="space-y-1.5">
            <Label>Technical Specification</Label>
            <Textarea
              value={(field.state.value as string) ?? ''}
              onChange={(e) => field.handleChange(e.target.value || null)}
              placeholder="Detailed technical specifications..."
              rows={3}
              disabled={isLoading}
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        {/* UACS Code */}
        <form.Field name="uacsCode">
          {(field) => (
            <div className="space-y-1.5">
              <Label>UACS Code</Label>
              <Input
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value || null)}
                placeholder="e.g. 30111500-IT-EQP-001"
                disabled={isLoading}
              />
            </div>
          )}
        </form.Field>

        {/* UNSPSC Code */}
        <form.Field name="unspscCode">
          {(field) => (
            <div className="space-y-1.5">
              <Label>UNSPSC Code</Label>
              <Input
                value={(field.state.value as string) ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. 43210000"
                disabled={isLoading}
              />
            </div>
          )}
        </form.Field>
      </div>

      <div>
        {/* Is CSE toggle */}
        <form.Field name="isCSE">
          {(field) => (
            <div className="space-y-1.5">
              <Label>&nbsp;</Label>
              <div className="flex items-center gap-2 h-9">
                <Checkbox
                  id="isCSE"
                  checked={field.state.value as boolean}
                  onCheckedChange={(checked) =>
                    field.handleChange(checked as boolean)
                  }
                  disabled={isLoading}
                />
                <label htmlFor="isCSE" className="text-sm cursor-pointer">
                  Common-Use Supply/Equipment (CSE)
                </label>
              </div>
            </div>
          )}
        </form.Field>
      </div>

      {/* Image Upload */}
      <div className="space-y-1.5">
        <Label>Item Image</Label>
        {imagePreviewUrl ? (
          <div className="relative w-full">
            <img
              src={imagePreviewUrl}
              alt="Item preview"
              className="w-full max-h-40 object-cover rounded-lg border border-border"
            />
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleRemoveImage}
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Click to upload image
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, WebP · max 5MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0])}
          disabled={isLoading}
        />
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? mode === 'create'
              ? 'Creating…'
              : 'Saving…'
            : mode === 'create'
              ? 'Create Item'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
