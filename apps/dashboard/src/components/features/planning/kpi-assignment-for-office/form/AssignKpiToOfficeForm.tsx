import { useEffect } from 'react'
import { useForm, useField } from '@tanstack/react-form'
import { toast } from 'sonner'
import { useQueryClient } from 'erpez-shared-lib'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import FieldInfo from '@/components/FieldInfo'
import { Checkbox } from '@/components/ui/checkbox'
import {
  useKpiAssignments,
  useAssignKpiToOffice,
  checkKpiAssignmentExists,
} from '../hooks/useAssignKpiToOffice'
import {
  type AssignKpiFormValues,
  transformToPayload,
} from '../types/assignKpiSchema'
import { getKpiAssignmentsRequest } from '@/features/planning/kpi-assignment/handlers/getKpiAssignmentsRequest'

// Create a helper to type-safely create defaultValues matching AssignKpiFormValues
function createDefaultValues(
  kpiId: string,
  officeId: string,
): Readonly<AssignKpiFormValues> {
  return Object.freeze({
    fyActiveKPIId: kpiId,
    officeId: officeId,
    assignedTargetAnnual: 0,
    assignedTargetQ1: undefined,
    assignedTargetQ2: undefined,
    assignedTargetQ3: undefined,
    assignedTargetQ4: undefined,
    isLocked: false,
  })
}

// Helper to establish the form API type
function _typeOnlyFormHelper() {
  return useForm({
    defaultValues: createDefaultValues('', ''),
  })
}

// Type export for the form API - inferred from helper
export type AssignKpiFormApi = ReturnType<typeof _typeOnlyFormHelper>

interface AssignKpiToOfficeFormProps {
  kpiId: string
  kpiName: string
  kpiCode: string
  officeId: string
  officeName?: string
  onClose?: () => void
  onAssigned?: () => void
  setForm?: (form: AssignKpiFormApi) => void
  agencyTargetAnnual?: number
  agencyTargetQ1?: number
  agencyTargetQ2?: number
  agencyTargetQ3?: number
  agencyTargetQ4?: number
}

