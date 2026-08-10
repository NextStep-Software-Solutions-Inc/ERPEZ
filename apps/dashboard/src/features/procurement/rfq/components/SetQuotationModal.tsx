import { useState, useEffect, useRef } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { useRFQStore, RFQItem } from '../store/rfqStore'
import { Pencil, Save, Upload, FileText, X, Send } from 'lucide-react'
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

interface SetQuotationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rfqId: string
}

interface ItemBidSpecModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: RFQItem
  onSave: (itemId: string, model: string, brand: string, color: string) => void
}

function ItemBidSpecModal({ open, onOpenChange, item, onSave }: ItemBidSpecModalProps) {
  const [model, setModel] = useState(item.bidModel || '')
  const [brand, setBrand] = useState(item.bidBrand || '')
  const [color, setColor] = useState(item.bidColor || '')

  useEffect(() => {
    if (open) {
      setModel(item.bidModel || '')
      setBrand(item.bidBrand || '')
      setColor(item.bidColor || '')
    }
  }, [open, item])

  const handleSave = () => {
    onSave(item.id, model, brand, color)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Item Bid Specification</DialogTitle>
          <DialogDescription>
            Enter the specifications for {item.itemName}
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

export function SetQuotationModal({ open, onOpenChange, rfqId }: SetQuotationModalProps) {
  const { rfqs } = useRFQStore()
  const rfq = rfqs.find((r) => r.id === rfqId)
  const { toast } = useToast()
  const [items, setItems] = useState<RFQItem[]>([])
  const [specModalOpen, setSpecModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<RFQItem | null>(null)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const isSubmitted = rfq?.quotationStatus === 'submitted'

  useEffect(() => {
    if (rfq && open) {
      setItems(rfq.items.map(item => ({ ...item })))
    }
  }, [rfq, open])

  if (!rfq) return null

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

  // Revoke any created object URLs when modal closes or component unmounts
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

  // Keep previous item URLs in sync and revoke when changed/removed
  useEffect(() => {
    const prev = prevBidUrlsRef.current
    items.forEach((it) => {
      const prevUrl = prev[it.id]
      const currUrl = it.bidBrochureUrl
      // If the previous URL was one we created and it changed (including removed), revoke it
      if (prevUrl && prevUrl !== currUrl && createdObjectUrlsRef.current[it.id] === prevUrl) {
        try { URL.revokeObjectURL(prevUrl) } catch {}
        delete createdObjectUrlsRef.current[it.id]
      }
    })
    // update prev snapshot
    prevBidUrlsRef.current = items.reduce((acc, it) => {
      acc[it.id] = it.bidBrochureUrl
      return acc
    }, {} as Record<string, string | undefined>)
  }, [items])

  const handleBrochureUpload = (itemId: string, file: File) => {
    // Revoke any previously-created object URL for this item
    const prev = items.find((i) => i.id === itemId)?.bidBrochureUrl
    if (prev && prev.startsWith('blob:') && createdObjectUrlsRef.current[itemId] === prev) {
      try { URL.revokeObjectURL(prev) } catch {}
      delete createdObjectUrlsRef.current[itemId]
    }

    // In a real app, upload to server and get URL
    // For now, create a local URL and track it for later revocation
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

  const handleSaveDraft = () => {
    // TODO: Implement save quotation as draft.
    // This requires a backend endpoint to persist quotation data (items, bids, brochures)
    // without marking the RFQ quotation as "submitted".
    // See rfqStore.ts for available endpoints or create POST /rfqs/{id}/quotation endpoint.
    toast({
      title: 'Draft saved',
      description: 'Your quotation has been saved as draft.'
    })
    // Close the dialog after saving
    onOpenChange(false)
  }

  const handleSubmitQuotation = () => {
    // Validate that all items have unit bid price (only required field)
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

    // Show confirmation dialog
    setSubmitConfirmOpen(true)
  }

  const confirmSubmit = () => {
    // TODO: Implement submit quotation API call.
    // This should POST updated items with bid prices and brochure URLs to backend,
    // then mark RFQ quotationStatus as "submitted".
    // Suggested endpoint: POST /rfqs/{id}/quotation/submit or PATCH /rfqs/{id}/quotation
    // Payload should include: items with bidUnitPrice, bidModel, bidBrand, bidColor, bidBrochureUrl
    toast({
      title: 'Quotation submitted',
      description: 'Your quotation has been successfully submitted.'
    })
    setSubmitConfirmOpen(false)
    onOpenChange(false)
  }

  const totalBidAmount = items.reduce((sum, item) => sum + (item.bidTotalAmount || 0), 0)

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Set Quotation - ${rfq.rfqNumber}`}
        description="Enter your bid specifications and unit prices for each item"
        size="4xl"
        showCloseButton
      >
        <div className="space-y-6">
          <div className="rounded-md border">
            <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Model/Brand/Color</TableHead>
                    <TableHead>Unit Bid (₱)</TableHead>
                    <TableHead>Total Bid (₱)</TableHead>
                    <TableHead>Brochure</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {item.itemName}
                          {item.isRequiredBrochure && (
                            <Badge variant="outline" className="text-xs">Brochure Required</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitOfMeasure || '—'}</TableCell>
                      <TableCell>
                        {item.bidModel && item.bidBrand && item.bidColor ? (
                          <div className="text-sm">
                            <div><strong>Model:</strong> {item.bidModel}</div>
                            <div><strong>Brand:</strong> {item.bidBrand}</div>
                            <div><strong>Color:</strong> {item.bidColor}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.bidUnitPrice || ''}
                          onChange={(e) => handleUnitBidChange(item.id, e.target.value)}
                          placeholder="0.00"
                          className="w-32"
                          disabled={isSubmitted}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          ₱{(item.bidTotalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.bidBrochureFileName ? (
                          <div className="flex items-center gap-2">
                            <a 
                              href={item.bidBrochureUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              {item.bidBrochureFileName}
                            </a>
                            {!isSubmitted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveBrochure(item.id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
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
                                  ref={(el) => {
                                    fileInputRefs.current[item.id] = el
                                  }}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleBrochureUpload(item.id, file)
                                  }}
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <div className="text-lg font-semibold">Total Quotation Amount:</div>
              <div className="text-2xl font-bold text-primary">
                ₱{totalBidAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmitQuotation} className="gap-2">
                    <Send className="h-4 w-4" />
                    Submit Quotation
                  </Button>
                </>
              )}
            </div>
          </div>
        </ResponsiveDialog>

      {selectedItem && (
        <ItemBidSpecModal
          open={specModalOpen}
          onOpenChange={setSpecModalOpen}
          item={selectedItem}
          onSave={handleSaveBidSpec}
        />
      )}

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
            <AlertDialogAction onClick={confirmSubmit}>
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
