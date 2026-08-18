/**
 * Create APR Dialog Component - Stepped Wizard Architecture
 *
 * Consolidated 4-step wizard for APR creation:
 * Step 1: Select source APP and line items
 * Step 2: Configure header information
 * Step 3: Configure terms & conditions
 * Step 4: Review & Submit
 */

import { useState, useMemo, useCallback } from 'react'
import { useAtom } from 'jotai'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  createAPRDialogOpenAtom,
  selectAPPDialogOpenAtom,
  selectedAPRFiscalYearAtom,
} from '../atoms'
import { useCreateAPRMutation, useFiscalYears } from '../handlers/hooks'
import { APRHeaderForm, APRTermsForm, SelectAPPForm, type SelectAppFormValues } from '../forms'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle2, ChevronRight, ArrowLeft, ArrowRight, FileText, Check } from 'lucide-react'

type Step = 1 | 2 | 3 | 4

const STEP_TITLES: Record<Step, { title: string; desc: string }> = {
  1: { title: 'Select Source APP & Line Items', desc: 'Step 1 of 4: Choose an approved APP and select line items to include' },
  2: { title: 'APR Header Information', desc: 'Step 2 of 4: Configure agency control number, account code, and description' },
  3: { title: 'Terms & Conditions', desc: 'Step 3 of 4: Configure delivery mode, insufficient funds action, and required attachments' },
  4: { title: 'Review & Create APR', desc: 'Step 4 of 4: Verify request summary before final submission' },
}