export default function AssignKpiToOfficeForm({
  kpiId,
  kpiName,
  kpiCode,
  officeId,
  officeName,
  onClose,
  onAssigned,
  setForm,
  agencyTargetAnnual,
  agencyTargetQ1,
  agencyTargetQ2,
  agencyTargetQ3,
  agencyTargetQ4,
}: AssignKpiToOfficeFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useAssignKpiToOffice()

  // Fetch existing assignments to check for duplicates
  const { data: assignmentsData } = useKpiAssignments({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
      filters: `officeId==${officeId}`,
    },
  })

  const existingAssignments = assignmentsData?.data ?? []
  const isDuplicate = checkKpiAssignmentExists(
    existingAssignments,
    kpiId,
    officeId,
  )

  const form = useForm({
    defaultValues: createDefaultValues(kpiId, officeId),
    onSubmit: async ({ value }) => {
      try {
        // Check again before submit
        if (isDuplicate) {
          toast.error('This KPI is already assigned to this office')
          return
        }

        const payload = transformToPayload(value)
        await mutateAsync({
          pathParams: {},
          payload,
        })

        toast.success('KPI assigned to office successfully!')
        void queryClient.invalidateQueries({
          queryKey: [getKpiAssignmentsRequest.endpoint],
        })
        onAssigned?.()
        onClose?.()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to assign KPI'
        toast.error(message)
      }
    },
  })

  // Expose form to parent
  useEffect(() => {
    if (setForm) {
      setForm(form)
    }
  }, [form, setForm])

  // Watch annual target field to calculate quarters if needed
  useField({
    form,
    name: 'assignedTargetAnnual',
  })

  return (
    <form
      id="assign-kpi-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Duplicate Warning */}
      {isDuplicate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">Already Assigned</p>
          <p className="text-yellow-700 text-sm mt-1">
            This KPI is already assigned to this office. You can update the
            targets or lock status using a different interface.
          </p>
        </div>
      )}

      {/* KPI Info (Read-Only Display) */}
      <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div>
          <p className="text-xs font-medium text-blue-600 uppercase">
            KPI Code
          </p>
          <p className="text-sm font-semibold text-blue-900">{kpiCode}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-blue-600 uppercase">
            KPI Name
          </p>
          <p className="text-sm font-semibold text-blue-900">{kpiName}</p>
        </div>
      </div>

      {/* Agency Targets Reference */}
      {(agencyTargetAnnual !== undefined ||
        agencyTargetQ1 !== undefined ||
        agencyTargetQ2 !== undefined ||
        agencyTargetQ3 !== undefined ||
        agencyTargetQ4 !== undefined) && (
        <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2.5">
            Reference Agency Targets
          </p>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="bg-indigo-50 p-2 rounded border border-indigo-100">
              <span className="text-[10px] font-medium text-indigo-600 block mb-0.5">
                Annual
              </span>
              <p className="font-bold text-indigo-900 text-sm">
                {agencyTargetAnnual !== undefined
                  ? agencyTargetAnnual.toFixed(2)
                  : '-'}
              </p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-indigo-50">
              <span className="text-[10px] font-medium text-indigo-600 block mb-0.5">
                Q1
              </span>
              <p className="font-semibold text-gray-700">
                {agencyTargetQ1 !== undefined && agencyTargetQ1 !== null
                  ? agencyTargetQ1.toFixed(2)
                  : '-'}
              </p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-indigo-50">
              <span className="text-[10px] font-medium text-indigo-600 block mb-0.5">
                Q2
              </span>
              <p className="font-semibold text-gray-700">
                {agencyTargetQ2 !== undefined && agencyTargetQ2 !== null
                  ? agencyTargetQ2.toFixed(2)
                  : '-'}
              </p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-indigo-50">
              <span className="text-[10px] font-medium text-indigo-600 block mb-0.5">
                Q3
              </span>
              <p className="font-semibold text-gray-700">
                {agencyTargetQ3 !== undefined && agencyTargetQ3 !== null
                  ? agencyTargetQ3.toFixed(2)
                  : '-'}
              </p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-indigo-50">
              <span className="text-[10px] font-medium text-indigo-600 block mb-0.5">
                Q4
              </span>
              <p className="font-semibold text-gray-700">
                {agencyTargetQ4 !== undefined && agencyTargetQ4 !== null
                  ? agencyTargetQ4.toFixed(2)
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Office Field (Read-Only) */}
      <form.Field
        name="officeId"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Office</Label>
            <Input
              id={field.name}
              value={officeName || field.state.value || ''}
              disabled
              className="bg-gray-100 cursor-not-allowed"
              placeholder="Office"
            />
            <p className="text-xs text-gray-600">
              Pre-filled from your current context
            </p>
          </div>
        )}
      />

      {/* Annual Target Field (Required) */}
      <form.Field
        name="assignedTargetAnnual"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Annual Target *</Label>
            <Input
              id={field.name}
              type="number"
              min="0.01"
              step="0.01"
              value={field.state.value || ''}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(
                  e.target.value ? parseFloat(e.target.value) : 0,
                )
              }
              placeholder="Enter annual target"
              disabled={isPending}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Quarterly Targets (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Q1 Target */}
        <form.Field
          name="assignedTargetQ1"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q1 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                placeholder="Q1 target"
                disabled={isPending}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Q2 Target */}
        <form.Field
          name="assignedTargetQ2"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q2 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                placeholder="Q2 target"
                disabled={isPending}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Q3 Target */}
        <form.Field
          name="assignedTargetQ3"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q3 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                placeholder="Q3 target"
                disabled={isPending}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Q4 Target */}
        <form.Field
          name="assignedTargetQ4"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name}>Q4 Target</Label>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.01"
                value={field.state.value ?? ''}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                placeholder="Q4 target"
                disabled={isPending}
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      {/* Lock Status Checkbox */}
      <form.Field
        name="isLocked"
        children={(field) => (
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Checkbox
              id={field.name}
              checked={field.state.value === true}
              onCheckedChange={(checked) => {
                field.handleChange(checked === true)
              }}
              disabled={isPending}
            />
            <div>
              <Label
                htmlFor={field.name}
                className="font-medium text-gray-900 cursor-pointer"
              >
                Lock Assignment
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Prevent changes to this assignment after creation
              </p>
            </div>
          </div>
        )}
      />
    </form>
  )
}
