import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Check,
  ChevronsUpDown,
  Loader2,
  FileText,
  Layers,
  CheckCircle2,
  Search,
  Filter,
  Building2,
  Wallet,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  PackageCheck,
  Plus,
  Trash2,
  GripVertical,
  Lock,
  Unlock,
  CheckCheck,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type {
  EligibleAppForProcurement,
  EligibleAppItem,
  EligibleConsolidatedPR,
  ProcurementSourceType,
  ResolutionClause,
  ResolutionClauseType,
} from '../types'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getEligibleAppsForProcurementRequest } from '../handlers/getEligibleAppsForProcurementRequest'
import { getEligibleConsolidatedPRsRequest } from '../handlers/getEligibleConsolidatedPRsRequest'
import { getResolutionClausesRequest } from '../handlers/getResolutionClausesRequest'
import { createResolutionClauseRequest } from '../handlers/createResolutionClauseRequest'
import { getUsersRequest } from '@/features/planning/market-scoping/handlers/getUsersRequest'

const useEligibleAppsForProcurement = createQueryHookFromTemplate(getEligibleAppsForProcurementRequest)
const useEligibleConsolidatedPRs = createQueryHookFromTemplate(getEligibleConsolidatedPRsRequest)
const useResolutionClauses = createQueryHookFromTemplate(getResolutionClausesRequest)
const useCreateResolutionClause = createMutationHookFromTemplate(createResolutionClauseRequest)
const useUsers = createQueryHookFromTemplate(getUsersRequest)

