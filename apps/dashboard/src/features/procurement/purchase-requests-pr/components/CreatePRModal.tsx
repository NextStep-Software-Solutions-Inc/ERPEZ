/**
 * Create PR Modal
 * Dialog for creating new Purchase Requests with header details.
 * Redesigned using the Post-Qualification verification dialog as design basis.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
} from 'erpez-shared-lib'
import { useForm } from '@tanstack/react-form'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Loader2,
  Layers,
  Sparkles,
  FileText,
  Building2,
  CheckCircle2,
  Boxes,
} from 'lucide-react'
import * as z from 'zod'
import api from '@/services/api'
import { useCreatePurchaseRequest } from '../handlers/hooks'
import { toApiPrType, type CreatePurchaseRequestItemPayload } from '../types/apiTypes'
import type { EligibleAPRResponse } from '../handlers/getPurchaseRequestEligibleAprsRequest'
import { useDashboardRole } from '@/hooks/useDashboardRole'
import { categoryRequiresTorAttachment } from '../utils/torAttachment'
import type { PurchaseRequest, PRItem } from '../types'
import type { ProcurementCategory } from '@/lib/fiscal-year-and-policies/types'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import FileUpload from '@/components/features/planning/file-upload/FileUpload'
import { createFileRequest } from '@/components/features/planning/file-upload/handlers/createFileRequest'
import { useToast } from '@/components/ui/use-toast'
import { useProcurementCategories } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementCategories'
import FieldInfo from '@/components/FieldInfo'
import {
  getOfficesRequest,
  type Office,
} from '@/features/planning/app-consolidation/handlers/getOfficesRequest'

const createPRSchema = z.object({
  date: z.date(),
  prNumber: z.string().min(1, 'PR Number is required'),
  procurementCategoryId: z.string().min(1, 'Procurement category is required'),
  officeId: z.string().min(1, 'Office is required'),
  description: z.string().nullable(),
  purpose: z.string().min(1, 'Purpose is required'),
  torAttachment: z
    .object({
      name: z.string(),
      url: z.string(),
      mimeType: z.string(),
      size: z.number(),
      uploadedAt: z.string(),
    })
    .nullable(),
})

type CreatePRFormData = z.infer<typeof createPRSchema>
type TorAttachmentValue = CreatePRFormData['torAttachment']

const useUploadFile = createMutationHookFromTemplate(createFileRequest)
const useOffices = createQueryHookFromTemplate(getOfficesRequest)

interface CreatePRModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prType: 'non-cse' | 'out-of-stock' | 'consolidated'
  initialOfficeId?: string
  initialPurpose?: string
  initialAprId?: string
  initialAprNumber?: string
  onSuccess?: (pr: PurchaseRequest) => void
}

export function CreatePRModal({
  open,
  onOpenChange,
  prType,
  initialOfficeId,
  initialPurpose,
  initialAprId,
  initialAprNumber,
  onSuccess,
}: CreatePRModalProps) {
  const createPRMutation = useCreatePurchaseRequest()
  const { departmentId } = useDashboardRole()
  const { toast } = useToast()
  const [isIndependent, setIsIndependent] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [torUploadResetKey, setTorUploadResetKey] = useState(0)
  const uploadMutation = useUploadFile()

  const [sourceAprData, setSourceAprData] = useState<EligibleAPRResponse | null>(null)
  const [isLoadingAprItems, setIsLoadingAprItems] = useState(false)

  const { data: categoriesResponse, isLoading: isCategoriesLoading } =
    useProcurementCategories({
      pathParams: {},
      queryParams: {},
    })

  const { data: officesResponse, isLoading: isOfficesLoading } = useOffices({})

  const procurementCategories = useMemo<Array<ProcurementCategory>>(
    () => categoriesResponse?.data ?? [],
    [categoriesResponse],
  )

  const offices = useMemo<Array<Office>>(() => {
    if (Array.isArray(officesResponse)) return officesResponse
    if (Array.isArray((officesResponse as any)?.data)) return (officesResponse as any).data
    return []
  }, [officesResponse])

  // Fetch deficit items from APR when creating Out-of-Stock PR
  useEffect(() => {
    if (!open || prType !== 'out-of-stock' || !initialAprId) {
      setSourceAprData(null)
      return
    }

    let isMounted = true
    setIsLoadingAprItems(true)

    const fetchEligibleItems = async () => {
      try {
        const targetOfficeId = initialOfficeId || departmentId
        const endpoint = targetOfficeId
          ? `/purchase-requests/eligible-aprs?officeId=${targetOfficeId}`
          : `/purchase-requests/eligible-aprs`
        const res = await api.get<{ succeeded: boolean; data: EligibleAPRResponse[] }>(endpoint)
        if (!isMounted) return

        if (res.data?.succeeded === false) {
          throw new Error('API returned unsuccessful response when loading APR deficit items')
        }

        const allAprs = res.data?.data || []
        const matched = allAprs.find(
          (a) =>
            a.aprId.toLowerCase() === initialAprId.toLowerCase() ||
            (initialAprNumber && a.aprNumber.toLowerCase() === initialAprNumber.toLowerCase())
        ) || allAprs[0]

        if (matched) {
          setSourceAprData(matched)
        }
      } catch (err) {
        console.error('Failed to fetch eligible APR items for initial APR:', err)
        if (isMounted) {
          toast({
            variant: 'destructive',
            title: 'Failed to load APR deficit items',
            description: 'Could not fetch deficit items for this APR. Please try again or check your network connection.',
          })
        }
      } finally {
        if (isMounted) setIsLoadingAprItems(false)
      }
    }

    void fetchEligibleItems()

    return () => {
      isMounted = false
    }
  }, [open, prType, initialAprId, initialAprNumber, initialOfficeId, departmentId])

  const aprDeficitPayloadItems = useMemo<CreatePurchaseRequestItemPayload[]>(() => {
    if (!sourceAprData || !sourceAprData.items) return []
    return sourceAprData.items
      .filter((it) => it.deficit > 0)
      .map((it) => ({
        aprItemId: it.aprItemId,
        name: it.itemName,
        description: it.itemName,
        unitCost: it.unitPrice,
        requestedQuantity: it.deficit,
        isNonCSE: false,
        requestedMonth: 'January',
      }))
  }, [sourceAprData])

  const defaultValues: CreatePRFormData = {
    date: new Date(),
    prNumber: '',
    procurementCategoryId: '',
    officeId: initialOfficeId || '',
    description: initialAprNumber
      ? `Sourced from APR: ${initialAprNumber}${initialAprId ? ` [APR:${initialAprId}]` : ''}`
      : initialAprId
        ? `Sourced from APR: ${initialAprId} [APR:${initialAprId}]`
        : null,
    purpose: initialPurpose || (prType === 'out-of-stock' ? (initialAprNumber ? `Procurement of out-of-stock CSE items from ${initialAprNumber}` : 'Procurement of out-of-stock CSE items from approved APR') : ''),
    torAttachment: null,
  }

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createPRSchema,
    },
    onSubmit: async ({ value }) => {
      const selectedCategory = procurementCategories.find(
        (category) => category.id === value.procurementCategoryId,
      )
      const requiresTor = categoryRequiresTorAttachment(selectedCategory)

      try {
        const officeId = value.officeId
        const officeNameById = new Map(offices.map((office) => [office.id, office.name]))
        const payloadItems = aprDeficitPayloadItems.length > 0 ? aprDeficitPayloadItems : undefined
        const targetAprId = prType === 'out-of-stock' ? (initialAprId || sourceAprData?.aprId) : undefined
        const result = await createPRMutation.mutateAsync({
          pathParams: {},
          payload: {
            requestedDate: format(value.date, 'yyyy-MM-dd'),
            prNumber: value.prNumber,
            procurementCategoryId: value.procurementCategoryId,
            description: value.description ?? '',
            purpose: value.purpose,
            officeId,
            prType: toApiPrType(prType),
            aprId: targetAprId,
            items: payloadItems,
          },
        })

        if (!result.succeeded || !result.data) {
          throw new Error(result.message || 'Failed to create PR')
        }

        const newPRItems: PRItem[] = sourceAprData && aprDeficitPayloadItems.length > 0
          ? sourceAprData.items
              .filter((it) => it.deficit > 0)
              .map((it) => {
                const itemTotal = it.deficit * it.unitPrice
                return {
                  id: it.aprItemId,
                  itemId: it.aprItemId,
                  itemName: it.itemName,
                  category: it.category || 'Consolidated APR',
                  quantity: it.deficit,
                  unitOfMeasure: it.unit || 'unit',
                  unitPrice: it.unitPrice,
                  totalAmount: itemTotal,
                  month: 'January',
                  monthlyQuantities: { January: it.deficit },
                  fund: it.fund || '',
                  source: 'apr' as const,
                  aprId: sourceAprData.aprId,
                  aprNumber: sourceAprData.aprNumber,
                  aprOffice: sourceAprData.officeName,
                  aprGroup: {
                    id: sourceAprData.aprId,
                    aprId: sourceAprData.aprId,
                    aprNumber: sourceAprData.aprNumber,
                    officeName: sourceAprData.officeName,
                    totalAmount: sourceAprData.items.reduce((s, x) => s + (x.deficit * x.unitPrice), 0),
                    items: [{
                      id: it.aprItemId,
                      itemId: it.aprItemId,
                      itemName: it.itemName,
                      category: it.category || 'Consolidated APR',
                      quantity: it.deficit,
                      unitOfMeasure: it.unit || 'unit',
                      unitPrice: it.unitPrice,
                      totalAmount: itemTotal,
                      month: 'January',
                      monthlyQuantities: { January: it.deficit },
                      fund: it.fund || '',
                      source: 'apr' as const,
                      aprId: sourceAprData.aprId,
                      aprNumber: sourceAprData.aprNumber,
                      aprOffice: sourceAprData.officeName,
                    }],
                  },
                }
              })
          : []

        const newPRTotalAmount = newPRItems.reduce((s, it) => s + it.totalAmount, 0)

        const newPR: PurchaseRequest = {
          id: result.data,
          type: prType as PurchaseRequest['type'],
          status: 'draft',
          isIndependent,
          aprId: targetAprId,
          aprNumber: initialAprNumber || sourceAprData?.aprNumber,
          headerDetails: {
            date: format(value.date, 'yyyy-MM-dd'),
            prNumber: value.prNumber,
            description: value.description ?? '',
            purpose: value.purpose,
            officeId,
            officeName: officeNameById.get(officeId) ?? '',
            procurementCategoryId: selectedCategory?.id,
            procurementCategoryName: selectedCategory?.name,
            torRequired: requiresTor,
            isHighlyTechnicalGoodsServices:
              selectedCategory?.isHighlyTechnicalGoodsServices,
            isIndependent,
            sourceType: isIndependent ? 'INDEPENDENT' : 'APP_ITEM',
            aprId: targetAprId,
            aprNumber: initialAprNumber || sourceAprData?.aprNumber,
          },
          items: newPRItems,
          totalAmount: newPRTotalAmount,
          createdBy: 'current-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          torAttachment: requiresTor ? value.torAttachment : null,
        }

        if (initialAprId && typeof window !== 'undefined') {
          try {
            localStorage.setItem(
              `apr_pr_${initialAprId}`,
              JSON.stringify({
                id: result.data,
                prNumber: value.prNumber,
                status: 'Draft',
              })
            )
          } catch (err) {
            console.warn('Could not cache optimistic PR in localStorage:', err)
          }
        }

        toast({
          title: isIndependent ? 'Independent PR Created' : 'Purchase Request Created',
          description: isIndependent
            ? `PR ${value.prNumber} created. You can now add Non-CSE items.`
            : `PR ${value.prNumber} created. You can now add items from approved PPMP.`,
        })

        form.reset()
        onOpenChange(false)
        setTimeout(() => {
          onSuccess?.(newPR)
        }, 80)
      } catch (error) {
        console.error('Failed to create PR:', error)
        toast({
          title: 'Error Creating PR',
          description:
            'An error occurred while creating the purchase request. Please try again.',
        })
      }
    },
  })

  useEffect(() => {
    if (!departmentId || offices.length === 0) return
    const selected = form.getFieldValue('officeId')
    if (
      !selected &&
      offices.some((office) => office.id === departmentId)
    ) {
      form.setFieldValue('officeId', departmentId)
    }
  }, [departmentId, offices, form])

  const isSubmitting = form.state.isSubmitting || createPRMutation.isPending

  const uploadTorFile = async (
    file: File | null,
    onChange: (value: TorAttachmentValue) => void,
  ) => {
    if (!file) {
      onChange(null)
      return
    }

    try {
      const result = await uploadMutation.mutateAsync({
        pathParams: {},
        payload: { file },
      })

      if (!result.succeeded || !result.data) {
        throw new Error(result.message || 'Failed to upload TOR')
      }

      onChange({
        name: file.name,
        url: result.data,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      })
      setTorUploadResetKey((value) => value + 1)
    } catch (error) {
      console.error('Failed to upload TOR:', error)
      toast({
        title: 'TOR Upload Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Unable to attach the Terms of Reference. Please try again.',
      })
      setTorUploadResetKey((value) => value + 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 max-w-3xl">
        <form
          id="create-pr-form"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
        >
          {/* Header styled like PostQualResultDialog */}
          <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-default-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-extrabold text-default-900 dark:text-slate-50 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Create New Purchase Request
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {prType === 'non-cse'
                    ? 'Enter requisition details, select office and category, and configure PR source.'
                    : prType === 'out-of-stock'
                      ? 'Create a Purchase Request for Out-of-Stock CSE items from approved APR.'
                      : 'Create a Consolidated Purchase Request across offices.'}
                </DialogDescription>
              </div>
              <Badge
                variant="outline"
                className="font-bold bg-white dark:bg-slate-950 shadow-sm border-primary/30 text-primary uppercase text-[10px] tracking-wider px-2.5 py-1"
              >
                {isIndependent
                  ? 'Independent PR'
                  : prType === 'out-of-stock'
                    ? 'Out-of-Stock CSE'
                    : 'From Approved PPMP'}
              </Badge>
            </div>
          </DialogHeader>

          {/* Form Content Area */}
          <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
            {/* PR Type / Source Selection Cards (styled exactly like PostQual Result Radio Cards) */}
            {prType === 'non-cse' && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-default-700 dark:text-slate-300">
                  PR Type / Requisition Source <span className="text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={isIndependent ? 'independent' : 'ppmp'}
                  onValueChange={(val) => {
                    const nextIsIndependent = val === 'independent'
                    setIsIndependent(nextIsIndependent)
                    if (!nextIsIndependent) {
                      if (form.getFieldValue('prNumber')?.startsWith('PR-IND-')) {
                        form.setFieldValue('prNumber', '')
                      }
                    } else {
                      if (!form.getFieldValue('prNumber')) {
                        form.setFieldValue(
                          'prNumber',
                          `PR-IND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
                        )
                      }
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="src-ppmp"
                    onClick={() => {
                      setIsIndependent(false)
                      if (form.getFieldValue('prNumber')?.startsWith('PR-IND-')) {
                        form.setFieldValue('prNumber', '')
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      !isIndependent
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                        : 'border-default-200 dark:border-slate-800 hover:bg-default-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="mt-0.5">
                      <RadioGroupItem value="ppmp" id="src-ppmp" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-default-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-primary" />
                        From Approved PPMP
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Standard PR linked to items allocated in approved office PPMPs.
                      </p>
                    </div>
                  </label>

                  <label
                    htmlFor="src-independent"
                    onClick={() => {
                      setIsIndependent(true)
                      if (!form.getFieldValue('prNumber')) {
                        form.setFieldValue(
                          'prNumber',
                          `PR-IND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
                        )
                      }
                    }}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isIndependent
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm ring-1 ring-amber-500'
                        : 'border-default-200 dark:border-slate-800 hover:bg-default-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="mt-0.5">
                      <RadioGroupItem value="independent" id="src-independent" color="warning" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-default-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Independent PR
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Standalone PR for direct non-CSE catalog or custom items.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* Row 1: PR Date & PR Number (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="date">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-default-800 dark:text-slate-200">
                      PR Date <span className="text-destructive">*</span>
                    </Label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-9 text-xs"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                          {field.state.value ? format(field.state.value, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => {
                            field.handleChange(date ?? new Date())
                            setIsDatePickerOpen(false)
                          }}
                          disabled={(date: Date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>

              <form.Field name="prNumber">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-default-800 dark:text-slate-200">
                      PR Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder={isIndependent ? 'e.g., PR-IND-2026-1001' : 'e.g., PR-2026-001'}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      className="h-9 text-xs"
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Row 2: Office & Procurement Category (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <form.Field name="officeId">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-default-800 dark:text-slate-200 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      Requesting Office <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      disabled={isOfficesLoading || isSubmitting || uploadMutation.isPending}
                      onValueChange={(value) => field.handleChange(value)}
                      value={field.state.value}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder={isOfficesLoading ? 'Loading offices...' : 'Select an office'} />
                      </SelectTrigger>
                      <SelectContent>
                        {offices.map((office) => (
                          <SelectItem key={office.id} value={office.id} className="text-xs">
                            {office.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>

              <form.Field name="procurementCategoryId">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-default-800 dark:text-slate-200">
                      Procurement Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      disabled={isCategoriesLoading || isSubmitting || uploadMutation.isPending}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        const nextCategory = procurementCategories.find((category) => category.id === value)
                        if (!categoryRequiresTorAttachment(nextCategory)) {
                          form.setFieldValue('torAttachment', null)
                        }
                      }}
                      value={field.state.value}
                    >
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder={isCategoriesLoading ? 'Loading categories...' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {procurementCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-xs">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Row 3: Purpose (Required Textarea) */}
            <form.Field name="purpose">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-default-800 dark:text-slate-200">
                    Purpose / Justification <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="State the specific operational justification or purpose of this purchase requisition..."
                    className="resize-none text-xs"
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            {/* Auto-attached APR Items Banner for Out-of-Stock PR */}
            {prType === 'out-of-stock' && initialAprId && (
              <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Sourced Items from {sourceAprData?.aprNumber || initialAprNumber || 'APR'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold bg-white dark:bg-slate-900 border-indigo-200 text-indigo-700">
                    {isLoadingAprItems ? 'Loading...' : `${aprDeficitPayloadItems.length} item(s) to import`}
                  </Badge>
                </div>
                {isLoadingAprItems ? (
                  <div className="flex items-center gap-2 py-1 text-xs text-indigo-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Loading deficit items from APR...</span>
                  </div>
                ) : sourceAprData && aprDeficitPayloadItems.length > 0 ? (
                  <div className="space-y-1.5 pt-1 border-t border-indigo-100 dark:border-indigo-900/60">
                    {sourceAprData.items
                      .filter((it) => it.deficit > 0)
                      .map((it) => (
                        <div key={it.aprItemId} className="flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
                          <span>{it.itemName} ({it.deficit} {it.unit || 'units'} deficit)</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            ₱{(it.deficit * it.unitPrice).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300 pt-1">
                      These deficit items will be automatically attached to this Purchase Request upon creation.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    No unreserved deficit items found for this APR.
                  </p>
                )}
              </div>
            )}

            {/* Row 4: Description (Optional Textarea) */}
            <form.Field name="description">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-default-800 dark:text-slate-200">
                    Description / Remarks <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    placeholder="Optional background details, delivery location instructions, or notes..."
                    className="resize-none text-xs"
                    rows={2}
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      field.handleChange(nextValue === '' ? null : nextValue)
                    }}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            </form.Field>

            {/* Terms of Reference (TOR) section if required */}
            <form.Subscribe
              selector={(state) => {
                const selectedCategory = procurementCategories.find(
                  (category) => category.id === state.values?.procurementCategoryId
                )
                return categoryRequiresTorAttachment(selectedCategory)
              }}
            >
              {(requiresTor) => {
                if (!requiresTor) return null

                return (
                  <form.Field
                    name="torAttachment"
                    validators={{
                      onSubmit: ({ value }) => {
                        if (!value?.url) {
                          return 'Terms of Reference is required for the selected category.'
                        }
                        return undefined
                      },
                    }}
                  >
                    {(field) => (
                      <div
                        className={`space-y-3 rounded-lg border p-4 ${
                          field.state.meta.errors.length > 0
                            ? 'border-destructive bg-destructive/5'
                            : 'border-amber-200 bg-amber-50/40 dark:bg-amber-950/20'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                            Terms of Reference (TOR) Required
                          </p>
                          <p className="text-[11px] text-amber-800/80 dark:text-amber-400">
                            Upload a PDF or Word document (up to 10 MB) mandatory for this category.
                          </p>
                        </div>

                        <FileUpload
                          key={torUploadResetKey}
                          acceptedTypes=".pdf,.doc,.docx"
                          disabled={isSubmitting || uploadMutation.isPending}
                          existingFileName={field.state.value?.name}
                          existingFileUrl={field.state.value?.url}
                          maxSize={10}
                          validationState={field.state.meta.errors.length > 0 ? 'error' : 'default'}
                          onFileChange={(file) => {
                            void uploadTorFile(file, field.handleChange)
                          }}
                        />

                        {uploadMutation.isPending && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Uploading TOR...
                          </div>
                        )}

                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                )
              }}
            </form.Subscribe>
          </div>

          {/* Footer styled like PostQualResultDialog */}
          <DialogFooter className="p-4 bg-default-50 dark:bg-slate-900/60 border-t border-default-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 font-bold shadow-sm text-white bg-primary hover:bg-primary/90"
              disabled={isSubmitting || uploadMutation.isPending}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating PR...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Purchase Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
