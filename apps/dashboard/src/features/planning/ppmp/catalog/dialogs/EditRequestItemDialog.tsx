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
import { Upload } from 'lucide-react'

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
  editRequestDialogOpenAtom,
  editingRequestIdAtom,
} from '../atoms/requestAtoms'
import {
  useItemRequests,
  useUpdateItemRequestMutation,
} from '../hooks/useItemRequestQueries'
import { getUomsRequest } from '@/components/features/planning/procurement-library/item-master/handlers/getUomsRequest'
import { getProcurementCategoriesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementCategoriesRequest'
import { useQuery } from '@tanstack/react-query'
import {
  UACS_CASCADE_MAP,
  getUacsItemCategories,
  PROCUREMENT_CATEGORIES,
} from '../utils/cascadingUacs'

import type { RequestItemEditFormValues } from '../forms/requestItemFormSchema'

export function EditRequestItemDialog() {
  const [isOpen, setIsOpen] = useAtom(editRequestDialogOpenAtom)
  const [editingRequestId, setEditingRequestId] = useAtom(editingRequestIdAtom)
  const { data: response } = useItemRequests({ pageSize: 100 })
  const { data: uomsResponse } = useQuery({
    queryKey: ['/uoms'],
    queryFn: ({ signal }) => getUomsRequest.fetcher({ finalUrl: '/uoms', signal }),
  })
  const { data: procurementCategoriesResponse } = useQuery({
    queryKey: ['/procurement-categories'],
    queryFn: ({ signal }) =>
      getProcurementCategoriesRequest.fetcher({ finalUrl: '/procurement-categories', signal }),
  })
  const updateMutation = useUpdateItemRequestMutation()

  const [selectedProcCategory, setSelectedProcCategory] = useState<
    keyof typeof UACS_CASCADE_MAP | ''
  >('')
  const [itemCategories, setItemCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get the request being edited
  const requestToEdit = (response?.data || []).find((r) => r.id === editingRequestId)
  const isDraftRequest = requestToEdit?.status === 'Draft'
  const isReturnedRequest = requestToEdit?.status === 'Returned'
  const canEditRequest = isDraftRequest || isReturnedRequest

  const getMatchedProcurementCategoryId = (catName: string) => {
    if (!catName) return null
    const categories = procurementCategoriesResponse?.data || []
    const matched = categories.find(
      (c: any) =>
        c.name?.toLowerCase().includes(catName.toLowerCase()) ||
        catName.toLowerCase().includes(c.name?.toLowerCase()),
    )
    return matched ? matched.id : null
  }

  // TanStack Form setup
  const form = useForm({
    defaultValues: {
      id: editingRequestId || '',
      name: requestToEdit?.name || '',
      procurementCategory: ((requestToEdit?.procurementCategoryName || requestToEdit?.procurementCategory || 'Goods') as
        | 'Goods'
        | 'Infra'
        | 'Consulting'),
      itemCategory: requestToEdit?.itemCategory || '',
      uomId: requestToEdit?.uomId || '',
      unitOfMeasure: requestToEdit?.uomName || requestToEdit?.unitOfMeasure || '',
      estimatedUnitCost: requestToEdit?.estimatedUnitCost || 0,
      specifications: requestToEdit?.technicalSpecification || requestToEdit?.specifications || '',
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

  // Initialize categories and form values on mount / open
  useEffect(() => {
    if (isOpen && requestToEdit) {
      const procCat =
        (requestToEdit.procurementCategoryName || requestToEdit.procurementCategory || 'Goods') as keyof typeof UACS_CASCADE_MAP
      setSelectedProcCategory(procCat)
      const categories = getUacsItemCategories(procCat)
      setItemCategories(categories)

      form.setFieldValue('id', requestToEdit.id)
      form.setFieldValue('name', requestToEdit.name)
      form.setFieldValue('procurementCategory', procCat as any)
      form.setFieldValue('itemCategory', requestToEdit.itemCategory)
      form.setFieldValue('uomId', requestToEdit.uomId || '')
      form.setFieldValue('estimatedUnitCost', requestToEdit.estimatedUnitCost)
      form.setFieldValue(
        'specifications',
        requestToEdit.technicalSpecification || requestToEdit.specifications || '',
      )
    }
  }, [isOpen, requestToEdit])

  async function handleSubmit(values: RequestItemEditFormValues) {
    if (!editingRequestId) return
    try {
      setIsSubmitting(true)
      const procurementCategoryId = getMatchedProcurementCategoryId(values.procurementCategory)

      await updateMutation.mutateAsync({
        id: editingRequestId,
        payload: {
          name: values.name,
          itemCategory: values.itemCategory,
          status: isReturnedRequest ? 'Submitted' : 'Draft',
          estimatedUnitCost: Number(values.estimatedUnitCost) || 0,
          technicalSpecification: values.specifications,
          uomId: values.uomId || null,
          procurementCategoryId,
          uacsCode: null,
        },
      })

      toast.success(
        isReturnedRequest
          ? 'Request resubmitted successfully!'
          : 'Draft updated successfully!',
        { duration: 4000 },
      )

      // Reset form and close dialog
      form.reset()
      setEditingRequestId(null)
      setIsOpen(false)
    } catch (error) {
      console.error('Request update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveDraft() {
    if (!editingRequestId) return
    try {
      setIsSubmitting(true)
      const values = form.state.values as RequestItemEditFormValues
      const procurementCategoryId = getMatchedProcurementCategoryId(values.procurementCategory)

      await updateMutation.mutateAsync({
        id: editingRequestId,
        payload: {
          name: values.name,
          itemCategory: values.itemCategory,
          status: 'Draft',
          estimatedUnitCost: Number(values.estimatedUnitCost) || 0,
          technicalSpecification: values.specifications,
          uomId: values.uomId || null,
          procurementCategoryId,
          uacsCode: null,
        },
      })

      toast.success('Draft saved successfully!', { duration: 4000 })

      // Reset form and close dialog
      form.reset()
      setEditingRequestId(null)
      setIsOpen(false)
    } catch (error) {
      console.error('Draft update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      form.reset()
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
                  {itemCategories.map((cat: string) => (
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
        <form.Field name="uomId">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="uomId">
                Unit of Measurement <span className="text-destructive">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="uomId">
                  <SelectValue placeholder="Select unit of measurement..." />
                </SelectTrigger>
                <SelectContent>
                  {(uomsResponse?.data || []).map((uom) => (
                    <SelectItem key={uom.id} value={uom.id}>
                      {uom.name}
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
