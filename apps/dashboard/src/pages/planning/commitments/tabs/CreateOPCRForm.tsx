import { useMemo, useEffect } from 'react'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Info, AlertCircle } from 'lucide-react'
import { createQueryHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { useCreateOPCR } from '@/features/planning/opcr/hooks/useOPCR'
import { getFiscalYearsRequest } from '@/features/planning/fiscal-year-and-policies/fiscal-year-management/handlers/getFiscalYearsRequest'
import { getOfficesRequest } from '@/components/features/planning/office/office/handlers/getOfficesRequest'
import { useForm, useField } from '@tanstack/react-form'
import { z } from 'zod'
import FieldInfo from '@/components/FieldInfo'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useOffices = createQueryHookFromTemplate(getOfficesRequest)

const createOPCRSchema = z.object({
  fiscalYearId: z.string().min(1, 'Fiscal Year is required'),
  officeId: z.string().min(1, 'Office is required'),
  name: z.string().min(10, 'Name must be at least 10 characters'),
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(/^[A-Z0-9-]+$/, 'Code must be uppercase and contain no spaces'),
})

export type CreateOPCRFormValues = z.infer<typeof createOPCRSchema>

// Helper to extract the form type without relying on complex generics
const useOPCRFormInstance = () =>
  useForm({
    defaultValues: {
      fiscalYearId: '',
      officeId: '',
      name: '',
      code: '',
    },
    validators: {
      onChange: createOPCRSchema,
    },
  })

export type OPCRFormApi = ReturnType<typeof useOPCRFormInstance>

interface CreateOPCRFormProps {
  existingFiscalYears: number[]
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: OPCRFormApi) => void
}

export default function CreateOPCRForm({
  existingFiscalYears,
  onCreated,
  onClose,
  setForm,
}: CreateOPCRFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateOPCR()

  // Fetch Fiscal Years
  const { data: fiscalYearsData, isLoading: loadingFY } = useFiscalYears({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })

  // Fetch Offices
  const { data: officesData, isLoading: loadingOffices } = useOffices({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })

  const availableFiscalYears = useMemo(() => {
    return (fiscalYearsData?.data ?? [])
      .filter((fy) => !existingFiscalYears.includes(fy.year))
      .sort((a, b) => a.year - b.year)
  }, [fiscalYearsData, existingFiscalYears])

  const form = useForm({
    defaultValues: {
      fiscalYearId: '',
      officeId: '',
      name: '',
      code: '',
    },
    validators: {
      onChange: createOPCRSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(
          {
            pathParams: {},
            payload: {
              fiscalYearId: value.fiscalYearId,
              officeId: value.officeId,
              name: value.name,
              code: value.code,
            },
          },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].startsWith('/opcrs'),
              })

              onCreated?.()
              onClose?.()
            },
          },
        )
        onCreated?.()
        onClose?.()
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create OPCR'
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

  // Watch FY and Office changes to auto-generate name and code
  const fiscalYearId = useField({ form, name: 'fiscalYearId' }).state.value
  const officeId = useField({ form, name: 'officeId' }).state.value

  useEffect(() => {
    if (!fiscalYearId || !officeId) return

    const selectedFY = fiscalYearsData?.data?.find(
      (fy) => fy.id === fiscalYearId,
    )
    const selectedOffice = officesData?.data?.find((o) => o.id === officeId)

    if (selectedFY && selectedOffice) {
      const year = selectedFY.year
      const officeName = selectedOffice.name
      const officeCode = (
        selectedOffice.code || (selectedOffice?.name || '').substring(0, 4)
      )
        .toUpperCase()
        .replace(/\s+/g, '')

      const name = `OPCR-${year}-${officeName}`
      const code = `OPCR-${officeCode}-EXEC`

      form.setFieldValue('name', name)
      form.setFieldValue('code', code)
    }
  }, [fiscalYearId, officeId, fiscalYearsData, officesData, form])

  return (
    <form
      id="create-opcr-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Fiscal Year Field */}
      <form.Field
        name="fiscalYearId"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Fiscal Year</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={loadingFY || isPending}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue
                  placeholder={loadingFY ? 'Loading...' : 'Select Fiscal Year'}
                />
              </SelectTrigger>
              <SelectContent>
                {availableFiscalYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    {fy.year}
                    {fy.description ? ` — ${fy.description}` : ''}
                  </SelectItem>
                ))}
                {!loadingFY && availableFiscalYears.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground italic">
                    No available fiscal years
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
            <div className="flex items-center gap-2">
              <Label htmlFor={field.name}>Office</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="right" className="w-80 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-1">
                        Temporary Selection
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This selection is temporary for Office identification
                        and will be automatically linked to your profile in the
                        future.
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={loadingOffices || isPending}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue
                  placeholder={loadingOffices ? 'Loading...' : 'Select Office'}
                />
              </SelectTrigger>
              <SelectContent>
                {officesData?.data?.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name} {office.code ? `(${office.code})` : ''}
                  </SelectItem>
                ))}
                {!loadingOffices &&
                  (!officesData?.data || officesData.data.length === 0) && (
                    <div className="px-3 py-2 text-sm text-muted-foreground italic">
                      No offices found
                    </div>
                  )}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Name Field */}
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>OPCR Name</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Enter OPCR Name"
              disabled={isPending}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Code Field */}
      <form.Field
        name="code"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>OPCR Code</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(
                  e.target.value.toUpperCase().replace(/\s+/g, ''),
                )
              }
              placeholder="Enter OPCR Code"
              disabled={isPending}
            />
            <FieldInfo field={field} />
          </div>
        )}
      />
    </form>
  )
}
