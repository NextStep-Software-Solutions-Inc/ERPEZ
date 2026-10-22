import { useState, useEffect, useMemo, JSX } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HelpCircle, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { FundSourceCombobox } from '@/components/features/planning/fund-source/components/FundSourceCombobox'
import type { AgencyMasterBudget, OfficeCeiling } from '@/lib/fiscal-year-and-policies/types'

/** Shape of the form data submitted by AddCeilingDialog */
export interface CeilingFormData {
  targetType: string
  fiscalYear: string
  fiscalYearId: string
  fundCluster: string
  status: string
  isSupplemental: boolean
  ps: number
  mooe: number
  co: number
  targetName: string
  officeId: string
}

interface AddCeilingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (allocation: CeilingFormData) => void
  offices: any[]
  projects: any[]
  isEdit?: boolean
  editingItem?: CeilingFormData
  /** ID of the ceiling being edited — used to exclude it from the "already allocated" sum */
  editingCeilingId?: string
  fiscalYears?: any[]
  agencyMasterBudgets?: AgencyMasterBudget[]
  isMasterBudgetsLoading?: boolean
  /** All existing office ceilings — used to compute the net remaining available per fund cluster */
  existingCeilings?: OfficeCeiling[]
  isSubmitting?: boolean
}

const EMPTY_ALLOCATION = {
  targetType: 'Office',
  fiscalYear: '',
  fiscalYearId: '',
  fundCluster: '',
  status: 'Draft',
  isSupplemental: false,
  ps: 0,
  mooe: 0,
  co: 0,
  targetName: '',
  officeId: '',
}

