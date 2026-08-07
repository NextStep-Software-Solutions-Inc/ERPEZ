import { useEffect, useMemo, useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { Plus, Trash2 } from 'lucide-react'
import FileUpload from '../../file-upload/FileUpload'
import type { FormType } from './CreateKpiForm'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TargetSectionProps {
  form: FormType
  isLoading?: boolean
  // mode?: 'kpi' | 'subKpi'
}

const QUARTERS = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter']
const PERIOD_TYPE = {
  ANNUAL: 'Annual',
  QUARTERLY: 'Quarterly',
} as const

type PeriodType = (typeof PERIOD_TYPE)[keyof typeof PERIOD_TYPE]

export default function TargetSection({
  form,
  isLoading = false,
  // mode = 'kpi',
}: TargetSectionProps) {
  const values = useStore(form.store, (state) => state.values)
  const [periodType, setPeriodType] = useState<PeriodType>(PERIOD_TYPE.ANNUAL)

  const total = useMemo(() => {
    const targets = values.KPITargets
    const calculatedTotal = targets.reduce((acc, target) => {
      const v = parseFloat(String(target.targetValue || 0))
      return acc + (isNaN(v) ? 0 : v)
    }, 0)
    return calculatedTotal
  }, [values.KPITargets])

  useEffect(() => {
    if (values.KPITargets.length === 0) {
      form.setFieldValue('KPITargets', [
        {
          period: 'Annual',
          targetValue: 0,
          quarterName: 'Annual',
        },
      ])
      setPeriodType(PERIOD_TYPE.ANNUAL)
    }
  }, [values.KPITargets])

  // Set period type based on inherited targets for subKpi mode
  useEffect(() => {
    const targets = values.KPITargets
    if (targets.length === 1 && targets[0]?.quarterName === 'Annual') {
      setPeriodType(PERIOD_TYPE.ANNUAL)
    } else if (targets.length === 4) {
      setPeriodType(PERIOD_TYPE.QUARTERLY)
    }
  }, [values.KPITargets])

  const handleChangePeriodType = (newPeriodType: PeriodType) => {
    setPeriodType(newPeriodType)
    if (newPeriodType === PERIOD_TYPE.ANNUAL) {
      form.setFieldValue('KPITargets', [
        {
          period: 'Annual',
          targetValue: 0,
          quarterName: 'Annual',
        },
      ])
    } else {
      form.setFieldValue(
        'KPITargets',
        QUARTERS.map((quarter) => ({
          period: 'Quarterly',
          targetValue: 0,
          quarterName: quarter,
        })),
      )
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label className="font-medium">Period Type <span className='text-destructive'>*</span></Label>
        <Select
          value={periodType}
          onValueChange={(value) => handleChangePeriodType(value as PeriodType)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select period type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PERIOD_TYPE.ANNUAL}>Annual</SelectItem>
            <SelectItem value={PERIOD_TYPE.QUARTERLY}>Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {values.KPITargets.length > 0 ? (
        <div className="grid gap-3">
          <Label className="font-medium">Target Values *</Label>
          {periodType === PERIOD_TYPE.ANNUAL ? (
            <div className="flex items-end gap-3 p-4 border rounded-lg bg-blue-50/50">
              <div className="flex-1 min-w-0">
                <Label className="text-sm mb-2 block">
                  Annual Target Value
                </Label>
                <form.Field
                  name="KPITargets[0].targetValue"
                  children={(field) => (
                    <Input
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(parseFloat(e.target.value) || 0)
                      }
                      placeholder="Enter annual target value"
                      disabled={isLoading}
                      className="w-full truncate"
                    />
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
                {values.KPITargets.map((target, index) => (
                <div
                  key={`quarter-${index}`}
                  className="flex flex-col gap-2 p-4 border rounded-lg bg-green-50/50 min-w-0"
                >
                  <Label className="text-sm font-medium truncate">
                    {target.quarterName}
                  </Label>
                  <form.Field
                    name={`KPITargets[${index}].targetValue`}
                    children={(field) => (
                      <Input
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(parseFloat(e.target.value) || 0)
                        }
                        placeholder={`${target.quarterName} target value`}
                        disabled={isLoading}
                        className="w-full truncate"
                      />
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-sm bg-blue-100/90 text-blue-700 border border-blue-700 rounded-md p-3 font-medium">
            Total: {total.toFixed(2)}
            {values.isPercentage ? '%' : ''}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg">
          Select a period type to create targets.
        </div>
      )}

      <div className="grid gap-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <Label className="font-medium">
            Modes of Verification <span className="text-destructive">*</span>
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              form.pushFieldValue('KPIMOVs', {
                name: '',
                description: '',
                fileId: '',
              })
            }
            disabled={isLoading}
            className="gap-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <Plus className="w-4 h-4" /> Add Mode of Verification
          </Button>
        </div>

        {values.KPIMOVs.length > 0 ? (
          <div className="grid gap-3">
            {values.KPIMOVs.map((_, index) => (
              <div
                key={`kpi-mov-${index}`}
                className="p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-sm">
                    Mode of Verification {index + 1}
                  </h3>
                  {values.KPIMOVs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => form.removeFieldValue('KPIMOVs', index)}
                      disabled={
                        isLoading || values.KPIMOVs.length <= 1
                      }
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label className="text-sm">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <form.Field
                      name={`KPIMOVs[${index}].name`}
                      children={(field) => (
                        <Input
                          type="text"
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="e.g., Monthly Reports, Audit Trail, Performance Review"
                          disabled={isLoading}
                          className="w-full overflow-hidden overflow-ellipsis whitespace-nowrap"
                        />
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-sm">Description</Label>
                    <form.Field
                      name={`KPIMOVs[${index}].description`}
                      children={(field) => (
                        <Textarea
                          value={field.state.value || ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Describe this mode of verification..."
                          disabled={isLoading}
                          rows={2}
                          className="w-full resize-none overflow-hidden"
                        />
                      )}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-sm">File/Document</Label>
                    <form.Field
                      name={`KPIMOVs[${index}].fileId`}
                      children={(field) => (
                        <FileUpload
                          onFileChange={(file) => {
                            field.handleChange(file?.name || '')
                            form.setFieldValue(`KPIMOVs[${index}].file`, file || undefined)
                          }}
                          disabled={isLoading}
                          acceptedTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          maxSize={10}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
