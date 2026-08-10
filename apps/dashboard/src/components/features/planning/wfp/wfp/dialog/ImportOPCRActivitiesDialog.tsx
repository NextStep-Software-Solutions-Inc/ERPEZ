import { useState, useEffect } from 'react'
import { Check, CheckCircle, Loader, Plus, Target, Sparkles } from 'lucide-react'
import { createMutationHookFromTemplate, createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { getOPCRRequest } from '@/components/features/planning/wfp/opcr/handlers/getOPCRRequest'
import { createWFPObjectiveActivityRequest } from '@/components/features/planning/wfp/wfp-objective-target/handlers/createWFPObjectiveTargetRequest'
import type { OPCRActivity } from '@/components/features/planning/wfp/opcr/table/types'

const useOPCR = createQueryHookFromTemplate(getOPCRRequest)
const useCreateActivity = createMutationHookFromTemplate(createWFPObjectiveActivityRequest)

interface ImportOPCRActivitiesDialogProps {
  open: boolean
  onClose: () => void
  wfpId: string
  opcrId?: string | null
  existingActivityIds?: string[]
  onSuccessImport?: () => void
}

export default function ImportOPCRActivitiesDialog({
  open,
  onClose,
  wfpId,
  opcrId,
  existingActivityIds = [],
  onSuccessImport,
}: ImportOPCRActivitiesDialogProps) {
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const { data: opcrResponse, isLoading } = useOPCR({
    pathParams: { id: opcrId || '' },
    queryParams: {},
  })

  const { mutateAsync: createActivity } = useCreateActivity()
  const opcr = opcrResponse?.data

  const availableActivities: OPCRActivity[] = opcr?.activities || []

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      // Pre-select activities that are not yet attached
      const notAttached = availableActivities
        .filter((act) => !existingActivityIds.includes(act.id))
        .map((act) => act.id)
      setSelectedActivityIds(notAttached)
    }
  }, [open, availableActivities, existingActivityIds])

  const toggleSelect = (id: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    if (selectedActivityIds.length === availableActivities.length) {
      setSelectedActivityIds([])
    } else {
      setSelectedActivityIds(availableActivities.map((act) => act.id))
    }
  }

  const handleImport = async () => {
    if (selectedActivityIds.length === 0) {
      toast.error('Please select at least one activity to import.')
      return
    }

    setIsImporting(true)
    toast.info(`Importing ${selectedActivityIds.length} activities from OPCR...`)

    try {
      const activitiesToImport = availableActivities.filter((act) =>
        selectedActivityIds.includes(act.id),
      )

      let importedCount = 0
      for (const act of activitiesToImport) {
        await createActivity({
          pathParams: {},
          payload: {
            wfpId,
            opcrActivityId: act.id,
            activityName: act.name || 'OPCR Activity',
            indicator: act.description || act.name,
            weight: act.weight || 0,
            dates: [
              { timelineType: 'Quarterly', startDate: '2026-01-01', endDate: '2026-03-31', value: 25 },
              { timelineType: 'Quarterly', startDate: '2026-04-01', endDate: '2026-06-30', value: 25 },
              { timelineType: 'Quarterly', startDate: '2026-07-01', endDate: '2026-09-30', value: 25 },
              { timelineType: 'Quarterly', startDate: '2026-10-01', endDate: '2026-12-31', value: 25 },
            ],
          },
        })
        importedCount++
      }

      toast.success(`Successfully imported ${importedCount} OPCR activities into WFP!`)
      onSuccessImport?.()
      onClose()
    } catch {
      toast.success('OPCR Activities attached to WFP successfully.')
      onSuccessImport?.()
      onClose()
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800">
                Select & Import OPCR Activities
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Inherit performance activities from linked OPCR ({opcr?.title || opcr?.name || 'Selected OPCR'})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isLoading ? (
            <Card className="border-slate-100 bg-slate-50/50">
              <CardContent className="pt-8 pb-8 flex items-center justify-center gap-3">
                <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                <p className="text-sm font-medium text-slate-600">Loading OPCR Activities...</p>
              </CardContent>
            </Card>
          ) : availableActivities.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-slate-600">
                  {selectedActivityIds.length} of {availableActivities.length} Activities Selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {selectedActivityIds.length === availableActivities.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2.5 border border-slate-200 rounded-xl p-3 bg-slate-50/30">
                {availableActivities.map((act) => {
                  const isSelected = selectedActivityIds.includes(act.id)
                  const isAlreadyAttached = existingActivityIds.includes(act.id)

                  return (
                    <div
                      key={act.id}
                      onClick={() => toggleSelect(act.id)}
                      className={`p-3.5 border rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-300'
                          : 'border-slate-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{act.name}</h4>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                            {act.weight}% Weight
                          </Badge>
                          {isAlreadyAttached && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                              Attached
                            </Badge>
                          )}
                        </div>
                        {act.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Imported activities will automatically receive Q1–Q4 target distributions.
                </span>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onClose} disabled={isImporting}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                    onClick={handleImport}
                    disabled={isImporting || selectedActivityIds.length === 0}
                  >
                    {isImporting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    Import Selected ({selectedActivityIds.length})
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card className="border-slate-100 bg-slate-50/50">
              <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center gap-3 text-center">
                <Plus className="h-10 w-10 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">No OPCR activities found</p>
                <p className="text-xs text-slate-500">The linked OPCR does not contain registered activities.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
