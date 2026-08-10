import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, ChevronDown, Eye, Plus, Search, Store, X, FileText, Package } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { usePurchaseOrderStore } from '../data/purchaseOrderStore'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import type { ConsolidatedPR } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { useBacResolutions, type BacResolution } from '@/features/procurement/bac-resolution'
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
  DELIVERY_TERMS,
  PAYMENT_TERMS,
} from './purchaseOrderFormSchema'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Label } from '@/components/ui/label'

type CreateDirectAcquisitionPurchaseOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormValues = PurchaseOrderFormValues

// ── Retail Supplier type (local, no backend yet) ──────────────────────────────
type RetailSupplier = { id: string; name: string; tin: string }

const INITIAL_SUPPLIERS: RetailSupplier[] = [
  { id: 's-001', name: 'National Bookstore', tin: '000-123-456-000' },
  { id: 's-002', name: 'Shopee Official Store', tin: '000-234-567-000' },
  { id: 's-003', name: 'Lazada Mall', tin: '000-345-678-000' },
  { id: 's-004', name: 'Abenson', tin: '000-456-789-000' },
  { id: 's-005', name: 'Octagon Computer Accessories', tin: '000-567-890-000' },
]

const DA_MOP_KEYWORDS = ['direct acquisition', 'direct contracting']

function isDaMop(mop?: string): boolean {
  if (!mop) return false
  return DA_MOP_KEYWORDS.some((k) => mop.toLowerCase().includes(k))
}

