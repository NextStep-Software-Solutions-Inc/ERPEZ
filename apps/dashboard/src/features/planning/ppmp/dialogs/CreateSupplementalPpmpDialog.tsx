import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FilePlus2, Copy } from 'lucide-react'
import { createSupplementalPpmpRequest } from '../handlers/createSupplementalPpmpRequest'
import type { PPMP, PPMPDetails } from '../types'

interface CreateSupplementalPpmpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourcePpmp: PPMP | PPMPDetails | null
  onSuccess?: (newPpmpId: string) => void
}

const useCreateSupplemental = createMutationHookFromTemplate(
  createSupplementalPpmpRequest,
)

export function CreateSupplementalPpmpDialog({
  open,
  onOpenChange,
  sourcePpmp,
  onSuccess,
}: CreateSupplementalPpmpDialogProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutateAsync: createSupplemental, isPending } = useCreateSupplemental()

  const [ppmpNumber, setPpmpNumber] = useState('')
  const [description, setDescription] = useState('')
  const [copyItems, setCopyItems] = useState(false)

  if (!sourcePpmp) return null

  const handleClose = () => {
    if (isPending) return
    setPpmpNumber('')
    setDescription('')
    setCopyItems(false)
    onOpenChange(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourcePpmp.id) return

    try {
      const cleanNumber = ppmpNumber
        .trim()
        .replace(/^SUPPLEMENTAL[-\s_]*/i, '')

      const response = await createSupplemental({
        pathParams: { id: sourcePpmp.id },
        payload: {
          ppmpNumber: cleanNumber || undefined,
          description: description.trim() || undefined,
          copyItems,
        },
      })

      const newPpmpId = response.data
      toast.success('Supplemental PPMP created successfully.')

      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/ppmp')
        },
      })

      handleClose()

      if (onSuccess && newPpmpId) {
        onSuccess(newPpmpId)
      } else if (newPpmpId) {
        navigate({
          to: '/v2/ppmp/$ppmpId',
          params: { ppmpId: newPpmpId },
        })
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create Supplemental PPMP.'
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <FilePlus2 className="h-5 w-5 text-indigo-600" />
              Create Supplemental PPMP
            </DialogTitle>
            <DialogDescription>
              Spawn a new Supplemental PPMP based on approved Original PPMP{' '}
              <strong className="text-foreground">{sourcePpmp.ppmpNumber}</strong>.
            </DialogDescription>
          </DialogHeader>

          {/* Source PPMP Info Card */}
          <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3.5 space-y-1.5 text-xs text-indigo-950">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source PPMP:</span>
              <span className="font-semibold">{sourcePpmp.ppmpNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fiscal Year:</span>
              <span className="font-semibold">
                {sourcePpmp.fiscalYearName || sourcePpmp.fiscalYear?.year || '-'}
              </span>
            </div>
            {sourcePpmp.officeName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Office:</span>
                <span className="font-semibold">{sourcePpmp.officeName}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Custom PPMP Number */}
            <div className="space-y-1.5">
              <Label htmlFor="supplemental-number" className="text-xs font-semibold">
                Supplemental PPMP Number{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="supplemental-number"
                placeholder={
                  sourcePpmp.ppmpNumber
                    ? `Leave blank for auto-numbering (e.g. ${sourcePpmp.ppmpNumber}-SUP-001)`
                    : 'e.g. PPMP-2026-001-SUP-001'
                }
                value={ppmpNumber}
                onChange={(e) => setPpmpNumber(e.target.value)}
                disabled={isPending}
              />
              <p className="text-[11px] text-muted-foreground">
                Enter number sequence only. Do not type &quot;SUPPLEMENTAL&quot;, as the document template automatically adds this to the title.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="supplemental-desc" className="text-xs font-semibold">
                Description{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="supplemental-desc"
                placeholder={`Supplemental procurement plan for ${sourcePpmp.ppmpNumber}...`}
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
              />
            </div>

            {/* Copy Items Checkbox */}
            <div className="flex items-start space-x-3 rounded-lg border p-3.5 bg-slate-50/60 transition-colors hover:bg-slate-50">
              <Checkbox
                id="copy-items"
                checked={copyItems}
                onCheckedChange={(checked) => setCopyItems(Boolean(checked))}
                disabled={isPending}
                className="mt-0.5"
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor="copy-items"
                  className="text-xs font-bold cursor-pointer flex items-center gap-1.5 text-slate-800"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  Copy all items & monthly allocations
                </label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  If checked, all items, quantities, prices, and monthly allocations from the source PPMP will be cloned into the supplemental plan. If unchecked, only activities and expenditure categories are cloned.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              {isPending ? 'Creating...' : 'Create Supplemental PPMP'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
