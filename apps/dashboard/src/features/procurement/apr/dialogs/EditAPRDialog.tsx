/**
 * Edit APR Dialog Component - Stepped Wizard Architecture
 *
 * Consolidated 4-step wizard for editing a Draft APR:
 * Step 1: Reselect/Select source APP and line items
 * Step 2: Update header information
 * Step 3: Update terms & conditions
 * Step 4: Review & Save APR Changes
 */

import { useState, useMemo, useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUpdateAPRMutation, useFiscalYears } from '../handlers/hooks'
import { invalidateAPRQueries } from '../utils/invalidateAPRQueries'
import { APRHeaderForm, APRTermsForm, SelectAPPForm, type SelectAppFormValues } from '../forms'
import {
  ModeOfDelivery,
  InsufficientFundsAction,
  type UpdateAPRCommandPayload,
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
import { Loader2, CheckCircle2, ChevronRight, ArrowLeft, ArrowRight, FileEdit, Check } from 'lucide-react'
import type { WizardSelectionState } from './CreateAPRDialog'

type Step = 1 | 2 | 3 | 4

const STEP_TITLES: Record<Step, { title: string; desc: string }> = {
  1: { title: 'Select / Update Source APP & Line Items', desc: 'Step 1 of 4: Choose an approved APP and select line items to include' },
  2: { title: 'APR Header Information', desc: 'Step 2 of 4: Update agency control number, account code, and description' },
  3: { title: 'Terms & Conditions', desc: 'Step 3 of 4: Update delivery mode, insufficient funds action, and required attachments' },
  4: { title: 'Review & Save Changes', desc: 'Step 4 of 4: Verify updated request summary before saving' },
}

const SELECT_APP_FORM_ID = 'edit-apr-select-app-form'
const FINAL_EDIT_APR_FORM_ID = 'edit-apr-final-form'

interface EditAPRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apr: any
  onSuccess?: () => void
}

