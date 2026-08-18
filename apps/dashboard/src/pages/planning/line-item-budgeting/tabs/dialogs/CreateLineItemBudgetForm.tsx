import { useState } from 'react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useForm, useField } from '@tanstack/react-form'
import { z } from 'zod'
import { useAtom } from 'jotai'
import FieldInfo from '@/components/FieldInfo'
import { getOPCRsRequest } from '@/features/planning/opcr'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getWFPsRequest } from '@/components/features/planning/wfp/wfp/handlers/getWFPsRequest'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import type { OPCR } from '@/features/planning/opcr/types'
import { FiscalYear } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/types/types'
import type { WFP } from '@/components/features/planning/wfp'
import type { Office } from '@/components/features/planning/office/office/table/types'
import {
  libDialogFiscalYearAtom,
  libDialogFundClusterAtom,
} from '@/features/planning/line-item-budgeting/line-item-budget/atoms/libDialogAtoms'

import { getOfficeCeilingsRequest } from '@/features/planning/line-item-budgeting/line-item-budget/handlers/getOfficeCeilingsRequest'
import { getFundSourcesRequest } from '@/components/features/planning/fund-receiving/handlers/getFundSourcesRequest'
import type { FundSource } from '@/features/planning/fund-source/types'
import { Send, Layers } from 'lucide-react'
import { OfficeCeiling } from '@/features/planning/line-item-budgeting/line-item-budget/types/type.office-ceiling'

const useOpcrs = createQueryHookFromTemplate(getOPCRsRequest)
const useWfps = createQueryHookFromTemplate(getWFPsRequest)
const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)

const useOfficeCeilingsForForm = createQueryHookFromTemplate(
  getOfficeCeilingsRequest,
)
const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)
const useOffices = createQueryHookFromTemplate(getOfficesRequest)

// Types
type WizardStep = 1 | 2
export type BudgetMode = 'bottom-up' | 'top-down'

// Helper function to get office level
function getOfficeLevel(office: Office): 'Office' | 'Department' {
  return office.parentId ? 'Department' : 'Office'
}

export interface SourceDocument {
  id: string
  code: string
  name: string
  status: 'Approved' | 'Draft'
  office: string
  type: 'OPCR' | 'WFP'
  fiscalYear: string
  projectName?: string
}

// Schema — agencyMasterBudgetId and fundSourceId are validated at UI level based on mode
const createLIBSchema = z.object({
  fiscalYearId: z.string().min(1, 'Fiscal year is required'),
  agencyMasterBudgetId: z.string().nullable().optional(),
  fundSourceId: z.string().nullable().optional(),
  officeId: z.string().min(1, 'Office is required'),
  parentLIBId: z.string().nullable().optional(),
  scope: z.enum(['Activity', 'Project']).nullable().optional(),
  level: z.enum(['Office', 'Department']).nullable().optional(),
  name: z.string().min(1, 'Name is required'),
  sourceType: z.enum(['OPCR', 'WFP']).nullable().optional(),
  sourceId: z.string().nullable().optional(),
  consolidatedIntoLIBId: z.string().nullable().optional(),
})

export type CreateLIBFormValues = z.infer<typeof createLIBSchema>

interface CreateLineItemBudgetFormProps {
  formId: string
  onSubmit: (
    values: CreateLIBFormValues,
    selectedDoc: SourceDocument,
    budgetMode: BudgetMode,
  ) => void
  isLoading?: boolean
  currentStep: WizardStep
  selectedDocument: SourceDocument | null
  onDocumentSelect: (doc: SourceDocument) => void
}

