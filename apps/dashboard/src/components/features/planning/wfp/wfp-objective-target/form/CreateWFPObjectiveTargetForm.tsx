import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createFormDataAtom } from '../atoms'
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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
// Schema for form validation including dynamically built dates
export const createWFPObjectiveTargetSchema = z.object({
  wfpObjectiveId: z.string().min(1),
  activityName: z.string().min(1),
  indicator: z.string().min(1),
  weight: z.number().min(0).max(100).optional(),
  dates: z.array(z.object({
    timelineType: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual']),
    startDate: z.string(),
    endDate: z.string(),
    value: z.number().min(0.01, 'Target value must be greater than 0'),
  })).min(1, 'At least one target period must be selected'),
});

// Type includes the dates array as part of the schema
export type CreateWFPObjectiveTargetValues = z.infer<typeof createWFPObjectiveTargetSchema>;

interface CreateWFPObjectiveTargetFormProps {
  onSubmit: (values: CreateWFPObjectiveTargetValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  wfpObjectiveId: string;
  wfpData?: WFPDetails;
  initialValues?: Partial<CreateWFPObjectiveTargetValues>;
}

export default function CreateWFPObjectiveTargetForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  wfpObjectiveId,
  wfpData,
  initialValues = {}
}: CreateWFPObjectiveTargetFormProps) {
  const [formData, setFormData] = useAtom(createFormDataAtom)
  const initialTimelineType = initialValues.dates && initialValues.dates.length > 0
    ? initialValues.dates[0].timelineType
    : 'Monthly'
  const [selectedType, setSelectedType] = useState(initialTimelineType)
  const [targetValues, setTargetValues] = useState<Record<string, string>>({})
  const [activeInput, setActiveInput] = useState<string | null>(null)
  // Build dates array dynamically based on selected periods
  const buildDates = useCallback(() => {
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2');
    return Object.entries(targetValues).map(([period, val]) => {
      const { startDate, endDate } = getPeriodDateObjects(period, selectedType, wfpData?.projectStartDate);
      
      // Use exclusive endDate as returned by getPeriodDateObjects
      return {
        timelineType: selectedType,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        value: parseFloat(val) || 0
      }
    })
  }, [targetValues, selectedType, wfpData])

  useEffect(() => {
    setTargetValues({})
    setActiveInput(null)
  }, [selectedType])

  const handleTargetChange = (period: string, val: string) => {
    setTargetValues(prev => {
      const newVals = { ...prev, [period]: val }
      if (val === '') delete newVals[period]
      return newVals
    })
  }

  const selectedCount = Object.keys(targetValues).length
  
  const getPeriodsForType = useCallback((type: string): ReadonlyArray<string> => {
    if (!wfpData?.projectStartDate || !wfpData?.projectEndDate) {
      return getPeriods(type);
    }
    const projectStart = new Date(wfpData.projectStartDate);
    const projectEnd = new Date(wfpData.projectEndDate);
    if (type === 'Monthly') {
      const startMonth = projectStart.getMonth();
      const endMonth = projectEnd.getMonth();
      const startYear = projectStart.getFullYear();
      const endYear = projectEnd.getFullYear();
      
      if (startYear === endYear) {
        return MONTH_ABBREVIATIONS.slice(startMonth, endMonth + 1);
      } else {
        // Multi-year: generate months with years
        const periods: Array<string> = [];
        let currentYear = startYear;
        let currentMonth = startMonth;
        
        while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
          periods.push(`${MONTH_ABBREVIATIONS[currentMonth]} ${currentYear}`);
          currentMonth++;
          if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
          }
        }
        return periods;
      }
    } else if (type === 'Quarterly') {
      const startQuarter = Math.floor(projectStart.getMonth() / 3);
      const endQuarter = Math.floor(projectEnd.getMonth() / 3);
      const startYear = projectStart.getFullYear();
      const endYear = projectEnd.getFullYear();
      
      if (startYear === endYear) {
        return QUARTER_LABELS.slice(startQuarter, endQuarter + 1);
      } else {
        // Multi-year: generate quarters with years
        const periods: Array<string> = [];
        let currentYear = startYear;
        let currentQuarter = startQuarter;
        
        while (currentYear < endYear || (currentYear === endYear && currentQuarter <= endQuarter)) {
          periods.push(`${QUARTER_LABELS[currentQuarter]} ${currentYear}`);
          currentQuarter++;
          if (currentQuarter > 3) {
            currentQuarter = 0;
            currentYear++;
          }
        }
        return periods;
      }
    } else if (type === 'Weekly') {
      const days = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
      const weeks = Math.ceil(days / 7);
      return Array.from({ length: weeks }, (_, i) => {
        const weekStart = new Date(projectStart);
        weekStart.setDate(projectStart.getDate() + (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
        const startDay = weekStart.getDate();
        const endDay = weekEnd.getDate();
        
        if (startMonth === endMonth) {
          return `${startMonth} ${startDay}-${endDay}`;
        } else {
          return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
        }
      });
    } else if (type === 'Daily') {
      const days = Math.floor((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(projectStart);
        date.setDate(projectStart.getDate() + i);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
    } else if (type === 'Annual') {
      const startYear = projectStart.getFullYear();
      const endYear = projectEnd.getFullYear();
      return Array.from({ length: endYear - startYear + 1 }, (_, i) => (startYear + i).toString());
    } else {
      return getPeriods(type);
    }
  }, [wfpData]);
  
  // Calculate periods based on WFP data
  const periods = useMemo(() => {
    if (!wfpData) {
      return []
    }
    return getPeriodsForType(selectedType)
  }, [selectedType, wfpData])
  const form = useForm({
    defaultValues: {
      activityName: initialValues.activityName || formData.activityName || '',
      indicator: initialValues.indicator || formData.indicator || '',
      weight: initialValues.weight ?? formData.weight ?? 0,
      dates: initialValues.dates || formData.dates || [],
      wfpObjectiveId,
    } as CreateWFPObjectiveTargetValues,
    validators: {
      onChange: createWFPObjectiveTargetSchema,
      onSubmit: createWFPObjectiveTargetSchema,
    },
    onSubmit: async ({ value }) => {
      const dates = buildDates()
      if (dates.length === 0) {
        toast.error('Please select at least one target period with a value.')
        return
      }
      
      // Explicitly construct payload to avoid passing unnecessary properties (like legacy 'targets')
      const payload: CreateWFPObjectiveTargetValues = {
        activityName: value.activityName,
        indicator: value.indicator,
        weight: value.weight,
        wfpObjectiveId: value.wfpObjectiveId,
        dates
      }
      
      onSubmit(payload)
    },
  })

  useEffect(() => {
    const dates = buildDates()
    form.setFieldValue('dates', dates)
  }, [buildDates, form])

  // Sync form state to Jotai atom for persistence
  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const values = form.state.values;
      setFormData({
        wfpObjectiveId: values.wfpObjectiveId,
        activityName: values.activityName,
        indicator: values.indicator,
        weight: values.weight,
        dates: values.dates,
      });
    });
    return unsubscribe;
  }, [form.store, setFormData])

  // Reset form when onCancel is called
  const handleCancel = () => {
    setTargetValues({})
    setActiveInput(null)
    form.reset()
    onCancel()
  }
  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="relative pl-6 space-y-6 pt-2 max-w-2xl mx-auto"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#10b981] rounded-full" />
      
      {/* Standard Fields (Activity & Indicator) */}
      <form.Field
        name="activityName"
        validators={{
          onChange: z.string().min(1, 'Activity name is required'),
        }}
        children={(activityNameField) => (
          <div>
            <Label className="text-sm font-bold text-gray-700">Activity <div className="text-red-500 inline">*</div></Label>
            <Input
              placeholder="Enter Target Activity"
              className="border-gray-200"
              value={activityNameField.state.value}
              onChange={(e) => activityNameField.handleChange(e.target.value)}
            />
            {activityNameField.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">{activityNameField.state.meta.errors[0]?.message}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="indicator"
        validators={{
          onChange: z.string().min(1, 'Indicator is required'),
        }}
        children={(indicatorField) => (
          <div>
            <Label className="text-sm font-bold text-gray-700">Target Accomplishment <div className="text-red-500 inline">*</div></Label>
            <Input
              placeholder="Enter Target Accomplishment"
              className="border-gray-200"
              value={indicatorField.state.value}
              onChange={(e) => indicatorField.handleChange(e.target.value)}
            />
            {indicatorField.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">{indicatorField.state.meta.errors[0]?.message}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="weight"
        validators={{
          onChange: z.number().min(.01).max(100, 'Weight must be between 0 and 100'),
        }}
        children={(weightField) => (
          <div>
            <Label className="text-sm font-bold text-gray-700">Weight (%)<div className="text-red-500 inline">*</div></Label>
            <Input
              type="number"
              placeholder="Enter weight"
              className="border-gray-200"
              value={weightField.state.value || ''}
              onChange={(e) => {
                const val = e.target.value;
                weightField.handleChange(val === '' ? undefined : parseFloat(val) || 0);
              }}
            />
            {weightField.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-xs">{weightField.state.meta.errors[0]?.message}</p>
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

      {/* Validation error for dates */}
      <form.Field
        name="dates"
        children={(datesField) => (
          <>
            {datesField.state.meta.errors.length > 0 && (
              <p className="text-red-500 text-sm font-medium">{datesField.state.meta.errors[0]?.message}</p>
            )}
          </>
        )}
      />

      {/* Selected Periods Summary */}
      <SelectedPeriodsSummary
        selectedCount={selectedCount}
        targetValues={targetValues}
        selectedType={selectedType}
        getPeriodDates={getPeriodDates}
        projectStart={wfpData?.projectStartDate}
      />
      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button variant="outline" onClick={handleCancel} className="px-10" disabled={isLoading}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={isLoading || form.state.isSubmitting}
          className="bg-[#10b981] hover:bg-[#059669] text-white px-10"
        >
          {isLoading || form.state.isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Activity'}
        </Button>
      </div>
    </form>
  )
}