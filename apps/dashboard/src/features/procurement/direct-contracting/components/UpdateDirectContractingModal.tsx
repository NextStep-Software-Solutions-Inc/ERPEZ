import { useState, useMemo, useEffect } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useDirectContractingStore, type BackendDirectContractingItem } from '../store/directContractingStore'
import { useBacResolutions } from '@/features/procurement/bac-resolution/handlers/hooks'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ShoppingCart, UserCheck } from 'lucide-react'
import api from '@/services/api'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { useDirectContracting, useUpdateDirectContracting } from '../handlers'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editEntryId: string
}

export function UpdateDirectContractingModal({ open, onOpenChange, editEntryId }: Props) {
  const { toast } = useToast()
  const { fetchEntries } = useDirectContractingStore()
  const { data: resolutions = [] } = useBacResolutions({})
  const [suppliersList, setSuppliersList] = useState<{ id: string; name: string }[]>([])
  const [editEntry, setEditEntry] = useState<BackendDirectContractingItem | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

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

  // Load entry details using query hook
  const { data: entryData } = useDirectContracting(
    {
      pathParams: { id: editEntryId },
      enabled: open && !!editEntryId
    }
  )

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const suppliersResponse = await api.get<{ succeeded: boolean; data: { id: string; name?: string }[] }>('/suppliers?Status=Approved&IsBlacklisted=false')
        if (suppliersResponse.data?.succeeded && Array.isArray(suppliersResponse.data.data)) {
          setSuppliersList(suppliersResponse.data.data.map(s => ({
            id: s.id,
            name: s.name ?? 'Unnamed Supplier'
          })))
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (open) {
      fetchSuppliers()
    }
  }, [open])

  useEffect(() => {
    if (entryData) {
      setEditEntry(entryData)
      setDcNumber(entryData.dcNumber || '')
      setDcName(entryData.name || '')
      setResolutionId(entryData.bacProjectId || '')
      setSupplierId(entryData.exclusiveSupplierId || '')
      if (entryData.submissionDeadline) {
        setDeadline(entryData.submissionDeadline.split('T')[0])
      } else {
        setDeadline('')
      }
    }
  }, [entryData])

  useEffect(() => {
    if (!open) {
      reset()
      setEditEntry(null)
    }
  }, [open])

  // Include current resolution option
  const resolutionOptions = useMemo(() => {
    const list = resolutions
      .filter(res => res.status === 'approved' || (editEntry && res.id === editEntry.bacProjectId))
      .map(res => ({
        id: res.id,
        number: res.bacResolutionNumber,
        label: `${res.bacResolutionNumber} - ${res.description.substring(0, 40)}...`,
        prNumbers: res.linkedConsolidatedPrs.map(pr => pr.prNumber),
        endUser: res.linkedConsolidatedPrs[0]?.endUser ?? 'N/A',
        amount: res.linkedConsolidatedPrs[0]?.amount ?? 0,
      }))
    
    if (editEntry && !list.some(r => r.id === editEntry.bacProjectId)) {
      list.push({
        id: editEntry.bacProjectId || '',
        number: editEntry.resolutionNumber || editEntry.bacProjectTitle || 'N/A',
        label: `${editEntry.resolutionNumber || editEntry.bacProjectTitle || 'N/A'} - Linked Resolution`,
        prNumbers: editEntry.resolutionNumber ? [editEntry.resolutionNumber] : [],
        endUser: editEntry.exclusiveSupplierName || 'N/A',
        amount: editEntry.totalABC || 0,
      })
    }
    return list
  }, [resolutions, editEntry])

  const updateMutation = useUpdateDirectContracting()

  const handleSaveClick = () => {
    if (!dcName.trim()) return toast({ title: 'Required', description: 'Direct Contracting Name is required.' })
    if (!resolutionId) return toast({ title: 'Required', description: 'BAC Resolution selection is required.' })
    if (!supplierId) return toast({ title: 'Required', description: 'Exactly one exclusive supplier must be selected.' })
    if (!deadline) return toast({ title: 'Required', description: 'A deadline is required.' })
    setConfirmOpen(true)
  }

  const handleUpdate = async () => {
    setConfirmOpen(false)
    try {
      const payload = {
        name: dcName.trim(),
        exclusiveSupplierId: supplierId,
        submissionDeadline: new Date(deadline).toISOString()
      }
      await updateMutation.mutateAsync({
        pathParams: { id: editEntryId },
        payload
      })
      toast({ 
        title: '✅ Direct Contracting Request Updated', 
        description: `Request ${dcNumber} has been updated.` 
      })
      
      await fetchEntries()
      
      reset()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to update Direct Contracting Request.'
      })
    }
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}
        title="Edit Direct Contracting Request"
        description="Modify the name, supplier, or deadline for this draft Direct Contracting request."
        size="lg"
        className="w-full max-h-[80vh]"
        footer={null}
        showCloseButton
      >
        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-5 py-2">
            <div>
              <label className="text-sm font-semibold">Direct Contracting Name <span className="text-destructive">*</span></label>
              <Input
                placeholder="e.g. Specialized Software Upgrade 2026"
                value={dcName}
                onChange={(e) => setDcName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Direct Contracting number <span className="text-destructive">*</span></label>
                <Input
                  disabled
                  placeholder={dcNumber}
                  value={dcNumber}
                  className="mt-1.5 bg-muted"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Submission Deadline <span className="text-destructive">*</span></label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">BAC Resolution <span className="text-destructive">*</span></label>
              <Select value={resolutionId} onValueChange={setResolutionId} disabled>
                <SelectTrigger className="mt-1.5 bg-muted">
                  <SelectValue placeholder="Select approved resolution..." />
                </SelectTrigger>
                <SelectContent>
                  {resolutionOptions.length > 0 ? (
                    resolutionOptions.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-medium">{r.number}</span>
                          <div className="flex flex-wrap gap-1">
                            {r.prNumbers.map(pr => (
                              <Badge key={pr} variant="soft" color="secondary" className="text-[10px] py-0 px-1">{pr}</Badge>
                            ))}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No approved resolutions available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <label className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <UserCheck className="h-4 w-4" /> Single Supplier Assignment
              </label>
              <p className="text-xs text-amber-800 mt-1 mb-3">
                Direct Contracting requires exactly one registered supplier of proprietary/exclusive items.
              </p>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select the exclusive supplier..." />
                </SelectTrigger>
                <SelectContent>
                  {suppliersList.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {resolutionId && (
              <div className="text-xs space-y-1 p-3 bg-muted rounded">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Linked PR:</span>
                      <span className="font-medium">{resolutionOptions.find(r => r.id === resolutionId)?.prNumbers.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Office:</span>
                      <span className="font-medium">{resolutionOptions.find(r => r.id === resolutionId)?.endUser}</span>
                  </div>
                  <div className="flex justify-between border-t mt-1 pt-1">
                      <span className="text-muted-foreground font-semibold">Total ABC:</span>
                      <span className="font-bold text-primary">₱{resolutionOptions.find(r => r.id === resolutionId)?.amount.toLocaleString()}</span>
                  </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveClick} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Changes"
        description="Are you sure you want to save these changes to the Direct Contracting request?"
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleUpdate}
      />
    </>
  )
}
