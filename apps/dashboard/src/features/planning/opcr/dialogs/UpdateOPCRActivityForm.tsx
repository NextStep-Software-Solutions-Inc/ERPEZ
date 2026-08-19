import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import FieldInfo from '@/components/FieldInfo'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import { OPCRActivity } from '@/features/planning/opcr/types'

// Create hook for offices
const useOffices = createQueryHookFromTemplate(getOfficesRequest)

const updateActivitySchema = z.object({
  name: z.string().min(1, 'Activity name is required'),
  description: z.string(),
  budget: z.number().min(0, 'Budget cannot be negative'),
  PAPDepartmentIds: z.array(z.string()),
})

export type UpdateOPCRActivityFormValues = z.infer<typeof updateActivitySchema>

interface ActivityDefaults {
  name: string
  description: string
  budget: number
  PAPDepartmentIds: string[]
}

// Helper to extract the form type
const useOPCRActivityFormInstance = (
  defaultValues: ActivityDefaults,
  onActivityUpdated: (activity: UpdateOPCRActivityFormValues) => void,
) =>
  useForm({
    defaultValues,
    validators: {
      onChange: updateActivitySchema,
    },
    onSubmit: async ({ value }) => {
      onActivityUpdated(value)
    },
  })

export type OPCRActivityFormApi = ReturnType<typeof useOPCRActivityFormInstance>

interface UpdateOPCRActivityFormProps {
  activity: OPCRActivity
  officeId?: string
  onActivityUpdated: (activity: UpdateOPCRActivityFormValues) => void
  onClose?: () => void
  setForm?: (form: OPCRActivityFormApi) => void
}

export default function UpdateOPCRActivityForm({
  activity,
  officeId,
  onActivityUpdated,
  setForm,
}: UpdateOPCRActivityFormProps) {
  // Fetch available sub-offices (departments) of the OPCR office
  const { data: subOfficesData, isLoading: subOfficesLoading } = useOffices({
    pathParams: {},
    queryParams: {
      filters: officeId ? `parentId==${officeId}` : '',
      pageSize: 1000,
    },
  })

  const activityDefaults: ActivityDefaults = {
    name: activity?.name || '',
    budget: activity?.budget || 0,
    description: activity?.description || '',
    PAPDepartmentIds:
      activity?.PAPDepartments?.map((d: any) => d.office?.id || d.officeId || d.id) ||
      [],
  }

  const form = useOPCRActivityFormInstance(activityDefaults, onActivityUpdated)

  // Expose form to parent on creation via effect
  useEffect(() => {
    setForm?.(form)
  }, [form, setForm])

  return (
    <form
      id="update-activity-form"
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
            <Label htmlFor={field.name}>Activity Name</Label>
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
            <Label htmlFor={field.name}>Proposed Budget</Label>
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
