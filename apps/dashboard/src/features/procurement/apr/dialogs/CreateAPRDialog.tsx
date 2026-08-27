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
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAPRDialogOpenAtom,
  selectedAPRFiscalYearAtom,
} from '../atoms'
import { useCreateAPRMutation, useFiscalYears } from '../handlers/hooks'
import { invalidateAPRQueries } from '../utils/invalidateAPRQueries'
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

export interface SourceAPP {
  id: string
  appNumber?: string
  appCode?: string
  name?: string
  appName?: string
  officeId?: string
  fiscalYearId?: string
  status?: string
  FiscalYear?: { id: string; year: number }
  fiscalYear?: { id: string; year: number } | number
  APPItems?: any[]
  appItems?: any[]
  items?: any[]
  APPPPMPs?: any[]
  [key: string]: any
}

export interface WizardSelectionState {
  sourceAppId: string | null
  primaryApp: SourceAPP | null
  selectedApps: SourceAPP[]
  selectedLineItemIds: string[]
  consolidatedItems: ConsolidatedAPRItem[]
}

type Step = 1 | 2 | 3 | 4

const STEP_TITLES: Record<Step, { title: string; desc: string }> = {
  1: { title: 'Select Source APP & Line Items', desc: 'Step 1 of 4: Choose an approved APP and select line items to include' },
  2: { title: 'APR Header Information', desc: 'Step 2 of 4: Configure agency control number, account code, and description' },
  3: { title: 'Terms & Conditions', desc: 'Step 3 of 4: Configure delivery mode, insufficient funds action, and required attachments' },
  4: { title: 'Review & Create APR', desc: 'Step 4 of 4: Verify request summary before final submission' },
}

const SELECT_APP_FORM_ID = 'create-apr-select-app-form'
const FINAL_CREATE_APR_FORM_ID = 'create-apr-final-form'

const INITIAL_WIZARD_SELECTION: WizardSelectionState = {
  sourceAppId: null,
  primaryApp: null,
  selectedApps: [],
  selectedLineItemIds: [],
  consolidatedItems: [],
}

