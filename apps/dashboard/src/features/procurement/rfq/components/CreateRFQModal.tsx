import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Eye, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { useRFQStore, RFQ, SupplierOption, fetchActiveSuppliers } from '../store/rfqStore'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Building, User, Mail, MapPin, FileText, Tag, Shield } from 'lucide-react'
import api from '@/services/api'
import type { APIResponse } from 'erpez-shared-lib'
import type { SupplierDetail } from '../types'

const createRFQSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  rfqNumber: z.string().min(1, 'RFQ number is required'),
  description: z.string().optional(),
  tracingNumber: z.string().min(1, 'Tracing number is required'),
  deadline: z.date().optional(),
  deliveryPeriod: z.string().optional(),
  supplierIds: z
    .array(z.string())
    .min(3, 'Please select at least 3 prospective suppliers.'),
  // modeOfProcurement removed — derived server-side from the Consolidated PR
  // items' ProcurementModeId once items are added, not user-selected. See
  // AddRFQItemsCommandHandler.
})

type CreateRFQFormData = z.infer<typeof createRFQSchema>

interface CreateRFQModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (rfqId: string) => void
  initialRFQ?: RFQ | null
}

export function CreateRFQModal({ open, onOpenChange, onSuccess, initialRFQ = null }: CreateRFQModalProps) {
  const { createRFQ, updateRFQ } = useRFQStore()
  const { toast } = useToast()
  const isEditMode = !!initialRFQ
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isDeadlinePickerOpen, setIsDeadlinePickerOpen] = useState(false)
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([])

  // Live supplier list (replaces MOCK_SUPPLIERS)
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false)

  // Supplier detail overlay — fetched on demand since the list endpoint
  // only returns SupplierOption (id, name, category, contact), not the
  // full SupplierRegistry shape this dialog renders.
  const [viewingSupplier, setViewingSupplier] = useState<SupplierDetail | null>(null)
  const [isLoadingSupplierDetail, setIsLoadingSupplierDetail] = useState(false)

  const form = useForm<CreateRFQFormData>({
    resolver: zodResolver(createRFQSchema),
    defaultValues: {
      date: new Date(),
      rfqNumber: '',
      description: '',
      tracingNumber: '',
      deadline: undefined,
      deliveryPeriod: '',
      supplierIds: [],
    },
  })

  // Load active suppliers whenever the modal opens
  useEffect(() => {
    if (!open) return
    setIsLoadingSuppliers(true)
    fetchActiveSuppliers()
      .then(setSuppliers)
      .catch((e) => {
        // No manual toast — the api.ts interceptor already shows an error
        // toast for every failed request, including this GET.
        console.error('Failed to load suppliers', e)
      })
      .finally(() => setIsLoadingSuppliers(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Initialize form when editing
  useEffect(() => {
    if (initialRFQ) {
      const initialSupplierIds = initialRFQ.suppliers?.map(s => s.id) ?? []
      form.reset({
        date: initialRFQ.date ? new Date(initialRFQ.date) : new Date(),
        rfqNumber: initialRFQ.rfqNumber,
        description: initialRFQ.description || '',
        tracingNumber: initialRFQ.tracingNumber || '',
        deadline: initialRFQ.deadline ? new Date(initialRFQ.deadline) : undefined,
        deliveryPeriod: initialRFQ.deliveryPeriod || '',
        supplierIds: initialSupplierIds,
      })
      setSelectedSupplierIds(initialSupplierIds)
    } else {
      // reset when modal closes
      if (!open) {
        form.reset({
          date: new Date(),
          rfqNumber: '',
          description: '',
          tracingNumber: '',
          deadline: undefined,
          deliveryPeriod: '',
          supplierIds: [],
        })
        setSelectedSupplierIds([])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRFQ, open])

  const toggleSupplier = (supplierId: string) => {
    setSelectedSupplierIds((prev) => {
      const next = prev.includes(supplierId)
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
      form.setValue('supplierIds', next, { shouldValidate: true })
      return next
    })
  }

  const handleViewSupplier = async (supplierId: string) => {
    setIsLoadingSupplierDetail(true)
    try {
      const response = await api.get<APIResponse<SupplierDetail>>(`/suppliers/${supplierId}`)
      const detail = response.data.data
      if (detail) {
        setViewingSupplier(detail)
      } else {
        // Not a failed request (200 OK), just an unexpectedly empty payload —
        // the interceptor's success-toast branch already fired for this GET,
        // so this is a distinct, additional signal worth surfacing.
        toast({ title: 'Error', description: 'Supplier details not found' })
      }
    } catch (e) {
      // No manual toast — the api.ts interceptor already shows an error
      // toast for every failed request, including this GET.
      console.error('Failed to fetch supplier details', e)
    } finally {
      setIsLoadingSupplierDetail(false)
    }
  }

  const onSubmit = async (data: CreateRFQFormData) => {
    setIsSubmitting(true)
    try {
      const payload = {
        rfqNumber: data.rfqNumber,
        tracingNumber: data.tracingNumber || '',
        description: data.description,
        date: format(data.date, 'yyyy-MM-dd'),
        deadline: data.deadline ? format(data.deadline, 'yyyy-MM-dd') : undefined,
        deliveryPeriod: data.deliveryPeriod,
        purpose: '',
        supplierIds: data.supplierIds,
      }

      let resultId: string

      // Success/error toasts are handled globally by the api.ts response
      // interceptor (toast.success/toast.error on every POST/PUT/PATCH/DELETE
      // and every failed request respectively) — don't toast here too, or the
      // user sees two stacked, differently-styled toasts for the same event.
      if (isEditMode && initialRFQ) {
        // PUT /rfqs/{id} — backend allows this while Status is Draft or Returned.
        const success = await updateRFQ(initialRFQ.id, payload)
        if (!success) {
          // updateRFQ resolved without throwing but reported failure (e.g. a
          // 200 with succeeded:false). The interceptor's success-toast branch
          // only fires on HTTP success, so surface this case explicitly —
          // just don't duplicate it if the request actually threw (handled below).
          return
        }
        resultId = initialRFQ.id
      } else {
        resultId = await createRFQ(payload)
      }

      form.reset()
      setSelectedSupplierIds([])
      onOpenChange(false)
      onSuccess?.(resultId)
    } catch (error) {
      // No manual toast here — the interceptor's error branch already
      // surfaced the real backend validation message for this failed request.
      console.error(isEditMode ? 'Failed to update RFQ' : 'Failed to create RFQ', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit RFQ' : 'Create RFQ'}
      description={
        isEditMode
          ? 'Update this Request for Quotation\u2019s header fields and invited suppliers'
          : 'Draft a Request for Quotation and add prospective suppliers'
      }
      size="2xl"
      className="w-full"
      footer={null}
      showCloseButton
    >
      <Form {...form}>
        <div className="flex flex-col [max-height:calc(85vh-8rem)]">
          <div className="flex-1 overflow-y-auto pr-2">
        <form id="create-rfq-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date <span className="text-destructive">*</span></FormLabel>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(d) => {
                        field.onChange(d)
                        setIsDatePickerOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rfqNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFQ Number <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="e.g., RFQ-2026-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Short description" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tracingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracing Number <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Internal tracing number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deadline</FormLabel>
                <Popover open={isDeadlinePickerOpen} onOpenChange={setIsDeadlinePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : 'Pick a deadline'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(d) => {
                        field.onChange(d)
                        setIsDeadlinePickerOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="deliveryPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Period</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 7 days after award" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="supplierIds"
            render={() => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Suppliers <span className="text-destructive">*</span></FormLabel>
                  <span className="text-xs text-muted-foreground">
                    (At least 3 suppliers required)
                  </span>
                </div>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                  {isLoadingSuppliers ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading suppliers...
                    </div>
                  ) : suppliers.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No active suppliers found.
                    </div>
                  ) : (
                    suppliers.map((supplier) => (
                      <div key={supplier.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md">
                        <Checkbox
                          id={`supplier-${supplier.id}`}
                          checked={selectedSupplierIds.includes(supplier.id)}
                          onCheckedChange={() => toggleSupplier(supplier.id)}
                        />
                        <label
                          htmlFor={`supplier-${supplier.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium">{supplier.supplierName}</div>
                          <div className="text-xs text-muted-foreground">
                            {supplier.supplierCategory} • {supplier.contactPerson}
                          </div>
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs gap-1"
                          disabled={isLoadingSupplierDetail}
                          onClick={(e) => {
                            e.preventDefault()
                            handleViewSupplier(supplier.id)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                {selectedSupplierIds.length > 0 && (
                  <div className="text-xs mt-2">
                    <span className={selectedSupplierIds.length >= 3 ? 'text-muted-foreground' : 'text-amber-600 font-medium'}>
                      {selectedSupplierIds.length} supplier(s) selected {selectedSupplierIds.length < 3 && '(minimum 3 required)'}
                    </span>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

        </form>
          </div>
          {/* Sticky footer */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4 bg-background shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="create-rfq-form" disabled={isSubmitting}>
              {isSubmitting
                ? (isEditMode ? 'Saving...' : 'Creating...')
                : (isEditMode ? 'SAVE CHANGES' : 'CREATE')}
            </Button>
          </div>
        </div>
      </Form>

      {/* Supplier Details Overlay Modal */}
      <Dialog open={!!viewingSupplier} onOpenChange={(open) => !open && setViewingSupplier(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" />
              {viewingSupplier?.name}
            </DialogTitle>
          </DialogHeader>

          {viewingSupplier && (
            <div className="space-y-6 mt-4">
              {/* Status and Verification */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge 
                  color={
                    viewingSupplier.status === 'approved' ? 'success' :
                    viewingSupplier.status === 'declined' ? 'destructive' :
                    viewingSupplier.status === 'under_review' ? 'info' : 'secondary'
                  }
                  variant={viewingSupplier.status === 'approved' ? 'outline' : undefined}
                >
                  {viewingSupplier.status.toUpperCase().replace('_', ' ')}
                </Badge>
                {viewingSupplier.isBlocked && (
                  <Badge color="destructive" className="gap-1">
                    Blocked
                  </Badge>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Supplier Category
                  </div>
                  <div className="font-medium">{viewingSupplier.supplierCategory?.name || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PhilGEPS Number
                  </div>
                  <div className="font-medium font-mono text-sm">{viewingSupplier.philGEPSNumber || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Business Permit No.
                  </div>
                  <div className="font-medium">{viewingSupplier.businessPermitNo || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    TIN Number
                  </div>
                  <div className="font-medium font-mono text-sm">{viewingSupplier.tinNumber || '—'}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Contact Person
                    </div>
                    <div className="font-medium">{viewingSupplier.contactPerson || '—'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <div className="font-medium">{viewingSupplier.email || '—'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contact Number
                    </div>
                    <div className="font-medium">{viewingSupplier.contactNumber || '—'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </div>
                    <div className="font-medium">{viewingSupplier.address || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Compliance Requirements */}
              {viewingSupplier.supplierRequirements && viewingSupplier.supplierRequirements.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Compliance Requirements
                  </h3>
                  <div className="space-y-2">
                    {viewingSupplier.supplierRequirements.map((req) => (
                      <div
                        key={req.supplierRequirementId}
                        className="flex items-center justify-between gap-3 rounded-md border p-3"
                      >
                        <span className="text-sm font-medium">{req.requirementName}</span>
                        <Badge
                          color={req.isVerified ? 'success' : 'secondary'}
                          variant={req.isVerified ? 'outline' : undefined}
                          className="gap-1"
                        >
                          {req.isVerified && <Shield className="h-3 w-3" />}
                          {req.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Note */}
              {viewingSupplier.statusNote && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Status Note
                  </h3>
                  <div className="text-sm bg-muted/40 border rounded-md p-3">
                    {viewingSupplier.statusNote}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveDialog>
  )
}
