import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2, ClipboardList, DollarSign, Lock } from 'lucide-react'
import { useAtom } from 'jotai'
import { useState, useEffect, useMemo } from 'react'
import { createFormDataAtom } from '../atoms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import ModeCard from '../components/ModeCard'
import { Combobox } from '@/components/ui/combobox'
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

// Get default fiscal year dates (e.g. 2026-01-01 to 2026-12-31)
const currentYear = new Date().getFullYear() > 2025 ? new Date().getFullYear() : 2026
const defaultStartDate = `${currentYear}-01-01`
const defaultEndDate = `${currentYear}-12-31`

// Schema for WFP Creation
export const createWFPSchema = z
  .object({
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
    fundSourceId: z.string().min(1, 'Fund Source is required'),
  })
  .refine(
    (data) => {
      if (!data.projectStartDate || !data.projectEndDate) return true
      return new Date(data.projectEndDate) >= new Date(data.projectStartDate)
    },
    {
      message: 'End Date must be after or equal to Start Date',
      path: ['projectEndDate'],
    },
  )
  .refine((data) => data.mode !== null, {
    message: 'Please select a source (OPCR or External)',
    path: ['mode'],
  })
  .refine(
    (data) => {
      if (data.mode === 'opcr') {
        return data.opcrId && String(data.opcrId).trim().length > 0
      }
      return true
    },
    {
      message: 'OPCR selection is required when source is OPCR',
      path: ['opcrId'],
    },
  )

export type CreateWFPFormValues = z.infer<typeof createWFPSchema>

interface CreateWFPFormProps {
  onSubmit: (data: CreateWFPFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  initialValues?: Partial<CreateWFPFormValues>
}

export default function CreateWFPForm({
  onSubmit,
  onCancel,
  isLoading = false,
  initialValues = {},
}: CreateWFPFormProps) {
  const [formData, setFormData] = useAtom(createFormDataAtom)
  const [opcrModeSelected, setOpcrModeSelected] = useState(
    initialValues.mode === 'opcr' || formData.mode === 'opcr' || true
  )

  // 1. Fetch offices
  const { data: officesResponse, isLoading: officesLoading } = useOffices({
    pathParams: {},
    queryParams: {},
  })

  // 2. Fetch OPCRs with high pageSize (pageSize: 1000)
  const { data: opcrsResponse, isLoading: opcrsLoading } = useOPCRs({
    pathParams: {},
    queryParams: { pageSize: 1000 },
    enabled: opcrModeSelected,
  })

  const offices = officesResponse?.data || []
  const rawOpcrs = opcrsResponse?.data || []

  // Extract selected Office and Organization ID to filter Fund Sources
  const selectedOfficeIdForQuery = formData.officeId || ''
  const selectedOfficeObj = offices.find((o: any) => o.id === selectedOfficeIdForQuery)
  const selectedOrgId = selectedOfficeObj?.organizationId || selectedOfficeObj?.organization?.id

  // 3. Fetch fund sources (filtered by organizationId if office selected, max 2000 items)
  const { data: fundSourcesResponse, isLoading: fundSourcesLoading } = useFundSources({
    pathParams: {},
    queryParams: { pageSize: 2000, ...(selectedOrgId ? { organizationId: selectedOrgId } : {}) },
  })

  const fundSources = fundSourcesResponse?.data || []

  const form = useForm({
    defaultValues: {
      officeId: '',
      mode: 'opcr',
      opcrId: '',
      fundSourceId: '',
      projectTitle: '',
      projectStartDate: defaultStartDate,
      projectEndDate: defaultEndDate,
      generalObjective: '',
      description: '',
      fiscalYearId: '',
      proposedBudget: 0,
      ...initialValues,
      ...formData,
    } as CreateWFPFormValues,
    onSubmit: (values) => {
      const payload: Record<string, any> = { ...values.value }
      
      // Convert empty GUID strings to null/undefined to avoid DB FK validation issues
      if (!payload.fundSourceId || String(payload.fundSourceId).trim() === '') {
        delete payload.fundSourceId
      }
      if (payload.mode === 'external' || !payload.opcrId || String(payload.opcrId).trim() === '') {
        delete payload.opcrId
      }

      onSubmit(payload as CreateWFPFormValues)
    },
  })

  const selectedOfficeId = form.state.values.officeId
  const currentMode = form.state.values.mode
  const selectedOpcrId = form.state.values.opcrId

  // Filter OPCRs by selected office if office is chosen, formatted as `OPCR Title (Code / Year)`
  const opcrOptions = useMemo(() => {
    let filtered = rawOpcrs
    if (selectedOfficeId) {
      filtered = rawOpcrs.filter(
        (o: { officeId?: string; office?: { id?: string } }) =>
          o.officeId === selectedOfficeId || o.office?.id === selectedOfficeId
      )
      if (filtered.length === 0) filtered = rawOpcrs
    }

    return filtered.map((opcr: any) => {
      const title = opcr.title || opcr.name || 'OPCR'
      const code = opcr.code || opcr.opcrCode || opcr.fiscalYear?.year || `OPCR-${opcr.id?.slice(0, 4)}`
      const officeName = opcr.office?.name || opcr.officeName || ''
      const subcategory = officeName ? ` - ${officeName}` : ''
      return {
        value: opcr.id,
        label: `${title} (${code})${subcategory}`,
        raw: opcr,
      }
    })
  }, [rawOpcrs, selectedOfficeId])


  // Auto-inherit Fiscal Year Implementation Dates from selected OPCR
  useEffect(() => {
    if (currentMode === 'opcr' && selectedOpcrId) {
      const targetOpcr = rawOpcrs.find((o: { id: string }) => o.id === selectedOpcrId)
      if (targetOpcr) {
        // Inherit Fiscal Year Implementation Dates (Jan 1 to Dec 31 of fiscal year)
        const fyYear = targetOpcr.fiscalYear?.year || targetOpcr.year || currentYear
        const fyStart = `${fyYear}-01-01`
        const fyEnd = `${fyYear}-12-31`

        if (form.state.values.projectStartDate !== fyStart) {
          form.setFieldValue('projectStartDate', fyStart)
          setFormData((prev) => ({ ...prev, projectStartDate: fyStart }))
        }
        if (form.state.values.projectEndDate !== fyEnd) {
          form.setFieldValue('projectEndDate', fyEnd)
          setFormData((prev) => ({ ...prev, projectEndDate: fyEnd }))
        }
      }
    }
  }, [currentMode, selectedOpcrId, rawOpcrs, form, setFormData])

  const updateFormData = <K extends keyof CreateWFPFormValues>(
    fieldName: K,
    value: CreateWFPFormValues[K]
  ) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
  }

