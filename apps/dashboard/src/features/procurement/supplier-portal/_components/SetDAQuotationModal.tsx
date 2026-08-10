import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
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
  FileText,
  Pencil,
  Save,
  Send,
  Upload,
  X,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import type { ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { ItemBidSpecModal } from './ItemBidSpecModal'
import type { DirectContractingItem, QuotationItemBid } from '../types/daItemTypes'

type RowBidState = {
  unitPrice: number | ''
  model: string
  brand: string
  color: string
  brochureUrl?: string
  brochureFileName?: string
}

interface SetDAQuotationModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: DirectContractingItem
  linkedPR: ReturnType<typeof useConsolidatedPRStore.getState>['consolidatedPRs'][number] | null
  onSave: (patch: Partial<DirectContractingItem>) => void
}

export function SetDAQuotationModal({
  open,
  onOpenChange,
  item,
  linkedPR,
  onSave,
}: SetDAQuotationModalProps) {
  const { toast } = useToast()
  const isSubmitted = item.quotationStatus === 'submitted'

  // The rows to quote: use linked PR items if available, fallback to the single DA item
  const prItems: ConsolidatedPRItem[] = linkedPR?.selectedPRItems ?? []
  const hasPRItems = prItems.length > 0

  // Per-row bid state — keyed by ConsolidatedPRItem.id (or 'single' for fallback)
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
        unitPrice: item.bidUnitPrice ?? '',
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
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const blobUrls = useRef<string[]>([])

  useEffect(() => {
    if (open) setRows(buildInitialRows())
    if (!open) {
      blobUrls.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {}
      })
      blobUrls.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const updateRow = (key: string, patch: Partial<RowBidState>) =>
    setRows((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  const handleBrochure = (key: string, file: File) => {
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    updateRow(key, { brochureUrl: url, brochureFileName: file.name })
    toast({ title: 'Brochure uploaded', description: `"${file.name}" attached.` })
  }

  const rowTotal = (key: string): number => {
    const r = rows[key]
    const qty = hasPRItems ? (prItems.find((pi) => pi.id === key)?.qty ?? 0) : item.quantity
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
        itemName: item.itemName,
        qty: item.quantity,
        unit: item.unit,
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

  const handleSaveDraft = () => {
    onSave({ quotationItems: buildQuotationItems(), quotationStatus: 'draft', bidTotalAmount: totalQuotation })
    toast({ title: 'Draft saved', description: 'Your quotation has been saved as draft.' })
    onOpenChange(false)
  }

  const handleSubmitQuotation = () => {
    const anyPrice = Object.keys(rows).some((k) => Number(rows[k].unitPrice) > 0)
    if (!anyPrice) {
      toast({ title: 'Incomplete quotation', description: 'Please enter at least one unit bid price.' })
      return
    }
    setSubmitConfirmOpen(true)
  }

  const confirmSubmit = () => {
    onSave({
      quotationItems: buildQuotationItems(),
      quotationStatus: 'submitted',
      quotationSubmittedAt: new Date().toISOString(),
      bidTotalAmount: totalQuotation,
    })
    toast({ title: 'Quotation submitted!', description: 'Your quotation has been successfully submitted.' })
    setSubmitConfirmOpen(false)
    onOpenChange(false)
  }

  const displayRows = hasPRItems
    ? prItems.map((pi) => ({ key: pi.id, name: pi.itemName, qty: pi.qty, unit: pi.unit, office: pi.prOffice, category: pi.category }))
    : [{ key: 'single', name: item.itemName, qty: item.quantity, unit: item.unit, office: '—', category: '—' }]

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Set Quotation — ${item.daNumber}`}
        description={
          hasPRItems
            ? `Enter your bid for all ${prItems.length} item(s) in Consolidated PR ${item.prNumber}`
            : 'Enter your bid specifications and unit price for this item'
        }
        size="5xl"
        showCloseButton
      >
        <div className="space-y-6">
          {/* Already-submitted banner */}
          {isSubmitted && (
            <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">Quotation already submitted</p>
                <p className="text-xs text-green-600">
                  Submitted on{' '}
                  {item.quotationSubmittedAt
                    ? new Date(item.quotationSubmittedAt).toLocaleString()
                    : '—'}
                  . You may update and resubmit.
                </p>
              </div>
            </div>
          )}

          {/* No PR items notice */}
          {!hasPRItems && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                No Consolidated PR items found for <strong>{item.prNumber}</strong>. Quoting against the DA item directly.
              </p>
            </div>
          )}

          {/* Items table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="whitespace-nowrap">Item Name</TableHead>
                  {hasPRItems && <TableHead>Office</TableHead>}
                  {hasPRItems && <TableHead>Category</TableHead>}
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Model / Brand / Color</TableHead>
                  <TableHead className="whitespace-nowrap">Unit Bid (₱)</TableHead>
                  <TableHead className="whitespace-nowrap">Total Bid (₱)</TableHead>
                  <TableHead>Brochure</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map(({ key, name, qty, unit, office, category }) => {
                  const r = rows[key] ?? { unitPrice: '', model: '', brand: '', color: '' }
                  const total = rowTotal(key)
                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium max-w-[180px]">
                        <span title={name} className="line-clamp-2">
                          {name}
                        </span>
                      </TableCell>
                      {hasPRItems && (
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{office}</TableCell>
                      )}
                      {hasPRItems && (
                        <TableCell>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {category}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-right font-medium">{qty}</TableCell>
                      <TableCell className="text-muted-foreground">{unit}</TableCell>
                      <TableCell className="min-w-[140px]">
                        {r.model && r.brand ? (
                          <div className="text-xs space-y-0.5">
                            <div>
                              <span className="text-muted-foreground">Model:</span> {r.model}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Brand:</span> {r.brand}
                            </div>
                            {r.color && (
                              <div>
                                <span className="text-muted-foreground">Color:</span> {r.color}
                              </div>
                            )}
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
                      <TableCell className="whitespace-nowrap font-semibold text-primary">
                        ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="min-w-[140px]">
                        {r.brochureFileName ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={r.brochureUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[100px]"
                            >
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              {r.brochureFileName}
                            </a>
                            {!isSubmitted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 text-destructive"
                                onClick={() => updateRow(key, { brochureUrl: undefined, brochureFileName: undefined })}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ) : (
                          !isSubmitted && (
                            <>
                              <input
                                type="file"
                                ref={(el) => {
                                  fileInputRefs.current[key] = el
                                }}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const f = e.target.files?.[0]
                                  if (f) handleBrochure(key, f)
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                                onClick={() => fileInputRefs.current[key]?.click()}
                              >
                                <Upload className="h-3 w-3" /> Upload
                              </Button>
                            </>
                          )
                        )}
                        {isSubmitted && !r.brochureFileName && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {!isSubmitted && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs whitespace-nowrap"
                            onClick={() => setSpecOpenFor(key)}
                          >
                            <Pencil className="h-3 w-3" /> Specs
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Grand total */}
          <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border">
            <div className="text-base font-semibold text-muted-foreground">
              Total Quotation Amount
              {hasPRItems && (
                <span className="ml-1 text-xs font-normal">
                  ({prItems.length} item{prItems.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-primary">
              ₱{totalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {!isSubmitted && (
              <>
                <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
                  <Save className="h-4 w-4" /> Save Draft
                </Button>
                <Button
                  onClick={handleSubmitQuotation}
                  className="gap-2 bg-gradient-to-r from-primary to-indigo-500 text-white hover:opacity-90"
                >
                  <Send className="h-4 w-4" /> Submit Quotation
                </Button>
              </>
            )}
          </div>
        </div>
      </ResponsiveDialog>

      {/* Per-row Item Bid Spec sub-dialog */}
      {specOpenFor !== null && (
        <ItemBidSpecModal
          open={specOpenFor !== null}
          onOpenChange={(v) => {
            if (!v) setSpecOpenFor(null)
          }}
          item={{
            ...item,
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
            <AlertDialogTitle>Submit Quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to submit your quotation for <strong>{item.daNumber}</strong>
              {hasPRItems ? ` covering ${prItems.length} consolidated PR item(s)` : ''}. You cannot edit your
              bid after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>Yes, Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
