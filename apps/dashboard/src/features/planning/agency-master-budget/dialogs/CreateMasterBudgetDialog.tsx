import { useState, useEffect } from 'react'
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
import type { CreateAgencyMasterBudgetPayload } from '@/features/planning/agency-master-budget/handlers/createAgencyMasterBudgetRequest'
import type { UpdateAgencyMasterBudgetPayload } from '@/features/planning/agency-master-budget/handlers/updateAgencyMasterBudgetRequest'

export interface FiscalYearOption {
  id: string
  year: number
  name: string
}

export interface FundClusterOption {
  id: string
  name: string
  code?: string
}

/** Editing state derived from an AgencyMasterBudget record */
export interface EditingMasterBudget {
  id: string
  fiscalYearId: string
  fundSourceId: string
  sourceDocumentType: number
  psAmount: number
  mooeAmount: number
  coAmount: number
}

interface CreateMasterBudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with create payload when not editing */
  onCreate: (payload: CreateAgencyMasterBudgetPayload) => void
  /** Called with update payload when editing */
  onUpdate: (id: string, payload: UpdateAgencyMasterBudgetPayload) => void
  fundClusters: FundClusterOption[]
  fiscalYears: FiscalYearOption[]
  editingBudget?: EditingMasterBudget | null
  isEdit?: boolean
  isSubmitting?: boolean
}

// Source document options — value must be parseable by the backend's Enum.TryParse<SourceDocumentTypeEnum>
// which accepts both the name ("NEPGAA") and the integer ("0").
// We use the enum names here to be consistent with what the API returns.
const SOURCE_DOCUMENTS = [
  { value: 'NEPGAA', label: 'NEP/GAA (Regular Funds)' },
  { value: 'PRE', label: 'PRE (Internally Generated Income)' },
  { value: 'MOA', label: 'MOA (External Grants)' },
  { value: 'Others', label: 'Other' },
]

// Normalize a stored sourceDocumentType (could be integer string "0" or enum name "NEPGAA") to an enum name
const SOURCE_DOC_INT_TO_NAME: Record<string, string> = {
  '0': 'NEPGAA',
  '1': 'PRE',
  '2': 'MOA',
  '3': 'Others',
}
const normalizeSourceDocType = (val: string | number): string => {
  const s = String(val)
  return SOURCE_DOC_INT_TO_NAME[s] ?? s
}

