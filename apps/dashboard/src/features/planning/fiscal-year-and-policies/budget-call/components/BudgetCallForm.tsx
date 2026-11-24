import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { pascalCaseToWords } from '@/utils/formatters'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { createBudgetCallRequest } from '@/lib/fiscal-year-and-policies/requests/createBudgetCallRequest'
import { updateBudgetCallRequest } from '@/lib/fiscal-year-and-policies/requests/updateBudgetCallRequest'
import { changeBudgetCallStatusRequest } from '@/lib/fiscal-year-and-policies/requests/changeBudgetCallStatusRequest'
import type {
  BudgetCall,
  BudgetCallWithLegacy,
} from '@/lib/fiscal-year-and-policies/types'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { FiscalYear } from '../../fiscal-year-management/types/types'

interface BudgetCallFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetCall?: BudgetCall
  defaultFiscalYearId?: string
}

const BUDGET_CALL_TYPES = [
  'InitialProposal',
  'SupplementalBudget',
  'BudgetRevision',
  'MidYearReview',
  'YearEndAdjustment',
] as const

type BudgetCallType = (typeof BUDGET_CALL_TYPES)[number]
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useCreateBudgetCall = createMutationHookFromTemplate(
  createBudgetCallRequest,
)
const useUpdateBudgetCall = createMutationHookFromTemplate(
  updateBudgetCallRequest,
)
const useChangeBudgetCallStatus = createMutationHookFromTemplate(
  changeBudgetCallStatusRequest,
)
export function BudgetCallForm({
  open,
  onOpenChange,
  budgetCall,
  defaultFiscalYearId,
}: BudgetCallFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!budgetCall

  const [fiscalYearId, setFiscalYearId] = useState('')
  const [type, setType] = useState<BudgetCallType | ''>('')
  const [submissionDeadline, setSubmissionDeadline] = useState('') // yyyy-mm-dd
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { data: fiscalYearsData } = useFiscalYears({
    pathParams: {},
    queryParams: {
      pageSize: 100,
      sorts: 'year',
    },
  })

  const createMutation = useCreateBudgetCall()
  const updateMutation = useUpdateBudgetCall()
  const changeStatusMutation = useChangeBudgetCallStatus()

  useEffect(() => {
    if (budgetCall && open) {
      setFiscalYearId(budgetCall.fiscalYearId)

      // support both canonical `submissionDeadline` and legacy `endDate`
      const budgetCallWithLegacy = budgetCall as BudgetCallWithLegacy
      const dl =
        budgetCallWithLegacy.submissionDeadline ??
        budgetCallWithLegacy.endDate ??
        ''
      setSubmissionDeadline(dl ? new Date(dl).toISOString().split('T')[0] : '')

      setType(budgetCallWithLegacy.type ?? 'InitialProposal')
      setErrors({})
    } else if (open) {
      setFiscalYearId(defaultFiscalYearId || '')
      setType('')
      setSubmissionDeadline('')
      setErrors({})
    } else {
      setFiscalYearId('')
      setType('')
      setSubmissionDeadline('')
      setErrors({})
    }
  }, [budgetCall, open, defaultFiscalYearId])

  const handleClose = () => {
    onOpenChange(false)
    setFiscalYearId('')
    setType('')
    setSubmissionDeadline('')
    setErrors({})
  }

  const handleUpdateAndActivate = async () => {
    if (!budgetCall) return

    const newErrors: { [key: string]: string } = {}
    if (!type) newErrors.type = 'Type is required'
    if (!submissionDeadline)
      newErrors.submissionDeadline = 'Submission deadline is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const dlDate = new Date(submissionDeadline)
    const payloadSubmissionDeadline = dlDate.toISOString()

    try {
      await updateMutation.mutateAsync({
        pathParams: { id: budgetCall.id },
        payload: {
          type: type || undefined,
          submissionDeadline: payloadSubmissionDeadline,
        },
      })

      await changeStatusMutation.mutateAsync({
        pathParams: { id: budgetCall.id },
        payload: { status: 'Active' },
      })

      toast.success('Budget call updated and activated successfully')
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/budget-calls')
        },
      })
      handleClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update and activate budget call')
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { [key: string]: string } = {}

    if (!fiscalYearId) newErrors.fiscalYearId = 'Fiscal year is required'
    if (!type) newErrors.type = 'Type is required'
    if (!submissionDeadline)
      newErrors.submissionDeadline = 'Submission deadline is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const dlDate = new Date(submissionDeadline)
    // Only enforce future date for new budget calls
    if (!isEditing) {
      const now = new Date()
      if (isNaN(dlDate.getTime()) || dlDate <= now) {
        toast.error('Submission deadline must be a future date')
        return
      }
    }

    const payloadSubmissionDeadline = dlDate.toISOString()

    if (isEditing) {
      updateMutation.mutate(
        {
          pathParams: { id: budgetCall.id },
          payload: {
            type: type || undefined,
            submissionDeadline: payloadSubmissionDeadline,
          },
        },
        {
          onSuccess: () => {
            toast.success('Budget call updated successfully')
            void queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0]
                return (
                  typeof key === 'string' && key.startsWith('/budget-calls')
                )
              },
            })
            handleClose()
          },
          onError: (error: any) => {
            toast.error(error.message || 'Failed to update budget call')
          },
        },
      )
    } else {
      createMutation.mutate(
        {
          pathParams: {},
          payload: {
            fiscalYearId,
            type,
            submissionDeadline: payloadSubmissionDeadline,
            status: 'Active',
          },
        },
        {
          onSuccess: () => {
            toast.success('Budget call created successfully')
            void queryClient.invalidateQueries({
              predicate: (query) => {
                const key = query.queryKey[0]
                return (
                  typeof key === 'string' && key.startsWith('/budget-calls')
                )
              },
            })
            handleClose()
          },
          onError: (error: any) => {
            toast.error(error.message || 'Failed to create budget call')
          },
        },
      )
    }
  }

  const fiscalYears = fiscalYearsData?.data || []

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Budget Call' : 'Initiate Budget Call'}
      description={
        isEditing
          ? 'Update the budget call deadline'
          : 'Initiate and activate a budget call for a fiscal year'
      }
      size="sm"
      footer={
        <div className="flex gap-2 justify-end w-full">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {isEditing && budgetCall?.status === 'Draft' && (
            <Button
              type="button"
              className="gap-1.5"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                changeStatusMutation.isPending
              }
              onClick={handleUpdateAndActivate}
            >
              <Play className="h-3.5 w-3.5" />
              Update & Activate
            </Button>
          )}
          <Button
            type="submit"
            form="budget-call-form"
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              changeStatusMutation.isPending
            }
          >
            {isEditing ? 'Update' : 'Activate'}
          </Button>
        </div>
      }
    >
      <form id="budget-call-form" onSubmit={onSubmit} className="space-y-4 p-2">
        {/* Fiscal Year */}
        <div className="space-y-2">
          <Label htmlFor="fiscalYearId">
            Fiscal Year <span className="text-destructive">*</span>
          </Label>
          <Select
            value={fiscalYearId}
            onValueChange={setFiscalYearId}
            disabled={isEditing}
          >
            <SelectTrigger id="fiscalYearId">
              <SelectValue placeholder="Select fiscal year" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              {fiscalYears.map((fy: FiscalYear) => (
                <SelectItem key={fy.id} value={fy.id}>
                  {fy.year} - {fy.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fiscalYearId && (
            <p className="text-sm text-destructive">{errors.fiscalYearId}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">
            Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as BudgetCallType)}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_CALL_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {pascalCaseToWords(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type}</p>
          )}
        </div>

        {/* Submission Deadline */}
        <div className="space-y-2">
          <Label htmlFor="submissionDeadline">
            Submission Deadline <span className="text-destructive">*</span>
          </Label>
          <Input
            id="submissionDeadline"
            type="date"
            value={submissionDeadline}
            onChange={(e) => setSubmissionDeadline(e.target.value)}
          />
          {errors.submissionDeadline && (
            <p className="text-sm text-destructive">
              {errors.submissionDeadline}
            </p>
          )}
        </div>
      </form>
    </ResponsiveDialogDashtail>
  )
}
