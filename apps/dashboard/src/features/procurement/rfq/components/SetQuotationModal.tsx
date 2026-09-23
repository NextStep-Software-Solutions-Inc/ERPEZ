import { useState, useEffect, useRef } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { useRFQStore, RFQItem } from '../store/rfqStore'
import { Pencil, Save, Upload, FileText, X, Send, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { submitSupplierBidRequest } from '@/features/procurement/supplier-portal/handlers/supplierPortalRequests'

const useSubmitSupplierBid = createMutationHookFromTemplate(submitSupplierBidRequest)

interface SetQuotationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rfqId: string
  supplierId?: string
  initialRFQ?: any
  onSuccess?: () => void
}

interface ItemBidSpecModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: RFQItem | null
  onSave: (itemId: string, model: string, brand: string, color: string) => void
}

function ItemBidSpecModal({ open, onOpenChange, item, onSave }: ItemBidSpecModalProps) {
  const [model, setModel] = useState('')
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    if (open && item) {
      setModel(item.bidModel || '')
      setBrand(item.bidBrand || '')
      setColor(item.bidColor || '')
    }
  }, [open, item])

  const handleSave = () => {
    if (item) {
      onSave(item.id, model, brand, color)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open && Boolean(item)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Item Bid Specification</DialogTitle>
          <DialogDescription>
            Enter the specifications for {item?.itemName || 'Item'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Enter model"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Enter brand"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Enter color"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SetQuotationModal({
  open,
  onOpenChange,
  rfqId,
  supplierId,
  initialRFQ,
  onSuccess,
}: SetQuotationModalProps) {
  const { rfqs } = useRFQStore()
  const rfq = initialRFQ || rfqs.find((r) => r.id === rfqId)
  const { toast } = useToast()
  const [items, setItems] = useState<RFQItem[]>([])
  const [specModalOpen, setSpecModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RFQItem | null>(null)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const { mutateAsync: submitBidMutation, isPending: isSubmitting } = useSubmitSupplierBid()

  const isSubmitted = rfq?.quotationStatus === 'submitted' && rfq?.quotationApprovalStatus !== 'returned'

  useEffect(() => {
    if (rfq && open) {
      setItems(
        (rfq.items || []).map((item: any) => ({
          ...item,
          unitPrice: Number(item.unitPrice ?? item.unitPriceSnapshot ?? 0),
          totalAmount: Number(item.totalAmount ?? item.totalABC ?? ((item.unitPrice ?? item.unitPriceSnapshot ?? 0) * (item.quantity || 1))),
          bidUnitPrice: item.bidUnitPrice !== undefined ? item.bidUnitPrice : (item.supplierUnitPrice || 0),
          bidTotalAmount: item.bidTotalAmount !== undefined ? item.bidTotalAmount : ((item.bidUnitPrice ?? item.supplierUnitPrice ?? 0) * (item.quantity || 1)),
          bidBrand: item.bidBrand || item.brand || '',
          bidModel: item.bidModel || item.model || '',
          bidColor: item.bidColor || item.color || '',
          bidBrochureUrl: item.bidBrochureUrl || item.brochureFileUrl,
          bidBrochureFileName: item.bidBrochureFileName,
        }))
      )
    }
  }, [rfq, open])

  if (!rfq) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Set Quotation"
        description="Loading quotation details..."
      >
        <div className="p-8 text-center text-muted-foreground">Loading quotation details...</div>
      </ResponsiveDialog>
    )
  }

  const handleBidSpecClick = (item: RFQItem) => {
    if (isSubmitted) {
      toast({
        title: 'Cannot edit',
        description: 'You cannot edit your bid after submission.'
      })
      return
    }
    setSelectedItem(item)
    setSpecModalOpen(true)
  }

  const handleSaveBidSpec = (itemId: string, model: string, brand: string, color: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { ...item, bidModel: model, bidBrand: brand, bidColor: color }
        : item
    ))
    toast({
      title: 'Specification saved',
      description: 'Item bid specification has been updated.'
    })
  }

  const handleUnitBidChange = (itemId: string, value: string) => {
    const unitBid = parseFloat(value) || 0
    setItems(items.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            bidUnitPrice: unitBid,
            bidTotalAmount: unitBid * item.quantity
          }
        : item
    ))
  }

  const createdObjectUrlsRef = useRef<Record<string, string>>({})
  const prevBidUrlsRef = useRef<Record<string, string | undefined>>({})

  useEffect(() => {
    if (!open) {
      Object.values(createdObjectUrlsRef.current).forEach((u) => {
        try { URL.revokeObjectURL(u) } catch {}
      })
      createdObjectUrlsRef.current = {}
      prevBidUrlsRef.current = {}
    }
    return () => {
      Object.values(createdObjectUrlsRef.current).forEach((u) => {
        try { URL.revokeObjectURL(u) } catch {}
      })
      createdObjectUrlsRef.current = {}
      prevBidUrlsRef.current = {}
    }
  }, [open])

  useEffect(() => {
    const prev = prevBidUrlsRef.current
    items.forEach((it) => {
      const prevUrl = prev[it.id]
      const currUrl = it.bidBrochureUrl
      if (prevUrl && prevUrl !== currUrl && createdObjectUrlsRef.current[it.id] === prevUrl) {
        try { URL.revokeObjectURL(prevUrl) } catch {}
        delete createdObjectUrlsRef.current[it.id]
      }
    })
    prevBidUrlsRef.current = items.reduce((acc, it) => {
      acc[it.id] = it.bidBrochureUrl
      return acc
    }, {} as Record<string, string | undefined>)
  }, [items])

  const handleBrochureUpload = (itemId: string, file: File) => {
    const prev = items.find((i) => i.id === itemId)?.bidBrochureUrl
    if (prev && prev.startsWith('blob:') && createdObjectUrlsRef.current[itemId] === prev) {
      try { URL.revokeObjectURL(prev) } catch {}
      delete createdObjectUrlsRef.current[itemId]
    }

    const fileUrl = URL.createObjectURL(file)
    createdObjectUrlsRef.current[itemId] = fileUrl

    setItems(items.map(item =>
      item.id === itemId
        ? {
            ...item,
            bidBrochureUrl: fileUrl,
            bidBrochureFileName: file.name
          }
        : item
    ))
    toast({
      title: 'Brochure uploaded',
      description: `File "${file.name}" has been uploaded.`
    })
  }

  const handleRemoveBrochure = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            bidBrochureUrl: undefined,
            bidBrochureFileName: undefined
          }
        : item
    ))
    toast({
      title: 'Brochure removed',
      description: 'The brochure has been removed.'
    })
  }

  const handleSaveDraft = async () => {
    try {
      const targetSupplierId = supplierId || '00000000-0000-0000-0000-000000000001'
      await submitBidMutation({
        pathParams: { rfqId: rfq.id },
        payload: {
          rfqId: rfq.id,
          supplierId: targetSupplierId,
          submissionType: 'Electronic',
          status: 'DRAFT',
          items: items.map((i) => ({
            rfqItemId: i.id,
            unitPrice: i.bidUnitPrice || 0,
            brand: i.bidBrand,
            model: i.bidModel,
            color: i.bidColor,
            brochureFileUrl: i.bidBrochureUrl,
            isResponsive: true,
          })),
        },
      })

      toast({
        title: 'Draft saved',
        description: 'Your quotation has been saved as draft.'
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Could not save quotation draft.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmitQuotation = () => {
    const incomplete = items.filter(item => 
      !item.bidUnitPrice || item.bidUnitPrice <= 0
    )

    if (incomplete.length > 0) {
      toast({
        title: 'Incomplete quotation',
        description: 'Please enter unit bid prices for all items.'
      })
      return
    }

    setSubmitConfirmOpen(true)
  }

  const confirmSubmit = async () => {
    try {
      const targetSupplierId = supplierId || '00000000-0000-0000-0000-000000000001'
      await submitBidMutation({
        pathParams: { rfqId: rfq.id },
        payload: {
          rfqId: rfq.id,
          supplierId: targetSupplierId,
          submissionType: 'Electronic',
          status: 'SUBMITTED',
          items: items.map((i) => ({
            rfqItemId: i.id,
            unitPrice: i.bidUnitPrice || 0,
            brand: i.bidBrand,
            model: i.bidModel,
            color: i.bidColor,
            brochureFileUrl: i.bidBrochureUrl,
            isResponsive: true,
          })),
        },
      })

      toast({
        title: 'Quotation submitted',
        description: 'Your quotation has been successfully submitted.'
      })
      setSubmitConfirmOpen(false)
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.message || 'Could not submit quotation.',
        variant: 'destructive',
      })
    }
  }

  const totalABCAmount = items.reduce(
    (sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 1)),
    0
  )
  const totalBidAmount = items.reduce((sum, item) => sum + (item.bidTotalAmount || 0), 0)
  const isTotalOverBudget = totalABCAmount > 0 && totalBidAmount > totalABCAmount

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Set Quotation - ${rfq.rfqNumber}`}
        description="Enter your bid specifications and unit prices for each item"
        size="5xl"
        className="w-full max-w-[1350px]"
        showCloseButton
      >
        <div className="space-y-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Model/Brand/Color</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Unit ABC (₱)</TableHead>
                    <TableHead className="whitespace-nowrap">Unit Bid (₱)</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Total Bid (₱)</TableHead>
                    <TableHead>Brochure</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isItemOverBudget =
                      Boolean(item.bidUnitPrice && item.unitPrice && item.bidUnitPrice > item.unitPrice)

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          {item.bidModel || item.bidBrand || item.bidColor ? (
                            <div className="text-sm">
                              {item.bidModel && <div>Model: {item.bidModel}</div>}
                              {item.bidBrand && <div>Brand: {item.bidBrand}</div>}
                              {item.bidColor && <div>Color: {item.bidColor}</div>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Not specified</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-700 whitespace-nowrap">
                          ₱{(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={item.bidUnitPrice || ''}
                              onChange={(e) => handleUnitBidChange(item.id, e.target.value)}
                              disabled={isSubmitted}
                              className={`w-32 ${
                                isItemOverBudget
                                  ? 'border-amber-500 focus-visible:ring-amber-500 text-amber-900 bg-amber-50/40'
                                  : ''
                              }`}
                              min="0"
                              step="0.01"
                            />
                            {isItemOverBudget && (
                              <span className="text-[10px] text-amber-600 block font-medium">
                                Exceeds ABC
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold whitespace-nowrap">
                          ₱{(item.bidTotalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {item.bidBrochureUrl ? (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <a
                                href={item.bidBrochureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline max-w-[120px] truncate block"
                                title={item.bidBrochureFileName || 'Brochure'}
                              >
                                {item.bidBrochureFileName || 'View Brochure'}
                              </a>
                              {!isSubmitted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveBrochure(item.id)}
                                  className="h-6 w-6 p-0 hover:text-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div>
                              {!isSubmitted && (
                                <>
                                  <input
                                    type="file"
                                    ref={(el) => (fileInputRefs.current[item.id] = el)}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleBrochureUpload(item.id, file)
                                    }}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRefs.current[item.id]?.click()}
                                    className="gap-2"
                                  >
                                    <Upload className="h-3 w-3" />
                                    Upload
                                  </Button>
                                </>
                              )}
                              {isSubmitted && <span className="text-muted-foreground text-sm">—</span>}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {!isSubmitted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBidSpecClick(item)}
                              className="gap-2"
                            >
                              <Pencil className="h-3 w-3" />
                              Item Bid Specification
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-between items-center p-4 bg-slate-50 border rounded-lg">
              <div>
                <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">
                  TOTAL APPROVED BUDGET (ABC)
                </span>
                <span className="text-lg font-bold text-slate-700">
                  ₱{totalABCAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block font-semibold uppercase tracking-wider">
                  TOTAL QUOTATION AMOUNT
                </span>
                <div className="flex items-center gap-2.5 justify-end">
                  <span className={`text-2xl font-bold ${isTotalOverBudget ? 'text-amber-600' : 'text-primary'}`}>
                    ₱{totalBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {isTotalOverBudget && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs font-medium">
                      Exceeds Total ABC
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {isSubmitted && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <Badge className="bg-green-600">SUBMITTED</Badge>
                <span className="text-sm text-green-800">
                  This quotation was submitted on {rfq?.quotationSubmittedAt ? new Date(rfq.quotationSubmittedAt).toLocaleString() : '—'}. 
                  You cannot edit your bid after submission.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {!isSubmitted && (
                <>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmitQuotation} disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Quotation
                  </Button>
                </>
              )}
            </div>
          </div>
        </ResponsiveDialog>

      <ItemBidSpecModal
        open={specModalOpen}
        onOpenChange={setSpecModalOpen}
        item={selectedItem}
        onSave={handleSaveBidSpec}
      />

      <AlertDialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              You cannot edit your bid after submission. Are you sure you want to submit this quotation?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