export function CreateAPRDialog() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useAtom(createAPRDialogOpenAtom)
  const [selectedFiscalYear, setSelectedFiscalYear] = useAtom(selectedAPRFiscalYearAtom)

  const [step, setStep] = useState<Step>(1)
  const [selection, setSelection] = useState<WizardSelectionState>(INITIAL_WIZARD_SELECTION)

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
    onSubmit: async (formValuesArg) => {
      try {
        const formValues = (formValuesArg as any)?.value ?? formValuesArg ?? form.state.values ?? {}

        if (!selection.sourceAppId || !selection.primaryApp) {
          toast.error('Please select an APP first.')
          setStep(1)
          return
        }

        if (selection.selectedLineItemIds.length === 0) {
          toast.error('Please select at least one line item.')
          setStep(1)
          return
        }

        // Strict extraction of officeId without silent dummy zero-UUID fallbacks
        const primary = selection.primaryApp
        const officeId =
          primary.officeId ||
          primary.APPItems?.[0]?.officeId ||
          primary.appItems?.[0]?.officeId ||
          primary.APPPPMPs?.[0]?.PPMP?.officeId ||
          primary.APPPPMPs?.[0]?.ppmp?.officeId ||
          primary.appppmPs?.[0]?.ppmp?.officeId

        if (!officeId || officeId === '00000000-0000-0000-0000-000000000000') {
          toast.error('Unable to determine the office for the selected APP. Please select a valid approved APP.')
          setStep(1)
          return
        }

        const fiscalYearId =
          primary.fiscalYearId ||
          primary.FiscalYear?.id ||
          (typeof primary.fiscalYear === 'object' ? primary.fiscalYear?.id : null)

        if (!fiscalYearId || fiscalYearId === '00000000-0000-0000-0000-000000000000') {
          toast.error('Unable to determine the fiscal year for the selected APP. Please select a valid approved APP.')
          setStep(1)
          return
        }

        const items = selection.selectedLineItemIds.map((lineItemId) => {
          const item = selection.consolidatedItems.find(
            (ci) => ci.appLineItemId === lineItemId || ci.id === lineItemId
          )
          const fallbackAppItem = selection.primaryApp?.APPItems?.find((ai: any) => ai.id === lineItemId) || selection.primaryApp?.appItems?.find((ai: any) => ai.id === lineItemId)
          const unitCost = item?.unitCost || fallbackAppItem?.unitCost || 0
          const totalAmount = item?.totalAmount || fallbackAppItem?.effectiveABC || fallbackAppItem?.totalAmount || 0
          const rawQty = item?.quantity || fallbackAppItem?.quantity
          const quantity = (rawQty && rawQty > 0)
            ? rawQty
            : (unitCost > 0 && totalAmount > 0)
              ? Math.round(totalAmount / unitCost)
              : 1

          return {
            appItemId: lineItemId,
            quantityRequested: quantity,
            unitCost,
          }
        })

        const commandPayload: CreateAPRCommandPayload = {
          appId: selection.sourceAppId,
          officeId,
          fiscalYearId,
          agencyControlNumber: formValues.agencyControlNumber || null,
          agencyAccountCode: formValues.agencyAccountCode || null,
          requestDate: (formValues.requestDate || new Date().toISOString()).split('T')[0],
          description: formValues.description || null,
          modeOfDelivery:
            formValues.modeOfDelivery === 'DOOR_TO_DOOR' || formValues.modeOfDelivery === 'DoorToDoor'
              ? ModeOfDelivery.DOOR_TO_DOOR
              : formValues.modeOfDelivery === 'SCHEDULED_PICKUP' || formValues.modeOfDelivery === 'ScheduledPickUp'
              ? ModeOfDelivery.SCHEDULED_PICKUP
              : ModeOfDelivery.FAST_LANE,
          insufficientFundsAction:
            formValues.insufficientFundsAction === 'BILL_US' || formValues.insufficientFundsAction === 'BillUs'
              ? InsufficientFundsAction.BILL_US
              : formValues.insufficientFundsAction === 'CHARGE_TO_DEPOSIT' || formValues.insufficientFundsAction === 'ChargeToUnutilizedDeposit'
              ? InsufficientFundsAction.CHARGE_TO_DEPOSIT
              : InsufficientFundsAction.REDUCE_QUANTITY,
          requiresObR: !!formValues.attachments?.observationReportRequired,
          requiresCBA: !!formValues.attachments?.collectiveBarterAgreementRequired,
          requiresCompleteSpecifications: !!formValues.attachments?.completeSpecsRequired,
          additionalRemarks: formValues.remarks || null,
          items,
        }

        await createAPR({
          pathParams: {},
          payload: commandPayload,
          body: commandPayload,
        } as any)

        // Invalidate APR list caches
        invalidateAPRQueries(queryClient)

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
    setIsOpen(false)
    setStep(1)
    setSelection(INITIAL_WIZARD_SELECTION)
  }, [setIsOpen])

  // Step 1 Submission Handler
  const handleSelectAPPSubmit = (values: SelectAppFormValues) => {
    setSelection({
      sourceAppId: values.selectedAppId,
      primaryApp: values.selectedApp || (values.selectedApps ? values.selectedApps[0] : null),
      selectedApps: values.selectedApps || (values.selectedApp ? [values.selectedApp] : []),
      selectedLineItemIds: values.selectedLineItemIds,
      consolidatedItems: values.consolidatedItems,
    })
    setStep(2)
  }

  // Per-step Validation Handlers
  const handleDetailsNext = () => {
    setStep(3)
  }

  const handleTermsNext = () => {
    setStep(4)
  }

  const appDisplayName = useMemo(() => {
    const appsList = selection.selectedApps
    if (appsList.length > 1) {
      return appsList.map((a) => a.appNumber || a.appCode || a.name).join(', ')
    }
    const single = selection.primaryApp
    return single?.appNumber || single?.appCode || (selection.sourceAppId ? `APP ${selection.sourceAppId.substring(0, 8)}` : '')
  }, [selection])

  const totalCalculatedBudget = useMemo(() => {
    return selection.consolidatedItems.reduce((sum, item) => {
      const amt = item.totalAmount || (item.unitCost || 0) * (item.quantity || 1) || 0
      return sum + amt
    }, 0)
  }, [selection.consolidatedItems])

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
        {step > 1 && selection.sourceAppId && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-blue-900 font-semibold truncate">
                Selected APP: <span className="font-mono text-primary">{appDisplayName}</span>
              </p>
              <p className="text-[11px] text-blue-700">
                {selection.selectedLineItemIds.length} line items selected (Total: ₱{totalCalculatedBudget.toLocaleString()})
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
                formId={SELECT_APP_FORM_ID}
                onSubmit={handleSelectAPPSubmit}
                fiscalYear={selectedFiscalYear}
                fiscalYearId={selectedFYObj?.id}
              />
            </div>
          )}

          {/* Persistent Form Container for Steps 2 & 3 (Keeps TanStack Form fields mounted) */}
          <form
            id={FINAL_CREATE_APR_FORM_ID}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            {/* STEP 2: Header Information */}
            <div className={step === 2 ? 'block space-y-4' : 'hidden'}>
              <APRHeaderForm form={form} />
            </div>

            {/* STEP 3: Terms & Conditions */}
            <div className={step === 3 ? 'block space-y-4' : 'hidden'}>
              <APRTermsForm form={form} />
            </div>
          </form>

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    📋 Request Summary
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
                      <p className="font-semibold text-primary">{selection.selectedLineItemIds.length} items</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Budget</p>
                      <p className="font-semibold text-green-700">₱{totalCalculatedBudget.toLocaleString()}</p>
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
                      <div>
                        <span className="font-medium">Delivery Mode:</span>{' '}
                        <Badge variant="outline" className="text-[10px]">
                          {form.state.values.modeOfDelivery === ModeOfDelivery.DOOR_TO_DOOR
                            ? 'Door-to-Door'
                            : form.state.values.modeOfDelivery === ModeOfDelivery.SCHEDULED_PICKUP
                            ? 'Scheduled Pick-up'
                            : 'Fast Lane'}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Insufficient Funds:</span>{' '}
                        <Badge variant="outline" className="text-[10px]">
                          {form.state.values.insufficientFundsAction === InsufficientFundsAction.BILL_US
                            ? 'Bill Us'
                            : form.state.values.insufficientFundsAction === InsufficientFundsAction.CHARGE_TO_DEPOSIT
                            ? 'Charge to Unutilized Deposit'
                            : 'Reduce Quantity'}
                        </Badge>
                      </div>
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
              <Button type="submit" form={SELECT_APP_FORM_ID}>
                Continue to Details <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}

            {step === 2 && (
              <>
                <Button variant="outline" onClick={() => setStep(1)} disabled={isPending}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Source APP
                </Button>
                <Button onClick={handleDetailsNext} disabled={isPending}>
                  Continue to Terms <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <Button variant="outline" onClick={() => setStep(2)} disabled={isPending}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Details
                </Button>
                <Button onClick={handleTermsNext} disabled={isPending}>
                  Continue to Review <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </>
            )}

            {step === 4 && (
              <>
                <Button variant="outline" onClick={() => setStep(3)} disabled={isPending}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to Terms
                </Button>
                <Button
                  type="submit"
                  form={FINAL_CREATE_APR_FORM_ID}
                  disabled={isPending || !selection.sourceAppId}
                >
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