export function CreateDirectAcquisitionPurchaseOrderDialog({
  open,
  onOpenChange,
}: CreateDirectAcquisitionPurchaseOrderDialogProps) {
  const createDraft = usePurchaseOrderStore((state) => state.createDraft)
  const consolidatedPRs = useConsolidatedPRStore((s) => s.consolidatedPRs)

  // Load BAC Resolutions
  const { data: resolutionsData } = useBacResolutions({ enabled: open })
  const bacResolutions = useMemo(() => resolutionsData ?? [], [resolutionsData])

  // ── Filter: only resolutions that have a linked PR with at least one item with Direct Acquisition MoP ──
  const daResolutions = useMemo(() => {
    return bacResolutions.filter((resolution) => {
      const linkedPrLink = resolution.linkedConsolidatedPrs?.[0]
      if (!linkedPrLink) return false
      const prFromStore = consolidatedPRs.find(
        (p) => p.id === linkedPrLink.id || p.prNumber === linkedPrLink.prNumber
      )
      if (!prFromStore) return false
      if (!prFromStore.itemMOPs) return false
      return Object.values(prFromStore.itemMOPs).some((v) => isDaMop(v?.mop))
    })
  }, [bacResolutions, consolidatedPRs])

  // ── Dropdown state ─────────────────────────────────────────────────────────
  const [prDropOpen, setPrDropOpen] = useState(false)
  const [prSearch, setPrSearch] = useState('')
  const [selectedResolution, setSelectedResolution] = useState<BacResolution | null>(null)
  const [viewingPR, setViewingPR] = useState<ConsolidatedPR | null>(null)

  // Derive selectedPR from selectedResolution
  const selectedPR = useMemo(() => {
    if (!selectedResolution) return null
    const linkedPrLink = selectedResolution.linkedConsolidatedPrs?.[0]
    if (!linkedPrLink) return null
    return consolidatedPRs.find(
      (p) => p.id === linkedPrLink.id || p.prNumber === linkedPrLink.prNumber
    ) || null
  }, [selectedResolution, consolidatedPRs])

  const filteredResolutions = useMemo(() => {
    const q = prSearch.toLowerCase()
    return daResolutions.filter((res) => {
      const prNumber = res.linkedConsolidatedPrs?.[0]?.prNumber ?? ''
      return (
        (res.bacResolutionNumber ?? '').toLowerCase().includes(q) ||
        (res.description ?? '').toLowerCase().includes(q) ||
        prNumber.toLowerCase().includes(q)
      )
    })
  }, [daResolutions, prSearch])

  // ── Retail supplier state ─────────────────────────────────────────────────────
  const [suppliers, setSuppliers] = useState<RetailSupplier[]>(INITIAL_SUPPLIERS)
  const [supplierSearch, setSupplierSearch] = useState('')
  const [supplierDropOpen, setSupplierDropOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<RetailSupplier | null>(null)

  // Add New Store mini-modal
  const [addStoreOpen, setAddStoreOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreTin, setNewStoreTin] = useState('')

  const filteredSuppliers = useMemo(() => {
    const q = supplierSearch.toLowerCase()
    return suppliers.filter((s) => s.name.toLowerCase().includes(q) || s.tin.includes(q))
  }, [suppliers, supplierSearch])

  const handleAddStore = () => {
    if (!newStoreName.trim()) return
    const newSupplier: RetailSupplier = {
      id: `s-${crypto.randomUUID()}`,
      name: newStoreName.trim(),
      tin: newStoreTin.trim() || '—',
    }
    setSuppliers((prev) => [...prev, newSupplier])
    setSelectedSupplier(newSupplier)
    setNewStoreName('')
    setNewStoreTin('')
    setAddStoreOpen(false)
    setSupplierDropOpen(false)
  }

  // ── Form date popovers ────────────────────────────────────────────────────────
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isDeliveryDateOpen, setIsDeliveryDateOpen] = useState(false)

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

  const handleSubmit = (data: FormValues) => {
    const deliveryTerm = data.deliveryTerm === 'Others' ? (data.deliveryTermCustom?.trim() ?? '') : data.deliveryTerm
    const paymentTerm = data.paymentTerm === 'Others' ? (data.paymentTermCustom?.trim() ?? '') : data.paymentTerm

    // If a Consolidated PR was selected, include only the items flagged for Direct Acquisition MoP
    const prDaItems = selectedPR
      ? selectedPR.selectedPRItems.filter((item) => isDaMop(selectedPR.itemMOPs?.[item.id]?.mop))
      : []

    const lineItems = prDaItems.map((i) => ({
      id: i.id,
      description: i.itemName,
      quantity: i.qty,
      unit: i.unit,
      unitPrice: i.unitPrice,
      amount: i.totalAmount,
    }))

    const totalAmount = lineItems.reduce((s, it) => s + it.amount, 0)

    createDraft({
      source: 'direct-acquisition',
      poNumber: data.poNumber,
      description: data.description ?? '',
      date: data.date ? format(data.date, 'yyyy-MM-dd') : '',
      placeOfDelivery: data.placeOfDelivery,
      dateOfDelivery: data.dateOfDelivery ? format(data.dateOfDelivery, 'yyyy-MM-dd') : '',
      deliveryTerm: deliveryTerm || data.deliveryTerm,
      paymentTerm: paymentTerm || data.paymentTerm,
      bidSupportingDocument: null,
      supplierName: selectedSupplier?.name ?? null,
      supplierTin: selectedSupplier?.tin ?? null,
      // Link back to the originating Consolidated PR and include its DA items
      sourceDocumentType: selectedPR ? 'direct-acquisition' : null,
      sourceDocumentId: selectedPR?.id ?? null,
      sourceDocumentNumber: selectedPR?.prNumber ?? null,
      sourceDocumentDescription: selectedPR?.description ?? null,
      lineItems: lineItems.length > 0 ? lineItems : undefined,
      totalAmount: lineItems.length > 0 ? totalAmount : undefined,
    })

    form.reset()
    setSelectedResolution(null)
    setSelectedSupplier(null)
    onOpenChange(false)
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Create PO for Direct Acquisition"
        description="Prepare the draft header, select the approved Consolidated PR with Direct Acquisition MoP, then choose the retail supplier."
        size="2xl"
        className="w-full"
        footer={null}
        showCloseButton
      >
        <Form {...form}>
          <div className="flex flex-col [max-height:calc(85vh-8rem)]">
            <div className="flex-1 overflow-y-auto pr-2">
              <form id="create-da-po-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pb-2">

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
                          <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDateOpen(false) }} />
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
                        <Input placeholder="PO-2026-001" {...field} />
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
                          <Calendar mode="single" selected={field.value} onSelect={(d) => { field.onChange(d); setIsDeliveryDateOpen(false) }} />
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

                {/* ── BAC Resolution (Direct Acquisition MoP) ── */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    BAC Resolution <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Select the approved BAC Resolution with Direct Acquisition MoP to link to this PO.</p>

                  {/* Inline searchable dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPrDropOpen((o) => !o)}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <span className={selectedResolution ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedResolution
                          ? `${selectedResolution.bacResolutionNumber ?? selectedResolution.id}${selectedPR?.prNumber ? ` (PR: ${selectedPR.prNumber})` : ''} — ${selectedResolution.description ?? ''}`
                          : '— Select Approved BAC Resolution —'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>

                    {prDropOpen && (
                      <div className="mt-2 w-full rounded-md border border-default-200 bg-popover shadow-sm">
                        {/* Search bar */}
                        <div className="p-2 border-b flex items-center gap-2">
                          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Input
                            value={prSearch}
                            onChange={(e) => setPrSearch(e.target.value)}
                            placeholder="Search by BAC Reso No. or PR No. or description…"
                            className="h-7 text-sm border-0 p-0 focus-visible:ring-0"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          {prSearch && (
                            <button onClick={() => setPrSearch('')} className="text-muted-foreground hover:text-foreground">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Resolution list */}
                        <div className="max-h-[28rem] overflow-y-auto divide-y divide-default-100">
                          {filteredResolutions.length > 0 ? (
                            filteredResolutions.map((res) => {
                              const linkedPrLink = res.linkedConsolidatedPrs?.[0]
                              const prFromStore = linkedPrLink
                                ? consolidatedPRs.find(
                                    (p) => p.id === linkedPrLink.id || p.prNumber === linkedPrLink.prNumber
                                  )
                                : null
                              const total = prFromStore
                                ? prFromStore.selectedPRItems.reduce((s, i) => s + i.totalAmount, 0)
                                : res.totalAmount
                              const daMopCount = prFromStore
                                ? prFromStore.selectedPRItems.filter((item) =>
                                    isDaMop(prFromStore.itemMOPs?.[item.id]?.mop),
                                  ).length
                                : 0
                              return (
                                <div
                                  key={res.id}
                                  className={`flex items-center justify-between px-3 py-2.5 text-sm ${selectedResolution?.id === res.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                >
                                  <button
                                    type="button"
                                    className="flex-1 text-left"
                                    onClick={() => { setSelectedResolution(res); setPrDropOpen(false); setPrSearch('') }}
                                  >
                                    <div className="font-semibold text-primary">
                                      {res.bacResolutionNumber ?? res.id}
                                      {linkedPrLink?.prNumber && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          (PR: {linkedPrLink.prNumber})
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate max-w-xs">{res.description ?? '—'}</div>
                                    <div className="flex gap-3 mt-0.5">
                                      <span className="text-xs text-muted-foreground">
                                        ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                      </span>
                                      {daMopCount > 0 && (
                                        <Badge className="text-xs h-4 bg-violet-100 text-violet-700 border-violet-300">
                                          {daMopCount} DA item{daMopCount !== 1 ? 's' : ''}
                                        </Badge>
                                      )}
                                      <Badge variant="outline" className="text-xs h-4">{res.status}</Badge>
                                    </div>
                                  </button>
                                  {prFromStore && (
                                    <button
                                      type="button"
                                      title="View Details"
                                      onClick={(e) => { e.stopPropagation(); setViewingPR(prFromStore); }}
                                      className="ml-2 shrink-0 rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              )
                            })
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                              <FileText className="h-6 w-6 opacity-30" />
                              <p className="text-xs">No BAC Resolutions with Direct Acquisition MoP found.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected BAC Resolution summary chip */}
                  {selectedResolution && (
                    <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs space-y-1 mt-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">
                          {selectedResolution.bacResolutionNumber ?? selectedResolution.id}
                          {selectedPR?.prNumber && (
                            <span className="text-muted-foreground font-normal ml-2">
                              (PR: {selectedPR.prNumber})
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {selectedPR && (
                            <button
                              type="button"
                              onClick={() => setViewingPR(selectedPR)}
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Eye className="h-3 w-3" /> View PR Details
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedResolution(null)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-4 flex-wrap">
                        <span><span className="text-muted-foreground">Status: </span><Badge variant="outline" className="text-xs">{selectedResolution.status}</Badge></span>
                        {selectedPR && (
                          <>
                            <span><span className="text-muted-foreground">Items: </span><span className="font-medium">{selectedPR.selectedPRItems.length}</span></span>
                            <span>
                              <span className="text-muted-foreground">Total ABC: </span>
                              <span className="font-semibold text-primary">
                                ₱{selectedPR.selectedPRItems.reduce((s, i) => s + i.totalAmount, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Retail Supplier ── */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Retail Supplier / Store <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Select an existing store or add a new one on the fly.</p>
                  <div className="flex gap-2">
                    {/* Supplier dropdown */}
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setSupplierDropOpen((o) => !o)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <span className={selectedSupplier ? 'text-foreground' : 'text-muted-foreground'}>
                          {selectedSupplier ? `${selectedSupplier.name} · TIN ${selectedSupplier.tin}` : '— Select Retail Supplier —'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>

                      {supplierDropOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border border-default-200 bg-popover shadow-lg">
                          <div className="p-2 border-b flex items-center gap-2">
                            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <Input
                              value={supplierSearch}
                              onChange={(e) => setSupplierSearch(e.target.value)}
                              placeholder="Search store name or TIN…"
                              className="h-7 text-sm border-0 p-0 focus-visible:ring-0"
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto divide-y divide-default-100">
                            {filteredSuppliers.length > 0 ? (
                              filteredSuppliers.map((s) => (
                                <div
                                  key={s.id}
                                  onClick={() => { setSelectedSupplier(s); setSupplierDropOpen(false); setSupplierSearch('') }}
                                  className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 text-sm ${selectedSupplier?.id === s.id ? 'bg-primary/10' : ''}`}
                                >
                                  <span className="font-medium">{s.name}</span>
                                  <span className="text-xs text-muted-foreground">TIN: {s.tin}</span>
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                No results found for "{supplierSearch}"
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add New Store button */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 gap-1.5 shrink-0"
                      onClick={() => setAddStoreOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Add New Store
                    </Button>
                  </div>
                </div>

              </form>
            </div>

            {/* Sticky footer */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-4 bg-background shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" form="create-da-po-form">
                Create Draft
              </Button>
            </div>
          </div>
        </Form>
      </ResponsiveDialog>

      {/* ── PR Details Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!viewingPR} onOpenChange={(o) => { if (!o) setViewingPR(null) }}>
        <DialogContent size="3xl" className="max-h-[92vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Consolidated PR Details — {viewingPR?.prNumber ?? viewingPR?.id}
            </DialogTitle>
            <DialogDescription>
              {viewingPR?.description ?? ''}
            </DialogDescription>
          </DialogHeader>

          {viewingPR && (
            <div className="flex-1 overflow-auto space-y-4 py-2">
              {/* Header meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">PR Number</p>
                  <p className="font-semibold text-primary">{viewingPR.prNumber ?? viewingPR.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{viewingPR.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className="mt-0.5">{viewingPR.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total ABC</p>
                  <p className="font-semibold text-primary">
                    ₱{viewingPR.selectedPRItems.reduce((s, i) => s + i.totalAmount, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {viewingPR.purpose && (
                <div className="text-sm">
                  <span className="text-muted-foreground font-medium">Purpose: </span>
                  <span>{viewingPR.purpose}</span>
                </div>
              )}

              {/* Line items table */}
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Line Items
                </p>
                <div className="rounded-md border overflow-auto">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs">Item</TableHead>
                        <TableHead className="text-xs">Office</TableHead>
                        <TableHead className="text-xs text-right">Qty</TableHead>
                        <TableHead className="text-xs">Unit</TableHead>
                        <TableHead className="text-xs text-right">Unit Price</TableHead>
                        <TableHead className="text-xs text-right">Total</TableHead>
                        <TableHead className="text-xs">MoP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingPR.selectedPRItems.map((item) => {
                        const mop = viewingPR.itemMOPs?.[item.id]?.mop ?? '—'
                        const isDa = isDaMop(mop)
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-sm">{item.itemName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.prOffice}</TableCell>
                            <TableCell className="text-right text-sm">{item.qty}</TableCell>
                            <TableCell className="text-xs">{item.unit}</TableCell>
                            <TableCell className="text-right text-sm">
                              ₱{item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-sm text-primary">
                              ₱{item.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                              {isDa ? (
                                <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-300">{mop}</Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">{mop}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t">
            {viewingPR && selectedResolution?.linkedConsolidatedPrs?.[0]?.id !== viewingPR.id && (
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  const matchingRes = daResolutions.find((res) => {
                    const linked = res.linkedConsolidatedPrs?.[0]
                    return linked && (linked.id === viewingPR.id || linked.prNumber === viewingPR.prNumber)
                  })
                  if (matchingRes) {
                    setSelectedResolution(matchingRes)
                  }
                  setViewingPR(null)
                  setPrDropOpen(false)
                }}
              >
                Select This PR
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setViewingPR(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Add New Store Mini-Modal ─────────────────────────────────────────────── */}
      <Dialog open={addStoreOpen} onOpenChange={setAddStoreOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Add New Store
            </DialogTitle>
            <DialogDescription>
              Quick registration for a Direct Acquisition retail supplier. Only Store Name and TIN are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-store-name">Store Name <span className="text-destructive">*</span></Label>
              <Input
                id="new-store-name"
                placeholder="e.g., Shopee Gadget Store"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-store-tin">TIN</Label>
              <Input
                id="new-store-tin"
                placeholder="000-000-000-000"
                value={newStoreTin}
                onChange={(e) => setNewStoreTin(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave blank if TIN is not yet available.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddStoreOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleAddStore} disabled={!newStoreName.trim()}>
              Save &amp; Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