  const isSubmitting = isLoading || form.state.isSubmitting

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4 pt-1 text-xs w-full max-w-full overflow-hidden"
    >
      {/* Select Office */}
      <form.Field
        name="officeId"
        children={(field) => (
          <div className="grid gap-1.5 w-full">
            <Label htmlFor={field.name} className="text-slate-800 font-bold text-xs">
              Select Office <span className="text-rose-500">*</span>
            </Label>
            <select
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value)
                updateFormData('officeId', e.target.value)
              }}
              disabled={officesLoading}
              className={`w-full rounded-md border px-3 py-2 text-xs bg-white ${
                field.state.meta.errors.length > 0 ? 'border-rose-500' : 'border-slate-300'
              } ${officesLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value="">{officesLoading ? 'Loading offices...' : '-- Select an Office --'}</option>
              {offices.map((office: Office) => (
                <option key={office.id} value={office.id}>
                  {office.name || office.code}
                </option>
              ))}
            </select>
            {field.state.meta.errors.length > 0 && (
              <p className="text-[11px] text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Select Source Type (OPCR / External) */}
      <form.Field
        name="mode"
        children={(field) => (
          <div className="grid gap-1.5 w-full">
            <Label className="text-slate-800 font-bold text-xs">
              Select Source Type <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <ModeCard
                icon={<ClipboardList className="h-4 w-4 text-blue-600" />}
                title="OPCR"
                description="Office Performance Commitment Review"
                selected={field.state.value === 'opcr'}
                onClick={() => {
                  field.handleChange('opcr')
                  updateFormData('mode', 'opcr')
                  setOpcrModeSelected(true)
                }}
              />
              <ModeCard
                icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                title="External"
                description="External funding source (Fund Cluster)"
                selected={field.state.value === 'external'}
                onClick={() => {
                  field.handleChange('external')
                  updateFormData('mode', 'external')
                  setOpcrModeSelected(false)
                  form.setFieldValue('opcrId', '')
                  updateFormData('opcrId', '')
                }}
              />
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-[11px] text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Select OPCR (Searchable Dropdown) */}
      {currentMode === 'opcr' && (
        <form.Field
          name="opcrId"
          children={(field) => (
            <div className="grid gap-1.5 w-full min-w-0">
              <Label htmlFor={field.name} className="text-slate-800 font-bold text-xs">
                Select OPCR <span className="text-rose-500">*</span>
              </Label>
              <Combobox
                options={opcrOptions}
                value={field.state.value}
                onValueChange={(val) => {
                  field.handleChange(val)
                  updateFormData('opcrId', val)
                }}
                placeholder={opcrsLoading ? 'Loading OPCRs...' : '-- Search or select OPCR --'}
                searchPlaceholder="Search OPCR title, code, or office..."
                emptyMessage="No OPCR found matching your search."
                disabled={opcrsLoading}
                className="w-full text-xs"
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-[11px] text-rose-500">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        />
      )}

      {/* Fund Source (Required Searchable Combobox) */}
      <form.Field
        name="fundSourceId"
        children={(field) => (
          <div className="grid gap-1.5 w-full min-w-0">
            <Label htmlFor={field.name} className="text-slate-800 font-bold text-xs">
              Fund Source <span className="text-rose-500">*</span>
            </Label>
            <FundSourceCombobox
              options={fundSources}
              value={field.state.value || ''}
              onValueChange={(val) => {
                field.handleChange(val)
                updateFormData('fundSourceId', val)
              }}
              placeholder={fundSourcesLoading ? 'Loading fund sources...' : '-- Search or select Fund Source --'}
              searchPlaceholder="Search by UACS code, fund name, or authorization..."
              emptyMessage="No Fund Source found matching your search."
              disabled={fundSourcesLoading}
              isLoading={fundSourcesLoading}
              className="w-full text-xs"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-[11px] text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Project Title */}
      <form.Field
        name="projectTitle"
        children={(field) => (
          <div className="grid gap-1 w-full">
            <Label htmlFor={field.name} className="text-slate-700 font-semibold text-xs">
              Project Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="Enter Project Title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.target.value)
                updateFormData('projectTitle', e.target.value)
              }}
              className={`text-xs h-8 ${field.state.meta.errors.length > 0 ? 'border-rose-500' : 'border-slate-300'}`}
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-[11px] text-rose-500">{String(field.state.meta.errors[0])}</p>
            )}
          </div>
        )}
      />

      {/* Implementation Dates (Defaulted to Jan 1 - Dec 31 of Fiscal Year) */}
      <div className="grid gap-1 w-full">
        <Label className="text-slate-700 font-semibold text-xs">
          Implementation Date <span className="text-rose-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="projectStartDate"
            children={(field) => (
              <div className="grid gap-1">
                <Label htmlFor={field.name} className="text-[10px] text-slate-500">
                  Start Date
                </Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    updateFormData('projectStartDate', e.target.value)
                  }}
                  className="text-xs h-8"
                />
              </div>
            )}
          />
          <form.Field
            name="projectEndDate"
            children={(field) => (
              <div className="grid gap-1">
                <Label htmlFor={field.name} className="text-[10px] text-slate-500">
                  End Date
                </Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    updateFormData('projectEndDate', e.target.value)
                  }}
                  className={`text-xs h-8 ${field.state.meta.errors.length > 0 ? 'border-rose-500' : ''}`}
                />
              </div>
            )}
          />
        </div>
        {form.state.fieldMeta.projectEndDate?.errors.length > 0 && (
          <p className="text-[11px] text-rose-500">
            {String(form.state.fieldMeta.projectEndDate.errors[0])}
          </p>
        )}
      </div>

      {/* General Objective */}
      <form.Field
        name="generalObjective"
        children={(field) => (
          <div className="grid gap-1 w-full">
            <Label htmlFor={field.name} className="text-slate-700 font-semibold text-xs">
              General Objective
            </Label>
            <Textarea
              id={field.name}
              placeholder="Enter General Objective"
              rows={3}
              value={field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.value)
                updateFormData('generalObjective', e.target.value)
              }}
              className="border-slate-300 text-xs resize-none"
            />
          </div>
        )}
      />

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="px-6 text-xs h-8">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 text-xs h-8 font-semibold"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          Create WFP
        </Button>
      </div>
    </form>
  )
}
