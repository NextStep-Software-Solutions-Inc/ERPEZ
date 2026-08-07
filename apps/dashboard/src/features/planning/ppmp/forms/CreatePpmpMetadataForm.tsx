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
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting)
  const isDirty = useStore(form.store, (state) => state.isDirty)

  const filteredLibs = useMemo(() => {
    const latestMap = new Map<string, typeof libs[0]>()
    for (const lib of libs) {
      const isApproved = !lib.status || lib.status.toLowerCase() === 'approved'
      if (!isApproved) continue
      
      const key = lib.libNumber || lib.name
      const existing = latestMap.get(key)
      if (
        !existing || 
        (lib.version !== undefined && (existing.version === undefined || lib.version > existing.version))
      ) {
        latestMap.set(key, lib)
      }
    }
    
    const result = Array.from(latestMap.values())
    
    const currentLibId = initialValues?.libId || formLibId
    if (currentLibId) {
      const hasCurrent = result.some(lib => lib.id === currentLibId)
      if (!hasCurrent) {
        const found = libs.find(lib => lib.id === currentLibId)
        if (found) {
          result.push(found)
        }
      }
    }
    
    return result
  }, [libs, initialValues?.libId, formLibId])

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
          <div className="space-y-2">
            <Label htmlFor={field.name}>Line-Item Budget</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
              disabled={isLoading || isFormDataLoading}
            >
              <SelectTrigger size="md">
                <SelectValue placeholder="Select a LIB..." />
              </SelectTrigger>
              <SelectContent>
                {filteredLibs.map((lib) => (
                  <SelectItem key={lib.id} value={lib.id}>
                    {lib.name}
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
              <SelectContent>
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
