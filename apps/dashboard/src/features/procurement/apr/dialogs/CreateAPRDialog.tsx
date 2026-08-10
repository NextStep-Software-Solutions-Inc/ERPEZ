/**
 * Create APR Dialog Component
 * 
 * Multi-step workflow for APR creation:
 * Step 1: Select source APP and line items (SelectAPPDialog)
 * Step 2: Configure header information
 * Step 3: Configure terms & conditions
 * Uses OrdinaryDialog composition pattern
 */

import { useState } from 'react'
import * as React from 'react'
import { useAtom } from 'jotai'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { createMutationHookFromTemplate } from 'erpez-shared-lib'
import {
  createAPRDialogOpenAtom,
  selectAPPDialogOpenAtom,
  selectedAPRFiscalYearAtom,
} from '../atoms'
import { createAPRRequest } from '../handlers'
import { APRHeaderForm, APRTermsForm } from '../forms'
import { ModeOfDelivery, InsufficientFundsAction } from '../types'
import type { CreateAPRPayload } from '../types'
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
import type { ConsolidatedAPRItem } from '../types'

const useCreateAPR = createMutationHookFromTemplate(createAPRRequest)

export function CreateAPRDialog() {
  const [open, setOpen] = useAtom(createAPRDialogOpenAtom)
  const [, setSelectAPPDialogOpen] = useAtom(selectAPPDialogOpenAtom)
  const [selectedFiscalYear] = useAtom(selectedAPRFiscalYearAtom)
  const [activeTab, setActiveTab] = useState('header')
  const [sourceAPPId, setSourceAPPId] = useState<string | null>(null)
  const [selectedAppLineItemIds, setSelectedAppLineItemIds] = useState<string[]>([])
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedAPRItem[]>([])

  const { mutateAsync: createAPR, isPending } = useCreateAPR()

  // Auto-open SelectAPPDialog when CreateAPRDialog opens
  React.useEffect(() => {
    if (open && !sourceAPPId) {
      setSelectAPPDialogOpen(true)
    }
  }, [open, sourceAPPId, setSelectAPPDialogOpen])

  const form = useForm({
    defaultValues: {
      agencyControlNumber: '',
      agencyAccountCode: '',
      description: '',
      requestDate: new Date().toISOString(),
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

        const payload: CreateAPRPayload = {
          sourceAPPId,
          selectedAppLineItemIds,
          consolidatedItems,
          header: {
            agencyControlNumber: values.value.agencyControlNumber,
            agencyAccountCode: values.value.agencyAccountCode,
            description: values.value.description,
            requestDate: values.value.requestDate,
            fiscalYear: values.value.fiscalYear,
            procuringEntity: '',
            requestingEntity: '',
          },
          terms: {
            modeOfDelivery: values.value.modeOfDelivery,
            insufficientFundsAction: values.value.insufficientFundsAction,
            attachments: values.value.attachments,
            remarks: values.value.remarks,
          },
        }

        await createAPR({
          pathParams: {},
          payload,
        })

        toast.success('APR created successfully')
        setOpen(false)
        setSourceAPPId(null)
        setSelectedAppLineItemIds([])
        setConsolidatedItems([])
      } catch (error) {
        toast.error('Failed to create APR')
      }
    },
  })

  const handleSelectAPP = (appId: string, lineItemIds: string[], items: ConsolidatedAPRItem[]) => {
    setSourceAPPId(appId)
    setSelectedAppLineItemIds(lineItemIds)
    setConsolidatedItems(items)
    setSelectAPPDialogOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
    setSourceAPPId(null)
    setSelectedAppLineItemIds([])
    setConsolidatedItems([])
  }

  const handleOpenSelectAPP = () => {
    setSelectAPPDialogOpen(true)
  }

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
                    ✅ APP Selected
                  </p>
                  <p className="text-xs text-green-700">
                    {selectedAppLineItemIds.length} line items will be added to this APR
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenSelectAPP}
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
              {isPending ? 'Creating...' : 'Create APR'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