export function CreateAPRDialog() {
  const [createOpen, setCreateOpen] = useAtom(createAPRDialogOpenAtom)
  const [selectOpen, setSelectOpen] = useAtom(selectAPPDialogOpenAtom)
  const [selectedFiscalYear, setSelectedFiscalYear] = useAtom(selectedAPRFiscalYearAtom)

  const isOpen = createOpen || selectOpen

  const [step, setStep] = useState<Step>(1)
  const [sourceAPPId, setSourceAPPId] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [selectedApps, setSelectedApps] = useState<any[]>([])
  const [selectedAppLineItemIds, setSelectedAppLineItemIds] = useState<string[]>([])
  const [consolidatedItems, setConsolidatedItems] = useState<ConsolidatedAPRItem[]>([])

  const { mutateAsync: createAPR, isPending } = useCreateAPRMutation()

  // Live fiscal years fetch for Step 1
  const { data: fiscalYearsResponse, isLoading: fiscalYearsLoading } = useFiscalYears({
    enabled: isOpen,
  } as any)

  const fiscalYears = useMemo(() => {
    if (!fiscalYearsResponse) return []
    if (Array.isArray(fiscalYearsResponse)) return fiscalYearsResponse
    if (Array.isArray((fiscalYearsResponse as any).data)) return (fiscalYearsResponse as any).data
    if (Array.isArray((fiscalYearsResponse as any).items)) return (fiscalYearsResponse as any).items
    return []
  }, [fiscalYearsResponse])

  const selectedFYObj = useMemo(
    () => fiscalYears.find((fy: any) => fy.year === selectedFiscalYear),
    [fiscalYears, selectedFiscalYear]
  )

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
          setStep(1)
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

  const handleClose = useCallback(() => {
    setCreateOpen(false)
    setSelectOpen(false)
    setStep(1)
    setSourceAPPId(null)
    setSelectedApp(null)
    setSelectedApps([])
    setSelectedAppLineItemIds([])
    setConsolidatedItems([])
  }, [setCreateOpen, setSelectOpen])

  // Step 1 Form Handler
  const handleSelectAPPSubmit = (values: SelectAppFormValues) => {
    setSourceAPPId(values.selectedAppId)
    setSelectedApp(values.selectedApp)
    if (values.selectedApps) setSelectedApps(values.selectedApps)
    setSelectedAppLineItemIds(values.selectedLineItemIds)
    setConsolidatedItems(values.consolidatedItems)
    setStep(2)
  }

  const appDisplayName = useMemo(() => {
    if (selectedApps.length > 1) {
      return selectedApps.map((a) => a.appNumber || a.appCode || a.name).join(', ')
    }
    return selectedApp?.appNumber || selectedApp?.appCode || (sourceAPPId ? `APP ${sourceAPPId.substring(0, 8)}` : '')
  }, [selectedApps, selectedApp, sourceAPPId])

  const totalCalculatedBudget = useMemo(() => {
    return consolidatedItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
  }, [consolidatedItems])

  const formId = 'select-app-wizard-form'

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={(openVal) => { if (!openVal) handleClose() }}>
      <DialogContent className="max-h-[95vh] flex flex-col overflow-hidden" size="2xl">
        {/* Wizard Header */}
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5 text-primary" />
            {STEP_TITLES[step].title}
          </DialogTitle>
          <DialogDescription>
            {STEP_TITLES[step].desc}
          </DialogDescription>

          {/* Stepper Breadcrumb Nav */}
          <div className="pt-3 flex items-center justify-between gap-1 text-xs">
            {([1, 2, 3, 4] as Step[]).map((s) => {
              const isActive = step === s
              const isCompleted = step > s
              const canClick = isCompleted || (s === 1) || (s <= step)

              return (
                <div key={s} className="flex items-center gap-1.5 flex-1">
                  <button
                    type="button"
                    disabled={!canClick || isPending}
                    onClick={() => {
                      if (canClick) setStep(s)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                        : isCompleted
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center justify-center h-4 w-4 rounded-full text-[10px] bg-white/20">
                      {isCompleted ? <Check className="h-3 w-3 text-green-800" /> : s}
                    </span>
                    <span className="truncate">
                      {s === 1 && 'Source APP'}
                      {s === 2 && 'Details'}
                      {s === 3 && 'Terms'}
                      {s === 4 && 'Review'}
                    </span>
                  </button>
                  {s < 4 && <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />}
                </div>
              )
            })}
          </div>
        </DialogHeader>

        {/* Selected APP Banner (Steps 2-4) */}
        {step > 1 && sourceAPPId && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-blue-900 font-semibold truncate">
                Selected APP: <span className="font-mono text-primary">{appDisplayName}</span>
              </p>
              <p className="text-[11px] text-blue-700">
                {selectedAppLineItemIds.length} line items selected (Total: ?{totalCalculatedBudget.toLocaleString()})
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              className="border-blue-300 text-blue-800 hover:bg-blue-100 flex-shrink-0"
              onClick={() => setStep(1)}
              disabled={isPending}
            >
              Change APP
            </Button>
          </div>
        )}

        {/* Wizard Step Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* STEP 1: Source APP & Line Items */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Fiscal Year Selector */}
              <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">Fiscal Year</label>
                  {fiscalYearsLoading && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading fiscal years...
                    </span>
                  )}
                </div>
                <Select
                  value={selectedFiscalYear ? selectedFiscalYear.toString() : ''}
                  onValueChange={(val) => setSelectedFiscalYear(parseInt(val, 10))}
                  disabled={fiscalYearsLoading || fiscalYears.length === 0}
                >
                  <SelectTrigger className="w-full bg-white h-9 text-xs">
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    {fiscalYears.length > 0 ? (
                      fiscalYears.map((fy: any) => (
                        <SelectItem key={fy.id || fy.year} value={fy.year.toString()}>
                          FY {fy.year} {fy.status ? `(${fy.status})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value={selectedFiscalYear ? selectedFiscalYear.toString() : ''}>
                        FY {selectedFiscalYear || 2026}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <SelectAPPForm
                key={`${selectedFiscalYear}-${selectedFYObj?.id || ''}`}
                formId={formId}
                onSubmit={handleSelectAPPSubmit}
                fiscalYear={selectedFiscalYear}
                fiscalYearId={selectedFYObj?.id}
              />
            </div>
          )}

          {/* STEP 2: Header Information */}
          {step === 2 && (
            <div className="space-y-4">
              <APRHeaderForm form={form} />
            </div>
          )}

          {/* STEP 3: Terms & Conditions */}
          {step === 3 && (
            <div className="space-y-4">
              <APRTermsForm form={form} />
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    ?? Request Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <p className="text-muted-foreground">Source APP(s)</p>
                      <p className="font-semibold text-gray-900">{appDisplayName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fiscal Year</p>
                      <p className="font-semibold text-gray-900">FY {selectedFiscalYear}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Selected Line Items</p>
                      <p className="font-semibold text-primary">{selectedAppLineItemIds.length} items</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Budget</p>
                      <p className="font-semibold text-green-700">?{totalCalculatedBudget.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <p className="font-semibold text-gray-800">Header Information</p>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div><span className="font-medium">Control No:</span> {form.state.values.agencyControlNumber || 'N/A'}</div>
                      <div><span className="font-medium">Account Code:</span> {form.state.values.agencyAccountCode || 'N/A'}</div>
                      <div><span className="font-medium">Request Date:</span> {form.state.values.requestDate}</div>
                      <div><span className="font-medium">Description:</span> {form.state.values.description || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <p className="font-semibold text-gray-800">Terms & Conditions</p>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div><span className="font-medium">Delivery Mode:</span> <Badge variant="outline" className="text-[10px]">{form.state.values.modeOfDelivery}</Badge></div>
                      <div><span className="font-medium">Insufficient Funds:</span> <Badge variant="outline" className="text-[10px]">{form.state.values.insufficientFundsAction}</Badge></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Wizard Footer */}
        <DialogFooter className="mt-2 pt-3 border-t flex items-center justify-between gap-2 px-6 pb-4">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <Button type="submit" form={formId}>
                Continue to Details <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}

            {step === 2 && (
              <>
                <Button variant="outline" onClick={() => setStep(1)} disabled={isPending}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Source APP
                </Button>
                <Button onClick={() => setStep(3)} disabled={isPending}>
                  Continue to Terms <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <Button variant="outline" onClick={() => setStep(2)} disabled={isPending}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Details
                </Button>
                <Button onClick={() => setStep(4)} disabled={isPending}>
                  Continue to Review <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <Button variant="outline" onClick={() => setStep(3)} disabled={isPending}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Terms
                </Button>
                <Button onClick={() => form.handleSubmit()} disabled={isPending || !sourceAPPId}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating APR...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Create APR
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
