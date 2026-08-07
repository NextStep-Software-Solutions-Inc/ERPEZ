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
import { getOfficesRequest, type Office } from '../handlers/getOfficesRequest'
import { getFiscalYearsRequest, type FiscalYear, type FiscalYearsResponse } from '../handlers/getFiscalYearsRequest'

export function CreateAPPDialog() {
  const [open, setOpen] = useAtom(createAPPDialogOpenAtom)
  const [, setAppList] = useAtom(appListAtom)
  
  // Fetch offices from API
  const useOffices = createQueryHookFromTemplate(getOfficesRequest)
  const { data: officesData } = useOffices({})
  const offices: Office[] = Array.isArray(officesData) ? officesData : []
  
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
    officeId: '',
    fiscalYearId: '',
  })
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)

  // Initialize officeId when offices are loaded
  useEffect(() => {
    if (offices.length > 0 && !formData.officeId) {
      setFormData(prev => ({
        ...prev,
        officeId: offices[0].id,
      }))
    }
  }, [offices])

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
    const { appName, appCode, fiscalYear, officeId, fiscalYearId } = formData
    
    if (!appName.trim()) {
      toast.error('Please enter APP name')
      return
    }
    if (!appCode.trim()) {
      toast.error('Please enter APP code')
      return
    }
    if (!officeId) {
      toast.error('Please select an office')
      return
    }
    if (!fiscalYearId) {
      toast.error('Please select a fiscal year')
      return
    }

    createApp(
      {
        pathParams: {},
        payload: {
          ppmpIds: [],
          appName: appName.trim(),
          appCode: appCode.trim(),
          fiscalYear: parseInt(fiscalYear),
          appType: 'Indicative',
          officeId,
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
            officeId: offices.length > 0 ? offices[0].id : 'No offices available',
            fiscalYearId: fiscalYears.find(fy => fy.year === new Date().getFullYear())?.id || 'No fiscal years available',
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
  }, [formData, setOpen, setAppList, navigate, createApp])

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
      officeId: offices.length > 0 ? offices[0].id : '',
      fiscalYearId: currentFY ? currentFY.id : '',
    })
  }, [setOpen, offices, fiscalYears])

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
        <DialogContent className="z-[999] pointer-events-auto max-w-md">
          <DialogHeader>
            <DialogTitle>Create Annual Procurement Plan</DialogTitle>
            <DialogDescription>
              Enter basic information to create a new APP. You'll configure PPMP selections and details in the next step.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">APP Name *</Label>
              <Input
                id="appName"
                placeholder="e.g., Indicative APP 2024"
                value={formData.appName}
                onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appCode">APP Code *</Label>
              <Input
                id="appCode"
                placeholder="e.g., APP-2024-001"
                value={formData.appCode}
                onChange={(e) => setFormData(prev => ({ ...prev, appCode: e.target.value }))}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officeId">Office *</Label>
              <Select value={formData.officeId} onValueChange={(value) => setFormData(prev => ({ ...prev, officeId: value }))}>
                <SelectTrigger id="officeId" disabled={isCreating || offices.length === 0}>
                  <SelectValue placeholder={offices.length === 0 ? 'Loading offices...' : 'Select an office'} />
                </SelectTrigger>
                <SelectContent>
                  {offices.map((office: Office) => (
                    <SelectItem key={office.id} value={office.id}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fiscalYear">Fiscal Year *</Label>
              <Select value={formData.fiscalYear} onValueChange={(value) => {
                const selectedFY = fiscalYears.find(fy => fy.year.toString() === value)
                setFormData(prev => ({
                  ...prev,
                  fiscalYear: value,
                  fiscalYearId: selectedFY?.id || '',
                }))
              }}>
                <SelectTrigger id="fiscalYear" disabled={isCreating || fiscalYears.length === 0}>
                  <SelectValue placeholder={fiscalYears.length === 0 ? 'Loading fiscal years...' : 'Select a fiscal year'} />
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

          <DialogFooter className="flex items-center gap-2 pt-4">
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
              className="pointer-events-auto cursor-pointer bg-blue-600 hover:bg-blue-700"
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
