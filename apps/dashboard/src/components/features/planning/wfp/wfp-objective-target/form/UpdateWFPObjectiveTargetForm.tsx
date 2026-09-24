import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MONTH_ABBREVIATIONS,
  QUARTER_LABELS,
  getDayOfWeek,
  getPeriodDateObjects,
  getPeriodDates,
  getPeriods
} from './constants'
import { TimelineTypeSelector } from './TimelineTypeSelector'
import { TimelineGrid } from './TimelineGrid'
import { SelectedPeriodsSummary } from './SelectedPeriodsSummary'
import type { WFPDetails } from '../..'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const updateWFPObjectiveSchema = z.object({
  wfpObjectiveId: z.string().min(1, 'WFP Objective ID is required'),
  activityName: z.string().min(1, 'Activity name is required'),
  weight: z.number().min(0.01).max(100, 'Weight must be between 0 and 100').optional(),
  indicator: z.string().min(3, 'Indicator must be at least 3 characters long'),
  dates: z.array(z.object({
    timelineType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']),
    startDate: z.string(),
    endDate: z.string(),
    value: z.number().min(0.01, 'Target value must be greater than 0'),
  })).optional(),
})

export type UpdateWFPObjectiveTargetValues = z.infer<typeof updateWFPObjectiveSchema>

interface UpdateWFPObjectiveTargetFormProps {
  onSubmit: (data: UpdateWFPObjectiveTargetValues) => void
  onCancel: () => void
  isLoading?: boolean
  wfpObjectiveId: string
  wfpData?: WFPDetails
  initialValues: Partial<UpdateWFPObjectiveTargetValues>
}

export default function UpdateWFPObjectiveTargetForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  wfpObjectiveId,
  wfpData,
  initialValues
}: UpdateWFPObjectiveTargetFormProps) {
  const initialTimelineType = initialValues.dates && initialValues.dates.length > 0
    ? initialValues.dates[0].timelineType
    : 'Quarterly'

  const [selectedType, setSelectedType] = useState(initialTimelineType)

  // Initialize targetValues mapping from initial dates
  const [targetValues, setTargetValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    if (initialValues.dates && initialValues.dates.length > 0) {
      initialValues.dates.forEach((d, idx) => {
        const year = d.startDate ? new Date(d.startDate).getFullYear() : 2026
        const month = d.startDate ? new Date(d.startDate).getMonth() : idx * 3
        const qNum = Math.floor(month / 3) + 1
        const key = selectedType === 'Quarterly' ? `Q${qNum} ${year}` : `Q${idx + 1} ${year}`
        map[key] = String(d.value)
      })
    }
    return map
  })

  const [activeInput, setActiveInput] = useState<string | null>(null)

  const buildDates = useCallback(() => {
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2')

    return Object.entries(targetValues).map(([period, val]) => {
      const { startDate, endDate } = getPeriodDateObjects(period, selectedType, wfpData?.projectStartDate)
      return {
        timelineType: selectedType as 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual',
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        value: parseFloat(val) || 0
      }
    })
  }, [targetValues, selectedType, wfpData])

  const handleTargetChange = (period: string, val: string) => {
    setTargetValues(prev => {
      const newVals = { ...prev, [period]: val }
      if (val === '') delete newVals[period]
      return newVals
    })
  }

  const selectedCount = Object.keys(targetValues).length

  const getPeriodsForType = useCallback((type: string): ReadonlyArray<string> => {
    let projectStart: Date | null = null
    let projectEnd: Date | null = null

    if (wfpData?.projectStartDate && wfpData?.projectEndDate) {
      const ps = new Date(wfpData.projectStartDate)
      const pe = new Date(wfpData.projectEndDate)
      if (!isNaN(ps.getTime()) && ps.getFullYear() > 1900 && !isNaN(pe.getTime()) && pe.getFullYear() > 1900) {
        projectStart = ps
        projectEnd = pe
      }
    }

    if (!projectStart || !projectEnd) {
      const fallbackYear = (initialValues.dates && initialValues.dates.length > 0 && initialValues.dates[0].startDate)
        ? new Date(initialValues.dates[0].startDate).getFullYear()
        : new Date().getFullYear()
      const year = fallbackYear > 1900 ? fallbackYear : new Date().getFullYear()
      projectStart = new Date(year, 0, 1)
      projectEnd = new Date(year, 11, 31)
    }

    if (type === 'Monthly') {
      const startMonth = projectStart.getMonth()
      const endMonth = projectEnd.getMonth()
      const startYear = projectStart.getFullYear()
      const endYear = projectEnd.getFullYear()

      if (startYear === endYear) {
        return MONTH_ABBREVIATIONS.slice(startMonth, endMonth + 1)
      } else {
        const periodsArr: Array<string> = []
        let currentYear = startYear
        let currentMonth = startMonth
        while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
          periodsArr.push(`${MONTH_ABBREVIATIONS[currentMonth]} ${currentYear}`)
          currentMonth++
          if (currentMonth > 11) {
            currentMonth = 0
            currentYear++
          }
        }
        return periodsArr
      }
    } else if (type === 'Quarterly') {
      const startQuarter = Math.floor(projectStart.getMonth() / 3)
      const endQuarter = Math.floor(projectEnd.getMonth() / 3)
      const startYear = projectStart.getFullYear()
      const endYear = projectEnd.getFullYear()

      if (startYear === endYear) {
        return QUARTER_LABELS.slice(startQuarter, endQuarter + 1).map(q => `${q} ${startYear}`)
      } else {
        const periodsArr: Array<string> = []
        let currentYear = startYear
        let currentQuarter = startQuarter
        while (currentYear < endYear || (currentYear === endYear && currentQuarter <= endQuarter)) {
          periodsArr.push(`${QUARTER_LABELS[currentQuarter]} ${currentYear}`)
          currentQuarter++
          if (currentQuarter > 3) {
            currentQuarter = 0
            currentYear++
          }
        }
        return periodsArr
      }
    }
    return getPeriods(type)
  }, [wfpData, initialValues.dates])

  const periods = useMemo(() => {
    return getPeriodsForType(selectedType)
  }, [selectedType, getPeriodsForType])

  const form = useForm({
    defaultValues: {
      wfpObjectiveId,
      activityName: initialValues.activityName || '',
      indicator: initialValues.indicator || '',
      weight: initialValues.weight ?? 0,
      dates: initialValues.dates || [],
    } as UpdateWFPObjectiveTargetValues,
    validators: {
      onChange: updateWFPObjectiveSchema,
    },
    onSubmit: ({ value }) => {
      const dates = buildDates()
      const payload: UpdateWFPObjectiveTargetValues = {
        wfpObjectiveId: value.wfpObjectiveId,
        activityName: value.activityName,
        indicator: value.indicator,
        weight: value.weight,
        dates: dates,
      }
      onSubmit(payload)
    },
  })

  // Sync form with initialValues when they change
  useEffect(() => {
    if (initialValues.activityName || initialValues.indicator || initialValues.weight || initialValues.dates) {
      form.reset({
        wfpObjectiveId,
        activityName: initialValues.activityName || '',
        indicator: initialValues.indicator || '',
        weight: initialValues.weight ?? 0,
        dates: initialValues.dates || [],
      } as UpdateWFPObjectiveTargetValues)

      if (initialValues.dates && initialValues.dates.length > 0) {
        const map: Record<string, string> = {}
        initialValues.dates.forEach((d, idx) => {
          const year = d.startDate ? new Date(d.startDate).getFullYear() : 2026
          const month = d.startDate ? new Date(d.startDate).getMonth() : idx * 3
          const qNum = Math.floor(month / 3) + 1
          const key = `Q${qNum} ${year}`
          map[key] = String(d.value)
        })
        setTargetValues(map)
      }
    }
  }, [initialValues, wfpObjectiveId, form])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="relative pl-6 space-y-6 pt-2 max-w-2xl mx-auto"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-full" />

      {/* Activity Name */}
      <form.Field
        name="activityName"
        validators={{
          onChange: z.string().min(1, 'Activity name is required'),
        }}
        children={(field) => (
          <div className="space-y-1">
            <Label className="text-sm font-bold text-gray-700">
              Activity <span className="text-red-500">*</span>
            </Label>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-gray-200"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Expected Indicator */}
      <form.Field
        name="indicator"
        validators={{
          onChange: z.string().min(3, 'Indicator must be at least 3 characters long'),
        }}
        children={(field) => (
          <div className="space-y-1">
            <Label className="text-sm font-bold text-gray-700">
              Target Accomplishment (Indicator) <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., 10 blueprints drafted and submitted"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border-gray-200"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Weight */}
      <form.Field
        name="weight"
        validators={{
          onChange: z
            .number()
            .min(0.01, 'Weight must be at least 0.01')
            .max(100, 'Weight must be between 0 and 100'),
        }}
        children={(field) => (
          <div className="space-y-1">
            <Label className="text-sm font-bold text-gray-700">
              Weight (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={field.state.value || ''}
              onChange={(e) => {
                const val = e.target.value
                field.handleChange(val === '' ? 0 : parseFloat(val) || 0)
              }}
              className="border-gray-200"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">
                {field.state.meta.errors[0]?.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Timeline Type Selector */}
      <TimelineTypeSelector
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Selection Grid */}
      <TimelineGrid
        selectedType={selectedType}
        periods={periods}
        targetValues={targetValues}
        activeInput={activeInput}
        setActiveInput={setActiveInput}
        handleTargetChange={handleTargetChange}
        getDayOfWeek={(period, type, projectStart) => getDayOfWeek(period, type, projectStart)}
        projectStart={wfpData?.projectStartDate}
      />

      {/* Selected Periods Summary */}
      <SelectedPeriodsSummary
        selectedCount={selectedCount}
        targetValues={targetValues}
        selectedType={selectedType}
        getPeriodDates={getPeriodDates}
        projectStart={wfpData?.projectStartDate}
        onRemovePeriod={(period) => handleTargetChange(period, '')}
      />

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button 
          variant="outline" 
          type="button"
          onClick={() => {
            setFormData({})
            onCancel()
          }} 
          className="px-10"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 font-bold"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Update Activity'}
        </Button>
      </div>
    </form>
  )
}