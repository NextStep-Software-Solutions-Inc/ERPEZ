import { useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import FieldInfo from '@/components/FieldInfo'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'

// Create hook for offices
const useOffices = createQueryHookFromTemplate(getOfficesRequest)

const createActivitySchema = z.object({
  name: z.string().min(1, 'Activity name is required'),
  description: z.string(),
  budget: z.number().min(0, 'Budget cannot be negative'),
  PAPDepartmentIds: z.array(z.string()),
})

export type CreateOPCRActivityFormValues = z.infer<typeof createActivitySchema>

interface ActivityDefaults {
  name: string
  description: string
  budget: number
  PAPDepartmentIds: string[]
}

// Helper to extract the form type
const useOPCRActivityFormInstance = (
  defaultValues: ActivityDefaults,
  onActivityCreated: (activity: CreateOPCRActivityFormValues) => void,
) =>
  useForm({
    defaultValues,
    validators: {
      onChange: createActivitySchema,
    },
    onSubmit: async ({ value }) => {
      onActivityCreated(value)
    },
  })

export type OPCRActivityFormApi = ReturnType<typeof useOPCRActivityFormInstance>

interface CreateOPCRActivityFormProps {
  onActivityCreated: (activity: CreateOPCRActivityFormValues) => void
  officeId?: string
  defaultKpi?: string
  defaultDimension?: string
  defaultSubKpiId?: string
  onClose?: () => void
  setForm?: (form: OPCRActivityFormApi) => void
}

export default function CreateOPCRActivityForm({
  onActivityCreated,
  officeId,
  setForm,
}: CreateOPCRActivityFormProps) {
  // Fetch available sub-offices (departments) of the OPCR office
  const { data: subOfficesData, isLoading: subOfficesLoading } = useOffices({
    pathParams: {},
    queryParams: {
      filters: officeId ? `parentId==${officeId}` : '',
      pageSize: 1000,
    },
  })

  const activityDefaults: ActivityDefaults = {
    name: '',
    budget: 0,
    description: '',
    PAPDepartmentIds: [],
  }

  const form = useOPCRActivityFormInstance(activityDefaults, onActivityCreated)

  // Expose form to parent on creation via effect
  useEffect(() => {
    setForm?.(form)
  }, [form, setForm])

  return (
    <form
      id="create-activity-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Activity Name Field */}
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Activity Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="Enter activity name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Description Field */}
      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Description</Label>
            <Textarea
              id={field.name}
              placeholder="Describe the activity in detail"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Budget Field */}
      <form.Field
        name="budget"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Proposed Budget <span className="text-red-500">*</span>
            </Label>
            <Input
              id={field.name}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
            <FieldInfo field={field} />
            <span className="text-xs text-muted-foreground">
              In Philippine Pesos (₱)
            </span>
          </div>
        )}
      />

      {/* Involved Divisions / Sub-Offices Field */}
      <form.Field
        name="PAPDepartmentIds"
        children={(field) => {
          const selectedIds = field.state.value || []
          const handleToggle = (id: string) => {
            const newValue = selectedIds.includes(id)
              ? selectedIds.filter((item: string) => item !== id)
              : [...selectedIds, id]
            field.handleChange(newValue)
          }

          return (
            <div className="space-y-2">
              <Label>Involved Departments / Sub-Offices</Label>
              <div className="max-h-64 overflow-y-auto border rounded-md p-3 space-y-2">
                {subOfficesLoading ? (
                  <div className="text-sm text-muted-foreground italic py-4">
                    Loading departments...
                  </div>
                ) : subOfficesData?.data && subOfficesData.data.length > 0 ? (
                  subOfficesData.data.map((office) => (
                    <div key={office.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={office.id}
                        checked={selectedIds.includes(office.id)}
                        onCheckedChange={() => handleToggle(office.id)}
                      />
                      <Label
                        htmlFor={office.id}
                        className="text-sm cursor-pointer"
                      >
                        {office.name} {office.code ? `(${office.code})` : ''}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic py-4">
                    No sub-offices available for this OPCR office
                  </div>
                )}
              </div>
              <FieldInfo field={field} />
            </div>
          )
        }}
      />
    </form>
  )
}
