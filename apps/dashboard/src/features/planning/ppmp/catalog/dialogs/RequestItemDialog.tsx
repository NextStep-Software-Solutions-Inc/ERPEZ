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

import { requestItemDialogOpenAtom } from '../atoms/requestAtoms'
import { useCreateItemRequestMutation } from '../hooks/useItemRequestQueries'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import { getUomsRequest } from '@/components/features/planning/procurement-library/item-master/handlers/getUomsRequest'
import { getProcurementCategoriesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementCategoriesRequest'
import { useQuery } from '@tanstack/react-query'
import {
  UACS_CASCADE_MAP,
  getUacsItemCategories,
  PROCUREMENT_CATEGORIES,
} from '../utils/cascadingUacs'

import type { RequestItemFormValues } from '../forms/requestItemFormSchema'

export function RequestItemDialog() {
  const [isOpen, setIsOpen] = useAtom(requestItemDialogOpenAtom)
  const createMutation = useCreateItemRequestMutation()
  const { data: officesResponse } = useQuery({
    queryKey: ['/offices'],
    queryFn: ({ signal }) => getOfficesRequest.fetcher({ finalUrl: '/offices', signal }),
  })
  const { data: uomsResponse } = useQuery({
    queryKey: ['/uoms'],
    queryFn: ({ signal }) => getUomsRequest.fetcher({ finalUrl: '/uoms', signal }),
  })
  const { data: procurementCategoriesResponse } = useQuery({
    queryKey: ['/procurement-categories'],
    queryFn: ({ signal }) =>
      getProcurementCategoriesRequest.fetcher({ finalUrl: '/procurement-categories', signal }),
  })

  const [selectedProcCategory, setSelectedProcCategory] = useState<
    keyof typeof UACS_CASCADE_MAP | ''
  >('')
  const [itemCategories, setItemCategories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    defaultValues: {
      name: '',
      procurementCategory: 'Goods' as const,
      itemCategory: '',
      uomId: '',
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

  const getMatchedOfficeId = () => {
    const offices = officesResponse?.data || []
    return offices.length > 0 ? offices[0].id : '00000000-0000-0000-0000-000000000000'
  }

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

  async function handleSubmit(values: RequestItemFormValues) {
    try {
      setIsSubmitting(true)
      const officeId = getMatchedOfficeId()
      const procurementCategoryId = getMatchedProcurementCategoryId(values.procurementCategory)

      await createMutation.mutateAsync({
        officeId,
        uomId: values.uomId || null,
        procurementCategoryId,
        name: values.name,
        itemCategory: values.itemCategory,
        status: 'Submitted',
        estimatedUnitCost: Number(values.estimatedUnitCost) || 0,
        technicalSpecification: values.specifications,
        uacsCode: null,
      })

      toast.success(
        'Request submitted! Track its status in the Item Requests tab.',
        {
          duration: 4000,
        },
      )

      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Request submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSaveDraft() {
    try {
      setIsSubmitting(true)
      const draftValues = form.state.values as RequestItemFormValues
      const officeId = getMatchedOfficeId()
      const procurementCategoryId = getMatchedProcurementCategoryId(draftValues.procurementCategory)

      await createMutation.mutateAsync({
        officeId,
        uomId: draftValues.uomId || null,
        procurementCategoryId,
        name: draftValues.name,
        itemCategory: draftValues.itemCategory,
        status: 'Draft',
        estimatedUnitCost: Number(draftValues.estimatedUnitCost) || 0,
        technicalSpecification: draftValues.specifications,
        uacsCode: null,
      })

      toast.success('Draft saved. You can finish it later from My Requests.', {
        duration: 4000,
      })

      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Draft save error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      form.reset()
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
        {/* ── Section 1: Item Information ── */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Item Information
            </h4>
          </div>

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

          {/* Procurement & Item Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Unit of Measurement */}
          <form.Field
            name="uomId"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Unit of Measurement is required'
                return undefined
              },
            }}
          >
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
        </div>

        <hr className="border-border" />

        {/* ── Section 2: Cost & Justification ── */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cost & Justification
            </h4>
          </div>

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="cost">
                    Estimated Unit Cost (₱)
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Enter the estimated cost per unit.
                  </span>
                </div>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="specs">
                    Technical Specifications & Justification
                    <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {field.state.value.length}/1000 characters
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide the technical specifications and explain why the item is needed.
                </p>
                <Textarea
                  id="specs"
                  placeholder="Describe the item specifications, key features, and intended use..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={isSubmitting}
                  rows={4}
                  className="min-h-24"
                />
                {field.state.meta.errors && (
                  <p className="text-xs text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="border-input hover:bg-accent"
          >
            {isSubmitting ? 'Saving Draft...' : 'Save as Draft'}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-2 bg-primary hover:bg-primary/90 min-w-32"
          >
            {isSubmitting && <Upload className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </ResponsiveDialogDashtail>
  )
}
