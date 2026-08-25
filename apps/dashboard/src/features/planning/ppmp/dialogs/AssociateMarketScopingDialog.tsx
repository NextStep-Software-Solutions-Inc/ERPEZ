import { useState, useMemo } from 'react'
import { Search, Link2, FileText, CheckCircle2, AlertCircle, Plus } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { createQueryHookFromTemplate, createMutationHookFromTemplate } from 'erpez-shared-lib'
import { getMarketScopingsRequest } from '@/features/planning/market-scoping/handlers/getMarketScopingsRequest'
import { linkMarketScopingRequest } from '@/features/planning/market-scoping/handlers/linkMarketScopingRequest'
import { formatCurrency } from '../lib/ppmpUtils'

const useMarketScopings = createQueryHookFromTemplate(getMarketScopingsRequest)
const useLinkMarketScoping = createMutationHookFromTemplate(linkMarketScopingRequest)

interface AssociateMarketScopingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: 'project' | 'activity'
  targetLineItemBudgetId?: string
  targetLineItemBudgetActivityId?: string
  targetName?: string
  officeId?: string
  onSuccess?: () => void
}

export default function AssociateMarketScopingDialog({
  open,
  onOpenChange,
  targetType,
  targetLineItemBudgetId,
  targetLineItemBudgetActivityId,
  targetName,
  officeId,
  onSuccess,
}: AssociateMarketScopingDialogProps) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedMsfId, setSelectedMsfId] = useState<string | null>(null)

  const { data: msfResponse, isLoading } = useMarketScopings(
    { pageSize: 100 },
    { enabled: open }
  )

  const { mutate: linkMsf, isPending: isLinking } = useLinkMarketScoping()

  // Filter MSFs that are either:
  // 1. Completely unlinked (no target set yet), OR
  // 2. Already linked to the SAME activity/project LIB as this PPMP
  //    (MSFs created via wizard already have the target set, but haven't been
  //     claimed by a PPMP yet — they must still appear here for association)
  const unlinkedMsfs = useMemo(() => {
    const list = msfResponse?.data?.items ?? []
    return list.filter((msf) => {
      // Accept if completely unlinked
      const isUnlinked = !msf.targetLineItemBudgetId && !msf.targetLineItemBudgetActivityId

      // Accept if already linked to the SAME target (wizard-created MSF for this activity/LIB)
      const isLinkedToSameActivity =
        targetType === 'activity' &&
        targetLineItemBudgetActivityId &&
        msf.targetLineItemBudgetActivityId === targetLineItemBudgetActivityId

      const isLinkedToSameLib =
        targetType === 'project' &&
        targetLineItemBudgetId &&
        msf.targetLineItemBudgetId === targetLineItemBudgetId

      if (!isUnlinked && !isLinkedToSameActivity && !isLinkedToSameLib) return false

      if (!search.trim()) return true
      const term = search.toLowerCase()
      return (
        msf.projectName?.toLowerCase().includes(term) ||
        msf.status?.toLowerCase().includes(term)
      )
    })
  }, [msfResponse, search, targetType, targetLineItemBudgetActivityId, targetLineItemBudgetId])

  const handleAssociate = () => {
    if (!selectedMsfId) {
      toast.error('Please select a Market Scoping Form to associate.')
      return
    }

    linkMsf(
      {
        params: { id: selectedMsfId },
        payload: {
          targetLineItemBudgetId: targetType === 'project' ? targetLineItemBudgetId : undefined,
          targetLineItemBudgetActivityId: targetType === 'activity' ? targetLineItemBudgetActivityId : undefined,
          officeId: officeId ?? '',
        },
      },
      {
        onSuccess: () => {
          toast.success('Market Scoping Form associated successfully.')
          queryClient.invalidateQueries({ queryKey: ['/ppmps'] })
          queryClient.invalidateQueries({ queryKey: ['/market-scopings'] })
          onOpenChange(false)
          setSelectedMsfId(null)
          setSearch('')
          onSuccess?.()
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Failed to associate Market Scoping Form.')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-default-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-default-900">
                Associate Market Scoping Form
              </DialogTitle>
              <DialogDescription className="text-xs text-default-500 mt-0.5">
                Link an existing Market Scoping Form to{' '}
                <span className="font-semibold text-default-700">
                  {targetName || (targetType === 'project' ? 'this Line-Item Budget' : 'this Activity')}
                </span>
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search bar */}
        <div className="p-4 border-b border-default-100 bg-default-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name or status..."
              className="pl-9 bg-white border-default-200 text-sm h-9"
            />
          </div>
        </div>

        {/* MSF List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-60 max-h-96">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 text-default-400 gap-2">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading available Market Scoping Forms...</span>
            </div>
          ) : unlinkedMsfs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-default-50/50 rounded-xl border border-dashed border-default-200">
              <FileText className="h-8 w-8 text-default-300 mb-2" />
              <p className="text-sm font-semibold text-default-700">No Unlinked Market Scoping Forms Found</p>
              <p className="text-xs text-default-400 mt-1 max-w-xs">
                All existing Market Scoping Forms are already linked or no forms match your search.
              </p>
            </div>
          ) : (
            unlinkedMsfs.map((msf) => {
              const isSelected = selectedMsfId === msf.id
              return (
                <div
                  key={msf.id}
                  onClick={() => setSelectedMsfId(msf.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-default-200 bg-white hover:border-default-300 hover:bg-default-50/50'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-default-900 truncate">
                        {msf.projectName}
                      </span>
                      <Badge
                        variant="soft"
                        className={
                          msf.status === 'Approved'
                            ? 'bg-success/15 text-success'
                            : msf.status === 'Draft'
                            ? 'bg-default-200 text-default-700'
                            : 'bg-warning/15 text-warning'
                        }
                      >
                        {msf.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-default-500">
                      <span>
                        Budget:{' '}
                        <strong className="text-default-700 font-semibold">
                          {formatCurrency(msf.estimatedBudget ?? 0)}
                        </strong>
                      </span>
                      {msf.deliveryDate && (
                        <span>
                          Delivery: {new Date(msf.deliveryDate).toLocaleDateString('en-PH')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-default-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <DialogFooter className="p-4 border-t border-default-100 bg-default-50/50 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              setSelectedMsfId(null)
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedMsfId || isLinking}
            onClick={handleAssociate}
            className="gap-1.5"
          >
            {isLinking ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Associating...
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Associate Market Scoping
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
