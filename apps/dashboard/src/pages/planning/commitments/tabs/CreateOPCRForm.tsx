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
import { useCreateOPCR, useOPCRs } from '@/features/planning/opcr/hooks/useOPCR'
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
  existingFiscalYears?: number[]
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: OPCRFormApi) => void
}

export default function CreateOPCRForm({
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

  // Fetch existing OPCRs to determine which offices already have OPCRs per fiscal year
  const { data: opcrsData, isLoading: loadingOPCRs } = useOPCRs({
    pathParams: {},
    queryParams: { pageSize: 1000 },
  })

  const availableFiscalYears = useMemo(() => {
    return (fiscalYearsData?.data ?? [])
      .slice()
      .sort((a, b) => a.year - b.year)
  }, [fiscalYearsData])

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

  // Determine which offices already have an OPCR for the selected fiscal year
  const existingOfficeIdsForSelectedFY = useMemo(() => {
    if (!fiscalYearId || !opcrsData?.data || !fiscalYearsData?.data) {
      return new Set<string>()
    }
    const selectedFY = fiscalYearsData.data.find((fy) => fy.id === fiscalYearId)
    if (!selectedFY) return new Set<string>()

    const set = new Set<string>()
    opcrsData.data.forEach((opcr: any) => {
      const opcrYear =
        typeof opcr.fiscalYear === 'number'
          ? opcr.fiscalYear
          : opcr.fiscalYear?.year
      const opcrFyId =
        opcr.fiscalYearId ||
        (typeof opcr.fiscalYear === 'object' ? opcr.fiscalYear?.id : undefined)

      const matchesYear =
        (opcrYear !== undefined && opcrYear === selectedFY.year) ||
        (opcrFyId !== undefined && opcrFyId === selectedFY.id)

      if (matchesYear) {
        const offId = opcr.officeId || opcr.office?.id
        if (offId) {
          set.add(String(offId).toLowerCase())
        }
      }
    })
    return set
  }, [fiscalYearId, opcrsData, fiscalYearsData])

  // If fiscal year changes and the previously selected office already has an OPCR for the new year, auto-reset
  useEffect(() => {
    if (!fiscalYearId || !officeId) return

    if (existingOfficeIdsForSelectedFY.has(String(officeId).toLowerCase())) {
      form.setFieldValue('officeId', '')
      form.setFieldValue('name', '')
      form.setFieldValue('code', '')
      toast.info(
        'The previously selected office already has an OPCR for this fiscal year. Please select another office.',
      )
    }
  }, [fiscalYearId, existingOfficeIdsForSelectedFY, officeId, form])

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
        children={(field) => {
          const isOfficeDisabled =
            !fiscalYearId || loadingOffices || loadingOPCRs || isPending

          return (
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
                          Office Assignment
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Each office may have only one OPCR per fiscal year.
                          Offices that already have an OPCR for the selected
                          year are disabled.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
                disabled={isOfficeDisabled}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue
                    placeholder={
                      !fiscalYearId
                        ? 'Select a Fiscal Year first'
                        : loadingOffices || loadingOPCRs
                          ? 'Loading offices...'
                          : 'Select Office'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {officesData?.data?.map((office) => {
                    const alreadyExists = existingOfficeIdsForSelectedFY.has(
                      String(office.id).toLowerCase(),
                    )
                    return (
                      <SelectItem
                        key={office.id}
                        value={office.id}
                        disabled={alreadyExists}
                      >
                        <div className="flex items-center justify-between w-full gap-2">
                          <span>
                            {office.name} {office.code ? `(${office.code})` : ''}
                          </span>
                          {alreadyExists && (
                            <span className="text-xs text-amber-700 font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 ml-2">
                              OPCR already exists
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
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
          )
        }}
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