export function CreateMasterBudgetDialog({
  open,
  onOpenChange,
  onCreate,
  onUpdate,
  fundClusters,
  fiscalYears,
  editingBudget,
  isEdit,
  isSubmitting,
}: CreateMasterBudgetDialogProps) {
  const { toast } = useToast()

  const getInitialFormData = () => {
    if (editingBudget) {
      return {
        fiscalYearId: editingBudget.fiscalYearId,
        fundSourceId: editingBudget.fundSourceId,
        sourceDocumentType: normalizeSourceDocType(editingBudget.sourceDocumentType),
        psAmount: editingBudget.psAmount,
        mooeAmount: editingBudget.mooeAmount,
        coAmount: editingBudget.coAmount,
      }
    }
    return {
      fiscalYearId: '',
      fundSourceId: '',
      sourceDocumentType: '',
      psAmount: 0,
      mooeAmount: 0,
      coAmount: 0,
    }
  }

  const [formData, setFormData] = useState(getInitialFormData())
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData())
      setErrors({})
    }
  }, [open, editingBudget])

  const grandTotal = (formData.psAmount || 0) + (formData.mooeAmount || 0) + (formData.coAmount || 0)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Fiscal Year is required'
    if (!formData.fundSourceId) newErrors.fundSourceId = 'Fund Source is required'
    if (!formData.sourceDocumentType) newErrors.sourceDocumentType = 'Source Document is required'
    if (formData.psAmount <= 0) newErrors.psAmount = 'Personnel Services amount must be greater than 0'
    if (formData.mooeAmount <= 0) newErrors.mooeAmount = 'MOOE amount must be greater than 0'
    if (formData.coAmount <= 0) newErrors.coAmount = 'Capital Outlay amount must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        color: 'destructive',
      })
      return
    }

    const payload = {
      fiscalYearId: formData.fiscalYearId,
      fundSourceId: formData.fundSourceId,
      sourceDocumentType: formData.sourceDocumentType,
      psAmount: formData.psAmount,
      mooeAmount: formData.mooeAmount,
      coAmount: formData.coAmount,
    }

    if (isEdit && editingBudget) {
      onUpdate(editingBudget.id, payload)
    } else {
      onCreate(payload)
    }
  }

  const handleClose = () => {
    setFormData(getInitialFormData())
    setErrors({})
    onOpenChange(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Edit Fund Source' : 'Create Fund Source'}
      description={isEdit ? 'Update the Fund Source budget allocation' : 'Setup the Agency\'s total approved budget from official source documents'}
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
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.fiscalYearId || !formData.fundSourceId || !formData.sourceDocumentType}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Fund Source' : 'Create Fund Source')}
          </Button>
        </div>
      }
      showCloseButton
    >
      <div className="space-y-10">

        {/* Fiscal Year and Fund Source Selection */}
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
                    <p>Select the fiscal year for which this master budget applies. This budget becomes the source of truth for budget allocation throughout the year.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={formData.fiscalYearId}
              onValueChange={(value) => setFormData({ ...formData, fiscalYearId: value })}
            >
              <SelectTrigger className={`h-10 border-gray-200 ${errors.fiscalYearId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Fiscal Year" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    {fy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fiscalYearId && (
              <p className="text-xs text-red-500">{errors.fiscalYearId}</p>
            )}
          </div>

          {/* Fund Source Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Fund Source <span className="text-red-500">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Select the fund source (General Fund, Internal Generated Fund, External Funds, or Special Fund). Each fund source has separate budget limits.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <FundSourceCombobox
              options={fundClusters}
              value={formData.fundSourceId}
              onValueChange={(value) =>
                setFormData({ ...formData, fundSourceId: value })
              }
              placeholder="Select Fund Source"
              searchPlaceholder="Search by code, name, authorization..."
              className={errors.fundSourceId ? 'ring-1 ring-red-500 rounded-md' : ''}
            />
            {errors.fundSourceId && (
              <p className="text-xs text-red-500">{errors.fundSourceId}</p>
            )}
          </div>

          {/* Source Document Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Source Document <span className="text-red-500">*</span></label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Select the official source document: NEP/GAA for regular funds, PRE for internally generated income, or MOA for external grants.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select
              value={formData.sourceDocumentType}
              onValueChange={(value) => setFormData({ ...formData, sourceDocumentType: value })}
            >
              <SelectTrigger className={`h-10 border-gray-200 ${errors.sourceDocumentType ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select Source Document" />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_DOCUMENTS.map((sd) => (
                  <SelectItem key={sd.value} value={sd.value}>
                    {sd.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sourceDocumentType && (
              <p className="text-xs text-red-500">{errors.sourceDocumentType}</p>
            )}
          </div>
        </div>

        {/* Budget Allocation Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4 mt-8">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-blue-900">Grand Total Limits by Allotment Class</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-blue-600 hover:text-blue-800 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>Enter the maximum budget limits for each allotment class. These are absolute ceilings that establish the source of truth for budget allocation throughout the fiscal year.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-4">
            {/* Personnel Services */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Personnel Services (PS) <span className="text-red-500">*</span></label>
              <Input
                type="number"
                value={formData.psAmount || ''}
                onChange={(e) => setFormData({ ...formData, psAmount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={`h-10 text-left font-mono bg-white ${errors.psAmount ? 'border-red-500 border-2' : 'border-blue-200'}`}
              />
              {errors.psAmount && (
                <p className="text-xs text-red-600 font-semibold">{errors.psAmount}</p>
              )}
            </div>

            {/* MOOE */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">MOOE <span className="text-red-500">*</span></label>
              <Input
                type="number"
                value={formData.mooeAmount || ''}
                onChange={(e) => setFormData({ ...formData, mooeAmount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={`h-10 text-left font-mono bg-white ${errors.mooeAmount ? 'border-red-500 border-2' : 'border-blue-200'}`}
              />
              {errors.mooeAmount && (
                <p className="text-xs text-red-600 font-semibold">{errors.mooeAmount}</p>
              )}
            </div>

            {/* Capital Outlay */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-900">Capital Outlay (CO) <span className="text-red-500">*</span></label>
              <Input
                type="number"
                value={formData.coAmount || ''}
                onChange={(e) => setFormData({ ...formData, coAmount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={`h-10 text-left font-mono bg-white ${errors.coAmount ? 'border-red-500 border-2' : 'border-blue-200'}`}
              />
              {errors.coAmount && (
                <p className="text-xs text-red-600 font-semibold">{errors.coAmount}</p>
              )}
            </div>
          </div>

          {/* Total Summary */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">Total Budget Allocation</p>
              <p className="text-lg font-bold text-blue-900">
                ₱{grandTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
