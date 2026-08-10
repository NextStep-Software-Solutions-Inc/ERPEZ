import { useState, useMemo } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useDirectAcquisitionStore } from '../store/directAcquisitionStore'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import { CheckCircle, AlertTriangle, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

const THRESHOLD = 200000


function genDANumber(entries: any[]): string {
  const year = new Date().getFullYear()
  // Determine next sequence by finding the max existing DA sequence for the current year
  let maxSeq = 0
  for (const ent of entries) {
    const da = (ent?.daNumber ?? '').toString()
    const m = da.match(new RegExp(`^DA-${year}-(\\d+)$`))
    if (m) {
      const seq = parseInt(m[1], 10)
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  }
  const next = (maxSeq + 1).toString().padStart(4, '0')
  return `DA-${year}-${next}`
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDirectAcquisitionModal({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const { addEntry, entries } = useDirectAcquisitionStore()
  const consolidatedPRs = useConsolidatedPRStore((state) => state.consolidatedPRs)
  const { data: resolutionsData } = useBacResolutions({ enabled: open })
  const bacResolutions = useMemo(() => resolutionsData ?? [], [resolutionsData])

  // Build the dropdown list from BAC Resolutions
  const bacResolutionOptions = useMemo(() => {
    return bacResolutions.map((resolution) => {
      const linkedPrLink = resolution.linkedConsolidatedPrs?.[0]
      const prNumber = linkedPrLink?.prNumber ?? ''
      
      const prFromStore = consolidatedPRs.find(
        (p) => p.id === linkedPrLink?.id || p.prNumber === prNumber
      )
      
      const category = prFromStore?.selectedPRItems?.[0]?.category ?? ''
      const office = prFromStore?.selectedPRItems?.[0]?.prOffice ?? linkedPrLink?.endUser ?? ''
      const totalAmount = prFromStore
        ? prFromStore.selectedPRItems.reduce((sum, item) => sum + item.totalAmount, 0)
        : resolution.totalAmount

      const label = resolution.bacResolutionNumber
        ? `${resolution.bacResolutionNumber}${prNumber ? ` (PR: ${prNumber})` : ''}${resolution.description ? ' - ' + resolution.description : ''}`
        : resolution.id

      return {
        id: resolution.id,
        bacResolutionNumber: resolution.bacResolutionNumber,
        consolidatedPrId: linkedPrLink?.id ?? '',
        prNumber: prNumber,
        label,
        category,
        office,
        totalABC: totalAmount,
      }
    })
  }, [bacResolutions, consolidatedPRs])

  // Auto-generate DA Number on open; user can override
  const autoDANumber = useMemo(() => genDANumber(entries), [entries])
  const [daNumber, setDaNumber] = useState('')
  const [selectedResolutionId, setSelectedResolutionId] = useState('')
  const [consolidatedPrId, setConsolidatedPrId] = useState('')
  const [category, setCategory] = useState('')
  const [totalABC, setTotalABC] = useState<number | ''>('')

  const exceedsThreshold = Number(totalABC) > THRESHOLD

  const reset = () => {
    setDaNumber('')
    setSelectedResolutionId('')
    setConsolidatedPrId('')
    setCategory('')
    setTotalABC('')
  }

  const handleCreate = () => {
    const finalDaNumber = daNumber.trim() || autoDANumber
    if (!selectedResolutionId.trim()) return toast({ title: 'Required', description: 'BAC Resolution selection is required.' })
    if (!totalABC || Number(totalABC) <= 0) return toast({ title: 'Required', description: 'Total ABC is required.' })
    if (exceedsThreshold) {
      toast({
        title: 'ABC Exceeds Limit',
        description: 'Direct Acquisition is only allowed for ABC ≤ ₱200,000. Please amend PR/APP.',
      })
      return
    }

    const selected = bacResolutionOptions.find(p => p.id === selectedResolutionId)

    addEntry({
      id: crypto.randomUUID(),
      daNumber: finalDaNumber,
      consolidatedPrId: selected?.consolidatedPrId ?? '',
      prNumber: selected?.prNumber ?? '',
      bacResolutionId: selected?.id ?? '',
      bacResolutionNumber: selected?.bacResolutionNumber ?? '',
      office: selected?.office ?? '',
      category: category || '',
      modeOfProcurement: 'Direct Acquisition',
      totalABC: Number(totalABC),
      status: 'draft',
      createdBy: 'System',
      createdAt: new Date().toISOString(),
    })

    toast({ title: '✅ Direct Acquisition Created', description: `DA Number ${finalDaNumber} has been created and linked to BAC Resolution ${selected?.bacResolutionNumber || selectedResolutionId.trim()}.` })
    reset()
    onOpenChange(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}
      title="Create Direct Acquisition"
      description="Direct Acquisition applies to purchases with Total ABC ≤ ₱200,000. Complete the form to create a DA record."
      size="lg"
      className="w-full max-h-[80vh]"
      footer={null}
      showCloseButton
    >
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <div className="space-y-4 py-2">

          {/* DA Number (auto-generated, editable) */}
          <div>
            <label className="text-sm font-semibold">DA Number <span className="text-destructive">*</span></label>
            <div className="flex gap-2 mt-1.5">
              <Input
                placeholder={autoDANumber}
                value={daNumber}
                onChange={(e: any) => setDaNumber(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Leave blank to use the auto-generated DA Number.</p>
          </div>

          {/* BAC Resolution Selection */}
          <div>
            <label className="text-sm font-semibold">BAC Resolution <span className="text-destructive">*</span></label>
            <Select
              value={selectedResolutionId}
              onValueChange={(v) => {
                setSelectedResolutionId(v)
                const found = bacResolutionOptions.find((p) => p.id === v)
                if (found) {
                  setConsolidatedPrId(found.consolidatedPrId)
                  setCategory(found.category)
                  setTotalABC(found.totalABC)
                }
              }}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select BAC Resolution..." />
              </SelectTrigger>
              <SelectContent>
                {bacResolutionOptions.length > 0 ? (
                  bacResolutionOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    No BAC Resolutions available.
                  </div>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Select the BAC Resolution to link to this Direct Acquisition. Eligibility is determined by the Total ABC (must be ≤ ₱200,000).
            </p>
          </div>

          {/* Total ABC */}
          <div>
            <label className="text-sm font-semibold">
              Total ABC <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground">max ₱200,000</span>
            </label>
            <div className="mt-1.5">
              <div className={cn('rounded-md border px-3 py-2 bg-muted/10 text-sm', exceedsThreshold ? 'border-destructive' : '')}>
                {consolidatedPrId && totalABC !== ''
                  ? <span className="font-semibold">₱{Number(totalABC).toLocaleString()}</span>
                  : <span className="text-muted-foreground">Derived from selected Consolidated PR</span>
                }
              </div>
            </div>
            {exceedsThreshold && (
              <p className="text-xs text-destructive mt-1 flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                Direct Acquisition is only allowed for ABC ≤ ₱200,000. Please amend PR/APP.
              </p>
            )}
            {totalABC !== '' && !exceedsThreshold && Number(totalABC) > 0 && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Within threshold. Eligible for Direct Acquisition.
              </p>
            )}
          </div>

          {/* Created By */}
          {/* <div>
            <label className="text-sm font-semibold">Created By <span className="text-xs font-normal text-muted-foreground">(optional)</span></label>
            <Input
              placeholder="e.g. Juan dela Cruz"
              value={createdBy}
              onChange={(e: any) => setCreatedBy(e.target.value)}
              className="mt-1.5"
            />
          </div> */}

          {/* Deadline Date - removed; deadline is no longer collected */}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={exceedsThreshold} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            {exceedsThreshold ? 'Blocked — ABC Exceeds ₱200,000' : 'Create Direct Acquisition'}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
