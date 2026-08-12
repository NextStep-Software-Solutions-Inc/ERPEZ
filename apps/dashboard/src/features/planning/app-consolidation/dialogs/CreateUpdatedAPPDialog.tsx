import { useState, useCallback } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
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
import { Card, CardContent } from '@/components/ui/card'
import { currentAppAtom } from '../atoms'
import { useQueryClient } from '@tanstack/react-query'
import api from '@/services/api'
import { Sparkles, Calendar, Layers, ShieldCheck } from 'lucide-react'

interface CreateUpdatedAPPDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUpdatedAPPDialog({ open, onOpenChange }: CreateUpdatedAPPDialogProps) {
  const [currentApp] = useAtom(currentAppAtom)
  const navigate = useNavigate() as any
  const queryClient = useQueryClient()
  const [isCloning, setIsCloning] = useState(false)

  const nextVersionNumber = (currentApp?.versionNumber || 0) + 1
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const [formData, setFormData] = useState({
    appName: currentApp ? `${currentApp.appName} (Updated V${nextVersionNumber})` : '',
    appCode: currentApp ? `${currentApp.appCode}-V${nextVersionNumber}` : '',
    batch: currentApp?.batch || 'Batch 1',
    quarter: currentApp?.quarter || 'Q1',
  })

  const handleCreateUpdatedAPP = useCallback(async () => {
    if (!currentApp) return

    setIsCloning(true)
    try {
      const response = await api.post(`/apps/${currentApp.id}/clone-updated`, {
        sourceAppId: currentApp.id,
        appName: formData.appName.trim(),
        appNumber: formData.appCode.trim(),
        batch: formData.batch.trim(),
        quarter: formData.quarter,
      })

      if (response.data?.succeeded && response.data?.data) {
        const newAppId = response.data.data
        toast.success(`Updated APP Version ${nextVersionNumber} created successfully!`)
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/apps') || query.queryKey[0].startsWith('/ppmps')),
        })
        onOpenChange(false)
        navigate({ to: '/v2/app-consolidation/$appId', params: { appId: newAppId } })
      } else {
        toast.error(response.data?.message || 'Failed to create Updated APP')
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to create Updated APP'
      toast.error(msg)
    } finally {
      setIsCloning(false)
    }
  }, [currentApp, formData, nextVersionNumber, onOpenChange, navigate, queryClient])

  if (!currentApp) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[999] pointer-events-auto max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Create Updated APP
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Create a new revision from an approved source APP with sequential version tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Source APP Context Card */}
          <Card className="border-blue-200 bg-blue-50/60">
            <CardContent className="p-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Source APP</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" /> Approved
                </span>
              </div>
              <p className="font-bold text-gray-900 text-sm">{currentApp.appName}</p>
              <div className="flex items-center gap-3 text-gray-600 pt-0.5">
                <span>Code: {currentApp.appCode}</span>
                <span>•</span>
                <span>FY {currentApp.fiscalYear}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="updatedAppName" className="font-semibold">Updated APP Name *</Label>
            <Input
              id="updatedAppName"
              value={formData.appName}
              onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
              disabled={isCloning}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="updatedAppCode" className="font-semibold">APP Code / Number *</Label>
            <Input
              id="updatedAppCode"
              value={formData.appCode}
              onChange={(e) => setFormData(prev => ({ ...prev, appCode: e.target.value }))}
              disabled={isCloning}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="updatedBatch" className="font-semibold">Batch *</Label>
              <Input
                id="updatedBatch"
                value={formData.batch}
                onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                disabled={isCloning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="updatedQuarter" className="font-semibold">Quarter *</Label>
              <Select value={formData.quarter} onValueChange={(val) => setFormData(prev => ({ ...prev, quarter: val }))}>
                <SelectTrigger id="updatedQuarter" disabled={isCloning}>
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1">Q1</SelectItem>
                  <SelectItem value="Q2">Q2</SelectItem>
                  <SelectItem value="Q3">Q3</SelectItem>
                  <SelectItem value="Q4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* System Generated Version Information */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-gray-50 border rounded-lg space-y-0.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-blue-600" /> Version Number
              </span>
              <p className="font-bold text-gray-900 text-sm">Version {nextVersionNumber}</p>
              <span className="text-[10px] text-gray-400">System Generated</span>
            </div>

            <div className="p-3 bg-gray-50 border rounded-lg space-y-0.5">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Version Date
              </span>
              <p className="font-bold text-gray-900 text-sm truncate">{todayFormatted}</p>
              <span className="text-[10px] text-gray-400">System Generated</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCloning}>
            Cancel
          </Button>
          <Button onClick={handleCreateUpdatedAPP} disabled={isCloning} className="bg-blue-600 hover:bg-blue-700 font-semibold">
            {isCloning ? 'Cloning & Updating...' : 'Create Updated APP'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