import FieldInfo from '@/components/FieldInfo'
import type { User } from '@/services/api/users'
import type { CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'
import { CreateEditResolutionClauseDialog } from '../dialogs/CreateEditResolutionClauseDialog'
import { ResolutionClausePickerModal } from '../dialogs/ResolutionClausePickerModal'

export const createBacResolutionSchema = z.object({
  appItemId: z.string().optional(),
  appItemIds: z.array(z.string()).optional(),
  consolidatedPRId: z.string().optional(),
  title: z.string().min(1, 'Title is required.'),
  abc: z.number().min(0, 'ABC must be at least 0.'),
  resolutionType: z.string().min(1, 'Resolution type is required.'),
  resolutionNumber: z.string().min(1, 'Resolution number is required.'),
  dateResolved: z.string().min(1, 'Date resolved is required.'),
  resolvedLocation: z.string().optional(),
  whereasClauses: z
    .array(z.object({
      resolutionClauseId: z.string(),
      order: z.number(),
    }))
    .min(1, 'At least one WHEREAS clause must be selected.'),
  nowThereforeClauses: z
    .array(z.object({
      resolutionClauseId: z.string(),
      order: z.number(),
    }))
    .optional(),
  resolvedClauses: z
    .array(z.object({
      resolutionClauseId: z.string(),
      order: z.number(),
    }))
    .optional(),
  endUserRepresentativeId: z.string().optional(),
  techRepresentativeId: z.string().optional(),
})

export type CreateBacResolutionFormValues = z.infer<
  typeof createBacResolutionSchema
>

export interface CreateBacResolutionWizardRef {
  getFormValues: () => CreateBacResolutionFormValues | null
  getCurrentStep: () => 1 | 2 | 3
  isSubmitting: () => boolean
  nextStep: () => Promise<void>
  backStep: () => void
  submit: () => Promise<void>
}

interface CreateBacResolutionFormProps {
  onSubmit: (values: CreateBacResolutionPayload) => Promise<void> | void
  onCancel?: () => void
  initialValues?: Partial<CreateBacResolutionPayload>
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  formId?: string
  currentStep?: 1 | 2 | 3
  setCurrentStep?: React.Dispatch<React.SetStateAction<1 | 2 | 3>>
  onStepChange?: (step: 1 | 2 | 3) => void
  onCanProceedChange?: (canProceed: boolean) => void
  onSuccess?: () => void
}

export const CreateBacResolutionForm = forwardRef<
  CreateBacResolutionWizardRef,
  CreateBacResolutionFormProps
>(
  (
    {
      onSubmit,
      initialValues,
      isLoading = false,
      onDirtyChange,
      formId,
      currentStep: externalCurrentStep,
      setCurrentStep: externalSetCurrentStep,
      onCanProceedChange,
      onSuccess,
    },
    ref,
  ) => {
    const [internalCurrentStep, setInternalCurrentStep] = useState<1 | 2 | 3>(1)
    const currentStep = externalCurrentStep ?? internalCurrentStep
    const setCurrentStep = externalSetCurrentStep ?? setInternalCurrentStep

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const [selectedSourceType, setSelectedSourceType] =
      useState<ProcurementSourceType | null>(null)

    // Multi-APP Item selection state:
    const [lockedAppId, setLockedAppId] = useState<string | null>(null)
    const [selectedAppItems, setSelectedAppItems] = useState<EligibleAppItem[]>([])

    const [selectedConsolidatedPr, setSelectedConsolidatedPr] =
      useState<EligibleConsolidatedPR | null>(null)

    // Clause state:
    const [whereasClauses, setWhereasClauses] = useState<{ resolutionClauseId: string; order: number }[]>([])
    const [nowThereforeClauses, setNowThereforeClauses] = useState<{ resolutionClauseId: string; order: number }[]>([])
    const [resolvedClauses, setResolvedClauses] = useState<{ resolutionClauseId: string; order: number }[]>([])

    // Modals state:
    const [pickerModalType, setPickerModalType] = useState<ResolutionClauseType | null>(null)
    const [createModalType, setCreateModalType] = useState<ResolutionClauseType | null>(null)

    // Collapsible sections state:
    const [isWhereasExpanded, setIsWhereasExpanded] = useState(true)
    const [isNowThereforeExpanded, setIsNowThereforeExpanded] = useState(false)
    const [isResolvedExpanded, setIsResolvedExpanded] = useState(false)

    // Fetch clauses for the picker modal based on active type
    const { data: resolutionClausesData, isPending: isClausesPending } =
      useResolutionClauses({
        pathParams: {},
        queryParams: { PageSize: 200, ClauseType: pickerModalType || undefined },
        enabled: pickerModalType !== null,
      })

    const clauseTemplates = useMemo<ResolutionClause[]>(() => {
      if (!resolutionClausesData) return []
      if (Array.isArray(resolutionClausesData.data)) {
        return resolutionClausesData.data
      }
      if (Array.isArray(resolutionClausesData)) {
        return resolutionClausesData
      }
      return []
    }, [resolutionClausesData])

    // Load full clause lookup for rendering names/bodies
    const { data: allClausesData } = useResolutionClauses({
      pathParams: {},
      queryParams: { PageSize: 500 },
    })

    const allClausesMap = useMemo(() => {
      const map = new Map<string, ResolutionClause>()
      const list = Array.isArray(allClausesData?.data)
        ? allClausesData.data
        : Array.isArray(allClausesData)
        ? allClausesData
        : []
      for (const item of list) {
        map.set(item.id, item)
      }
      return map
    }, [allClausesData])

    const { data: appsData } = useEligibleAppsForProcurement({})
    const allApps = useMemo<EligibleAppForProcurement[]>(() => {
      return appsData?.data || []
    }, [appsData?.data])

    const lockedApp = useMemo(() => {
      if (!lockedAppId) return null
      return allApps.find((a) => a.id === lockedAppId) || null
    }, [lockedAppId, allApps])

    const derivedTitle = useMemo(() => {
      if (selectedSourceType === 'AppItem') {
        if (selectedAppItems.length === 1) {
          return (
            selectedAppItems[0].ppmpItemName ||
            selectedAppItems[0].description ||
            selectedAppItems[0].remarks ||
            ''
          )
        }
        if (selectedAppItems.length > 1) {
          const appNum = lockedApp?.appNumber || 'APP'
          return `${appNum} — ${selectedAppItems.length} Items`
        }
      }
      if (selectedSourceType === 'ConsolidatedPr' && selectedConsolidatedPr) {
        return (
          selectedConsolidatedPr.projectName ||
          selectedConsolidatedPr.description
        )
      }
      return ''
    }, [selectedSourceType, selectedAppItems, lockedApp, selectedConsolidatedPr])

    const inheritedAbc = useMemo(() => {
      if (selectedSourceType === 'AppItem') {
        return selectedAppItems.reduce((sum, item) => sum + item.effectiveABC, 0)
      }
      if (selectedSourceType === 'ConsolidatedPr' && selectedConsolidatedPr) {
        return selectedConsolidatedPr.totalAmount
      }
      return 0
    }, [selectedSourceType, selectedAppItems, selectedConsolidatedPr])

    const { data: usersData, isPending: isUsersLoading } = useUsers({
      pathParams: {},
      queryParams: { PageSize: 100 },
    })

    const users = useMemo<User[]>(() => {
      if (!usersData) return []
      if (Array.isArray(usersData.data)) return usersData.data
      if (Array.isArray(usersData)) return usersData
      return []
    }, [usersData])

    const createClauseMutation = useCreateResolutionClause()

    const handleCreateCustomClause = async (
      name: string,
      body: string,
      type: ResolutionClauseType,
    ) => {
      const created = await createClauseMutation.mutateAsync({
        pathParams: {},
        payload: { name, body, clauseType: type },
      })

      if (type === 'Whereas') {
        setWhereasClauses((prev) => [
          ...prev,
          { resolutionClauseId: created.id, order: prev.length },
        ])
      } else if (type === 'NowTherefore') {
        setNowThereforeClauses((prev) => [
          ...prev,
          { resolutionClauseId: created.id, order: prev.length },
        ])
      } else if (type === 'Resolved') {
        setResolvedClauses((prev) => [
          ...prev,
          { resolutionClauseId: created.id, order: prev.length },
        ])
      }

      toast.success(`Custom ${type} Clause created and added to resolution.`)
    }

    const defaultResNumber = `BAC-RES-2026-${Math.floor(
      100 + Math.random() * 900,
    )}`

    const form = useForm({
      defaultValues: {
        appItemId: initialValues?.appItemId || undefined,
        appItemIds: initialValues?.appItemIds || [],
        consolidatedPRId: initialValues?.consolidatedPRId || undefined,
        title: initialValues?.title ?? derivedTitle ?? '',
        abc: initialValues?.abc ?? inheritedAbc ?? 0,
        resolutionType: initialValues?.resolutionType ?? 'award-recommendation',
        resolutionNumber: initialValues?.resolutionNumber ?? defaultResNumber,
        dateResolved:
          initialValues?.dateResolved ??
          new Date().toISOString().split('T')[0],
        resolvedLocation: initialValues?.resolvedLocation || '',
        whereasClauses: whereasClauses,
        nowThereforeClauses: nowThereforeClauses,
        resolvedClauses: resolvedClauses,
        endUserRepresentativeId: initialValues?.endUserRepresentativeId || undefined,
        techRepresentativeId: initialValues?.techRepresentativeId || undefined,
      },
      onSubmit: async ({ value }) => {
        setIsSubmitting(true)
        setSubmitError(null)

        if (whereasClauses.length === 0) {
          toast.error('At least one WHEREAS clause must be selected.')
          setIsSubmitting(false)
          return
        }

        try {
          const payload: CreateBacResolutionPayload = {
            sourceType: selectedSourceType === 'AppItem' ? 'APPItem' : 'ConsolidatedPR',
            appItemId: selectedAppItems[0]?.id,
            appItemIds: selectedAppItems.map((i) => i.id),
            consolidatedPRId: selectedConsolidatedPr?.id,
            title: value.title,
            abc: inheritedAbc > 0 ? inheritedAbc : value.abc,
            resolutionType: value.resolutionType,
            resolutionNumber: value.resolutionNumber,
            dateResolved: value.dateResolved,
            resolvedLocation: value.resolvedLocation,
            whereasClauses: whereasClauses.map((c, idx) => ({
              whereasClauseId: c.resolutionClauseId,
              order: idx,
            })),
            whereasClauseLinks: whereasClauses.map((c, idx) => ({
              resolutionClauseId: c.resolutionClauseId,
              order: idx,
            })),
            nowThereforeClauses: nowThereforeClauses.map((c, idx) => ({
              resolutionClauseId: c.resolutionClauseId,
              order: idx,
            })),
            resolvedClauses: resolvedClauses.map((c, idx) => ({
              resolutionClauseId: c.resolutionClauseId,
              order: idx,
            })),
            endUserRepresentativeId: value.endUserRepresentativeId,
            techRepresentativeId: value.techRepresentativeId,
          }

          await onSubmit(payload)
          onSuccess?.()
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Failed to create BAC Resolution'
          setSubmitError(errorMsg)
          toast.error(errorMsg)
        } finally {
          setIsSubmitting(false)
        }
      },
    })

    // Sync title & ABC when source selection changes
    useEffect(() => {
      if (derivedTitle) {
        form.setFieldValue('title', derivedTitle)
      }
      form.setFieldValue('abc', inheritedAbc)
    }, [derivedTitle, inheritedAbc, form])

    // Update parent canProceed status based on step requirements
    useEffect(() => {
      if (currentStep === 1) {
        onCanProceedChange?.(selectedSourceType !== null)
      } else if (currentStep === 2) {
        const canProceed =
          (selectedSourceType === 'AppItem' && selectedAppItems.length > 0) ||
          (selectedSourceType === 'ConsolidatedPr' &&
            selectedConsolidatedPr !== null)
        onCanProceedChange?.(canProceed)
      } else if (currentStep === 3) {
        onCanProceedChange?.(true)
      }
    }, [
      currentStep,
      selectedSourceType,
      selectedAppItems,
      selectedConsolidatedPr,
      onCanProceedChange,
    ])

    useEffect(() => {
      onDirtyChange?.(form.state.isDirty || currentStep > 1)
    }, [form.state.isDirty, currentStep, onDirtyChange])

    const handleNextStep = async () => {
      if (currentStep === 1) {
        if (!selectedSourceType) {
          toast.error('Please select a procurement source type')
          return
        }
        setCurrentStep(2)
      } else if (currentStep === 2) {
        const hasSelection =
          (selectedSourceType === 'AppItem' && selectedAppItems.length > 0) ||
          (selectedSourceType === 'ConsolidatedPr' &&
            selectedConsolidatedPr !== null)
        if (!hasSelection) {
          toast.error(
            selectedSourceType === 'AppItem'
              ? 'Please select at least one APP Item to proceed'
              : 'Please select a Consolidated PR to proceed',
          )
          return
        }
        setCurrentStep(3)
      }
    }

    const handleBackStep = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => (prev === 1 ? 1 : prev - 1) as 1 | 2 | 3)
      }
    }

    const handleSubmit = async () => {
      setSubmitError(null)
      await form.handleSubmit()
    }

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getFormValues: () => {
          return form.state.values as CreateBacResolutionFormValues
        },
        getCurrentStep: () => currentStep,
        isSubmitting: () => isSubmitting,
        nextStep: handleNextStep,
        backStep: handleBackStep,
        submit: handleSubmit,
      }),
      [currentStep, isSubmitting, form.state.values, selectedSourceType, selectedAppItems, selectedConsolidatedPr],
    )

    return (
      <div className="space-y-6">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-center gap-2 py-2 border-b border-default-200">
          {[
            { step: 1, label: 'Source Type' },
            { step: 2, label: 'Source Record' },
            { step: 3, label: 'Resolution Details' },
          ].map(({ step, label }) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors',
                  currentStep === step
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                    : currentStep > step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {currentStep > step ? '✓' : step}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:inline-block',
                  currentStep === step
                    ? 'text-primary font-bold'
                    : currentStep > step
                      ? 'text-emerald-700'
                      : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {step < 3 && (
                <div
                  className={cn(
                    'w-6 sm:w-10 h-0.5 transition-colors',
                    currentStep > step ? 'bg-emerald-500' : 'bg-muted',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: SELECT SOURCE TYPE */}
        {currentStep === 1 && (
          <SourceTypeSelectorStep
            selectedSourceType={selectedSourceType}
            onSelectSourceType={(type) => {
              setSelectedSourceType(type)
              setLockedAppId(null)
              setSelectedAppItems([])
              setSelectedConsolidatedPr(null)
            }}
          />
        )}

        {/* STEP 2: SELECT SOURCE RECORD (TWO-PANEL APP LOCK-IN OR CPR) */}
        {currentStep === 2 && selectedSourceType && (
          <SourceRecordPickerStep
            sourceType={selectedSourceType}
            lockedAppId={lockedAppId}
            onSetLockedAppId={setLockedAppId}
            selectedAppItems={selectedAppItems}
            onSetSelectedAppItems={setSelectedAppItems}
            selectedConsolidatedPr={selectedConsolidatedPr}
            onSelectConsolidatedPr={setSelectedConsolidatedPr}
          />
        )}

        {/* STEP 3: RESOLUTION DETAILS */}
        {currentStep === 3 && (
          <form
            id={formId}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {submitError && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <p className="font-semibold">Creation Error</p>
                <p className="text-xs mt-1">{submitError}</p>
              </div>
            )}

            {/* Read-Only Selected Items Summary Table (when APPItem source) */}
            {selectedSourceType === 'AppItem' && selectedAppItems.length > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-primary" />
                    <h4 className="font-bold text-sm text-default-900">
                      Selected APP Line Items ({selectedAppItems.length})
                    </h4>
                    {lockedApp && (
                      <Badge variant="outline" className="bg-white text-primary border-primary/30 text-xs">
                        {lockedApp.appNumber}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Parent APP: <span className="text-default-900">{lockedApp?.name || 'Annual Procurement Plan'}</span>
                  </span>
                </div>

                <div className="overflow-hidden rounded-md border border-default-200 bg-white">
                  <Table>
                    <TableHeader className="bg-default-50">
                      <TableRow>
                        <TableHead className="w-[100px] text-xs font-bold">Item #</TableHead>
                        <TableHead className="text-xs font-bold">Description / Line Item</TableHead>
                        <TableHead className="text-xs font-bold">Implementing Office</TableHead>
                        <TableHead className="text-xs font-bold">Mode of Procurement</TableHead>
                        <TableHead className="text-right text-xs font-bold">Approved Budget (ABC)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedAppItems.map((item, idx) => (
                        <TableRow key={item.id} className="text-xs">
                          <TableCell className="font-semibold text-primary">
                            {item.itemNumber || `Item ${(idx + 1).toString().padStart(2, '0')}`}
                          </TableCell>
                          <TableCell className="font-medium text-default-900 max-w-[280px]">
                            <p className="truncate font-semibold">{item.ppMPItemName || item.description}</p>
                            {item.remarks && (
                              <p className="text-[11px] text-muted-foreground truncate">{item.remarks}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-default-700">{item.officeName || '—'}</TableCell>
                          <TableCell className="text-default-700">{item.procurementModeName || '—'}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700">
                            ₱{item.effectiveABC.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Total ABC Summary Footer Row */}
                      <TableRow className="bg-default-50/80 font-bold border-t-2 border-default-300">
                        <TableCell colSpan={4} className="text-right text-xs uppercase tracking-wider text-default-800">
                          Total Approved Budget for Contract (ABC):
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-emerald-700">
                          ₱{inheritedAbc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Read-Only CPR Summary Table (when ConsolidatedPR source) */}
            {selectedSourceType === 'ConsolidatedPr' && selectedConsolidatedPr && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-700" />
                    <h4 className="font-bold text-sm text-default-900">
                      Linked Consolidated Purchase Request
                    </h4>
                  </div>
                  <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300 font-semibold">
                    {selectedConsolidatedPr.prNumber}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Project:</span>
                    <p className="font-semibold text-default-900 truncate">{selectedConsolidatedPr.projectName || selectedConsolidatedPr.description}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End-User Office:</span>
                    <p className="font-semibold text-default-900">{selectedConsolidatedPr.endUser || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mode:</span>
                    <p className="font-semibold text-default-900">{selectedConsolidatedPr.modeOfProcurementName || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Budget:</span>
                    <p className="font-bold text-emerald-700">₱{selectedConsolidatedPr.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            )}

            {/* General Project & Resolution Info */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-5 shadow-xs">
              <h4 className="font-bold text-sm text-default-900 border-b border-default-200 pb-2">
                Resolution Metadata
              </h4>

              {/* Title & ABC Fields */}
              <div className="grid gap-5 md:grid-cols-3">
                <div className="md:col-span-2">
                  <form.Field name="title">
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Project Title *</Label>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Procurement Project Title"
                          disabled={isLoading || isSubmitting}
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>

                <div>
                  <form.Field name="abc">
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Approved Budget (ABC) *</Label>
                        <Input
                          id={field.name}
                          type="number"
                          step="0.01"
                          value={field.state.value}
                          disabled={true}
                          className="bg-default-100 font-semibold cursor-not-allowed text-default-700"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Read-only budget computed from selected line items.
                        </p>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>
              </div>

              {/* Resolution Number, Type, Date Resolved, & Resolved Location */}
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <form.Field name="resolutionNumber">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Resolution Number *</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="BAC-RES-2026-001"
                        disabled={isLoading || isSubmitting}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="resolutionType">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Resolution Type *</Label>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isSubmitting}
                        className="h-10 rounded-md border border-default-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="award-recommendation">
                          Award Recommendation
                        </option>
                        <option value="procurement-mode-recommendation">
                          Procurement Mode Recommendation
                        </option>
                      </select>
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="dateResolved">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Date Resolved *</Label>
                      <Input
                        id={field.name}
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isSubmitting}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="resolvedLocation">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Resolved Location</Label>
                      <Input
                        id={field.name}
                        value={field.state.value || ''}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. BAC Conference Room, Main Bldg"
                        disabled={isLoading || isSubmitting}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Representatives Section */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4 shadow-xs">
              <h4 className="font-bold text-sm text-default-900 border-b border-default-200 pb-2">
                Resolution Representatives
              </h4>
              <div className="grid gap-5 md:grid-cols-2">
                <form.Field name="endUserRepresentativeId">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>End-User Representative</Label>
                      {isUsersLoading ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Loading users...
                        </div>
                      ) : (
                        <UserPickerCombobox
                          value={field.state.value}
                          onChange={(userId) => field.handleChange(userId)}
                          users={users}
                          disabled={isSubmitting}
                          placeholder="Select End-User Representative..."
                        />
                      )}
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="techRepresentativeId">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Technical Representative</Label>
                      {isUsersLoading ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Loading users...
                        </div>
                      ) : (
                        <UserPickerCombobox
                          value={field.state.value}
                          onChange={(userId) => field.handleChange(userId)}
                          users={users}
                          disabled={isSubmitting}
                          placeholder="Select Technical Representative..."
                        />
                      )}
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* THREE COLLAPSIBLE CLAUSE SECTIONS */}
            <div className="space-y-4">
              {/* 1. WHEREAS CLAUSES (REQUIRED) */}
              <ClauseSection
                title="WHEREAS Clauses"
                description="Legal context and background clauses for this resolution."
                badgeRequired={true}
                items={whereasClauses}
                clausesMap={allClausesMap}
                isExpanded={isWhereasExpanded}
                onToggleExpand={() => setIsWhereasExpanded((prev) => !prev)}
                onOpenPicker={() => setPickerModalType('Whereas')}
                onOpenCreate={() => setCreateModalType('Whereas')}
                onChangeItems={setWhereasClauses}
              />

              {/* 2. NOW, THEREFORE CLAUSES (OPTIONAL) */}
              <ClauseSection
                title="NOW, THEREFORE Clauses"
                description="Committee premise and transition clauses."
                badgeRequired={false}
                items={nowThereforeClauses}
                clausesMap={allClausesMap}
                isExpanded={isNowThereforeExpanded}
                onToggleExpand={() => setIsNowThereforeExpanded((prev) => !prev)}
                onOpenPicker={() => setPickerModalType('NowTherefore')}
                onOpenCreate={() => setCreateModalType('NowTherefore')}
                onChangeItems={setNowThereforeClauses}
              />

              {/* 3. RESOLVED CLAUSES (OPTIONAL) */}
              <ClauseSection
                title="RESOLVED Clauses"
                description="Final resolution decisions and award recommendations."
                badgeRequired={false}
                items={resolvedClauses}
                clausesMap={allClausesMap}
                isExpanded={isResolvedExpanded}
                onToggleExpand={() => setIsResolvedExpanded((prev) => !prev)}
                onOpenPicker={() => setPickerModalType('Resolved')}
                onOpenCreate={() => setCreateModalType('Resolved')}
                onChangeItems={setResolvedClauses}
              />
            </div>
          </form>
        )}

        {/* Modal: Clause Picker from Repository */}
        {pickerModalType && (
          <ResolutionClausePickerModal
            open={pickerModalType !== null}
            onOpenChange={(open) => {
              if (!open) setPickerModalType(null)
            }}
            clauseType={pickerModalType}
            templates={clauseTemplates}
            initialSelected={
              pickerModalType === 'Whereas'
                ? whereasClauses
                : pickerModalType === 'NowTherefore'
                ? nowThereforeClauses
                : resolvedClauses
            }
            onApply={(selected) => {
              if (pickerModalType === 'Whereas') {
                setWhereasClauses(selected)
              } else if (pickerModalType === 'NowTherefore') {
                setNowThereforeClauses(selected)
              } else if (pickerModalType === 'Resolved') {
                setResolvedClauses(selected)
              }
              setPickerModalType(null)
            }}
            onCreateCustom={() => {
              const currentType = pickerModalType
              setPickerModalType(null)
              setCreateModalType(currentType)
            }}
            isPending={isClausesPending}
          />
        )}

        {/* Modal: Create Custom Clause */}
        {createModalType && (
          <CreateEditResolutionClauseDialog
            open={createModalType !== null}
            onOpenChange={(open) => {
              if (!open) setCreateModalType(null)
            }}
            defaultClauseType={createModalType}
            onSave={async (name, body, type) => {
              await handleCreateCustomClause(name, body, type)
            }}
            isSubmitting={createClauseMutation.isPending}
          />
        )}
      </div>
    )
  },
)

CreateBacResolutionForm.displayName = 'CreateBacResolutionForm'

/* ── STEP 1: SOURCE TYPE SELECTOR ────────────────────────────────────────── */
interface SourceTypeSelectorStepProps {
  selectedSourceType: ProcurementSourceType | null
  onSelectSourceType: (type: ProcurementSourceType) => void
}

export function SourceTypeSelectorStep({
  selectedSourceType,
  onSelectSourceType,
}: SourceTypeSelectorStepProps) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <h3 className="text-lg font-semibold text-default-900">
          Step 1: Choose Procurement Source Type
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Select how you want to initiate this BAC Resolution project.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 pt-2">
        {/* Path A: From APP Items */}
        <div
          onClick={() => onSelectSourceType('AppItem')}
          className={cn(
            'relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all hover:border-primary hover:shadow-md',
            selectedSourceType === 'AppItem'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-default-200 bg-white',
          )}
        >
          {selectedSourceType === 'AppItem' && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-semibold text-primary text-xs">
                  Path A — APP Line Items
                </span>
              </div>
              <h4 className="mt-2 font-bold text-base text-default-900">
                From Annual Procurement Plan (APP)
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Create a BAC Resolution directly by multi-selecting approved APP items within the same Annual Procurement Plan.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-default-100 p-2.5 text-xs text-default-600">
            <span className="font-semibold text-default-700">Workflow:</span> APP → APP Items (Multi-select) → ProcurementProject → BAC Resolution → Execution
          </div>
        </div>

        {/* Path B: From Consolidated PR */}
        <div
          onClick={() => onSelectSourceType('ConsolidatedPr')}
          className={cn(
            'relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all hover:border-primary hover:shadow-md',
            selectedSourceType === 'ConsolidatedPr'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-default-200 bg-white',
          )}
        >
          {selectedSourceType === 'ConsolidatedPr' && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800 text-xs">
                  Path B — Consolidated PR Driven
                </span>
              </div>
              <h4 className="mt-2 font-bold text-base text-default-900">
                From Consolidated PR
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Create a BAC Resolution from an approved Consolidated Purchase Request (CPR) containing multiple combined PR items.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-default-100 p-2.5 text-xs text-default-600">
            <span className="font-semibold text-default-700">Workflow:</span> APP → PR → Consolidated PR → ProcurementProject → BAC Resolution → Execution
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── STEP 2: TWO-PANEL SOURCE RECORD PICKER ───────────────────────────────── */
interface SourceRecordPickerStepProps {
  sourceType: ProcurementSourceType
  lockedAppId: string | null
  onSetLockedAppId: (id: string | null) => void
  selectedAppItems: EligibleAppItem[]
  onSetSelectedAppItems: React.Dispatch<React.SetStateAction<EligibleAppItem[]>>
  selectedConsolidatedPr: EligibleConsolidatedPR | null
  onSelectConsolidatedPr: (cpr: EligibleConsolidatedPR) => void
}

export function SourceRecordPickerStep({
  sourceType,
  lockedAppId,
  onSetLockedAppId,
  selectedAppItems,
  onSetSelectedAppItems,
  selectedConsolidatedPr,
  onSelectConsolidatedPr,
}: SourceRecordPickerStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [itemSearchTerm, setItemSearchTerm] = useState('')
  const [officeFilter, setOfficeFilter] = useState('ALL')

  const { data: appsData, isLoading: isAppsLoading } =
    useEligibleAppsForProcurement({})
  const { data: cprsData, isLoading: isCprsLoading } =
    useEligibleConsolidatedPRs({})

  const allApps = useMemo<EligibleAppForProcurement[]>(() => {
    return appsData?.data || []
  }, [appsData?.data])

  const filteredApps = useMemo(() => {
    if (!searchTerm.trim()) return allApps
    const term = searchTerm.toLowerCase()
    return allApps.filter(
      (app) =>
        app.appNumber.toLowerCase().includes(term) ||
        app.name.toLowerCase().includes(term) ||
        app.fiscalYearName.toLowerCase().includes(term),
    )
  }, [allApps, searchTerm])

  const lockedApp = useMemo(() => {
    if (!lockedAppId) return null
    return allApps.find((a) => a.id === lockedAppId) || null
  }, [lockedAppId, allApps])

  const lockedAppItems = useMemo(() => {
    if (!lockedApp) return []
    return lockedApp.eligibleItems
  }, [lockedApp])

  const filteredLockedAppItems = useMemo(() => {
    return lockedAppItems.filter((item) => {
      const matchesSearch =
        !itemSearchTerm.trim() ||
        item.description.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        item.itemNumber.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        item.officeName.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        item.procurementModeName.toLowerCase().includes(itemSearchTerm.toLowerCase())
      const matchesOffice =
        officeFilter === 'ALL' || item.officeName === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [lockedAppItems, itemSearchTerm, officeFilter])

  const availableOffices = useMemo(() => {
    if (lockedApp) {
      return Array.from(
        new Set(lockedAppItems.map((i) => i.officeName).filter(Boolean)),
      )
    }
    return []
  }, [lockedApp, lockedAppItems])

  const handleToggleAppItem = (item: EligibleAppItem) => {
    onSetSelectedAppItems((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      if (exists) {
        return prev.filter((i) => i.id !== item.id)
      } else {
        return [...prev, item]
      }
    })
  }

  const handleSelectAllVisible = () => {
    onSetSelectedAppItems((prev) => {
      const currentIds = new Set(prev.map((i) => i.id))
      const toAdd = filteredLockedAppItems.filter((i) => !currentIds.has(i.id))
      return [...prev, ...toAdd]
    })
  }

  const handleDeselectAllVisible = () => {
    const visibleIds = new Set(filteredLockedAppItems.map((i) => i.id))
    onSetSelectedAppItems((prev) => prev.filter((i) => !visibleIds.has(i.id)))
  }

  const handleUnlockApp = () => {
    if (selectedAppItems.length > 0) {
      if (
        !window.confirm(
          'Switching APP will clear your currently selected items. Proceed?',
        )
      ) {
        return
      }
    }
    onSetSelectedAppItems([])
    onSetLockedAppId(null)
  }

  const totalSelectedABC = useMemo(() => {
    return selectedAppItems.reduce((sum, i) => sum + i.effectiveABC, 0)
  }, [selectedAppItems])

  // Consolidated PR list filtering:
  const filteredConsolidatedPrs = useMemo(() => {
    return (cprsData?.data || []).filter((cpr) => {
      const matchesSearch =
        !searchTerm.trim() ||
        cpr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.endUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.modeOfProcurementName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesOffice =
        officeFilter === 'ALL' || cpr.endUser === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [cprsData?.data, searchTerm, officeFilter])

  if (sourceType === 'ConsolidatedPr') {
    return (
      <div className="space-y-4 py-2">
        <div>
          <h3 className="text-lg font-semibold text-default-900">
            Select Approved Consolidated PR
          </h3>
          <p className="text-xs text-muted-foreground">
            Only approved Consolidated PRs available for BAC resolution are listed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by CPR #, project description, end-user office..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>

        {isCprsLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            Loading Consolidated PRs...
          </div>
        ) : filteredConsolidatedPrs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-8 text-center text-sm text-muted-foreground">
            No eligible Consolidated PRs match your search.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-default-200 bg-white max-h-[420px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-default-50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[120px]">CPR Number</TableHead>
                  <TableHead>Project Description</TableHead>
                  <TableHead>End-User Office</TableHead>
                  <TableHead>Procurement Mode</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="w-[100px] text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsolidatedPrs.map((cpr) => {
                  const isSelected = selectedConsolidatedPr?.id === cpr.id
                  return (
                    <TableRow
                      key={cpr.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected ? 'bg-primary/5 font-semibold' : 'hover:bg-default-50',
                      )}
                      onClick={() => onSelectConsolidatedPr(cpr)}
                    >
                      <TableCell className="font-bold text-primary">{cpr.prNumber}</TableCell>
                      <TableCell className="font-medium text-default-900">{cpr.projectName || cpr.description}</TableCell>
                      <TableCell className="text-default-700">{cpr.endUser}</TableCell>
                      <TableCell className="text-default-700">{cpr.modeOfProcurementName}</TableCell>
                      <TableCell className="text-right font-bold text-emerald-700">
                        ₱{cpr.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-xs font-semibold"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectConsolidatedPr(cpr)
                          }}
                        >
                          {isSelected ? 'Selected ✓' : 'Select'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    )
  }

  // APP ITEM: TWO-PANEL LAYOUT
  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-default-900">
            Step 2: Select APP & Multi-Select Line Items
          </h3>
          <p className="text-xs text-muted-foreground">
            Lock in one Annual Procurement Plan on the left, then select one or multiple line items on the right.
          </p>
        </div>
        {lockedApp && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold px-2.5 py-1">
              <Lock className="h-3 w-3 mr-1" /> Locked in: {lockedApp.appNumber}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleUnlockApp}
              className="text-xs h-7 text-muted-foreground hover:text-destructive"
            >
              <Unlock className="h-3 w-3 mr-1" /> Switch APP
            </Button>
          </div>
        )}
      </div>

      {isAppsLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          Loading Annual Procurement Plans...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[480px]">
          {/* LEFT PANEL: APP LIST (LOCK-IN SELECTOR) */}
          <div className="md:col-span-4 rounded-xl border border-default-200 bg-default-50/50 p-3.5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-default-700">
                1. Select Parent APP
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {filteredApps.length} Plans
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search APPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[420px] pr-1">
              {filteredApps.map((app) => {
                const isLocked = lockedAppId === app.id
                const isOtherDisabled = lockedAppId !== null && !isLocked
                const count = app.eligibleItems.length
                const totalBudget = app.eligibleItems.reduce((s, i) => s + i.effectiveABC, 0)

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      if (lockedAppId && lockedAppId !== app.id) {
                        handleUnlockApp()
                      }
                      onSetLockedAppId(app.id)
                    }}
                    className={cn(
                      'group relative rounded-lg border p-3 transition-all cursor-pointer select-none text-left',
                      isLocked
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                        : isOtherDisabled
                        ? 'border-default-200 bg-white/50 opacity-60 hover:opacity-100 hover:border-default-300'
                        : 'border-default-200 bg-white hover:border-primary/50 hover:bg-primary/5',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-default-900 truncate">
                        {app.appNumber}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                        {app.fiscalYearName || 'FY 2026'}
                      </span>
                    </div>

                    <p className="text-[11px] text-default-700 font-medium line-clamp-2 mt-1">
                      {app.name}
                    </p>

                    <div className="mt-2 pt-2 border-t border-default-100 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-medium text-default-600">
                        {count} item{count !== 1 ? 's' : ''}
                      </span>
                      <span className="font-bold text-emerald-700">
                        ₱{totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )
              })}

              {filteredApps.length === 0 && (
                <div className="rounded-lg border border-dashed border-default-200 bg-white p-6 text-center text-xs text-muted-foreground">
                  No APPs match your search.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: ITEMS MULTI-CHECKBOX SELECTOR */}
          <div className="md:col-span-8 rounded-xl border border-default-200 bg-white p-4 flex flex-col space-y-3">
            {!lockedApp ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed border-default-200 rounded-lg">
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <h4 className="text-sm font-bold text-default-800">No Annual Procurement Plan Locked</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Click on an Annual Procurement Plan from the left list to view and multi-select its eligible line items.
                </p>
              </div>
            ) : (
              <>
                {/* Header with Search & Multi-select controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-default-900">
                        {lockedApp.appNumber} Line Items
                      </span>
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
                        {selectedAppItems.length} selected
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[400px]">
                      {lockedApp.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllVisible}
                      className="h-7 text-xs gap-1"
                    >
                      <CheckCheck className="h-3 w-3" /> Select All Visible
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleDeselectAllVisible}
                      disabled={selectedAppItems.length === 0}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-destructive"
                    >
                      <RotateCcw className="h-3 w-3" /> Deselect All
                    </Button>
                  </div>
                </div>

                {/* Search & Office filter bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search items by description, mode, item #..."
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-xs bg-default-50"
                    />
                  </div>

                  {availableOffices.length > 0 && (
                    <select
                      value={officeFilter}
                      onChange={(e) => setOfficeFilter(e.target.value)}
                      className="h-8 rounded-md border border-default-300 bg-white px-2.5 text-xs text-default-800 focus:border-primary focus:outline-none"
                    >
                      <option value="ALL">All Offices</option>
                      {availableOffices.map((office) => (
                        <option key={office} value={office}>
                          {office}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Items Table */}
                <div className="flex-1 overflow-y-auto max-h-[340px] border border-default-200 rounded-lg">
                  <Table>
                    <TableHeader className="bg-default-50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-[44px] text-center"></TableHead>
                        <TableHead className="w-[90px] text-xs font-bold">Item #</TableHead>
                        <TableHead className="text-xs font-bold">Description</TableHead>
                        <TableHead className="text-xs font-bold">Office</TableHead>
                        <TableHead className="text-xs font-bold">Mode</TableHead>
                        <TableHead className="text-right text-xs font-bold">Effective ABC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLockedAppItems.map((item) => {
                        const isChecked = selectedAppItems.some((i) => i.id === item.id)
                        return (
                          <TableRow
                            key={item.id}
                            onClick={() => handleToggleAppItem(item)}
                            className={cn(
                              'cursor-pointer text-xs select-none transition-colors',
                              isChecked ? 'bg-primary/5 font-semibold' : 'hover:bg-default-50/70',
                            )}
                          >
                            <TableCell className="text-center p-2" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleToggleAppItem(item)}
                              />
                            </TableCell>
                            <TableCell className="font-bold text-primary">{item.itemNumber}</TableCell>
                            <TableCell className="font-medium text-default-900 max-w-[220px]">
                              <p className="truncate">{item.ppMPItemName || item.description}</p>
                              {item.remarks && (
                                <p className="text-[10px] text-muted-foreground truncate">{item.remarks}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-default-700">{item.officeName || '—'}</TableCell>
                            <TableCell className="text-default-700">{item.procurementModeName || '—'}</TableCell>
                            <TableCell className="text-right font-bold text-emerald-700">
                              ₱{item.effectiveABC.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        )
                      })}

                      {filteredLockedAppItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                            No eligible line items match your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Selection Summary Bar */}
                <div className="rounded-lg bg-default-50 border border-default-200 p-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-default-700">
                    {selectedAppItems.length} of {lockedAppItems.length} items selected
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Combined ABC:</span>
                    <span className="text-sm font-bold text-emerald-700">
                      ₱{totalSelectedABC.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── CLAUSE SECTION COMPONENT (COLLAPSIBLE) ──────────────────────────────── */
interface ClauseSectionProps {
  title: string
  description: string
  badgeRequired: boolean
  items: { resolutionClauseId: string; order: number }[]
  clausesMap: Map<string, ResolutionClause>
  isExpanded: boolean
  onToggleExpand: () => void
  onOpenPicker: () => void
  onOpenCreate: () => void
  onChangeItems: (items: { resolutionClauseId: string; order: number }[]) => void
}

function ClauseSection({
  title,
  description,
  badgeRequired,
  items,
  clausesMap,
  isExpanded,
  onToggleExpand,
  onOpenPicker,
  onOpenCreate,
  onChangeItems,
}: ClauseSectionProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const removeItem = (id: string) => {
    const next = items
      .filter((c) => c.resolutionClauseId !== id)
      .map((c, idx) => ({ resolutionClauseId: c.resolutionClauseId, order: idx }))
    onChangeItems(next)
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    const newArr = [...items]
    const temp = newArr[index - 1]
    newArr[index - 1] = newArr[index]
    newArr[index] = temp
    onChangeItems(newArr.map((item, idx) => ({ ...item, order: idx })))
  }

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return
    const newArr = [...items]
    const temp = newArr[index + 1]
    newArr[index + 1] = newArr[index]
    newArr[index] = temp
    onChangeItems(newArr.map((item, idx) => ({ ...item, order: idx })))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    const sourceIndexStr = e.dataTransfer.getData('text/plain')
    const sourceIndex = sourceIndexStr ? parseInt(sourceIndexStr, 10) : draggedIndex
    if (sourceIndex === null || sourceIndex === undefined || isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDraggedIndex(null)
      return
    }

    const updated = [...items]
    const [removed] = updated.splice(sourceIndex, 1)
    updated.splice(targetIndex, 0, removed)
    onChangeItems(updated.map((item, idx) => ({ ...item, order: idx })))
    setDraggedIndex(null)
  }

  return (
    <div className="rounded-lg border border-default-200 bg-white overflow-hidden shadow-xs">
      <div
        onClick={onToggleExpand}
        className="p-3.5 bg-default-50/70 flex items-center justify-between cursor-pointer select-none hover:bg-default-100/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-sm text-default-900">{title}</h4>
          {badgeRequired ? (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-semibold">
              Required (≥1)
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] text-muted-foreground">
              Optional
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] font-bold">
            {items.length} selected
          </Badge>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCreate}
            className="h-7 text-xs gap-1 text-default-700 border-default-300 hover:bg-default-100"
          >
            <Plus className="h-3 w-3" /> Custom
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onOpenPicker}
            className="h-7 text-xs font-semibold gap-1"
          >
            <FileText className="h-3 w-3" /> Add from Library
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="h-7 w-7 text-muted-foreground"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 border-t border-default-200">
          <p className="text-xs text-muted-foreground">{description}</p>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-default-200 bg-default-50/50 p-6 text-center text-xs text-muted-foreground">
              No clauses added yet. Click &quot;Add from Library&quot; or &quot;Custom&quot; to add clauses.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => {
                const clauseObj = clausesMap.get(item.resolutionClauseId)
                return (
                  <div
                    key={item.resolutionClauseId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={cn(
                      'group flex items-start gap-3 p-3 rounded-lg border bg-white shadow-xs transition-all',
                      draggedIndex === index
                        ? 'opacity-40 border-primary border-dashed'
                        : 'border-default-200 hover:border-default-300',
                    )}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground group-hover:text-default-700 flex items-center justify-center h-6 w-4 mt-0.5">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-default-900">
                          {clauseObj?.name || 'Clause'}
                        </span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => moveUp(index)}
                            className="h-6 w-6 text-muted-foreground hover:text-default-900"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index === items.length - 1}
                            onClick={() => moveDown(index)}
                            className="h-6 w-6 text-muted-foreground hover:text-default-900"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.resolutionClauseId)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {clauseObj?.body || ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── USER PICKER COMBOBOX ─────────────────────────────────────────────────── */
interface UserPickerComboboxProps {
  value?: string
  onChange: (userId: string) => void
  users: User[]
  disabled?: boolean
  placeholder?: string
}

export function UserPickerCombobox({
  value,
  onChange,
  users,
  disabled = false,
  placeholder = 'Select user...',
}: UserPickerComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedUser = useMemo(() => {
    return users.find((u) => u.id === value)
  }, [users, value])

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users
    const term = search.toLowerCase()
    return users.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    )
  }, [users, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal text-xs h-10 border-default-300"
        >
          {selectedUser ? (
            <span className="truncate">
              {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            placeholder="Search representatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-7 w-full rounded-md bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-[220px] overflow-y-auto p-1 space-y-0.5">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                onChange(user.id)
                setOpen(false)
              }}
              className={cn(
                'flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs cursor-pointer hover:bg-default-100 transition-colors',
                value === user.id ? 'bg-primary/10 font-semibold text-primary' : 'text-default-900',
              )}
            >
              <div>
                <p>{user.firstName} {user.lastName}</p>
                <p className="text-[10px] text-muted-foreground">{user.email}</p>
              </div>
              {value === user.id && <Check className="h-3.5 w-3.5 text-primary" />}
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No users found.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
