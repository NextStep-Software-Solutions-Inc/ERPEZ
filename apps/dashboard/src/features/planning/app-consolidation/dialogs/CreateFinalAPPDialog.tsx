import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, ArrowRight, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import api from '@/services/api'
import type { AppMaster } from '../types'

interface CreateFinalAPPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  indicativeApp: AppMaster | null
}

export function CreateFinalAPPDialog({
  open,
  onOpenChange,
  indicativeApp,
}: CreateFinalAPPDialogProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCloning, setIsCloning] = useState(false)

  const [formData, setFormData] = useState({
    appName: '',
    appCode: '',
    batch: 'Batch 1',
    quarter: 'Q1',
  })

  // Pre-fill from source Indicative APP whenever it changes
  useEffect(() => {
    if (indicativeApp) {
      setFormData({
        appName: `Final APP FY ${indicativeApp.fiscalYear}`,
        appCode: `${indicativeApp.appCode}-FINAL`,
        batch: indicativeApp.batch || 'Batch 1',
        quarter: indicativeApp.quarter || 'Q1',
      })
    }
  }, [indicativeApp])

  const handleCreateFinalAPP = useCallback(async () => {
    if (!indicativeApp) return

    const { appName, appCode, batch, quarter } = formData

    if (!appName.trim()) {
      toast.error('Please enter a name for the Final APP')
      return
    }
    if (!appCode.trim()) {
      toast.error('Please enter a code for the Final APP')
      return
    }

    setIsCloning(true)
    try {
      // POST /apps/{indicativeAppId}/clone-final
      // The backend CloneFinalAPPCommandHandler will:
      //   1. Validate source is Indicative + Approved
      //   2. Create a new independent Final APP (Draft)
      //   3. Deep-clone all PPMP source links
      //   4. Deep-clone all APPItems with full procurement detail
      //   5. Set SourceAPPId → indicativeApp.id for traceability
      const response = await api.post(`/apps/${indicativeApp.id}/clone-final`, {
        appNumber:   appCode.trim(),
        name:        appName.trim(),
        batch:       batch.trim(),
        quarter,
        description: `Final APP for FY ${indicativeApp.fiscalYear} — carried forward from Indicative APP ${indicativeApp.appCode}`,
      })

      if (response.data?.succeeded && response.data?.data) {
        const newAppId = response.data.data as string
        toast.success(`Final APP "${appName}" created with procurement data carried forward!`)
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/apps') || query.queryKey[0].startsWith('/ppmps')),
        })
        onOpenChange(false)
        navigate({
          to: '/v2/app-consolidation/$appId',
          params: { appId: newAppId },
        })
      } else {
        toast.error(response.data?.message || 'Failed to create Final APP')
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to create Final APP'
      console.error('Failed to create Final APP:', error)
      toast.error(msg)
    } finally {
      setIsCloning(false)
    }
  }, [formData, indicativeApp, queryClient, onOpenChange, navigate])

  if (!indicativeApp) return null

  // Count items/PPMPs to show in the carry-forward summary
  const itemCount = indicativeApp.aggregationResults?.items
    ? indicativeApp.aggregationResults.items.reduce((sum, group) => sum + group.items.length, 0)
    : (indicativeApp.bac?.lineItems?.length ?? 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[9999] pointer-events-auto max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <CheckCircle2 className="w-5 h-5" />
            <DialogTitle className="text-xl font-bold text-gray-900">
              Create Final Annual Procurement Plan
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600">
            Creates a new independent Final APP pre-populated with all procurement data
            from the approved Indicative APP. The Final APP is fully editable — changes
            do not affect the Indicative source.
          </DialogDescription>
        </DialogHeader>

        {indicativeApp.derivedFinalAppId ? (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <p className="text-sm font-semibold text-amber-900">
                Final APP Already Exists
              </p>
              <p className="text-xs text-amber-800">
                A Final APP (<span className="font-bold">{indicativeApp.derivedFinalAppNumber}</span>) has already been created from this Indicative APP. Subsequent adjustments should be performed on the Final APP or by creating an Updated APP from the latest approved version.
              </p>
            </div>
            <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false)
                  navigate({
                    to: '/v2/app-consolidation/$appId',
                    params: { appId: indicativeApp.derivedFinalAppId! },
                  })
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2"
              >
                View Final APP
                <ArrowRight className="w-4 h-4" />
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-3">
              {/* Source Summary */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-2">
                <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  Source Indicative APP — Data to carry forward:
                </p>
                <p className="text-sm font-bold text-amber-900">{indicativeApp.appName}</p>
                <p className="text-xs text-amber-800 font-medium">
                  Code: {indicativeApp.appCode} · FY {indicativeApp.fiscalYear}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                    ✓ {itemCount} procurement item{itemCount !== 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                    ✓ PPMP sources
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                    ✓ Modes & schedules
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalAppName" className="font-semibold">Final APP Name *</Label>
                <Input
                  id="finalAppName"
                  value={formData.appName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, appName: e.target.value }))}
                  disabled={isCloning}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="finalAppCode" className="font-semibold">APP Code / Number *</Label>
                  <Input
                    id="finalAppCode"
                    value={formData.appCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, appCode: e.target.value }))}
                    disabled={isCloning}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-semibold">Fiscal Year</Label>
                  <Input
                    value={`FY ${indicativeApp.fiscalYear}`}
                    disabled
                    className="bg-gray-100 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="finalBatch" className="font-semibold">Batch</Label>
                  <Input
                    id="finalBatch"
                    value={formData.batch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, batch: e.target.value }))}
                    disabled={isCloning}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finalQuarter" className="font-semibold">Quarter</Label>
                  <Select
                    value={formData.quarter}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, quarter: val }))}
                  >
                    <SelectTrigger id="finalQuarter" disabled={isCloning}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 (1st Quarter)</SelectItem>
                      <SelectItem value="Q2">Q2 (2nd Quarter)</SelectItem>
                      <SelectItem value="Q3">Q3 (3rd Quarter)</SelectItem>
                      <SelectItem value="Q4">Q4 (4th Quarter)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* What will happen note */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800 space-y-1">
                <p className="font-semibold">What happens when you create this Final APP:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                  <li>A new independent Draft APP is created with type <strong>Final</strong></li>
                  <li>All procurement items are copied from the Indicative APP</li>
                  <li>All PPMP source links are copied forward</li>
                  <li>Modes, fund sources, milestones &amp; schedules are preserved</li>
                  <li>The Indicative APP remains <strong>unchanged</strong></li>
                  <li>Edits to this Final APP will not affect the Indicative APP</li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCloning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFinalAPP}
                disabled={isCloning}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2"
              >
                {isCloning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carrying Forward Data...
                  </>
                ) : (
                  <>
                    Create Final APP
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