export function EditAPRDialog({ open, onOpenChange, apr, onSuccess }: EditAPRDialogProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>(1)
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(
    apr?.fiscalYear || apr?.FiscalYear?.year || new Date().getFullYear()
  )

  const { mutateAsync: updateAPR, isPending } = useUpdateAPRMutation()

  // Live fiscal years fetch for Step 1
  const { data: fiscalYearsResponse, isLoading: fiscalYearsLoading } = useFiscalYears({
    enabled: open,
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

  const initialAppId = apr?.appId || apr?.sourceAPPId || apr?.APP?.id || null
  const initialAppItemIds = useMemo(() => {
    if (!apr?.items && !apr?.consolidatedItems) return []
    const items = apr.items || apr.consolidatedItems || []
    return items
      .map((i: any) => i.appItemId || i.appLineItemId)
      .filter((id: any): id is string => Boolean(id))
  }, [apr])

  const [selection, setSelection] = useState<WizardSelectionState>({
    sourceAppId: initialAppId,
    primaryApp: apr?.APP || null,
    selectedApps: apr?.APP ? [apr.APP] : [],
    selectedLineItemIds: initialAppItemIds,
    consolidatedItems: apr?.consolidatedItems || apr?.items || [],
  })

  // Sync state when APR changes or dialog re-opens
  useEffect(() => {
    if (open && apr) {
      const fy = apr.fiscalYear || apr.FiscalYear?.year || new Date().getFullYear()
      setSelectedFiscalYear(fy)
      const appId = apr.appId || apr.sourceAPPId || apr.APP?.id || null
      const items = apr.items || apr.consolidatedItems || []
      const itemIds = items
        .map((i: any) => i.appItemId || i.appLineItemId)
        .filter((id: any): id is string => Boolean(id))

      setSelection({
        sourceAppId: appId,
        primaryApp: apr.APP || null,
        selectedApps: apr.APP ? [apr.APP] : [],
        selectedLineItemIds: itemIds,
        consolidatedItems: items,
      })
      setStep(1)
    }
  }, [open, apr])

  const form = useForm({
    defaultValues: {
      agencyControlNumber: apr?.agencyControlNumber || '',
      agencyAccountCode: apr?.agencyAccountCode || '',
      description: apr?.description || '',
      requestDate: (apr?.requestDate || new Date().toISOString()).split('T')[0],
      fiscalYear: selectedFiscalYear,
      modeOfDelivery: apr?.modeOfDelivery || ModeOfDelivery.FAST_LANE,
      insufficientFundsAction: apr?.insufficientFundsAction || InsufficientFundsAction.REDUCE_QUANTITY,
      attachments: {
        observationReportRequired: !!(apr?.requiresObR || apr?.terms?.attachments?.observationReportRequired),
        collectiveBarterAgreementRequired: !!(apr?.requiresCBA || apr?.terms?.attachments?.collectiveBarterAgreementRequired),
        completeSpecsRequired: !!(apr?.requiresCompleteSpecifications || apr?.terms?.attachments?.completeSpecsRequired),
      },
      remarks: apr?.additionalRemarks || apr?.terms?.remarks || '',
    },
    onSubmit: async (formValuesArg) => {
      try {
        const formValues = (formValuesArg as any)?.value ?? formValuesArg ?? form.state.values ?? {}

        if (!selection.sourceAppId) {
          toast.error('Please select an APP first.')
          setStep(1)
          return
        }

        if (selection.selectedLineItemIds.length === 0) {
          toast.error('Please select at least one APP line item.')
          setStep(1)
          return
        }

        const items = selection.selectedLineItemIds.map((lineItemId) => {
          const item = selection.consolidatedItems.find(
            (ci) => ci.appLineItemId === lineItemId || ci.id === lineItemId || ci.appItemId === lineItemId
          )
          const rawQty = item?.quantity ?? (item as any)?.quantityRequested
          const unitCost = item?.unitCost ?? (item as any)?.estimatedUnitCost ?? 0
          const totalAmount = item?.totalAmount ?? (item as any)?.effectiveABC ?? 0
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

        const commandPayload: UpdateAPRCommandPayload = {
          id: apr.id,
          appId: selection.sourceAppId,
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

        await updateAPR({
          pathParams: { aprId: apr.id },
          payload: commandPayload,
          body: commandPayload,
        } as any)

        // Invalidate APR queries
        invalidateAPRQueries(queryClient)

        toast.success(`APR ${apr.aprNumber || ''} updated successfully`)
        onSuccess?.()
        onOpenChange(false)
      } catch (error: any) {
        console.error('Failed to update APR:', error)
        const msg = error?.response?.data?.message || error?.message || 'Failed to update APR'
        toast.error(msg)
      }
    },
  })

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

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] flex flex-col overflow-hidden" size="2xl">
        {/* Wizard Header */}
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileEdit className="h-5 w-5 text-primary" />
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
                {selection.selectedLineItemIds.length} APP line items selected (Total: ₱{totalCalculatedBudget.toLocaleString()})
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
                initialAppId={selection.sourceAppId || undefined}
                initialSelectedLineItemIds={selection.selectedLineItemIds}
                excludeAprId={apr.id}
              />
            </div>
          )}

          {/* Persistent Form Container for Steps 2 & 3 */}
          <form
            id={FINAL_EDIT_APR_FORM_ID}
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
                          {form.state.values.modeOfDelivery === 'DoorToDoor' || form.state.values.modeOfDelivery === 'DOOR_TO_DOOR'
                            ? 'Door-to-Door'
                            : form.state.values.modeOfDelivery === 'ScheduledPickUp' || form.state.values.modeOfDelivery === 'SCHEDULED_PICKUP'
                            ? 'Scheduled Pick-up'
                            : 'Fast Lane'}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Insufficient Funds:</span>{' '}
                        <Badge variant="outline" className="text-[10px]">
                          {form.state.values.insufficientFundsAction === 'BillUs' || form.state.values.insufficientFundsAction === 'BILL_US'
                            ? 'Bill Us'
                            : form.state.values.insufficientFundsAction === 'ChargeToUnutilizedDeposit' || form.state.values.insufficientFundsAction === 'CHARGE_TO_DEPOSIT'
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
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
                <Button
                  type="submit"
                  form={FINAL_EDIT_APR_FORM_ID}
                  disabled={isPending || !selection.sourceAppId}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Changes
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