export function AddCeilingDialog({
  open,
  onOpenChange,
  onAdd,
  offices,
  projects,
  isEdit = false,
  editingItem,
  editingCeilingId,
  fiscalYears = [],
  agencyMasterBudgets = [],
  isMasterBudgetsLoading = false,
  existingCeilings = [],
  isSubmitting = false,
}: AddCeilingDialogProps): JSX.Element {

  const [allocation, setAllocation] = useState<CeilingFormData>(editingItem || EMPTY_ALLOCATION)
  const { toast } = useToast()

  const [errors, setErrors] = useState<Record<string, string>>({})
  useEffect(() => {
    if (isEdit && editingItem) {
      setAllocation(editingItem)
    } else if (!isEdit && !open) {
      setAllocation(EMPTY_ALLOCATION)
      setErrors({})
    }
  }, [editingItem, isEdit, open])

  // ── Derive fund clusters available for the selected fiscal year from real API data ──
  // agencyMasterBudgets where fiscalYear.year === selected year → their fundSource codes
  const fundClustersForSelectedYear = useMemo(() => {
    if (!allocation.fiscalYear && !allocation.fiscalYearId) return []
    return agencyMasterBudgets
      .filter((mb) => {
        const matchesYear =
          allocation.fiscalYear &&
          (String(mb.fiscalYear?.year) === String(allocation.fiscalYear) ||
            mb.fiscalYear?.id === allocation.fiscalYear)
        const matchesId =
          allocation.fiscalYearId &&
          (mb.fiscalYearId === allocation.fiscalYearId ||
            mb.fiscalYear?.id === allocation.fiscalYearId)
        return matchesYear || matchesId
      })
      .map((mb) => ({
        code: mb.fundSource?.code ?? '',
        name: mb.fundSource?.name ?? mb.fundSource?.code ?? '',
        ps: mb.psAmount,
        mooe: mb.mooeAmount,
        co: mb.coAmount,
        agencyMasterBudgetId: mb.id,
      }))
      .filter((fc) => fc.code)
  }, [agencyMasterBudgets, allocation.fiscalYear, allocation.fiscalYearId])

  // ── Available budget for the selected fund cluster (from real data) ──
  // Subtracts amounts already allocated to other ceilings sharing the same agencyMasterBudgetId.
  // When editing, the current ceiling's own amounts are excluded from the "used" sum so the
  // user sees how much is still available to redistribute.
  const availableFunds = useMemo(() => {
    const match = fundClustersForSelectedYear.find(fc => fc.code === allocation.fundCluster)
    if (!match) return { ps: 0, mooe: 0, co: 0 }

    // Sum amounts already used by other ceilings on this same agency master budget
    const usedByOthers = existingCeilings
      .filter(c => c.agencyMasterBudgetId === match.agencyMasterBudgetId && c.id !== editingCeilingId)
      .reduce(
        (acc, c) => ({
          ps: acc.ps + (c.psAmount ?? 0),
          mooe: acc.mooe + (c.mooeAmount ?? 0),
          co: acc.co + (c.coAmount ?? 0),
        }),
        { ps: 0, mooe: 0, co: 0 },
      )

    return {
      ps: Math.max(0, (match.ps ?? 0) - usedByOthers.ps),
      mooe: Math.max(0, (match.mooe ?? 0) - usedByOthers.mooe),
      co: Math.max(0, (match.co ?? 0) - usedByOthers.co),
    }
  }, [fundClustersForSelectedYear, allocation.fundCluster, existingCeilings, editingCeilingId])

  // Validate and update allocation amounts
  const handleAmountChange = (field: 'ps' | 'mooe' | 'co', value: string) => {
    const numValue = parseFloat(value) || 0
    const available = availableFunds[field]
    const newErrors = { ...errors }

    if (available > 0 && numValue > available) {
      newErrors[field] = `Cannot exceed available ₱${available.toLocaleString()}`
      setErrors(newErrors)
      return
    } else {
      delete newErrors[field]
    }

    setErrors(newErrors)
    setAllocation({ ...allocation, [field]: numValue })
  }

  const handleClose = () => {
    if (!isEdit) {
      setAllocation(EMPTY_ALLOCATION)
      setErrors({})
    }
    onOpenChange(false)
  }

  const handleAdd = () => {
    if (!allocation.targetName || !allocation.fundCluster || !allocation.fiscalYear || !allocation.status) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        color: 'destructive',
      })
      return
    }

    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the allocation amounts. Some exceed available funds.',
        color: 'destructive',
      })
      return
    }

    onAdd(allocation)
  }

  // Fund clusters filtered by the selected fiscal year (from real API data)
  const getAvailableFundClusters = () => fundClustersForSelectedYear

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Ceiling' : 'Create Ceiling'}
      description={isEdit 
        ? 'Update budget ceiling allocation details'
        : 'Create a new budget ceiling allocation'}
      size="full"
      className="max-w-[800px] max-h-[90vh]"
      footer={
        <div className="flex gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!allocation.targetName || !allocation.fundCluster || !allocation.fiscalYear || !allocation.status || isSubmitting || Object.keys(errors).length > 0}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Ceiling' : 'Create Ceiling'}
          </Button>
        </div>
      }
      showCloseButton
    >
      <div className="space-y-10">
        {/* Fiscal Year Selection and Target Type */}
        <div className="space-y-4">
          {/* Fiscal Year Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Fiscal Year <span className="text-red-500">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Select the fiscal year for this ceiling allocation. Available fund sources will be filtered based on the selected year.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={allocation.fiscalYear}
              onValueChange={(v) => {
                // Also capture fiscalYearId so the parent can use it for the API call
                const fyOption = fiscalYears.find((fy: any) => (fy.year || fy.id) === v)
                setAllocation({
                  ...allocation,
                  fiscalYear: v,
                  fiscalYearId: fyOption?.id ?? '',
                  fundCluster: '', // reset fund cluster when fiscal year changes
                })
                setErrors({})
              }}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue placeholder="Select Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears && fiscalYears.length > 0 ? (
                  fiscalYears.map((fy: any) => (
                    <SelectItem key={fy.id || fy.year} value={fy.year || fy.id}>
                      {fy.name || fy.year}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No fiscal years available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Target Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Target Type <span className="text-red-500">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Choose whether this ceiling applies to an Organizational Unit/Office or a Project/WFP</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={allocation.targetType}
              onValueChange={(v) => {
                setAllocation({ ...allocation, targetType: v, targetName: '' })
              }}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Office">Organizational Unit / Office</SelectItem>
                <SelectItem value="Project">Project / WFP</SelectItem>
              </SelectContent>
              </Select>
            </div>

            {/* Target Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Office <span className="text-red-500">*</span></label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p>Select the specific office, department, or project to allocate ceiling to</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={allocation.officeId || ''}
                onValueChange={(v) => {
                  const officeList = allocation.targetType === 'Office' ? offices : projects
                  const selected = officeList.find((o: any) => o.id === v)
                  setAllocation({ ...allocation, officeId: v, targetName: selected?.name ?? '' })
                }}
              >
                <SelectTrigger className="h-10 border-gray-200">
                  <SelectValue placeholder="Choose office">
                    {allocation.targetName || 'Choose office'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allocation.targetType === 'Office' ? (
                    offices.map((o: any) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))
                  ) : (
                    projects.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Fund Cluster & Status Section */}
        <div className="space-y-4 pt-4">
          {/* Status Section - MOVED FIRST */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Ceiling Status <span className="text-red-500">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">Ceiling Status Types:</p>
                      <ul className="space-y-1 text-xs">
                        <li><span className="font-semibold">Draft:</span> Visible only to the Budget Office.</li>
                        <li><span className="font-semibold">Indicative (Soft):</span> Published for initial Budget Call. Warning if exceeded, but submission permitted.</li>
                        <li><span className="font-semibold">Final (Hard):</span> After GAA/Agency approval. Hard Block if ceiling exceeded.</li>
                        <li><span className="font-semibold">Locked:</span> Mid-year cutoffs. No edits unless realignment triggered.</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={allocation.status}
              onValueChange={(v) => setAllocation({ ...allocation, status: v })}
            >
              <SelectTrigger className="h-10 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft - Visible only to the Budget Office</SelectItem>
                <SelectItem value="Indicative">Indicative (Soft Ceiling) - Published for initial Budget Call</SelectItem>
                <SelectItem value="Final">Final (Hard Ceiling) - Enforced after GAA/Agency Approval</SelectItem>
                <SelectItem value="Locked">Locked (Execution Phase) - Mid-year cutoffs</SelectItem>
              </SelectContent>
            </Select>
            {allocation.status && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-1">Status Details:</p>
                <p className="text-xs text-gray-600">
                  {allocation.status === 'Draft' && 'This ceiling will be visible only to the Budget Office until published.'}
                  {allocation.status === 'Indicative' && 'Published for the initial Budget Call. Generates a Warning if an office drafts a budget exceeding this amount, but permits submission.'}
                  {allocation.status === 'Final' && 'Enforced after GAA/Head of Agency approval. Triggers a Hard Block, preventing SPMS/WFP submission if the drafted LIB exceeds this ceiling.'}
                  {allocation.status === 'Locked' && 'Mid-year cutoffs. No further edits allowed unless a formal Realignment is triggered.'}
                </p>
              </div>
            )}
          </div>

          {/* Fund Source - MOVED SECOND */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Fund Source <span className="text-red-500">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Fund source categorization based on budget source and type (e.g., Regular Agency Fund)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FundSourceCombobox
              options={getAvailableFundClusters().map((fc) => ({
                id: fc.code,
                code: fc.code,
                name: fc.name,
              }))}
              value={allocation.fundCluster}
              valueKey="code"
              onValueChange={(v) => {
                setAllocation({ ...allocation, fundCluster: v })
                setErrors({}) // Clear validation errors when fund cluster changes
              }}
              placeholder={
                !allocation.fiscalYear
                  ? 'Select Fiscal Year first'
                  : isMasterBudgetsLoading
                    ? 'Loading fund sources...'
                    : 'Select Fund Source'
              }
              searchPlaceholder="Search by code, name, authorization..."
              emptyMessage={
                !allocation.fiscalYear
                  ? 'Please select a Fiscal Year first.'
                  : isMasterBudgetsLoading
                    ? 'Loading agency master budgets...'
                    : `No approved Agency Master Budgets found for ${allocation.fiscalYear}. Ceilings must be allocated from an established Master Budget. Please create one in Step 1 (Fund Source tab) first.`
              }
              isLoading={isMasterBudgetsLoading}
              disabled={!allocation.fiscalYear || isMasterBudgetsLoading}
            />
            {!allocation.fiscalYear && (
              <p className="text-xs text-amber-600">Please select a Fiscal Year first to see available fund sources</p>
            )}
            {allocation.fiscalYear && !isMasterBudgetsLoading && getAvailableFundClusters().length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 space-y-1">
                <p className="font-semibold">No approved Agency Master Budgets found for {allocation.fiscalYear}.</p>
                <p>
                  Ceilings must be allocated from an established Agency Master Budget (Step 1). Please switch to the{' '}
                  <span className="font-bold underline">Fund Source</span> tab to set up an Agency Master Budget for this year first.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Allocation Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4 mt-8">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-blue-900">Budget Filling Allocation</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Enter budget amounts for each category. Available funds are based on selected fund source.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            {/* Personnel Services */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-blue-900">Personnel Services (PS)</label>
                <span className="text-xs text-blue-700 font-medium">
                  Available: ₱{availableFunds.ps.toLocaleString()}
                </span>
              </div>
              <Input
                type="number"
                value={allocation.ps || 0}
                onChange={(e) => handleAmountChange('ps', e.target.value)}
                placeholder="0"
                className={`h-10 text-left font-mono bg-white ${
                  errors.ps ? 'border-red-500 border-2' : 'border-blue-200'
                }`}
              />
              {errors.ps ? (
                <p className="text-xs text-red-600 font-semibold">{errors.ps}</p>
              ) : (
                <p className="text-xs text-blue-600">
                  {allocation.ps > 0 ? `Allocated: ₱${allocation.ps.toLocaleString()} (Remaining: ₱${Math.max(0, availableFunds.ps - allocation.ps).toLocaleString()})` : ''}
                </p>
              )}
            </div>

            {/* MOOE */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-blue-900">MOOE</label>
                <span className="text-xs text-blue-700 font-medium">
                  Available: ₱{availableFunds.mooe.toLocaleString()}
                </span>
              </div>
              <Input
                type="number"
                value={allocation.mooe || 0}
                onChange={(e) => handleAmountChange('mooe', e.target.value)}
                placeholder="0"
                className={`h-10 text-left font-mono bg-white ${
                  errors.mooe ? 'border-red-500 border-2' : 'border-blue-200'
                }`}
              />
              {errors.mooe ? (
                <p className="text-xs text-red-600 font-semibold">{errors.mooe}</p>
              ) : (
                <p className="text-xs text-blue-600">
                  {allocation.mooe > 0 ? `Allocated: ₱${allocation.mooe.toLocaleString()} (Remaining: ₱${Math.max(0, availableFunds.mooe - allocation.mooe).toLocaleString()})` : ''}
                </p>
              )}
            </div>

            {/* Capital Outlays */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-blue-900">Capital Outlays (CO)</label>
                <span className="text-xs text-blue-700 font-medium">
                  Available: ₱{availableFunds.co.toLocaleString()}
                </span>
              </div>
              <Input
                type="number"
                value={allocation.co || 0}
                onChange={(e) => handleAmountChange('co', e.target.value)}
                placeholder="0"
                className={`h-10 text-left font-mono bg-white ${
                  errors.co ? 'border-red-500 border-2' : 'border-blue-200'
                }`}
              />
              {errors.co ? (
                <p className="text-xs text-red-600 font-semibold">{errors.co}</p>
              ) : (
                <p className="text-xs text-blue-600">
                  {allocation.co > 0 ? `Allocated: ₱${allocation.co.toLocaleString()} (Remaining: ₱${Math.max(0, availableFunds.co - allocation.co).toLocaleString()})` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">Total Budget Filling Allocation</p>
              <p className="text-lg font-bold text-blue-900">
                ₱{((allocation.ps || 0) + (allocation.mooe || 0) + (allocation.co || 0)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
    </ResponsiveDialog>
  )
}
