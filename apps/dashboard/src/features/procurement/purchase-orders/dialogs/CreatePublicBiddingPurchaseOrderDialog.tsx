import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Eye, FileText, Tag, Package, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useGetNoasAvailableForPO, useCreatePurchaseOrder, uploadPoDocument } from '../handlers'
import type { AvailableNoa } from '../types'
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
  DELIVERY_TERMS,
  PAYMENT_TERMS,
} from './purchaseOrderFormSchema'

type CreatePublicBiddingPurchaseOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormValues = PurchaseOrderFormValues

export function CreatePublicBiddingPurchaseOrderDialog({
  open,
  onOpenChange,
}: CreatePublicBiddingPurchaseOrderDialogProps) {
  const { data: availableNoas = [], isLoading: isLoadingNoas } = useGetNoasAvailableForPO()
  const createMutation = useCreatePurchaseOrder()

  const [selectedNoaId, setSelectedNoaId] = useState<string | null>(null)
  const [viewingNoa, setViewingNoa] = useState<AvailableNoa | null>(null)
  const [noaSearch, setNoaSearch] = useState('')
  const [isNoaDropdownOpen, setIsNoaDropdownOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isDeliveryDateOpen, setIsDeliveryDateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedNoa = useMemo(
    () => availableNoas.find((noa) => noa.id === selectedNoaId),
    [availableNoas, selectedNoaId],
  )

  const filteredNoas = useMemo(() => {
    return availableNoas.filter((noa) =>
      [noa.noaNumber, noa.description ?? '', noa.supplierName]
        .join(' ')
        .toLowerCase()
        .includes(noaSearch.toLowerCase()),
    )
  }, [availableNoas, noaSearch])

  const form = useForm<FormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      date: undefined,
      poNumber: '',
      description: '',
      placeOfDelivery: '',
      dateOfDelivery: undefined,
      deliveryTerm: '',
      deliveryTermCustom: '',
      paymentTerm: '',
      paymentTermCustom: '',
      bidSupportingDocument: null,
    },
  })

  const watchDeliveryTerm = form.watch('deliveryTerm')
  const watchPaymentTerm = form.watch('paymentTerm')

  const handleSubmit = async (data: FormValues) => {
    if (!selectedNoaId || !selectedNoa) {
      toast.error('Please select an approved Notice of Award (NOA).')
      return
    }

    try {
      setIsSubmitting(true)
      let supportingDocumentUrl: string | undefined = undefined
      if (data.bidSupportingDocument instanceof File) {
        supportingDocumentUrl = await uploadPoDocument(data.bidSupportingDocument)
      }

      const deliveryTerm =
        data.deliveryTerm === 'Others'
          ? (data.deliveryTermCustom?.trim() ?? '')
          : data.deliveryTerm
      const paymentTerm =
        data.paymentTerm === 'Others'
          ? (data.paymentTermCustom?.trim() ?? '')
          : data.paymentTerm

      await createMutation.mutateAsync({
        poNumber: data.poNumber,
        procurementMode: 'PUBLIC_BIDDING',
        sourceDocumentType: 'NOA',
        sourceDocumentId: selectedNoaId,
        supplierId: selectedNoa.supplierId,
        description: data.description ?? '',
        date: data.date ? format(data.date, 'yyyy-MM-dd') : '',
        placeOfDelivery: data.placeOfDelivery,
        dateOfDelivery: data.dateOfDelivery ? format(data.dateOfDelivery, 'yyyy-MM-dd') : '',
        deliveryTerm: deliveryTerm || data.deliveryTerm,
        paymentTerm: paymentTerm || data.paymentTerm,
        supportingDocumentUrl,
      })

      toast.success('Public Bidding Purchase Order created successfully!')
      form.reset()
      setSelectedNoaId(null)
      setNoaSearch('')
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create Public Bidding Purchase Order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Create PO for Public Bidding"
        description="Prepare the draft header, then select the approved NOA that will auto-fill the supplier and amount."
        size="2xl"
        className="w-full"
        footer={null}
        showCloseButton
      >
        <Form {...form}>
          <div className="flex flex-col [max-height:calc(85vh-8rem)]">
            <div className="flex-1 overflow-y-auto pr-2">
              <form id="create-pb-po-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-2">

                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
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
                            onSelect={(d) => { field.onChange(d); setIsDateOpen(false) }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PO Number */}
                <FormField
                  control={form.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number</FormLabel>
                      <FormControl>
                        <Input placeholder="PO-2026-PB-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Short description of the purchase order" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Place of Delivery */}
                <FormField
                  control={form.control}
                  name="placeOfDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Delivery</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Office, floor, or delivery location" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Delivery */}
                <FormField
                  control={form.control}
                  name="dateOfDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Delivery</FormLabel>
                      <Popover open={isDeliveryDateOpen} onOpenChange={setIsDeliveryDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Pick a delivery date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(d) => { field.onChange(d); setIsDeliveryDateOpen(false) }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Term */}
                <FormField
                  control={form.control}
                  name="deliveryTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Term</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-gray-200">
                            <SelectValue placeholder="Select delivery term" />
                          </SelectTrigger>
                          <SelectContent>
                            {DELIVERY_TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchDeliveryTerm === 'Others' && (
                  <FormField
                    control={form.control}
                    name="deliveryTermCustom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Delivery Term</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Within 45 calendar days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Payment Term */}
                <FormField
                  control={form.control}
                  name="paymentTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Term</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-10 border-gray-200">
                            <SelectValue placeholder="Select payment term" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TERMS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchPaymentTerm === 'Others' && (
                  <FormField
                    control={form.control}
                    name="paymentTermCustom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Payment Term</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Net 45 upon acceptance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* BID Supporting Document */}
                <FormField
                  control={form.control}
                  name="bidSupportingDocument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BID Supporting Document</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => field.onChange(e.target.files?.[0] ?? null)}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        {field.value ? `Selected: ${(field.value as File).name}` : 'Optional. Upload the BID PDF if available.'}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NOA — inline dropdown with search + View per row */}
                <div>
                  <FormLabel>Notice of Award (NOA)</FormLabel>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    Select the approved NOA to auto-fill the supplier and awarded line items.
                  </p>

                  <div className="relative">
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={isNoaDropdownOpen}
                      aria-controls="noa-dropdown-list"
                      aria-label="Select approved NOA"
                      onClick={() => setIsNoaDropdownOpen((o) => !o)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <span className={selectedNoa ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {selectedNoa
                          ? `${selectedNoa.noaNumber} · ${selectedNoa.supplierName}`
                          : isLoadingNoas
                            ? 'Loading available NOAs...'
                            : 'Select NOA'}
                      </span>
                      <svg
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isNoaDropdownOpen ? 'rotate-180' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>

                    {isNoaDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border border-default-200 bg-popover shadow-lg">
                        <div className="p-2 border-b">
                          <Input
                            value={noaSearch}
                            onChange={(e) => setNoaSearch(e.target.value)}
                            placeholder="Search by NOA number, supplier, or description"
                            className="h-8 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto divide-y divide-default-100">
                          {filteredNoas.length ? (
                            filteredNoas.map((noa) => (
                              <div
                                key={noa.id}
                                onClick={() => {
                                  setSelectedNoaId(noa.id)
                                  setIsNoaDropdownOpen(false)
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 ${selectedNoaId === noa.id ? 'bg-primary/10' : ''}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">{noa.noaNumber}</div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {noa.supplierName}
                                  </div>
                                </div>
                                <div className="text-sm font-medium shrink-0">
                                  ₱{noa.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs gap-1 shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setViewingNoa(noa)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                  View
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                              {isLoadingNoas ? 'Loading available NOAs...' : 'No approved NOAs available for PO.'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedNoa && (
                    <div className="mt-3 p-3 rounded-lg border bg-muted/30 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Supplier:</span>
                        <span className="font-semibold text-foreground">{selectedNoa.supplierName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Awarded Total:</span>
                        <span className="font-semibold text-primary">
                          ₱{selectedNoa.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Items to auto-fill:</span>
                        <span className="font-medium text-foreground">{selectedNoa.lineItems?.length ?? 0} item(s)</span>
                      </div>
                    </div>
                  )}
                </div>

              </form>
            </div>

            {/* Sticky footer */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-4 bg-background shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" form="create-pb-po-form" disabled={isSubmitting || !selectedNoaId}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Draft'
                )}
              </Button>
            </div>
          </div>
        </Form>
      </ResponsiveDialog>

      {/* NOA Details Overlay Modal */}
      <Dialog open={!!viewingNoa} onOpenChange={(o) => !o && setViewingNoa(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              {viewingNoa?.noaNumber}
            </DialogTitle>
          </DialogHeader>

          {viewingNoa && (
            <div className="space-y-6 mt-2">
              <div className="flex items-center gap-2">
                <Badge color="success" variant="outline">APPROVED</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </div>
                  <div className="font-medium">{viewingNoa.description || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Supplier
                  </div>
                  <div className="font-medium">{viewingNoa.supplierName || '—'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Total Amount
                  </div>
                  <div className="font-semibold text-primary">
                    ₱{viewingNoa.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {viewingNoa.lineItems && viewingNoa.lineItems.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Line Items
                  </h3>
                  <div className="space-y-2">
                    {viewingNoa.lineItems.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 rounded-md border p-3">
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.itemName}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.quantity} {item.unit} × ₱{item.unitPrice.toLocaleString('en-PH')}
                          </div>
                        </div>
                        <div className="text-sm font-semibold shrink-0">
                          ₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