export default function CreateLineItemBudgetForm({
  formId,
  onSubmit,
  isLoading = false,
  currentStep,
  selectedDocument,
  onDocumentSelect,
}: CreateLineItemBudgetFormProps) {
  const [, setFiscalYear] = useAtom(libDialogFiscalYearAtom)
  const [, setFundCluster] = useAtom(libDialogFundClusterAtom)

  // Budget mode state: 'bottom-up' = Submit Budget Proposal, 'top-down' = Draft from Assigned Ceiling
  const [budgetMode, setBudgetMode] = useState<BudgetMode>('bottom-up')

  const currentDate = new Date().toISOString().split('T')[0]

  const form = useForm({
    defaultValues: {
      fiscalYearId: '',
      agencyMasterBudgetId: '',
      fundSourceId: null,
      officeId: '',
      name: '',
      parentLIBId: null,
      sourceType: null,
      sourceId: null,
      level: null,
      scope: null,
      consolidatedIntoLIBId: null,
    } as CreateLIBFormValues,
    onSubmit: async ({ value }) => {
      try {
        if (!selectedDocument) {
          toast.error('Please select a source document')
          return
        }

        // Validate required fields based on budget mode
        if (budgetMode === 'bottom-up' && !value.fundSourceId) {
          toast.error('Please select a Fund Source for your budget proposal')
          return
        }

        if (budgetMode === 'top-down' && !value.agencyMasterBudgetId) {
          toast.error('Please select an Assigned Ceiling')
          return
        }

        await onSubmit(
          value as CreateLIBFormValues,
          selectedDocument,
          budgetMode,
        )
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to create Line Item Budget'
        toast.error(message)
      }
    },
  })

  // Get field values for filtering
  const fiscalYearValue =
    useField({ form: form, name: 'fiscalYearId' }).state.value || ''
  const officeIdValue =
    useField({ form: form, name: 'officeId' }).state.value || ''

  // Fetch offices data
  const { data: officesData, isLoading: isOfficesLoading } = useOffices({
    pathParams: {},
    queryParams: {},
  })

  // Fetch fiscal years first to get selected fiscal year number
  const { data: fiscalYearsData, isLoading: isFiscalYearsLoading } =
    useFiscalYears({
      pathParams: {},
      queryParams: {
        pageSize: 100,
        sorts: 'year==asc',
      },
    })

  const selectedFiscalYear = (fiscalYearsData?.data || []).find(
    (fy: FiscalYear) => fy.id === fiscalYearValue,
  )
  const selectedYear = selectedFiscalYear?.year

  // Fetch all source data - OPCR/WFP filtered by office, fiscal year, and status==Approved
  const selectedOffice = (officesData?.data || []).find(
    (o: Office) => o.id === officeIdValue,
  )


  const { data: opcrs, isLoading: isOpcrsLoading } = useOpcrs({
    pathParams: {},
    queryParams: {
      ...(fiscalYearValue &&
        officeIdValue && {
        filters: `officeId==${officeIdValue},fiscalYearId==${fiscalYearValue},commitmentStatus==Approved`,
      }),
    },
  })

  const { data: wfps, isLoading: isWfpsLoading } = useWfps({
    pathParams: {},
    queryParams: {
      ...(fiscalYearValue &&
        officeIdValue &&
        selectedYear && {
        filters: `officeId==${officeIdValue},fiscalYear==${selectedYear},status==Approved`,
      }),
    },
  })

  // Bottom-up mode: all fund sources (no fiscal year filtering required by API, but we fetch them when mode is bottom-up)
  const { data: fundSourcesData, isLoading: isFundSourcesLoading } =
    useFundSources({
      pathParams: {},
      queryParams: {
        pageSize: 100, // Fetch all available
      },
      enabled: budgetMode === 'bottom-up',
    })

  // Top-down mode: OfficeCeilings filtered by officeId + fiscalYearId
  const canFetchCeilings =
    budgetMode === 'top-down' && !!officeIdValue && !!fiscalYearValue
  const officeCeilingsFilters = canFetchCeilings
    ? `officeId==${officeIdValue},fiscalYearId==${fiscalYearValue}`
    : ''

  const { data: officeCeilingsData, isLoading: isOfficeCeilingsLoading } =
    useOfficeCeilingsForForm({
      pathParams: {},
      queryParams: {
        pageSize: 200,
        filters: officeCeilingsFilters,
      },
      enabled: canFetchCeilings,
    })

  // Format API data for display
  const formattedFiscalYears = (fiscalYearsData?.data || [])
    .map((fy: FiscalYear) => ({
      id: fy.id,
      name: fy.year,
    }))
    .sort((a, b) => a.name - b.name)

  // Bottom-up mode: all fund clusters directly from fund sources
  const formattedAllFundClusters = (fundSourcesData?.data || []).map(
    (fs: FundSource) => ({
      id: fs.id, // fundSourceId
      fundSourceId: fs.id,
      code: fs.code,
      name: fs.name,
      label: `${fs.name} (${fs.code})`,
    }),
  )

  // Top-down mode: ceilings assigned to this office — extract AMB from each ceiling
  const formattedCeilingOptions = (officeCeilingsData?.data || [])
    .filter((oc: OfficeCeiling) => oc.agencyMasterBudget)
    .map((oc: OfficeCeiling) => ({
      id: oc.agencyMasterBudgetId,
      officeCeilingId: oc.id,
      fundSourceId: oc.agencyMasterBudget?.fundSourceId || '',
      label: `AMB — PS: ₱${(oc.psAmount / 1000).toFixed(0)}K | MOOE: ₱${(oc.mooeAmount / 1000).toFixed(0)}K | CO: ₱${(oc.coAmount / 1000).toFixed(0)}K`,
      totalAmount:
        (oc.psAmount || 0) + (oc.mooeAmount || 0) + (oc.coAmount || 0),
    }))

  const formattedOffices = (officesData?.data || []).map((office: Office) => ({
    id: office.id,
    name: office.name || office.code || 'Unknown',
    level: getOfficeLevel(office),
  }))

  // Filter and format OPCR/WFP data to match SourceDocument shape
  const formattedOpcrs: SourceDocument[] = (opcrs?.data || []).map(
    (opcr: OPCR) => ({
      id: opcr.id,
      code: opcr.id,
      name: `OPCR - FY ${opcr.fiscalYear}`,
      status: opcr.commitmentStatus === 'Approved' ? 'Approved' : 'Draft',
      office: opcr.officeName || selectedOffice?.name || 'Selected Office',
      type: 'OPCR',
      fiscalYear: String(opcr.fiscalYear),
    }),
  )

  const formattedWfps: SourceDocument[] = (wfps?.data || []).map(
    (wfp: WFP) => {
      const startYear = wfp.projectStartDate
        ? new Date(wfp.projectStartDate).getFullYear().toString()
        : ''
      const endYear = wfp.projectEndDate
        ? new Date(wfp.projectEndDate).getFullYear().toString()
        : ''
      const fyLabel =
        startYear && endYear && startYear !== endYear
          ? `${startYear} - ${endYear}`
          : startYear || String(selectedYear || '')

      return {
        id: wfp.id,
        code: wfp.id.substring(0, 8).toUpperCase(),
        name: wfp.projectTitle || 'Unnamed WFP',
        status: wfp.status === 'Approved' ? 'Approved' : 'Draft',
        office: wfp.officeName || selectedOffice?.name || 'Selected Office',
        type: 'WFP',
        fiscalYear: fyLabel,
        projectName: wfp.projectTitle || 'Unnamed WFP',
      }
    },
  )

  // Handle budget mode toggle — reset AMB when switching mode
  const handleModeChange = (mode: BudgetMode) => {
    setBudgetMode(mode)
    form.setFieldValue('agencyMasterBudgetId', '')
    form.setFieldValue('fundSourceId', null)
    setFundCluster('')
  }

  // Step indicator with visual progress
  const renderStepIndicator = () => {
    return (
      <div className="mb-8 px-0">
        <div className="relative flex items-center justify-between gap-4">
          {/* Connector Line - Full Width Background */}
          <div className="absolute top-6 left-8 right-8 h-1 bg-gray-300 rounded-full z-0" />

          {/* Active Connector Line - Animated */}
          <div
            className={`absolute top-6 left-8 h-1 bg-green-500 rounded-full transition-all duration-500 z-0 ${1 < currentStep ? 'right-8' : 'right-auto w-1/2'
              }`}
          />

          {/* Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${1 === currentStep
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : 1 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
            >
              {1 < currentStep ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                1
              )}
            </div>
            <span
              className={`text-xs font-semibold mt-3 text-center transition-colors ${1 <= currentStep ? 'text-foreground' : 'text-gray-500'
                }`}
            >
              Document
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-md ${2 === currentStep
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : 2 < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
            >
              {2 < currentStep ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                2
              )}
            </div>
            <span
              className={`text-xs font-semibold mt-3 text-center transition-colors ${2 <= currentStep ? 'text-foreground' : 'text-gray-500'
                }`}
            >
              Source
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Form with Steps */}
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-8 flex-1 overflow-y-auto px-4"
      >
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300 pb-6">
            {/* ============================================================
                BUDGET MODE SELECTOR — Flow Selector Toggle
                ============================================================ */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800">
                Budget Mode
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Submit Budget Proposal — bottom-up */}
                <button
                  type="button"
                  onClick={() => handleModeChange('bottom-up')}
                  className={cn(
                    'relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200',
                    budgetMode === 'bottom-up'
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                  )}
                  id="mode-bottom-up"
                >
                  {budgetMode === 'bottom-up' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </span>
                  )}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      budgetMode === 'bottom-up'
                        ? 'bg-amber-100'
                        : 'bg-gray-100',
                    )}
                  >
                    <Send
                      className={cn(
                        'w-4 h-4',
                        budgetMode === 'bottom-up'
                          ? 'text-amber-600'
                          : 'text-gray-500',
                      )}
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        budgetMode === 'bottom-up'
                          ? 'text-amber-900'
                          : 'text-gray-700',
                      )}
                    >
                      Submit Budget Proposal
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        budgetMode === 'bottom-up'
                          ? 'text-amber-700'
                          : 'text-gray-500',
                      )}
                    >
                      No ceiling assigned yet. Proposal reviewed by Budget
                      Office.
                    </p>
                  </div>
                </button>

                {/* Draft from Assigned Ceiling — top-down */}
                <button
                  type="button"
                  onClick={() => handleModeChange('top-down')}
                  className={cn(
                    'relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all duration-200',
                    budgetMode === 'top-down'
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white',
                  )}
                  id="mode-top-down"
                >
                  {budgetMode === 'top-down' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </span>
                  )}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      budgetMode === 'top-down' ? 'bg-blue-100' : 'bg-gray-100',
                    )}
                  >
                    <Layers
                      className={cn(
                        'w-4 h-4',
                        budgetMode === 'top-down'
                          ? 'text-blue-600'
                          : 'text-gray-500',
                      )}
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        budgetMode === 'top-down'
                          ? 'text-blue-900'
                          : 'text-gray-700',
                      )}
                    >
                      Draft from Assigned Ceiling
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        budgetMode === 'top-down'
                          ? 'text-blue-700'
                          : 'text-gray-500',
                      )}
                    >
                      A ceiling is allocated to your office. Start drafting now.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Date Field - Auto-filled, Read-only */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={currentDate}
                disabled
                className="bg-gray-50"
              />
            </div>

            {/* Fiscal Year Field */}
            <form.Field
              name="fiscalYearId"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Fiscal Year</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value)
                      setFiscalYear(value)
                      setFundCluster('')
                      // Reset AMB when fiscal year changes
                      form.setFieldValue('agencyMasterBudgetId', '')
                      form.setFieldValue('fundSourceId', null)
                    }}
                    disabled={isLoading || isFiscalYearsLoading}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select Fiscal Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {formattedFiscalYears.length > 0 ? (
                        formattedFiscalYears.map((fy) => (
                          <SelectItem key={fy.id} value={fy.id}>
                            {fy.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {isFiscalYearsLoading
                            ? 'Loading...'
                            : 'No fiscal years available'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </div>
              )}
            />

            {/* Office Field */}
            <form.Field
              name="officeId"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Office</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      field.handleChange(value)
                      // Derive and set office level when office is selected
                      const selectedOfficeData = (officesData?.data || []).find(
                        (o: Office) => o.id === value,
                      )
                      if (selectedOfficeData) {
                        const levelKey =
                          'level' satisfies keyof CreateLIBFormValues
                        form.setFieldValue(
                          levelKey,
                          getOfficeLevel(selectedOfficeData),
                        )
                      }
                      // Reset AMB when office changes
                      form.setFieldValue('agencyMasterBudgetId', '')
                      form.setFieldValue('fundSourceId', null)
                      setFundCluster('')
                    }}
                    disabled={isLoading || isOfficesLoading}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select Office" />
                    </SelectTrigger>
                    <SelectContent>
                      {formattedOffices.length > 0 ? (
                        formattedOffices.map((office) => (
                          <SelectItem key={office.id} value={office.id}>
                            {office.name} ({office.level})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-gray-500">
                          {isOfficesLoading
                            ? 'Loading...'
                            : 'No offices available'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </div>
              )}
            />

            {/* ============================================================
                AMB / CEILING DROPDOWN — conditional by budget mode
                ============================================================ */}
            <form.Field
              name="agencyMasterBudgetId"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>
                    {budgetMode === 'top-down'
                      ? 'Assigned Ceiling (Agency Master Budget)'
                      : 'Fund Source (Agency Master Budget)'}
                  </Label>

                  {budgetMode === 'bottom-up' ? (
                    /* Bottom-up: all AMBs filtered by fiscal year */
                    <Select
                      value={field.state.value || ''}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        setFundCluster(value)
                        const selectedAMB = formattedAllFundClusters.find(
                          (a: { id: string; fundSourceId: string }) =>
                            a.id === value,
                        )
                        if (selectedAMB) {
                          form.setFieldValue(
                            'fundSourceId',
                            selectedAMB.fundSourceId,
                          )
                        } else {
                          form.setFieldValue('fundSourceId', null)
                        }
                      }}
                      disabled={
                        isLoading || isFundSourcesLoading || !fiscalYearValue
                      }
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue
                          placeholder={
                            !fiscalYearValue
                              ? 'Select Fiscal Year first'
                              : 'Select Fund Source'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formattedAllFundClusters.length > 0 ? (
                          formattedAllFundClusters.map(
                            (cluster: { id: string; label: string }) => (
                              <SelectItem key={cluster.id} value={cluster.id}>
                                {cluster.label}
                              </SelectItem>
                            ),
                          )
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            {isFundSourcesLoading
                              ? 'Loading...'
                              : !fiscalYearValue
                                ? 'Please select a fiscal year'
                                : 'No fund sources available'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    /* Top-down: OfficeCeilings filtered by officeId + fiscalYearId */
                    <Select
                      value={field.state.value || ''}
                      onValueChange={(value) => {
                        field.handleChange(value)
                        setFundCluster(value)
                        const selectedCeiling = formattedCeilingOptions.find(
                          (c: { id: string; fundSourceId: string }) =>
                            c.id === value,
                        )
                        if (selectedCeiling) {
                          form.setFieldValue(
                            'fundSourceId',
                            selectedCeiling.fundSourceId || null,
                          )
                        }
                      }}
                      disabled={
                        isLoading ||
                        isOfficeCeilingsLoading ||
                        !fiscalYearValue ||
                        !officeIdValue
                      }
                    >
                      <SelectTrigger id={field.name} className="w-full">
                        <SelectValue
                          placeholder={
                            !fiscalYearValue
                              ? 'Select Fiscal Year first'
                              : !officeIdValue
                                ? 'Select Office first'
                                : 'Select Assigned Ceiling'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formattedCeilingOptions.length > 0 ? (
                          formattedCeilingOptions.map(
                            (ceiling: { id: string; label: string }) => (
                              <SelectItem key={ceiling.id} value={ceiling.id}>
                                {ceiling.label}
                              </SelectItem>
                            ),
                          )
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-gray-500">
                            {isOfficeCeilingsLoading
                              ? 'Loading ceilings...'
                              : !fiscalYearValue || !officeIdValue
                                ? 'Select Fiscal Year and Office first'
                                : 'No ceilings assigned to this office yet'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Mode-specific help text */}
                  <p className="text-xs text-gray-500">
                    {budgetMode === 'top-down'
                      ? '⚡ Only ceilings assigned to the selected office and fiscal year are shown.'
                      : '📋 Showing all available fund sources for the selected fiscal year.'}
                  </p>

                  <FieldInfo field={field} />
                </div>
              )}
            />

            {/* Name Field */}
            <form.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Line Item Budget Name</Label>
                  <Input
                    id={field.name}
                    placeholder="e.g., Equipment Procurement Q1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isLoading}
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />

            {/* Parent LIB Field (Optional) */}
            <form.Field
              name="parentLIBId"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Parent LIB (Optional)</Label>
                  <Select
                    value={field.state.value || 'none'}
                    onValueChange={(value) =>
                      field.handleChange(value === 'none' ? null : value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select Parent LIB (leave empty if none)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    For hierarchical LIB structures. Leave empty for top-level
                    LIBs.
                  </p>
                </div>
              )}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-300 pb-6">
            <div
              className={cn(
                'rounded-lg p-6 border shadow-sm',
                budgetMode === 'bottom-up'
                  ? 'bg-linear-to-br from-amber-50 to-yellow-50 border-amber-100'
                  : 'bg-linear-to-br from-blue-50 to-indigo-50 border-blue-100',
              )}
            >
              <p
                className={cn(
                  'text-sm font-semibold',
                  budgetMode === 'bottom-up'
                    ? 'text-amber-900'
                    : 'text-blue-900',
                )}
              >
                Source Document Selection
              </p>
              <p
                className={cn(
                  'text-xs',
                  budgetMode === 'bottom-up'
                    ? 'text-amber-700'
                    : 'text-blue-700',
                )}
              >
                {budgetMode === 'bottom-up'
                  ? 'Choose the source document for this Budget Proposal'
                  : 'Choose the source document for this Ceiling Draft'}
              </p>
            </div>
            <div>
              {/* No documents warning when not loading and both OPCR and WFP are empty */}
              {!isOpcrsLoading &&
                !isWfpsLoading &&
                formattedOpcrs.length === 0 &&
                formattedWfps.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mb-4">
                      <svg
                        className="w-6 h-6 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      No source documents found
                    </p>
                    <p className="text-xs text-amber-700">
                      {!officeIdValue || !fiscalYearValue
                        ? 'Please select both office and fiscal year in Step 1 first.'
                        : `No approved OPCRs or WFPs found for ${selectedOffice?.name || 'the selected office'} in the selected fiscal year.`}
                    </p>
                  </div>
                )}
            </div>
            {(isOpcrsLoading || isWfpsLoading) && (
              <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-white/50 rounded-lg border border-dashed border-gray-300">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">
                  Loading available documents...
                </p>
              </div>
            )}

            {!isOpcrsLoading && !isWfpsLoading && (
              <div className="space-y-6">
                {/* OPCR Section */}
                {formattedOpcrs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-900">
                      OPCRs
                    </h3>
                    <div className="space-y-3">
                      {formattedOpcrs.map((opcr) => (
                        <button
                          key={opcr.id}
                          type="button"
                          onClick={() => {
                            onDocumentSelect(opcr)
                            const sourceTypeKey =
                              'sourceType' satisfies keyof CreateLIBFormValues
                            const sourceIdKey =
                              'sourceId' satisfies keyof CreateLIBFormValues
                            const scopeKey =
                              'scope' satisfies keyof CreateLIBFormValues

                            form.setFieldValue(sourceTypeKey, 'OPCR')
                            form.setFieldValue(sourceIdKey, opcr.id)
                            form.setFieldValue(scopeKey, 'Activity')
                          }}
                          className={cn(
                            'w-full p-4 text-left rounded-lg border-2 transition-all flex gap-4',
                            selectedDocument?.id === opcr.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm',
                          )}
                        >
                          <div className="mt-1">
                            <div
                              className={cn(
                                'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                                selectedDocument?.id === opcr.id
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300',
                              )}
                            >
                              {selectedDocument?.id === opcr.id && (
                                <div className="h-2 w-2 bg-white rounded-full" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-blue-900">
                              OPCR - {opcr.name}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                              <div>
                                <span className="font-medium">Document:</span>{' '}
                                {opcr.code}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>{' '}
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                  Approved
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Office:</span>{' '}
                                {opcr.office}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* OPCR Empty State */}
                {!isOpcrsLoading && formattedOpcrs.length === 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      No OPCRs Available
                    </p>
                    <p className="text-xs text-blue-700">
                      No approved OPCRs found for the selected filters.
                    </p>
                  </div>
                )}

                {/* WFP Section */}
                {formattedWfps.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-gray-900">
                      WFPs
                    </h3>
                    <div className="space-y-3">
                      {formattedWfps.map((wfp) => (
                        <div key={wfp.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onDocumentSelect(wfp)
                              const sourceTypeKey =
                                'sourceType' satisfies keyof CreateLIBFormValues
                              const sourceIdKey =
                                'sourceId' satisfies keyof CreateLIBFormValues
                              const scopeKey =
                                'scope' satisfies keyof CreateLIBFormValues

                              form.setFieldValue(sourceTypeKey, 'WFP')
                              form.setFieldValue(sourceIdKey, wfp.id)
                              form.setFieldValue(scopeKey, 'Project')
                            }}
                            className={cn(
                              'w-full p-4 text-left rounded-lg border-2 transition-all flex gap-4',
                              selectedDocument?.id === wfp.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm',
                            )}
                          >
                            <div className="mt-1">
                              <div
                                className={cn(
                                  'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                                  selectedDocument?.id === wfp.id
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300',
                                )}
                              >
                                {selectedDocument?.id === wfp.id && (
                                  <div className="h-2 w-2 bg-white rounded-full" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-purple-900">
                                WFP - {wfp.name}
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Document:</span>{' '}
                                  {wfp.code}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span>{' '}
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                    Approved
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="font-medium">Project:</span>{' '}
                                  {wfp.projectName}
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Budget Scope Selection - Show directly under selected WFP */}
                          {selectedDocument?.id === wfp.id && (
                            <form.Field
                              name="scope"
                              children={(field) => (
                                <div className="mt-3 space-y-3 pl-9 pr-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <Label className="text-sm font-semibold text-purple-900">
                                    Budget Scope
                                  </Label>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        field.handleChange('Activity')
                                      }
                                      disabled={isLoading}
                                      className={cn(
                                        'flex-1 px-4 py-2 text-sm rounded-lg font-medium transition-all',
                                        field.state.value === 'Activity'
                                          ? 'bg-purple-600 text-white shadow-sm'
                                          : 'bg-white text-gray-700 border border-purple-200 hover:bg-purple-100',
                                      )}
                                    >
                                      Activity-Level
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        field.handleChange('Project')
                                      }
                                      disabled={isLoading}
                                      className={cn(
                                        'flex-1 px-4 py-2 text-sm rounded-lg font-medium transition-all',
                                        field.state.value === 'Project'
                                          ? 'bg-purple-600 text-white shadow-sm'
                                          : 'bg-white text-gray-700 border border-purple-200 hover:bg-purple-100',
                                      )}
                                    >
                                      Project-Level
                                    </button>
                                  </div>
                                  <p className="text-xs text-purple-700">
                                    Define the budget allocation scope for this
                                    WFP project
                                  </p>
                                </div>
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* WFP Empty State */}
                {!isWfpsLoading && formattedWfps.length === 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      No WFPs Available
                    </p>
                    <p className="text-xs text-purple-700">
                      No approved WFPs found for the selected filters.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Selected Document Summary - Show if document selected */}
            {selectedDocument && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-900 mb-2">
                  Selected Source Document
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedDocument.name}
                  </p>
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Type:</span>{' '}
                    {selectedDocument.type} •{' '}
                    <span className="font-semibold">Code:</span>{' '}
                    {selectedDocument.code}
                  </p>
                  <p className="text-xs text-blue-700">
                    <span className="font-semibold">Office:</span>{' '}
                    {selectedDocument.office}
                  </p>
                  {selectedDocument.fiscalYear && (
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">Fiscal Year:</span>{' '}
                      {selectedDocument.fiscalYear}
                    </p>
                  )}
                  {selectedDocument.type === 'OPCR' && (
                    <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded text-xs text-blue-900">
                      <p className="font-semibold">Activity-Level Breakdown</p>
                      <p className="mt-1">
                        Automatically selected for OPCR documents.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </>
  )
}
