import { useState, useCallback, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createAPPDialogOpenAtom,
  appListAtom,
} from '../atoms'
import { createMutationHookFromTemplate, createQueryHookFromTemplate } from 'erpez-shared-lib'
import { createAppRequest } from '../handlers/createAppRequest'
import { getFiscalYearsRequest, type FiscalYear, type FiscalYearsResponse } from '../handlers/getFiscalYearsRequest'
import { FileText, CheckCircle2, Lock } from 'lucide-react'

export function CreateAPPDialog() {
  const [open, setOpen] = useAtom(createAPPDialogOpenAtom)
  const [, setAppList] = useAtom(appListAtom)

  // Fetch fiscal years from API
  const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
  const { data: fiscalYearsData } = useFiscalYears({})
  const fiscalYearsResponse: FiscalYearsResponse | undefined = fiscalYearsData
  const fiscalYears: FiscalYear[] = fiscalYearsResponse?.data || []

  const navigate = useNavigate() as any
  const useCreateApp = createMutationHookFromTemplate(createAppRequest)
  const { mutate: createApp, isPending: isCreating } = useCreateApp()

  const [formData, setFormData] = useState({
    appName: '',
    appCode: '',
    fiscalYear: '',
    fiscalYearId: '',
    appType: 'Indicative' as 'Indicative' | 'Final' | 'Updated',
    batch: 'Batch 1',
    quarter: 'Q1',
  })
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

  // Initialize fiscalYear and fiscalYearId when fiscal years are loaded
  useEffect(() => {
    if (fiscalYears.length > 0 && !formData.fiscalYearId) {
      const currentYear = new Date().getFullYear()
      const currentFY = fiscalYears.find(fy => fy.year === currentYear) || fiscalYears[0]
      setFormData(prev => ({
        ...prev,
        fiscalYear: currentFY.year.toString(),
        fiscalYearId: currentFY.id,
      }))
    }
  }, [fiscalYears])

  const handleCreateAPP = useCallback(async () => {
    const { appName, appCode, fiscalYear, fiscalYearId, appType, batch, quarter } = formData

    if (!appName.trim()) {
      toast.error('Please enter APP name')
      return
    }
    if (!appCode.trim()) {
      toast.error('Please enter APP code')
      return
    }
    if (!fiscalYearId) {
      toast.error('Please select a fiscal year')
      return
    }
    if (!batch.trim()) {
      toast.error('Please enter Batch')
      return
    }

    createApp(
      {
        pathParams: {},
        payload: {
          appName: appName.trim(),
          appCode: appCode.trim(),
          fiscalYear: parseInt(fiscalYear),
          appType,
          batch: batch.trim(),
          quarter,
          fiscalYearId,
        },
      },
      {
        onSuccess: (response) => {
          toast.success('APP created successfully!')
          setFormData({
            appName: '',
            appCode: '',
            fiscalYear: new Date().getFullYear().toString(),
            fiscalYearId: fiscalYears.find(fy => fy.year === new Date().getFullYear())?.id || '',
            appType: 'Indicative',
            batch: 'Batch 1',
            quarter: 'Q1',
          })
          setOpen(false)

          // Navigate to APP Details page with the returned ID
          if (response?.id) {
            navigate({ to: '/v2/app-consolidation/$appId', params: { appId: response.id } })
          }
        },
        onError: (error) => {
          toast.error('Failed to create APP')
          console.error(error)
        },
      }
    )
  }, [formData, setOpen, setAppList, navigate, createApp, fiscalYears])

  const handleClose = useCallback(() => {
    if (isCreating) return
    if (formData.appName.trim() || formData.appCode.trim()) {
      setShowCancelConfirmation(true)
    } else {
      setOpen(false)
    }
  }, [formData, isCreating, setOpen])

  const handleConfirmCancel = useCallback(() => {
    setOpen(false)
    setShowCancelConfirmation(false)
    const currentYear = new Date().getFullYear()
    const currentFY = fiscalYears.find(fy => fy.year === currentYear) || fiscalYears[0]
    setFormData({
      appName: '',
      appCode: '',
      fiscalYear: currentFY ? currentFY.year.toString() : '',
      fiscalYearId: currentFY ? currentFY.id : '',
      appType: 'Indicative',
      batch: 'Batch 1',
      quarter: 'Q1',
    })
  }, [setOpen, fiscalYears])

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !isCreating) {
      handleClose()
    } else if (newOpen) {
      setOpen(true)
    }
  }, [isCreating, handleClose, setOpen])

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="z-[999] pointer-events-auto max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Annual Procurement Plan</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Create an APP for a specific fiscal year. PPMPs from different offices can be consolidated into this plan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="appName" className="font-semibold">APP Name *</Label>
              <Input
                id="appName"
                placeholder="e.g., Indicative APP 2027"
                value={formData.appName}
                onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appCode" className="font-semibold">APP Code / Number *</Label>
                <Input
                  id="appCode"
                  placeholder="e.g., APP-2027-001"
                  value={formData.appCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, appCode: e.target.value }))}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYear" className="font-semibold">Fiscal Year *</Label>
                <Select value={formData.fiscalYear} onValueChange={(value) => {
                  const selectedFY = fiscalYears.find(fy => fy.year.toString() === value)
                  setFormData(prev => ({
                    ...prev,
                    fiscalYear: value,
                    fiscalYearId: selectedFY?.id || '',
                  }))
                }}>
                  <SelectTrigger id="fiscalYear" disabled={isCreating || fiscalYears.length === 0}>
                    <SelectValue placeholder={fiscalYears.length === 0 ? 'Loading...' : 'Select Year'} />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.map(fy => (
                      <SelectItem key={fy.id} value={fy.year.toString()}>
                        {fy.year} {fy.description ? `- ${fy.description}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* APP Type Radio Cards */}
            <div className="space-y-2">
              <Label className="font-semibold">APP Type *</Label>
              <div className="grid grid-cols-3 gap-3">
                {/* Indicative Card */}
                <div
                  onClick={() => !isCreating && setFormData(prev => ({ ...prev, appType: 'Indicative' }))}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.appType === 'Indicative'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={`w-4 h-4 ${formData.appType === 'Indicative' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-semibold text-sm text-gray-900">Indicative</span>
                  </div>
                  <p className="text-xs text-gray-500">Budget proposal APP</p>
                </div>

                {/* Final Card */}
                <div
                  onClick={() => !isCreating && setFormData(prev => ({ ...prev, appType: 'Final' }))}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.appType === 'Final'
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className={`w-4 h-4 ${formData.appType === 'Final' ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="font-semibold text-sm text-gray-900">Final</span>
                  </div>
                  <p className="text-xs text-gray-500">Approved implementation plan</p>
                </div>

                {/* Updated Card (Disabled in standard creation) */}
                <div
                  title="Updated APPs can only be created from an approved Final APP."
                  className="p-3 rounded-lg border-2 border-gray-200 bg-gray-100/70 opacity-60 cursor-not-allowed relative"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-sm text-gray-500">Updated</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-tight">Requires approved Final APP</p>
                </div>
              </div>
            </div>

            {/* Submission Metadata: Batch and Quarter */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch" className="font-semibold">Batch *</Label>
                <Input
                  id="batch"
                  placeholder="e.g., Batch 1"
                  value={formData.batch}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch: e.target.value }))}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quarter" className="font-semibold">Quarter *</Label>
                <Select value={formData.quarter} onValueChange={(value) => setFormData(prev => ({ ...prev, quarter: value }))}>
                  <SelectTrigger id="quarter" disabled={isCreating}>
                    <SelectValue placeholder="Select Quarter" />
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

          <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="pointer-events-auto cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAPP}
              disabled={isCreating}
              className="pointer-events-auto cursor-pointer bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              {isCreating ? 'Creating...' : 'Create & Continue'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirmation} onOpenChange={setShowCancelConfirmation}>
        <AlertDialogContent className="z-[99999] pointer-events-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? Your entered information will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="pointer-events-auto cursor-pointer">Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="pointer-events-auto cursor-pointer bg-red-600 hover:bg-red-700"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
