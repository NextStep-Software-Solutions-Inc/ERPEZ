import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react'
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
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import { createAppRequest } from '../handlers/createAppRequest'
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
  const useCreateApp = createMutationHookFromTemplate(createAppRequest)
  const { mutate: createApp, isPending: isCreating } = useCreateApp()

  const [formData, setFormData] = useState({
    appName: '',
    appCode: '',
    batch: 'Batch 1',
    quarter: 'Q1',
  })

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

  const handleCreateFinalAPP = useCallback(() => {
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

    createApp(
      {
        pathParams: {},
        payload: {
          appName: appName.trim(),
          appCode: appCode.trim(),
          fiscalYear: indicativeApp.fiscalYear,
          fiscalYearId: indicativeApp.fiscalYearId,
          appType: 'Final',
          batch: batch.trim(),
          quarter,
          description: `Final APP for FY ${indicativeApp.fiscalYear} created from Approved Indicative APP ${indicativeApp.appCode}`,
        },
      },
      {
        onSuccess: async (response) => {
          toast.success(`Final APP "${appName}" created successfully!`)
          await queryClient.invalidateQueries({ queryKey: ['/apps'] })
          onOpenChange(false)

          if (response?.id) {
            navigate({
              to: '/v2/app-consolidation/$appId',
              params: { appId: response.id },
            })
          }
        },
        onError: (error: any) => {
          console.error('Failed to create Final APP:', error)
          toast.error(error?.message || 'Failed to create Final APP')
        },
      }
    )
  }, [formData, indicativeApp, createApp, queryClient, onOpenChange, navigate])

  if (!indicativeApp) return null

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
            Transition from approved Indicative budget proposal to official Final APP baseline for FY {indicativeApp.fiscalYear}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Source Indicative APP Summary */}
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1">
            <p className="font-semibold text-amber-900 flex items-center gap-1.5">
              <span>Source Indicative APP:</span>
              <span className="font-bold">{indicativeApp.appName}</span>
            </p>
            <p className="text-amber-800 font-mono">Code: {indicativeApp.appCode} • Status: {indicativeApp.status}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="finalAppName" className="font-semibold">Final APP Name *</Label>
            <Input
              id="finalAppName"
              value={formData.appName}
              onChange={(e) => setFormData((prev) => ({ ...prev, appName: e.target.value }))}
              disabled={isCreating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="finalAppCode" className="font-semibold">Final APP Code / Number *</Label>
              <Input
                id="finalAppCode"
                value={formData.appCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, appCode: e.target.value }))}
                disabled={isCreating}
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
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalQuarter" className="font-semibold">Quarter</Label>
              <Select
                value={formData.quarter}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, quarter: val }))}
              >
                <SelectTrigger id="finalQuarter" disabled={isCreating}>
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
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateFinalAPP}
            disabled={isCreating}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Final APP...
              </>
            ) : (
              <>
                Create Final APP
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
