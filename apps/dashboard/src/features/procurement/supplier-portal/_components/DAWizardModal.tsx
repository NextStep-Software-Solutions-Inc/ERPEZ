/**
 * DAWizardModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Combined 3-step wizard that replaces the separate "Handle DA Requirements"
 * and "Set Quotation" dialogs for Direct Acquisition items.
 *
 * Step 1 – DA Requirements
 *   • Upload Proof of Exclusivity (PDF)
 *   • Upload Sole Distributorship Certificate (PDF)
 *   • Proposal Details & Notes  (no offered unit price field)
 *
 * Step 2 – Set Quotation
 *   • Item table derived from linked Consolidated PR (or the DA item itself)
 *   • Item Master (Procurement Library) lookup to auto-fill specs
 *   • Unit bid price, model / brand / color, brochure upload
 *
 * Step 3 – Review & Submit
 *   • Read-only summary of steps 1 & 2
 *   • "Save Draft" or "Submit to Agency" actions
 */

import { useState, useEffect, useRef, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileCheck,
  FileText,
  Package,
  Paperclip,
  Pencil,
  Save,
  Send,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import type { ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { useItemMaster } from '@/hooks/useItemMaster'
import { ItemBidSpecModal } from './ItemBidSpecModal'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { DirectContractingItem, QuotationItemBid } from '../types/daItemTypes'

// ─── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'DA Requirements', icon: ShieldCheck },
  { id: 2, label: 'Set Quotation', icon: ClipboardList },
  { id: 3, label: 'Review & Submit', icon: CheckCircle2 },
] as const

// ─── Row bid state type ───────────────────────────────────────────────────────
type RowBidState = {
  unitPrice: number | ''
  model: string
  brand: string
  color: string
  brochureUrl?: string
  brochureFileName?: string
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface DAWizardModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  item: DirectContractingItem
  onSave: (patch: Partial<DirectContractingItem>) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DAWizardModal({ open, onOpenChange, item, onSave }: DAWizardModalProps) {
  const { toast } = useToast()

  // ── Step 1 state ────────────────────────────────────────────────────────────
  const [exclusivityFile, setExclusivityFile] = useState<string | undefined>(item.exclusivityProofUrl)
  const [exclusivityFileName, setExclusivityFileName] = useState<string | undefined>(item.exclusivityProofFileName)
  const [soleDistFile, setSoleDistFile] = useState<string | undefined>(item.soleDistCertUrl)
  const [soleDistFileName, setSoleDistFileName] = useState<string | undefined>(item.soleDistCertFileName)
  const [proposalNotes, setProposalNotes] = useState(item.proposalNotes || '')

  const exclusivityRef = useRef<HTMLInputElement>(null)
  const soleDistRef = useRef<HTMLInputElement>(null)

  // ── Step 2 state ────────────────────────────────────────────────────────────
  const consolidatedPRs = useConsolidatedPRStore((s) => s.consolidatedPRs)
  const linkedPR = useMemo(
    () => consolidatedPRs.find((pr) => pr.id === item.prNumber || pr.prNumber === item.prNumber) ?? null,
    [consolidatedPRs, item.prNumber],
  )
  const prItems: ConsolidatedPRItem[] = linkedPR?.selectedPRItems ?? []
  const hasPRItems = prItems.length > 0

  // Item Master from Procurement Library
  const { itemMasters } = useItemMaster()

  const buildInitialRows = (): Record<string, RowBidState> => {
    if (hasPRItems) {
      const existing = item.quotationItems ?? []
      return Object.fromEntries(
        prItems.map((pi) => {
          const ex = existing.find((e) => e.prItemId === pi.id)
          // Try to pre-fill specs from Item Master by name match
          const libItem = itemMasters.find(
            (im) => im.itemName.toLowerCase() === pi.itemName.toLowerCase(),
          )
          return [
            pi.id,
            {
              unitPrice: ex?.bidUnitPrice ?? '',
              model: ex?.bidModel ?? libItem?.productCode ?? '',
              brand: ex?.bidBrand ?? '',
              color: ex?.bidColor ?? '',
              brochureUrl: ex?.bidBrochureUrl,
              brochureFileName: ex?.bidBrochureFileName,
            } satisfies RowBidState,
          ]
        }),
      )
    }
    const libItem = itemMasters.find(
      (im) => im.itemName.toLowerCase() === item.itemName.toLowerCase(),
    )
    return {
      single: {
        unitPrice: item.bidUnitPrice ?? '',
        model: item.bidModel ?? libItem?.productCode ?? '',
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
  const unitInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const blobUrls = useRef<string[]>([])
  const [step2ValidationAttempted, setStep2ValidationAttempted] = useState(false)

  // Document preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [previewTitle, setPreviewTitle] = useState<string | undefined>(undefined)

  // ── Wizard step ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)

  // ── Reset on open/close ─────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setStep(1)
      setExclusivityFile(item.exclusivityProofUrl)
      setExclusivityFileName(item.exclusivityProofFileName)
      setSoleDistFile(item.soleDistCertUrl)
      setSoleDistFileName(item.soleDistCertFileName)
      setProposalNotes(item.proposalNotes || '')
    } else {
      blobUrls.current.forEach((u) => { try { URL.revokeObjectURL(u) } catch {} })
      blobUrls.current = []
    }
  }, [open, item])

  // Re-build rows when item master loads or linked PR changes
  useEffect(() => {
    if (open) setRows(buildInitialRows())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemMasters.length])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setUrl: (u: string) => void,
    setName: (n: string) => void,
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const MAX_BYTES = 10 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      toast({ title: 'File too large', description: 'File exceeds 10 MB limit.', color: 'destructive' })
      return
    }
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: 'Invalid file type', description: 'Only PDF files are accepted.', color: 'destructive' })
      return
    }
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    setUrl(url)
    setName(file.name)
  }

  const handleBrochure = (key: string, file: File) => {
    const MAX_BYTES = 10 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      toast({ title: 'File too large', description: 'Brochure exceeds 10 MB limit.', color: 'destructive' })
      return
    }
    const url = URL.createObjectURL(file)
    blobUrls.current.push(url)
    updateRow(key, { brochureUrl: url, brochureFileName: file.name })
    toast({ title: 'Brochure uploaded', description: `"${file.name}" attached.` })
  }

  const openPreview = (url?: string, title?: string) => {
    if (!url) return
    setPreviewUrl(url)
    setPreviewTitle(title)
    setPreviewOpen(true)
  }

  const updateRow = (key: string, patch: Partial<RowBidState>) => {
    setRows((prev) => {
      const existing = prev[key] ?? { unitPrice: '', model: '', brand: '', color: '' }
      return {
        ...prev,
        [key]: {
          ...existing,
          ...patch,
        },
      }
    })
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

  const buildPatch = (status: 'draft' | 'submitted'): Partial<DirectContractingItem> => ({
    // Step 1 fields
    exclusivityProofFileName: exclusivityFileName,
    exclusivityProofUrl: exclusivityFile,
    soleDistCertFileName: soleDistFileName,
    soleDistCertUrl: soleDistFile,
    proposalNotes,
    // Step 2 fields
    quotationItems: buildQuotationItems(),
    bidTotalAmount: totalQuotation,
    // Shared status
    daRequirementsStatus: status,
    quotationStatus: status,
    ...(status === 'submitted'
      ? {
          daRequirementsSubmittedAt: new Date().toISOString(),
          quotationSubmittedAt: new Date().toISOString(),
          status: 'for_review' as const,
        }
      : {}),
  })

  const handleSaveDraft = () => {
    onSave(buildPatch('draft'))
    toast({ title: 'Draft saved', description: 'Your DA submission has been saved as a draft.' })
    onOpenChange(false)
  }

  const confirmSubmit = () => {
    onSave(buildPatch('submitted'))
    toast({
      title: 'Submitted!',
      description: `DA requirements & quotation for ${item.daNumber} submitted to the agency.`,
    })
    setSubmitConfirmOpen(false)
    onOpenChange(false)
  }

  // ── Step 1 validation ───────────────────────────────────────────────────────
  const step1Valid = !!exclusivityFileName && !!soleDistFileName

  // ── Step 2 validation: require a unit bid for every displayed row
  const step2Valid =
    Object.keys(rows).length > 0 && Object.keys(rows).every((k) => Number(rows[k].unitPrice) > 0)

  // ── Display rows for quotation table ───────────────────────────────────────
  const displayRows = hasPRItems
    ? prItems.map((pi) => ({ key: pi.id, name: pi.itemName, qty: pi.qty, unit: pi.unit, office: pi.prOffice, category: pi.category }))
    : [{ key: 'single', name: item.itemName, qty: item.quantity, unit: item.unit, office: '—', category: '—' }]

  // ── Item master match helper ─────────────────────────────────────────────
  const getLibItem = (name: string) =>
    itemMasters.find((im) => im.itemName.toLowerCase() === name.toLowerCase()) ?? null

  // ─────────────────────────────────────────────────────────────────────────
  // Sub-components
  // ─────────────────────────────────────────────────────────────────────────

  /** Reusable PDF drop zone */
  const DropZone = ({
    label,
    badge,
    badgeClass,
    hint,
    fileName,
    borderClass,
    bgClass,
    iconClass,
    inputRef,
    onChange,
  }: {
    label: string
    badge: string
    badgeClass: string
    hint: string
    fileName?: string
    borderClass: string
    bgClass: string
    iconClass: string
    inputRef: React.RefObject<HTMLInputElement | null>
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className={`text-sm font-semibold ${iconClass}`}>{label}</Label>
        {badge && <Badge className={`${badgeClass} text-xs`}>{badge}</Badge>}
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          fileName ? 'border-emerald-400 bg-emerald-50/60' : `${borderClass} ${bgClass} hover:opacity-80`
        }`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          // Support both Enter and Space to match native button behavior.
          // Space can be reported as ' ', 'Spacebar' (older browsers) or 'Space' (modern).
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') {
        e.preventDefault() // prevent page scroll on Space
        inputRef.current?.click()
          }
        }}
      >
        {fileName ? (
          <div className="flex flex-col items-center gap-2">
        <FileCheck className="h-10 w-10 text-emerald-600" />
        <p className="text-sm font-semibold text-emerald-700">{fileName}</p>
        <p className="text-xs text-muted-foreground">Click to replace file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
        <FileText className={`h-10 w-10 ${iconClass}`} />
        <p className={`text-sm font-semibold ${iconClass}`}>Click or drag &amp; drop to upload</p>
        <p className="text-xs text-muted-foreground">PDF only · Max 10 MB</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onChange} />
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Step renderers
  // ─────────────────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Item recap */}
      <div className="rounded-lg bg-slate-50 border px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span><span className="text-muted-foreground">DA No.: </span><strong>{item.daNumber}</strong></span>
        <span><span className="text-muted-foreground">PR: </span><strong>{item.prNumber}</strong></span>
        <span><span className="text-muted-foreground">Qty: </span><strong>{item.quantity} {item.unit}</strong></span>
        <span><span className="text-muted-foreground">Budget: </span><strong>{formatCurrencyPHP(item.totalAmount)}</strong></span>
      </div>

      {/* Proof of Exclusivity */}
      <DropZone
        label="Proof of Exclusivity"
        badge="REQUIRED"
        badgeClass="bg-red-100 text-red-700 border-red-300"
        hint="Upload the official document proving your exclusive right to supply this item — e.g., Manufacturer's Authorization Letter or Certificate of Exclusivity."
        fileName={exclusivityFileName}
        borderClass="border-red-300"
        bgClass="bg-red-50/40"
        iconClass="text-red-500"
        inputRef={exclusivityRef}
        onChange={(e) =>
          handleFileChange(e, (u) => setExclusivityFile(u), (n) => setExclusivityFileName(n))
        }
      />

      <Separator />

      {/* Sole Distributorship Certificate */}
      <DropZone
        label="Sole Distributorship Certificate"
        badge="REQUIRED"
        badgeClass="bg-blue-100 text-blue-700 border-blue-300"
        hint="Upload your valid Sole Distributorship Certificate issued by the manufacturer or authorized principal, certifying your exclusive authority to distribute this product."
        fileName={soleDistFileName}
        borderClass="border-blue-300"
        bgClass="bg-blue-50/40"
        iconClass="text-blue-500"
        inputRef={soleDistRef}
        onChange={(e) =>
          handleFileChange(e, (u) => setSoleDistFile(u), (n) => setSoleDistFileName(n))
        }
      />

      <Separator />

      {/* Proposal Details & Notes */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Proposal Details &amp; Notes
          <span className="ml-1 text-xs font-normal text-muted-foreground">(delivery terms, warranty, lead time, etc.)</span>
        </Label>
        <Textarea
          placeholder="Describe your offer, delivery schedule, warranty terms, and any other relevant information the agency should know..."
          value={proposalNotes}
          onChange={(e) => setProposalNotes(e.target.value)}
          rows={4}
        />
      </div>

      {/* Compliance warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Both the <strong>Proof of Exclusivity</strong> and the{' '}
          <strong>Sole Distributorship Certificate</strong> are mandatory for Direct Contracting under RA 12009.
          Incomplete submissions will be disqualified.
        </p>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* No PR items notice */}
      {!hasPRItems && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            No Consolidated PR items found for <strong>{item.prNumber}</strong>. Quoting against the DA item directly.
          </p>
        </div>
      )}

      {/* Items quotation table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
              <TableRow className="bg-slate-50">
              <TableHead className="whitespace-nowrap">Item Name</TableHead>
              {hasPRItems && <TableHead>Office</TableHead>}
              {hasPRItems && <TableHead>Category</TableHead>}
              <TableHead className="text-right">Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Library Match</TableHead>
              <TableHead>Model / Brand / Color</TableHead>
              <TableHead className="whitespace-nowrap">Unit Bid (₱)</TableHead>
              <TableHead className="whitespace-nowrap">Total Bid (₱)</TableHead>
              <TableHead>Brochure</TableHead>
              <TableHead>Item Specs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map(({ key, name, qty, unit, office, category }) => {
              const r = rows[key] ?? { unitPrice: '', model: '', brand: '', color: '' }
              const total = rowTotal(key)
              const libMatch = getLibItem(name)
              return (
                <TableRow key={key}>
                  <TableCell className="font-medium max-w-[160px]">
                    <span title={name} className="line-clamp-2">{name}</span>
                  </TableCell>
                  {hasPRItems && (
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{office}</TableCell>
                  )}
                  {hasPRItems && (
                    <TableCell>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">{category}</Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-right font-medium">{qty}</TableCell>
                  <TableCell className="text-muted-foreground">{unit}</TableCell>

                  {/* Item Master library match */}
                  <TableCell className="min-w-[140px]">
                    {libMatch ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-violet-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-violet-700 truncate max-w-[110px]" title={libMatch.itemName}>
                            {libMatch.itemName}
                          </span>
                        </div>
                        {libMatch.uacsCode && (
                          <p className="text-xs text-muted-foreground">UACS: {libMatch.uacsCode}</p>
                        )}
                        {libMatch.minimumTechnicalSpecifications && (
                          <p className="text-xs text-muted-foreground line-clamp-1" title={libMatch.minimumTechnicalSpecifications}>
                            {libMatch.minimumTechnicalSpecifications}
                          </p>
                        )}
                        <Badge className="text-[10px] bg-violet-100 text-violet-700 border-violet-200 mt-0.5">
                          {libMatch.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No match</span>
                    )}
                  </TableCell>

                  {/* Specs */}
                  <TableCell className="min-w-[140px]">
                    {r.model && r.brand ? (
                      <div className="text-xs space-y-0.5">
                        <div><span className="text-muted-foreground">Model:</span> {r.model}</div>
                        <div><span className="text-muted-foreground">Brand:</span> {r.brand}</div>
                        {r.color && <div><span className="text-muted-foreground">Color:</span> {r.color}</div>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">Not set</span>
                    )}
                  </TableCell>

                  {/* Unit bid price */}
                  <TableCell>
                    <div>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={r.unitPrice}
                        onChange={(e) =>
                          updateRow(key, { unitPrice: e.target.value === '' ? '' : Number(e.target.value) })
                        }
                        placeholder="0.00"
                        className="w-28"
                        ref={(el) => { unitInputRefs.current[key] = el }}
                      />
                      {step2ValidationAttempted && !(Number(r.unitPrice) > 0) && (
                        <p className="text-xs text-destructive mt-1">Please enter unit bid for this item.</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Total bid */}
                  <TableCell className="whitespace-nowrap font-semibold text-primary">
                    ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>

                  {/* Brochure */}
                    <TableCell className="min-w-[130px]">
                      {r.brochureFileName ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openPreview(r.brochureUrl, r.brochureFileName)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[90px]"
                            title={r.brochureFileName}
                          >
                            <FileText className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[80px]">{r.brochureFileName}</span>
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-destructive"
                            onClick={() => updateRow(key, { brochureUrl: undefined, brochureFileName: undefined })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            ref={(el) => { fileInputRefs.current[key] = el }}
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
                      )}
                    </TableCell>

                  {/* Specs button */}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs whitespace-nowrap"
                      onClick={() => setSpecOpenFor(key)}
                    >
                      <Pencil className="h-3 w-3" /> Specs
                    </Button>
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
    </div>
  )

  const renderStep3 = () => {
    const quotItems = buildQuotationItems()
    return (
      <div className="space-y-6">
        {/* DA Requirements summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-600" /> DA Requirements
          </h3>
          <div className="rounded-lg border divide-y text-sm">
            {/* Proof of Exclusivity */}
            <div className="grid grid-cols-2 px-4 py-3 gap-2">
              <span className="text-muted-foreground font-medium">Proof of Exclusivity</span>
              {exclusivityFileName ? (
                <a
                  href={exclusivityFile ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-700 hover:underline w-fit"
                >
                  <Paperclip className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">{exclusivityFileName}</span>
                </a>
              ) : (
                <span className="text-destructive font-semibold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Not uploaded
                </span>
              )}
            </div>
            {/* Sole Dist Certificate */}
            <div className="grid grid-cols-2 px-4 py-3 gap-2">
              <span className="text-muted-foreground font-medium">Sole Distributorship Certificate</span>
              {soleDistFileName ? (
                <a
                  href={soleDistFile ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-700 hover:underline w-fit"
                >
                  <Paperclip className="h-4 w-4 flex-shrink-0" />
                  <span className="font-semibold">{soleDistFileName}</span>
                </a>
              ) : (
                <span className="text-destructive font-semibold flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" /> Not uploaded
                </span>
              )}
            </div>
            {/* Proposal notes */}
            {proposalNotes && (
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Proposal Notes</span>
                <span className="whitespace-pre-wrap">{proposalNotes}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Quotation summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-indigo-600" /> Quotation
          </h3>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Model / Brand</TableHead>
                    <TableHead>Brochure</TableHead>
                    <TableHead className="whitespace-nowrap">Unit Bid (₱)</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Total Bid (₱)</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {quotItems.map((qi) => (
                  <TableRow key={qi.prItemId}>
                    <TableCell className="font-medium max-w-[180px]">
                      <span title={qi.itemName} className="line-clamp-2">{qi.itemName}</span>
                    </TableCell>
                    <TableCell>{qi.qty}</TableCell>
                    <TableCell className="text-muted-foreground">{qi.unit}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {qi.bidModel && qi.bidBrand ? `${qi.bidModel} / ${qi.bidBrand}` : qi.bidModel || qi.bidBrand || '—'}
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      {qi.bidBrochureFileName ? (
                        <a
                          href={qi.bidBrochureUrl ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {qi.bidBrochureFileName}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₱{qi.bidUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      ₱{qi.bidTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end items-center gap-3 p-3 bg-slate-50 rounded-lg border">
            <span className="text-sm font-semibold text-muted-foreground">Total Quotation</span>
            <span className="text-xl font-bold text-primary">
              ₱{totalQuotation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Validation summary */}
        <div className={`rounded-md p-3 flex gap-2 ${step1Valid && step2Valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          {step1Valid && step2Valid ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700">
                All required documents have been uploaded and at least one bid price has been entered.
                You are ready to <strong>Submit to Agency</strong> or <strong>Save as Draft</strong>.
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                {!step1Valid && 'Missing required document(s) in Step 1. '}
                {!step2Valid && 'No bid prices entered in Step 2. '}
                You can still <strong>Save Draft</strong>, but submission requires all items to be complete.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Footer
  // ─────────────────────────────────────────────────────────────────────────
  const footer = (
    <div className="flex items-center justify-between border-t pt-3">
      <Button
        variant="ghost"
        onClick={() => (step > 1 ? setStep((s) => s - 1) : onOpenChange(false))}
      >
        {step > 1 ? (
          <><ChevronLeft className="h-4 w-4 mr-2" /> Back</>
        ) : (
          <><X className="h-4 w-4 mr-2" /> Cancel</>
        )}
      </Button>

      <div className="flex items-center gap-2">
        {/* Save Draft always available */}
        <Button variant="outline" onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-2" /> Save Draft
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => {
              // If on step 1 or 2 perform validation before advancing
              if (step === 1) {
                if (!step1Valid) return
                setStep(2)
                return
              }
              if (step === 2) {
                if (!step2Valid) {
                  setStep2ValidationAttempted(true)
                  // focus first invalid input
                  const firstInvalidKey = Object.keys(rows).find((k) => !(Number(rows[k].unitPrice) > 0))
                  const el = firstInvalidKey ? unitInputRefs.current[firstInvalidKey] : null
                  if (el) {
                    el.focus()
                    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch {}
                  }
                  return
                }
                setStep(3)
                return
              }
            }}
            className="bg-gradient-to-r from-primary to-indigo-500 text-white hover:opacity-90"
            title={
              step === 1 && !step1Valid
                ? 'Please attach both required documents to proceed'
                : step === 2 && !step2Valid
                ? 'Please enter unit bid for every item to proceed'
                : undefined
            }
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            disabled={!step1Valid || !step2Valid}
            onClick={() => setSubmitConfirmOpen(true)}
            className="bg-gradient-to-r from-primary to-indigo-500 text-white hover:opacity-90"
          >
            <Send className="h-4 w-4 mr-2" /> Submit to Agency
          </Button>
        )}
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  // Helper to determine if there are unsaved changes
  const isDirty = (() => {
    // Step 1 diffs
    const step1Dirty =
      (exclusivityFileName ?? '') !== (item.exclusivityProofFileName ?? '') ||
      (exclusivityFile ?? '') !== (item.exclusivityProofUrl ?? '') ||
      (soleDistFileName ?? '') !== (item.soleDistCertFileName ?? '') ||
      (soleDistFile ?? '') !== (item.soleDistCertUrl ?? '') ||
      (proposalNotes ?? '') !== (item.proposalNotes ?? '')

    // Step 2 diffs
    const rowsDirty = (() => {
      if (hasPRItems) {
        const existing = item.quotationItems ?? []
        return prItems.some((pi) => {
          const r = rows[pi.id] ?? { unitPrice: '', model: '', brand: '', color: '', brochureFileName: undefined }
          const ex = existing.find((e) => e.prItemId === pi.id)
          const unitDiff = (Number(r.unitPrice) || 0) !== (ex?.bidUnitPrice ?? 0)
          const modelDiff = (r.model ?? '') !== (ex?.bidModel ?? '')
          const brandDiff = (r.brand ?? '') !== (ex?.bidBrand ?? '')
          const colorDiff = (r.color ?? '') !== (ex?.bidColor ?? '')
          const brochureDiff = (r.brochureFileName ?? '') !== (ex?.bidBrochureFileName ?? '')
          return unitDiff || modelDiff || brandDiff || colorDiff || brochureDiff
        })
      }
      const r = rows['single'] ?? { unitPrice: '', model: '', brand: '', color: '', brochureFileName: undefined }
      const unitDiff = (Number(r.unitPrice) || 0) !== (item.bidUnitPrice ?? 0)
      const modelDiff = (r.model ?? '') !== (item.bidModel ?? '')
      const brandDiff = (r.brand ?? '') !== (item.bidBrand ?? '')
      const colorDiff = (r.color ?? '') !== (item.bidColor ?? '')
      const brochureDiff = (r.brochureFileName ?? '') !== (item.bidBrochureFileName ?? '')
      return unitDiff || modelDiff || brandDiff || colorDiff || brochureDiff
    })()

    return step1Dirty || rowsDirty
  })()

  const handleAttemptClose = (shouldOpen: boolean) => {
    if (!shouldOpen) {
      if (isDirty) {
        const ok = window.confirm(
          'You have unsaved changes in this DA wizard. Discard changes and close?'
        )
        if (!ok) return
      }
      onOpenChange(false)
    } else {
      onOpenChange(true)
    }
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={handleAttemptClose}
        title={`DA Submission — ${item.daNumber}`}
        description={`${item.itemName} · Direct Contracting / Sole Distributorship`}
        size="5xl"
        showCloseButton
        footer={footer}
      >
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between relative">
            {/* Connector line */}
            <div className="absolute inset-x-0 top-4 h-0.5 bg-border z-0 mx-8" />
            {STEPS.map((s) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isDone = step > s.id
              return (
                <div key={s.id} className="z-10 flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isActive
                          ? 'bg-primary border-primary text-white'
                          : 'bg-background border-border text-muted-foreground'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : isDone ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ResponsiveDialog>

      {/* Item Bid Spec sub-dialog (step 2) */}
      {specOpenFor !== null && (
        <ItemBidSpecModal
          open={specOpenFor !== null}
          onOpenChange={(v) => { if (!v) setSpecOpenFor(null) }}
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

      {/* Document preview dialog */}
      <ResponsiveDialog
        open={previewOpen}
        onOpenChange={(v) => { if (!v) { setPreviewOpen(false); setPreviewUrl(undefined); setPreviewTitle(undefined) } else setPreviewOpen(true) }}
        title={previewTitle ?? 'Preview Document'}
        description={undefined}
        size="3xl"
        showCloseButton
        footer={null}
      >
        <div className="h-[70vh]">
          {previewUrl ? (
            <iframe src={previewUrl} className="w-full h-full border rounded-md" title={previewTitle} />
          ) : (
            <p className="text-sm text-muted-foreground">No preview available</p>
          )}
        </div>
      </ResponsiveDialog>

      {/* Submit confirm dialog */}
      <AlertDialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to submit your DA requirements <em>and</em> quotation for{' '}
              <strong>{item.daNumber}</strong> to the agency. The item will be marked{' '}
              <strong>For Review</strong>. You may update and resubmit if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} className="bg-primary text-white">
              <Send className="h-4 w-4 mr-2" />
              Confirm &amp; Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

