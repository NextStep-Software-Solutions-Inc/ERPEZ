/**
 * CreatePpmpMetadataForm
 * Step 1 of the PPMP Builder workflow — captures PPMP metadata using TanStack Form.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useStore } from '@tanstack/react-form'
import { Pencil, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createPpmpMetadataSchema,
  DEFAULT_PPMP_SEQUENCE_SUFFIX,
  extractPpmpSequenceSuffix,
  generatePpmpNumber,
  type CreatePpmpMetadataFormValues,
} from './createPpmpMetadataForm.schema'
import FieldInfo from '@/components/FieldInfo'
import { usePpmpFormData } from '../hooks/usePpmpFormData'

interface CreatePpmpMetadataFormProps {
  formId: string
  onSubmit: (data: CreatePpmpMetadataFormValues) => void | Promise<void>
  isLoading?: boolean
  defaultOfficeId?: string
  defaultIsMaster?: boolean
  initialValues?: Partial<CreatePpmpMetadataFormValues>
  onValuesChange?: (values: Partial<CreatePpmpMetadataFormValues>) => void
}

export function CreatePpmpMetadataForm({
  formId,
  onSubmit,
  isLoading = false,
  defaultOfficeId,
  defaultIsMaster = false,
  initialValues,
  onValuesChange,
}: CreatePpmpMetadataFormProps) {
  const [isAutoGeneratePpmpNumber, setIsAutoGeneratePpmpNumber] = useState(
    !initialValues?.ppmpNumber,
  )
  const [sequenceSuffix, setSequenceSuffix] = useState(
    extractPpmpSequenceSuffix(initialValues?.ppmpNumber),
  )
  const didMountRef = useRef(false)

  // Fetch all dropdown data
  const {
    offices,
    fiscalYears,
    libs,
    fundSources,
    ppmps,
    libActivities,
    ppmpActivities,
    isLoading: isFormDataLoading,
  } = usePpmpFormData({ enabled: true })

  const form = useForm({
    defaultValues: {
      officeId: initialValues?.officeId ?? defaultOfficeId ?? '',
      fiscalYearId: initialValues?.fiscalYearId ?? '',
      libId: initialValues?.libId ?? '',
      fundSourceId: initialValues?.fundSourceId ?? null,
      parentId: initialValues?.parentId ?? null,
      ppmpNumber: initialValues?.ppmpNumber ?? null,
      isMaster: initialValues?.isMaster ?? defaultIsMaster,
    },

    validators: {
      onChange: createPpmpMetadataSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const fiscalYearId = useStore(
    form.store,
    (state) => state.values.fiscalYearId,
  )
  const ppmpNumber = useStore(form.store, (state) => state.values.ppmpNumber)
  const values = useStore(form.store, (state) => state.values)
  const formLibId = useStore(form.store, (state) => state.values.libId)
  const isDirty = useStore(form.store, (state) => state.isDirty)

  const { availableLibs, fullyPlannedLibs } = useMemo(() => {
    const latestMap = new Map<string, (typeof libs)[0]>()
    for (const lib of libs) {
      const isApproved = !lib.status || lib.status.toLowerCase() === 'approved'
      if (!isApproved) continue

      const key = lib.libNumber || lib.name
      const existing = latestMap.get(key)
      if (
        !existing ||
        (lib.version !== undefined &&
          (existing.version === undefined || lib.version > existing.version))
      ) {
        latestMap.set(key, lib)
      }
    }

    const latestLibs = Array.from(latestMap.values())
    const currentLibId = initialValues?.libId || formLibId
    if (currentLibId) {
      const hasCurrent = latestLibs.some((lib) => lib.id === currentLibId)
      if (!hasCurrent) {
        const found = libs.find((lib) => lib.id === currentLibId)
        if (found) {
          latestLibs.push(found)
        }
      }
    }

    const activePpmpActivitySet = new Set(
      ppmpActivities
        .filter((pa: any) => pa.libActivityId)
        .map((pa: any) => pa.libActivityId),
    )

    const available: (typeof libs)[0][] = []
    const fullyPlanned: (typeof libs)[0][] = []

    for (const lib of latestLibs) {
      if (currentLibId && lib.id === currentLibId) {
        available.push(lib)
        continue
      }

      if (lib.scope === 'Project') {
        const isLinkedToPpmp = ppmps.some(
          (p: any) =>
            p.libId === lib.id &&
            !p.isDeleted &&
            p.status?.toLowerCase() !== 'archived',
        )
        if (isLinkedToPpmp) {
          fullyPlanned.push(lib)
        } else {
          available.push(lib)
        }
      } else {
        const acts = libActivities.filter(
          (a: any) => a.lineItemBudgetId === lib.id,
        )
        if (
          acts.length > 0 &&
          acts.every((a: any) => activePpmpActivitySet.has(a.id))
        ) {
          fullyPlanned.push(lib)
        } else {
          available.push(lib)
        }
      }
    }

    return { availableLibs: available, fullyPlannedLibs: fullyPlanned }
  }, [
    libs,
    ppmps,
    libActivities,
    ppmpActivities,
    initialValues?.libId,
    formLibId,
  ])

  const selectedFiscalYear = useMemo(
    () => fiscalYears.find((fy) => fy.id === fiscalYearId),
    [fiscalYears, fiscalYearId],
  )

  useEffect(() => {
    if (didMountRef.current) {
      onValuesChange?.(isDirty ? values : {})
    } else {
      didMountRef.current = true
    }
  }, [isDirty, onValuesChange, values])

  useEffect(() => {
    if (isAutoGeneratePpmpNumber && selectedFiscalYear) {
      form.setFieldValue(
        'ppmpNumber',
        generatePpmpNumber(selectedFiscalYear.year, sequenceSuffix),
      )
    }
  }, [form, isAutoGeneratePpmpNumber, selectedFiscalYear, sequenceSuffix])

  const handleToggleAutoGenerate = () => {
    const nextValue = !isAutoGeneratePpmpNumber
    setIsAutoGeneratePpmpNumber(nextValue)

    if (nextValue) {
      if (selectedFiscalYear) {
        form.setFieldValue(
          'ppmpNumber',
          generatePpmpNumber(selectedFiscalYear.year, sequenceSuffix),
        )
      }
      return
    }

    if (!ppmpNumber && selectedFiscalYear) {
      form.setFieldValue(
        'ppmpNumber',
        generatePpmpNumber(selectedFiscalYear.year, sequenceSuffix),
      )
    }

    setTimeout(() => {
      const element = document.getElementById('ppmp-number-input')
      element?.focus()
    }, 50)
  }

  const handleSuffixChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, '').slice(0, 4)
    const nextSuffix = raw || DEFAULT_PPMP_SEQUENCE_SUFFIX
    setSequenceSuffix(nextSuffix)

    if (isAutoGeneratePpmpNumber && selectedFiscalYear) {
      form.setFieldValue(
        'ppmpNumber',
        generatePpmpNumber(selectedFiscalYear.year, nextSuffix),
      )
    }
  }

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <form.Field name="officeId">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Office</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={isLoading || isFormDataLoading}
            >
              <SelectTrigger size="md">
                <SelectValue placeholder="Select an office..." />
              </SelectTrigger>
              <SelectContent>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Field name="fiscalYearId">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Fiscal Year</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={isLoading || isFormDataLoading}
            >
              <SelectTrigger size="md">
                <SelectValue placeholder="Select a fiscal year..." />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((fy) => (
                  <SelectItem key={fy.id} value={fy.id}>
                    FY {fy.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="ppmp-number-input">PPMP Number</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 gap-1 text-xs text-muted-foreground"
            onClick={handleToggleAutoGenerate}
            disabled={isLoading || isFormDataLoading}
          >
            {isAutoGeneratePpmpNumber ? (
              <>
                <Lock className="h-3 w-3" />
                Auto-generated
              </>
            ) : (
              <>
                <Pencil className="h-3 w-3" />
                Manual entry
              </>
            )}
          </Button>
        </div>

        {isAutoGeneratePpmpNumber ? (
          <div className="flex items-center gap-0">
            <span className="flex h-9 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none whitespace-nowrap">
              FY-{selectedFiscalYear?.year || 'YYYY'}-
            </span>
            <Input
              className="rounded-l-none w-24"
              placeholder={DEFAULT_PPMP_SEQUENCE_SUFFIX}
              value={sequenceSuffix}
              onChange={handleSuffixChange}
              maxLength={4}
              inputMode="numeric"
              disabled={isLoading || isFormDataLoading}
            />
          </div>
        ) : (
          <Input
            id="ppmp-number-input"
            placeholder="FY-YYYY-0001"
            value={ppmpNumber || ''}
            onChange={(event) =>
              form.setFieldValue('ppmpNumber', event.target.value || null)
            }
            disabled={isLoading || isFormDataLoading}
          />
        )}

        <p className="text-xs text-muted-foreground">
          Auto-generated format uses the selected fiscal year.
        </p>
        {form.state.fieldMeta.ppmpNumber?.errors?.length ? (
          <p className="text-xs text-destructive">
            {String(form.state.fieldMeta.ppmpNumber.errors[0])}
          </p>
        ) : null}
      </div>

      <form.Field name="libId">
        {(field) => (
          <div className="space-y-2 text-left">
            <Label htmlFor={field.name}>Line-Item Budget</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={
                isLoading ||
                isFormDataLoading ||
                (availableLibs.length === 0 && fullyPlannedLibs.length === 0)
              }
            >
              <SelectTrigger size="md" className="w-full text-left justify-between [&>span]:text-left [&>span]:truncate [&>span]:block">
                <SelectValue
                  placeholder={
                    isFormDataLoading
                      ? 'Loading Line-Item Budgets...'
                      : availableLibs.length === 0 && fullyPlannedLibs.length === 0
                        ? 'No approved Line-Item Budgets found'
                        : availableLibs.length === 0
                          ? 'All approved Line-Item Budgets are fully planned'
                          : 'Select a LIB...'
                  }
                />
              </SelectTrigger>
              <SelectContent align="start" className="text-left">
                {availableLibs.map((lib) => (
                  <SelectItem key={lib.id} value={lib.id} className="text-left justify-start cursor-pointer">
                    <span className="text-left truncate">{lib.name || lib.libNumber}</span>
                  </SelectItem>
                ))}
                {fullyPlannedLibs.map((lib) => (
                  <SelectItem
                    key={lib.id}
                    value={lib.id}
                    disabled
                    className="text-left justify-start opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                  >
                    <span className="text-left truncate text-slate-500 flex items-center gap-1.5">
                      <Lock className="h-3 w-3 inline shrink-0 text-slate-400" />
                      <span>{lib.name || lib.libNumber}</span>
                      <span className="text-[10px] text-muted-foreground italic">(Fully Planned)</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Field name="fundSourceId">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Fund Source (Optional)</Label>
            <Select
              value={field.state.value ?? 'none'}
              onValueChange={(val) => field.handleChange(val === 'none' ? null : val)}
              disabled={isLoading || isFormDataLoading}
            >
              <SelectTrigger size="md">
                <SelectValue placeholder="Select a fund source..." />
              </SelectTrigger>
              <SelectContent className="max-h-72 overflow-y-auto">
                <SelectItem value="none">None / Select a fund source...</SelectItem>
                {fundSources.map((fundSource) => (
                  <SelectItem key={fundSource.id} value={fundSource.id}>
                    {fundSource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Field name="parentId">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Parent PPMP (Optional)</Label>
            <Select
              value={field.state.value ?? 'none'}
              onValueChange={(val) => field.handleChange(val === 'none' ? null : val)}
              disabled={isLoading || isFormDataLoading}
            >
              <SelectTrigger size="md">
                <SelectValue placeholder="Select a parent PPMP..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Select a parent PPMP...</SelectItem>
                {ppmps.map((ppmp) => (
                  <SelectItem key={ppmp.id} value={ppmp.id}>
                    {ppmp.documentName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a PPMP to create an amendment.
            </p>
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

    </form>
  )
}
