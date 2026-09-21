import { useState, useMemo, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useDirectContractingStore, type DirectContracting } from '../store/directContractingStore'
import { DirectContractingForm } from './DirectContractingForm'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import { ShoppingCart } from 'lucide-react'
import { useCreateDirectContracting } from '../handlers'
import api from '@/services/api'
import type { BacProject } from '@/features/procurement/bac-resolution/types'

function genDCNumber(entries: DirectContracting[]): string {
  const year = new Date().getFullYear()
  let maxSeq = 0
  for (const ent of entries) {
    const dc = (ent?.dcNumber ?? '').toString()
    const m = dc.match(new RegExp(`^DC-${year}-(\\d+)$`))
    if (m) {
      const seq = parseInt(m[1], 10)
      if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq
    }
  }
  return `DC-${year}-${String(maxSeq + 1).padStart(4, '0')}`
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateDirectContractingModal({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const { entries, fetchEntries } = useDirectContractingStore()
  const { data: resolutionsResponse } = useBacResolutions({
    pathParams: {},
    queryParams: { pageSize: 100 },
    enabled: open,
  })
  const [suppliersList, setSuppliersList] = useState<{ id: string; name: string }[]>([])

  const rawResolutions = useMemo<BacProject[]>(() => {
    if (!resolutionsResponse) return []
    if (Array.isArray(resolutionsResponse)) return resolutionsResponse
    if (typeof resolutionsResponse === 'object' && resolutionsResponse !== null) {
      const record = resolutionsResponse as Record<string, unknown>
      if (Array.isArray(record.data)) return record.data
      if (Array.isArray(record.items)) return record.items
    }
    return []
  }, [resolutionsResponse])

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get<{ succeeded: boolean; data: { id: string; name?: string }[] }>('/suppliers?Status=Approved&IsBlacklisted=false')
        if (response.data?.succeeded && Array.isArray(response.data.data)) {
          setSuppliersList(response.data.data.map((s: { id: string; name?: string }) => ({
            id: s.id,
            name: s.name ?? 'Unnamed Supplier'
          })))
        }
      } catch (err) {
        console.error('Failed to fetch suppliers', err)
      }
    }
    if (open) {
      fetchSuppliers()
    }
  }, [open])

  const autoDCNumber = useMemo(() => genDCNumber(entries), [entries])

  const [dcNumber, setDcNumber] = useState('')
  const [dcName, setDcName] = useState('')
  const [resolutionId, setResolutionId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [deadline, setDeadline] = useState('')

  const reset = () => {
    setDcNumber('')
    setDcName('')
    setResolutionId('')
    setSupplierId('')
    setDeadline('')
  }

  // Reset form fields only when the modal is closed to avoid wiping out values upon open.
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open])

  // Filter approved resolutions linked to Direct Contracting
  const resolutionOptions = useMemo(() =>
    rawResolutions
      .filter((res: any) => (res?.status || '').toLowerCase() === 'approved') // Only approved can proceed to request
      .map((res: any) => {
        const resolutionNumber =
          res.bacResolutionNumber ||
          res.resolutionNumber ||
          res.title ||
          (res.id ? `RES-${res.id.slice(0, 8)}` : 'N/A')

        const description = res.description || res.title || ''
        const shortDesc = description
          ? description.length > 40
            ? `${description.substring(0, 40)}...`
            : description
          : ''

        let prNumbers: string[] = []
        if (Array.isArray(res.linkedConsolidatedPrs) && res.linkedConsolidatedPrs.length > 0) {
          prNumbers = res.linkedConsolidatedPrs
            .map((pr: any) => pr?.prNumber || pr?.cprNumber)
            .filter(Boolean)
        } else if (res.consolidatedPR?.cprNumber || res.consolidatedPR?.prNumber) {
          const pr = res.consolidatedPR.cprNumber || res.consolidatedPR.prNumber
          if (pr) prNumbers = [pr]
        } else if (res.appItem?.itemNumber) {
          prNumbers = [res.appItem.itemNumber]
        }
        prNumbers = Array.from(new Set(prNumbers))

        const endUser =
          res.linkedConsolidatedPrs?.[0]?.endUser ||
          res.consolidatedPR?.endUser ||
          res.consolidatedPR?.officeName ||
          res.appItem?.officeName ||
          'N/A'

        const amount =
          res.linkedConsolidatedPrs?.[0]?.amount ??
          res.consolidatedPR?.totalAmount ??
          res.abc ??
          res.sumABC ??
          res.appItem?.effectiveABC ??
          0

        return {
          id: res.id,
          number: resolutionNumber,
          label: shortDesc ? `${resolutionNumber} - ${shortDesc}` : resolutionNumber,
          prNumbers,
          endUser,
          amount,
        }
      }),
    [rawResolutions]
  )

  const createMutation = useCreateDirectContracting()

  const handleCreate = async () => {
    const finalDcNumber = dcNumber.trim() || autoDCNumber
    if (!dcName.trim()) return toast({ title: 'Required', description: 'Direct Contracting Name is required.' })
    if (!resolutionId) return toast({ title: 'Required', description: 'BAC Resolution selection is required.' })
    if (!supplierId) return toast({ title: 'Required', description: 'Exactly one exclusive supplier must be selected.' })
    if (!deadline) return toast({ title: 'Required', description: 'A deadline is required.' })

    const sup = suppliersList.find(s => s.id === supplierId)

    try {
      const payload = {
        dcNumber: finalDcNumber,
        name: dcName.trim(),
        bacProjectId: resolutionId,
        exclusiveSupplierId: supplierId,
        submissionDeadline: new Date(deadline).toISOString()
      }

      await createMutation.mutateAsync({
        pathParams: {},
        payload
      })

      toast({
        title: '✅ Direct Contracting Request Initialized',
        description: `Request ${finalDcNumber} created for ${sup?.name}. Ready to send.`
      })

      await fetchEntries()

      reset()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to initialize Direct Contracting Request.'
      })
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}
      title="Create Direct Contracting Request"
      description="Select an approved BAC Resolution and assign the single exclusive supplier for this proprietary procurement."
      size="lg"
      className="w-full max-h-[80vh]"
      footer={null}
      showCloseButton
    >
      <div className="max-h-[70vh] overflow-y-auto pr-4">
        <DirectContractingForm
          dcNumber={dcNumber}
          setDcNumber={setDcNumber}
          dcName={dcName}
          setDcName={setDcName}
          resolutionId={resolutionId}
          setResolutionId={setResolutionId}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          deadline={deadline}
          setDeadline={setDeadline}
          isEdit={false}
          autoDCNumber={autoDCNumber}
          resolutionOptions={resolutionOptions}
          suppliersList={suppliersList}
        />
        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Initialize Request
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
