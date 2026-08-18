/**
 * Create APR Dialog Component
 * 
 * Multi-step workflow for APR creation:
 * Step 1: Select source APP and line items (SelectAPPDialog)
 * Step 2: Configure header information
 * Step 3: Configure terms & conditions
 */

import { useState } from 'react'
import * as React from 'react'
import { useAtom } from 'jotai'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  createAPRDialogOpenAtom,
  selectAPPDialogOpenAtom,
  selectedAPRFiscalYearAtom,
} from '../atoms'
import { useCreateAPRMutation } from '../handlers/hooks'
import { APRHeaderForm, APRTermsForm } from '../forms'
import {
  ModeOfDelivery,
  InsufficientFundsAction,
  type CreateAPRCommandPayload,
  type ConsolidatedAPRItem,
} from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SelectAPPDialog } from './SelectAPPDialog'
import { Loader2 } from 'lucide-react'

export function CreateAPRDialog() {
  const [open, setOpen] = useAtom(createAPRDialogOpenAtom)
  const [, setSelectAPPDialogOpen] = useAtom(selectAPPDialogOpenAtom)
  const [selectedFiscalYear] = useAtom(selectedAPRFiscalYearAtom)
  const [activeTab, setActiveTab] = useState('header')
  const [sourceAPPId, setSourceAPPId] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [selectedAppLineItemIds, setSelectedAppLineItemIds] = useState<string[]>([])
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedAPRItem[]>([])

  const { mutateAsync: createAPR, isPending } = useCreateAPRMutation()

  // Auto-open SelectAPPDialog when CreateAPRDialog opens without selected APP
  React.useEffect(() => {
    if (open && !sourceAPPId) {
      setSelectAPPDialogOpen((prev) => (!prev ? true : prev))
    }
  }, [open, sourceAPPId, setSelectAPPDialogOpen])

  const form = useForm({
    defaultValues: {
      agencyControlNumber: '',
      agencyAccountCode: '',
      description: '',
      requestDate: new Date().toISOString().split('T')[0],
      fiscalYear: selectedFiscalYear,
      modeOfDelivery: ModeOfDelivery.FAST_LANE,
      insufficientFundsAction: InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: false,
        collectiveBarterAgreementRequired: false,
        completeSpecsRequired: false,
      },
      remarks: '',
    },
    onSubmit: async (values) => {
      try {
        if (!sourceAPPId) {
          toast.error('Please select an APP first')
          return
        }

        const officeId =
          selectedApp?.officeId ||
          selectedApp?.APPItems?.[0]?.officeId ||
          selectedApp?.appItems?.[0]?.officeId ||
          selectedApp?.APPPPMPs?.[0]?.PPMP?.officeId ||
          selectedApp?.APPPPMPs?.[0]?.ppmp?.officeId ||
          selectedApp?.appppmPs?.[0]?.ppmp?.officeId ||
          '00000000-0000-0000-0000-000000000000'

        const fiscalYearId =
          selectedApp?.fiscalYearId ||
          selectedApp?.FiscalYear?.id ||
          selectedApp?.fiscalYear?.id ||
          '00000000-0000-0000-0000-000000000000'

        // Map line items to backend CreateAPRItemDto
        const items = selectedAppLineItemIds.map((lineItemId) => {
          const item = consolidatedItems.find(
            (ci) => ci.appLineItemId === lineItemId || ci.id === lineItemId
          )
          return {
            appItemId: lineItemId,
            quantityRequested: item?.quantity ?? null,
            unitCost: item?.unitCost ?? null,
          }
        })

        const commandPayload: CreateAPRCommandPayload = {
          appId: sourceAPPId,
          officeId,
          fiscalYearId,
          agencyControlNumber: values.value.agencyControlNumber || null,
          agencyAccountCode: values.value.agencyAccountCode || null,
          requestDate: values.value.requestDate.split('T')[0],
          description: values.value.description || null,
          modeOfDelivery: values.value.modeOfDelivery,
          insufficientFundsAction: values.value.insufficientFundsAction,
          requiresObR: !!values.value.attachments.observationReportRequired,
          requiresCBA: !!values.value.attachments.collectiveBarterAgreementRequired,
          requiresCompleteSpecifications: !!values.value.attachments.completeSpecsRequired,
          additionalRemarks: values.value.remarks || null,
          items,
        }

        await createAPR({
          payload: commandPayload,
        } as any)

        toast.success('Agency Purchase Request (APR) created successfully')
        handleClose()
      } catch (error: any) {
        console.error('Failed to create APR:', error)
        const msg = error?.response?.data?.message || error?.message || 'Failed to create APR'
        toast.error(msg)
      }
    },
  })

  const [selectedApps, setSelectedApps] = useState<any[]>([])

  const handleSelectAPP = (
    appId: string,
    lineItemIds: string[],
    items: ConsolidatedAPRItem[],
    app?: any,
    _selectedAppIds?: string[],
    appsList?: any[]
  ) => {
    setSourceAPPId(appId)
    setSelectedApp(app)
    if (appsList) setSelectedApps(appsList)
    setSelectedAppLineItemIds(lineItemIds)
    setConsolidatedItems(items)
    setSelectAPPDialogOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    setSourceAPPId(null)
    setSelectedApp(null)
    setSelectedApps([])
    setSelectedAppLineItemIds([])
    setConsolidatedItems([])
  }

  const handleOpenSelectAPP = () => {
    setSelectAPPDialogOpen(true)
  }

  const appDisplayName =
    selectedApps.length > 1
      ? selectedApps.map((a) => a.appNumber || a.appCode || a.name).join(', ')
      : selectedApp?.appNumber || selectedApp?.appCode || (sourceAPPId ? `APP ${sourceAPPId.substring(0, 8)}` : '')

  return (
    <>
      <SelectAPPDialog onSelectAPP={handleSelectAPP} />

      <Dialog
        open={open && sourceAPPId !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose()
          setOpen(isOpen)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto" size="xl">
          <DialogHeader>
            <DialogTitle>Create New APR (Agency Purchase Request)</DialogTitle>
            <DialogDescription>
              Step {activeTab === 'header' ? '2' : '3'} of 3:
              {activeTab === 'header' && ' Configure header information'}
              {activeTab === 'terms' && ' Configure terms & conditions'}
            </DialogDescription>
          </DialogHeader>

          {/* APP Status Banner */}
          {sourceAPPId && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">
                    ✅ APP Selected: <span className="font-bold">{appDisplayName}</span>
                  </p>
                  <p className="text-xs text-green-700">
                    {selectedAppLineItemIds.length} line items selected for this APR
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenSelectAPP}
                  disabled={isPending}
                >
                  Change APP
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="header">Header Information</TabsTrigger>
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
            </TabsList>

            <TabsContent value="header" className="space-y-4">
              <APRHeaderForm form={form} />
            </TabsContent>

            <TabsContent value="terms" className="space-y-4">
              <APRTermsForm form={form} />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenSelectAPP}
              disabled={isPending}
            >
              Change APP
            </Button>
            <Button onClick={() => form.handleSubmit()} disabled={isPending || !sourceAPPId}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating APR...
                </>
              ) : (
                'Create APR'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
