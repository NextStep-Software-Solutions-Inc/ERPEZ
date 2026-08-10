import { useState, useEffect, useRef, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FileText,
  Save,
  Send,
  X,
  Upload,
  Pencil,
  Paperclip,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useConsolidatedPRStore, type ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { ItemBidSpecModal } from './ItemBidSpecModal'
import type { DirectContractingItem, QuotationItemBid } from '../types/daItemTypes'
import type { DirectContracting } from '@/features/procurement/direct-contracting/store/directContractingStore'

interface DARequirementsModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: DirectContracting | DirectContractingItem
  onSave: (patch: Partial<DirectContracting> | Partial<DirectContractingItem>) => void
}

export type RowBidState = {
  unitPrice: number | ''
  model: string
  brand: string
  color: string
  brochureUrl?: string
  brochureFileName?: string
}

export function DARequirementsModal({ open, onOpenChange, item, onSave }: DARequirementsModalProps) {
  const { toast } = useToast()

  // Use fields consistently for both types
  const dcNumber = 'dcNumber' in item ? item.dcNumber : ('daNumber' in item ? item.daNumber : '')
  const itemName = 'dcName' in item ? item.dcName : ('itemName' in item ? item.itemName : '')
  const prNumber = item.prNumber
  const quantity = ('quantity' in item ? item.quantity : ('totalItems' in item ? item.totalItems : 0)) || 0
  const unit = ('unit' in item ? item.unit : 'Items') || 'Items'
  const totalAmount = 'totalABC' in item ? item.totalABC : ('totalAmount' in item ? item.totalAmount : 0)
  const status = item.proposalAmount ? 'submitted' : (item.daRequirementsStatus || 'draft')

  const isSubmitted = status === 'submitted' || item.status === 'for-review' || item.status === 'approved' || item.status === 'rejected'

  // Exclusivity Document (Unified Dropzone)
  const [exclusivityFile, setExclusivityFile] = useState<string | undefined>(item.exclusivityProofUrl)
  const [exclusivityFileName, setExclusivityFileName] = useState<string | undefined>(item.exclusivityProofFileName)
  const [proposalNotes, setProposalNotes] = useState(item.proposalNotes || '')

  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const exclusivityRef = useRef<HTMLInputElement>(null)
  const blobUrls = useRef<string[]>([])

  // Drag and Drop hover state
  const [isDragging, setIsDragging] = useState(false)

  // ── Step 2 state & logic (RFQ-style quotation per item) ──
  const consolidatedPRs = useConsolidatedPRStore((s) => s.consolidatedPRs)
  const linkedPR = useMemo(
    () => consolidatedPRs.find((pr) => pr.id === item.prNumber || pr.prNumber === item.prNumber) ?? null,
    [consolidatedPRs, item.prNumber],
  )
  const prItems: ConsolidatedPRItem[] = linkedPR?.selectedPRItems ?? []
  const hasPRItems = prItems.length > 0

  const buildInitialRows = (): Record<string, RowBidState> => {
    if (hasPRItems) {
      const existing = item.quotationItems ?? []
      return Object.fromEntries(
        prItems.map((pi) => {
          const ex = existing.find((e) => e.prItemId === pi.id)
          return [
            pi.id,
            {
              unitPrice: ex?.bidUnitPrice ?? '',
              model: ex?.bidModel ?? '',
              brand: ex?.bidBrand ?? '',
              color: ex?.bidColor ?? '',
              brochureUrl: ex?.bidBrochureUrl,
              brochureFileName: ex?.bidBrochureFileName,
            } satisfies RowBidState,
          ]
        }),
      )
    }
    return {
      single: {
        unitPrice: item.bidUnitPrice ?? item.proposalUnitPrice ?? '',
        model: item.bidModel ?? '',
        brand: item.bidBrand ?? '',
        color: item.bidColor ?? '',
        brochureUrl: item.bidBrochureUrl,
        brochureFileName: item.bidBrochureFileName,
      },
    }
  }

  const [rows, setRows] = useState<Record<string, RowBidState>>(buildInitialRows)
  const [specOpenFor, setSpecOpenFor] = useState<string | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    if (open) {
      setExclusivityFile(item.exclusivityProofUrl)
      setExclusivityFileName(item.exclusivityProofFileName)
      setProposalNotes(item.proposalNotes || '')
      setRows(buildInitialRows())
    } else {
      blobUrls.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch { }
      })
      blobUrls.current = []
    }
  }, [open, item, hasPRItems])

  useEffect(() => {
    return () => {
      blobUrls.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch { }
      })
    }
  }, [])

  const updateRow = (key: string, patch: Partial<RowBidState>) =>
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  const handleBrochure = (key: string, file: File) => {
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    updateRow(key, { brochureUrl: url, brochureFileName: file.name })
    toast({ title: 'Brochure uploaded', description: `"${file.name}" attached.` })
  }

  const handleRemoveBrochure = (key: string) => {
    updateRow(key, { brochureUrl: undefined, brochureFileName: undefined })
    toast({ title: 'Brochure removed', description: 'Brochure has been removed.' })
  }

  const rowTotal = (key: string): number => {
    const r = rows[key]
    const qty = hasPRItems ? (prItems.find((pi) => pi.id === key)?.qty ?? 0) : quantity
    return (Number(r?.unitPrice) || 0) * qty
  }

  const totalQuotation = Object.keys(rows).reduce((sum, key) => sum + rowTotal(key), 0)

  const buildQuotationItems = (): QuotationItemBid[] => {
    if (hasPRItems) {
      return prItems.map((pi) => {
        const r = rows[pi.id]
        return {
          prItemId: pi.id,
          itemName: pi.itemName,
          qty: pi.qty,
          unit: pi.unit,
          bidUnitPrice: Number(r?.unitPrice) || 0,
          bidTotalAmount: rowTotal(pi.id),
          bidModel: r?.model || undefined,
          bidBrand: r?.brand || undefined,
          bidColor: r?.color || undefined,
          bidBrochureUrl: r?.brochureUrl,
          bidBrochureFileName: r?.brochureFileName,
        }
      })
    }
    const r = rows['single']
    return [
      {
        prItemId: 'single',
        itemName: itemName,
        qty: quantity || 1,
        unit: unit,
        bidUnitPrice: Number(r?.unitPrice) || 0,
        bidTotalAmount: rowTotal('single'),
        bidModel: r?.model || undefined,
        bidBrand: r?.brand || undefined,
        bidColor: r?.color || undefined,
        bidBrochureUrl: r?.brochureUrl,
        bidBrochureFileName: r?.brochureFileName,
      },
    ]
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF files are accepted for this document.',
        color: 'destructive',
      })
      return
    }
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    setExclusivityFile(url)
    setExclusivityFileName(file.name)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: 'Invalid file type',
        description: 'Only PDF files are accepted for this document.',
        color: 'destructive',
      })
      return
    }
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    setExclusivityFile(url)
    setExclusivityFileName(file.name)
    toast({
      title: 'Document uploaded',
      description: `"${file.name}" has been successfully uploaded via drag & drop.`,
    })
  }

  // Submission validation: Exclusivity document is required + all rows must have unit price > 0
  const canSubmit = !!exclusivityFileName && Object.keys(rows).every((k) => Number(rows[k]?.unitPrice) > 0)

  const buildPatch = (status: 'draft' | 'submitted'): Partial<DirectContracting> | Partial<DirectContractingItem> => {
    const quotationItems = buildQuotationItems()
    const isDC = 'dcNumber' in item

    const basePatch = {
      exclusivityProofFileName: exclusivityFileName,
      exclusivityProofUrl: exclusivityFile,
      soleDistCertFileName: exclusivityFileName,
      soleDistCertUrl: exclusivityFile,
      proposalNotes,
      quotationItems,
      proposalAmount: totalQuotation,
      bidTotalAmount: totalQuotation,
      ...(!hasPRItems ? {
        proposalUnitPrice: rows['single']?.unitPrice === '' ? undefined : Number(rows['single']?.unitPrice),
        bidUnitPrice: rows['single']?.unitPrice === '' ? undefined : Number(rows['single']?.unitPrice),
        bidModel: rows['single']?.model || undefined,
        bidBrand: rows['single']?.brand || undefined,
        bidColor: rows['single']?.color || undefined,
        bidBrochureUrl: rows['single']?.brochureUrl,
        bidBrochureFileName: rows['single']?.brochureFileName,
      } : {}),
      daRequirementsStatus: status,
      quotationStatus: status,
    }

    if (status === 'submitted') {
      if (isDC) {
        return {
          ...basePatch,
          daRequirementsSubmittedAt: new Date().toISOString(),
          quotationSubmittedAt: new Date().toISOString(),
          status: 'for-review' as const,
        } satisfies Partial<DirectContracting>
      } else {
        return {
          ...basePatch,
          daRequirementsSubmittedAt: new Date().toISOString(),
          quotationSubmittedAt: new Date().toISOString(),
          status: 'for_review' as const,
        } satisfies Partial<DirectContractingItem>
      }
    }

    return basePatch
  }

  const handleSaveDraft = () => {
    onSave(buildPatch('draft'))
    toast({ title: 'Draft saved', description: 'Your direct contracting quotation draft has been saved.' })
    onOpenChange(false)
  }

  const handleConfirmSubmit = () => {
    onSave(buildPatch('submitted'))
    toast({
      title: 'Quotation submitted!',
      description: `Your documents and quotation for ${dcNumber} have been submitted to the agency for review.`,
    })
    setSubmitConfirmOpen(false)
    onOpenChange(false)
  }

  const displayRows = hasPRItems
    ? prItems.map((pi) => ({ key: pi.id, name: pi.itemName, qty: pi.qty, unit: pi.unit, office: pi.prOffice, category: pi.category }))
    : [{ key: 'single', name: itemName, qty: quantity || 1, unit: unit, office: '—', category: '—' }]

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Handle DC Requirements — ${dcNumber}`}
        description={`${itemName} · Direct Contracting / Sole Distributorship`}
        size="4xl"
        showCloseButton
        footer={
          <div className="flex items-center justify-between border-t pt-3 w-full">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              {isSubmitted ? 'Close' : 'Cancel'}
            </Button>
            {!isSubmitted && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  disabled={!canSubmit}
                  onClick={() => setSubmitConfirmOpen(true)}
                  className="bg-gradient-to-r from-primary to-indigo-500 text-white hover:opacity-90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit to Agency
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Already-submitted banner */}
          {isSubmitted && (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">Quotation already submitted</p>
                <p className="text-xs text-emerald-600">
                  Submitted on{' '}
                  {item.quotationSubmittedAt
                    ? new Date(item.quotationSubmittedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                    : '—'}
                  . You may update and resubmit.
                </p>
              </div>
            </div>
          )}

          {/* Item recap */}
          <div className="rounded-lg bg-slate-50 border px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>
              <span className="text-muted-foreground">DC No.: </span>
              <strong>{dcNumber}</strong>
            </span>
            <span>
              <span className="text-muted-foreground">PR: </span>
              <strong>{prNumber}</strong>
            </span>
            <span>
              <span className="text-muted-foreground">Qty: </span>
              <strong>
                {quantity} {unit}
              </strong>
            </span>
            <span>
              <span className="text-muted-foreground">Budget: </span>
              <strong>₱{(totalAmount || 0).toLocaleString()}</strong>
            </span>
          </div>

          {/* ── Unified Dropzone: Exclusivity Dropzone ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-red-500">Exclusivity Document</Label>
              <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">REQUIRED</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload your valid Sole Distributorship Certificate, Manufacturer's Authorization, or Patent Document.
            </p>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${exclusivityFileName
                  ? 'border-emerald-400 bg-emerald-50/60'
                  : isDragging
                    ? 'border-primary bg-primary/10 scale-[1.01] shadow-md'
                    : 'border-red-300 bg-red-50/40 hover:border-red-400 hover:bg-red-50'
                } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
              onClick={() => !isSubmitted && exclusivityRef.current?.click()}
              onDragOver={(e) => !isSubmitted && handleDragOver(e)}
              onDragLeave={(e) => !isSubmitted && handleDragLeave(e)}
              onDrop={(e) => !isSubmitted && handleDrop(e)}
              role="button"
              tabIndex={isSubmitted ? -1 : 0}
              onKeyDown={(e) => {
                if (!isSubmitted && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  exclusivityRef.current?.click()
                }
              }}
            >
              {exclusivityFileName ? (
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className="h-10 w-10 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700">{exclusivityFileName}</p>
                  {!isSubmitted && <p className="text-xs text-muted-foreground">Click or drag new file to replace</p>}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-10 w-10 text-red-500" />
                  <p className="text-sm font-semibold text-red-500">Click or drag &amp; drop to upload</p>
                  <p className="text-xs text-muted-foreground">PDF only · Max 10 MB</p>
                </div>
              )}
            </div>
            <input
              ref={exclusivityRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isSubmitted}
            />
          </div>

          <Separator />

          {/* ── Set Quotation per Item ── */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Set Quotation per Item</Label>
              <p className="text-xs text-muted-foreground">Enter your bid specifications and unit prices for each item</p>
            </div>
            <div className="rounded-md border overflow-x-auto">
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
                  {displayRows.map(({ key, name, qty, unit }) => {
                    const r = rows[key] ?? { unitPrice: '', model: '', brand: '', color: '' }
                    const total = rowTotal(key)
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium max-w-[180px]">
                          <span title={name} className="line-clamp-2">
                            {name}
                          </span>
                        </TableCell>
                        <TableCell>{qty}</TableCell>
                        <TableCell>{unit}</TableCell>
                        <TableCell>
                          {r.model && r.brand ? (
                            <div className="text-xs space-y-0.5">
                              <div><strong>Model:</strong> {r.model}</div>
                              <div><strong>Brand:</strong> {r.brand}</div>
                              {r.color && <div><strong>Color:</strong> {r.color}</div>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={r.unitPrice}
                            onChange={(e) =>
                              updateRow(key, { unitPrice: e.target.value === '' ? '' : Number(e.target.value) })
                            }
                            placeholder="0.00"
                            className="w-32"
                            disabled={isSubmitted}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-emerald-700">
                            ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {r.brochureFileName ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={r.brochureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-primary hover:underline truncate max-w-[100px]"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span className="truncate max-w-[80px]" title={r.brochureFileName}>{r.brochureFileName}</span>
                              </a>
                              {!isSubmitted && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveBrochure(key)}
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
                                      fileInputRefs.current[key] = el
                                    }}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) handleBrochure(key, file)
                                    }}
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRefs.current[key]?.click()}
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
                              onClick={() => setSpecOpenFor(key)}
                              className="gap-2 whitespace-nowrap"
                            >
                              <Pencil className="h-3 w-3" />
                              Specs
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex justify-between items-center p-4 bg-slate-50 rounded-lg border">
              <div className="text-base font-semibold">Total Quotation Amount:</div>
              <div className="text-2xl font-bold text-primary">
                ₱{totalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Proposal Notes ── */}
          <div className="space-y-1">
            <Label htmlFor="proposalNotes" className="text-sm font-semibold">
              Proposal Details &amp; Notes{' '}
              <span className="text-xs font-normal text-muted-foreground">(delivery terms, warranty, lead time, etc.)</span>
            </Label>
            <Textarea
              id="proposalNotes"
              disabled={isSubmitted}
              placeholder="Describe your offer, delivery schedule, warranty terms, and any other relevant information the agency should know..."
              value={proposalNotes}
              onChange={(e) => setProposalNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Warning box */}
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              The Exclusivity Document (Sole Distributorship Certificate, Manufacturer's Authorization, or Patent Document) is mandatory for Direct Contracting under RA 12009. Incomplete submissions will be disqualified.
            </p>
          </div>
        </div>
      </ResponsiveDialog>

      {specOpenFor !== null && (
        <ItemBidSpecModal
          open={specOpenFor !== null}
          onOpenChange={(v) => {
            if (!v) setSpecOpenFor(null)
          }}
          item={{
            ...item,
            itemName: hasPRItems ? prItems.find(pi => pi.id === specOpenFor)?.itemName : itemName,
            bidModel: rows[specOpenFor]?.model,
            bidBrand: rows[specOpenFor]?.brand,
            bidColor: rows[specOpenFor]?.color,
          } as DirectContractingItem}
          onSave={(_id, m, b, c) => {
            updateRow(specOpenFor, { model: m, brand: b, color: c })
            setSpecOpenFor(null)
          }}
        />
      )}

      <AlertDialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to submit your DC requirements for <strong>{dcNumber}</strong> to the agency. Once
              submitted, the item will be marked <strong>For Review</strong>. You can update and resubmit if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} className="bg-primary text-white">
              <Send className="h-4 w-4 mr-2" />
              Confirm &amp; Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
