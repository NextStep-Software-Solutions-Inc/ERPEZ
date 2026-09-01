import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useMemo, useState, useEffect } from 'react'
import { Loader2, ClipboardList, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ModeCard from '../components/ModeCard'
import { FundSourceCombobox } from '@/components/features/planning/fund-source/components/FundSourceCombobox'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import { getFundSourcesRequest } from '@/components/features/planning/fund-source/handlers/getFundSourcesRequest'
import type { Office } from '@/components/features/planning/office/office/table/types'
import { getOPCRsRequest } from '@/features/planning/opcr'

// Create hooks from request blueprints
const useOffices = createQueryHookFromTemplate(getOfficesRequest)
const useOPCRs = createQueryHookFromTemplate(getOPCRsRequest)
const useFundSources = createQueryHookFromTemplate(getFundSourcesRequest)

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  try {
    return new Date(dateString).toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export const updateWFPSchema = z.object({
  officeId: z.string().min(1, 'Office is required'),
  projectTitle: z.string().min(1, 'Project Title is required'),
  projectStartDate: z.string().min(1, 'Start Date is required'),
  projectEndDate: z.string().min(1, 'End Date is required'),
  generalObjective: z.string().optional().default(''),
  description: z.string().optional().default(''),
  fiscalYearId: z.string().optional().default(''),
  proposedBudget: z.number().min(0).optional().default(0),
  mode: z.enum(['opcr', 'external']).nullable().default(null),
  opcrId: z.string().optional().default(''),
  fundSourceId: z.string().optional().default(''),
}).refine((data) => {
  if (!data.projectStartDate || !data.projectEndDate) return true
  return new Date(data.projectEndDate) >= new Date(data.projectStartDate)
}, {
  message: 'End Date must be after or equal to Start Date',
  path: ['projectEndDate'],
}).refine((data) => data.mode !== null, {
  message: 'Please select a source (OPCR or External)',
  path: ['mode'],
}).refine((data) => {
  if (data.mode === 'opcr') {
    return data.opcrId && String(data.opcrId).trim().length > 0
  }
  return true
}, {
  message: 'OPCR is required when source is OPCR',
  path: ['opcrId'],
});

export type UpdateWFPFormValues = z.infer<typeof updateWFPSchema>

interface UpdateWFPFormProps {
  onSubmit: (data: UpdateWFPFormValues) => void
  onCancel: () => void
  initialValues?: Partial<UpdateWFPFormValues>
  isLoading?: boolean
  onValueChange?: <K extends keyof UpdateWFPFormValues>(fieldName: K, value: UpdateWFPFormValues[K]) => void
}

export default function UpdateWFPForm({
  onSubmit,
  onCancel,
  initialValues,
  isLoading = false,
  onValueChange,
}: UpdateWFPFormProps) {
  const [opcrModeSelected, setOpcrModeSelected] = useState(false)

  // Set opcrModeSelected when initialValues changes
  useEffect(() => {
    if (initialValues?.mode === 'opcr') {
      setOpcrModeSelected(true)
    } else {
      setOpcrModeSelected(false)
    }
  }, [initialValues?.mode])

  // Fetch offices - always enabled
  const { data: officesResponse, isLoading: officesLoading } = useOffices({
    pathParams: {},
    queryParams: {},
  })

  // Fetch OPCRs only when OPCR mode is selected
  const { data: opcrsResponse, isLoading: opcrsLoading } = useOPCRs({
    pathParams: {},
    queryParams: {},
    enabled: opcrModeSelected,
  })

  // Fetch fund sources (max 2000 items) - always enabled
  const { data: fundSourcesResponse, isLoading: fundSourcesLoading } = useFundSources({
    pathParams: {},
    queryParams: { pageSize: 2000 },
  })

  // Extract data from responses
  const offices = officesResponse?.data || []
  const opcrs = opcrsResponse?.data || []
  const fundSources = useMemo(() => {
    const list = fundSourcesResponse?.data || []
    return [...list].sort((a: any, b: any) =>
      (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
    )
  }, [fundSourcesResponse?.data])

  const defaultValues = useMemo(() => {
    const apiData = initialValues || {}
    return {
      officeId: apiData.officeId || '',
      projectTitle: apiData.projectTitle || '',
      projectStartDate: formatDateForInput(apiData.projectStartDate),
      projectEndDate: formatDateForInput(apiData.projectEndDate),
      generalObjective: apiData.generalObjective || '',
      description: apiData.description || '',
      fiscalYearId: apiData.fiscalYearId || '',
      proposedBudget: apiData.proposedBudget || 0,
      mode: apiData.mode || null,
      opcrId: apiData.opcrId || '',
      fundSourceId: apiData.fundSourceId || '',
    } as UpdateWFPFormValues
  }, [initialValues])

  const form = useForm({
    defaultValues: defaultValues,
    onSubmit: async ({ value }) => {
      onSubmit(value)
    },
  })

  const isSubmitting = isLoading || form.state.isSubmitting

  const handleValueChange = <K extends keyof UpdateWFPFormValues>(
    fieldName: K,
    value: UpdateWFPFormValues[K],
  ) => {
    onValueChange?.(fieldName, value)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6 pt-2"
    >
      {/* Office ID */}
      <form.Field
        name="officeId"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700 font-medium">
              Office <span className="text-red-500">*</span>
            </Label>
            <select
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value)
                handleValueChange('officeId', e.target.value)
              }}
              disabled={officesLoading}
              className={`w-full rounded-md border px-3 py-2 text-sm bg-white ${
                field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-gray-300'
              } ${officesLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value="">
                {officesLoading ? 'Loading offices...' : 'Select an Office'}
              </option>
              {offices && offices.length > 0 && offices.map((office: Office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Project Title */}
      <form.Field
        name="projectTitle"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700 font-medium">
              Project Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="Enter Project Title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value)
                handleValueChange('projectTitle', e.target.value)
              }}
              className={field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-gray-300'}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Implementation Dates (Start & End) */}
      <div className="grid gap-4">
        <Label className="text-gray-700 font-medium">
          Implementation Date <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <form.Field
            name="projectStartDate"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name} className="text-xs text-gray-500">Start Date</Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    handleValueChange('projectStartDate', e.target.value)
                  }}
                />
              </div>
            )}
          />
          <form.Field
            name="projectEndDate"
            children={(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name} className="text-xs text-gray-500">End Date</Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    handleValueChange('projectEndDate', e.target.value)
                  }}
                  className={field.state.meta.errors.length > 0 ? 'border-red-500' : ''}
                />
              </div>
            )}
          />
        </div>
        {form.state.fieldMeta.projectEndDate?.errors.length > 0 && (
          <p className="text-xs text-red-500">
            {String(form.state.fieldMeta.projectEndDate.errors[0])}
          </p>
        )}
      </div>

      {/* General Objective */}
      <form.Field
        name="generalObjective"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700 font-medium">
              General Objective
            </Label>
            <Textarea
              id={field.name}
              placeholder="Enter General Objective"
              rows={4}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value)
                handleValueChange('generalObjective', e.target.value)
              }}
              className="border-gray-300"
            />
          </div>
        )}
      />

      {/* Source Selection (Mode: OPCR or External) - READ-ONLY */}
      <form.Field
        name="mode"
        children={(field) => (
          <div className="grid gap-4">
            <Label className="text-gray-700 font-medium">
              Source <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModeCard
                icon={<ClipboardList className="h-5 w-5" />}
                title="OPCR"
                description="Office Performance Commitment Review"
                selected={field.state.value === 'opcr'}
                disabled={true}
              />
              <ModeCard
                icon={<DollarSign className="h-5 w-5" />}
                title="External"
                description="External funding source"
                selected={field.state.value === 'external'}
                disabled={true}
              />
            </div>
            <p className="text-xs text-gray-500">(Cannot change after creation)</p>
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* OPCR Selection - Only show when mode is 'opcr' */}
      {form.state.values.mode === 'opcr' && (
        <form.Field
          name="opcrId"
          children={(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name} className="text-gray-700 font-medium">
                OPCR <span className="text-red-500">*</span>
              </Label>
              <select
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  handleValueChange('opcrId', e.target.value)
                }}
                disabled={opcrsLoading}
                className={`w-full rounded-md border px-3 py-2 text-sm bg-white ${
                  field.state.meta.errors.length > 0 ? 'border-red-500' : 'border-gray-300'
                } ${opcrsLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="">
                  {opcrsLoading ? 'Loading OPCRs...' : 'Select an OPCR'}
                </option>
                {opcrs && opcrs.length > 0 && opcrs.map((opcr) => (
                  <option key={opcr.id} value={opcr.id}>
                    {opcr.name || `OPCR - ${opcr.id}`}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        />
      )}

      {/* Fund Source Selection */}
      <form.Field
        name="fundSourceId"
        children={(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name} className="text-gray-700 font-medium">
              Fund Source
            </Label>
            <FundSourceCombobox
              options={fundSources}
              value={field.state.value || ''}
              onValueChange={(val) => {
                field.handleChange(val)
                handleValueChange('fundSourceId', val)
              }}
              placeholder={fundSourcesLoading ? 'Loading fund sources...' : 'Select a Fund Source'}
              searchPlaceholder="Search by UACS code, fund name, or authorization..."
              emptyMessage="No Fund Source found matching your search."
              disabled={fundSourcesLoading}
              isLoading={fundSourcesLoading}
              className="w-full text-sm"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-red-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-8"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update WFP'
          )}
        </Button>
      </div>
    </form>
  )
}
