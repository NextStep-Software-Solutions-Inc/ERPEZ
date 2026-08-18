import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useMemo, useEffect, useState } from 'react'
import { Loader2, Plus, X, Check, Target, Layers } from 'lucide-react'
import { useAtom } from 'jotai'
import { createFormDataAtom } from '../atoms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import FieldInfo from '@/components/FieldInfo'
import type { OPCR, OPCRActivity } from '@/components/features/planning/wfp/opcr/table/types'

export const createWFPObjectiveSchema = z.object({
  wfpId: z.string().min(1, 'WFP ID is required'),
  wfpObjectives: z
    .array(
      z.object({
        description: z.string().min(1, 'Objective description is required'),
        weight: z.number().min(1, 'Weight must be at least 1').max(100, 'Weight cannot exceed 100'),
        outcome: z.string().optional().default(''),
        wfpObjectiveActivities: z
          .array(
            z.object({
              activityName: z.string().min(1, 'Activity name is required'),
              indicator: z.string().optional().default(''),
              weight: z.number().optional().default(0),
              opcrActivityId: z.string().optional(),
            })
          )
          .optional()
          .default([]),
      })
    )
    .min(1, 'At least one objective is required'),
})

export type CreateWFPObjectiveValues = z.infer<typeof createWFPObjectiveSchema>

interface CreateWFPObjectiveFormProps {
  onSubmit: (data: CreateWFPObjectiveValues) => void
  onCancel: () => void
  isLoading?: boolean
  wfpId: string
  remainingWeight?: number
  initialValues?: Partial<CreateWFPObjectiveValues>
  opcr?: OPCR
}

export default function CreateWFPObjectiveForm({
  onSubmit,
  onCancel,
  remainingWeight,
  isLoading = false,
  wfpId,
  initialValues = {},
  opcr,
}: CreateWFPObjectiveFormProps) {
  const [formData, setFormData] = useAtom(createFormDataAtom)
  const availableOpcrActivities: OPCRActivity[] = opcr?.activities || []

  const form = useForm({
    defaultValues: {
      wfpObjectives: [
        {
          description: '',
          weight: remainingWeight || 0,
          outcome: '',
          wfpObjectiveActivities: [],
        },
      ],
      ...initialValues,
      ...formData,
      wfpId: wfpId,
    } as CreateWFPObjectiveValues,
    onSubmit: ({ value }) => onSubmit(createWFPObjectiveSchema.parse(value)),
  })

  // Track selection mode per objective index ('opcr' | 'manual')
  const [activityModes, setActivityModes] = useState<Record<number, 'opcr' | 'manual'>>({ 0: 'opcr' })

  // Sync form state with Jotai atom for unsaved changes detection
  // ✅ Correct — Subscription object has .unsubscribe(), not ()
  useEffect(() => {
    const subscription = form.store.subscribe(() => {
      setFormData(form.state.values)
    })
    return () => subscription.unsubscribe()
  }, [form.store, setFormData])

  // Memoize weight calculations to avoid recalculation on every render
  const weightCalculations = useMemo(() => {
    const totalInForm = form.state.values.wfpObjectives.reduce(
      (sum, obj) => sum + (Number(obj.weight) || 0),
      0
    )

    const remainingWeights = form.state.values.wfpObjectives.map((obj) =>
      Math.max(0, (remainingWeight || 0) - (totalInForm - (Number(obj.weight) || 0)))
    )

    return {
      totalInForm,
      remainingWeights,
      isAddDisabled: totalInForm >= (remainingWeight || 0),
    }
  }, [form.state.values.wfpObjectives, remainingWeight])

  const addObjective = () => {
    const availableWeight = Math.max(0, (remainingWeight || 0) - weightCalculations.totalInForm)
    const newIdx = form.state.values.wfpObjectives.length

    form.setFieldValue('wfpObjectives', (prev) => [
      ...prev,
      { description: '', weight: availableWeight, outcome: '', wfpObjectiveActivities: [] },
    ])
    setActivityModes((prev) => ({ ...prev, [newIdx]: 'opcr' }))
  }

  const removeObjective = (index: number) => {
    const current = form.state.values.wfpObjectives
    if (current.length > 1) {
      form.setFieldValue('wfpObjectives', current.filter((_, i) => i !== index))
    }
  }

  const toggleOpcrActivity = (objIndex: number, act: OPCRActivity) => {
    const currentObj = form.state.values.wfpObjectives[objIndex]
    const currentActs = currentObj?.wfpObjectiveActivities || []
    const exists = currentActs.some((a) => a.opcrActivityId === act.id)

    if (exists) {
      const updated = currentActs.filter((a) => a.opcrActivityId !== act.id)
      form.setFieldValue(`wfpObjectives[${objIndex}].wfpObjectiveActivities`, updated)
    } else {
      const newAct = {
        activityName: act.name,
        indicator: act.description || act.name,
        weight: act.weight || 0,
        opcrActivityId: act.id,
      }
      form.setFieldValue(`wfpObjectives[${objIndex}].wfpObjectiveActivities`, [...currentActs, newAct])
    }
  }

  const addManualActivity = (objIndex: number) => {
    const currentObj = form.state.values.wfpObjectives[objIndex]
    const currentActs = currentObj?.wfpObjectiveActivities || []
    form.setFieldValue(`wfpObjectives[${objIndex}].wfpObjectiveActivities`, [
      ...currentActs,
      { activityName: '', indicator: '', weight: 0 },
    ])
  }

  const removeActivity = (objIndex: number, actIndex: number) => {
    const currentObj = form.state.values.wfpObjectives[objIndex]
    const currentActs = currentObj?.wfpObjectiveActivities || []
    form.setFieldValue(
      `wfpObjectives[${objIndex}].wfpObjectiveActivities`,
      currentActs.filter((_, i) => i !== actIndex)
    )
  }

  const isSubmitting = isLoading || form.state.isSubmitting

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4 max-w-4xl mx-auto p-1"
    >
      {/* Header with Add Objective Button */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Objectives & Activities</h2>
          <p className="text-xs text-slate-500">Define objectives and attach OPCR or custom activities under each.</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addObjective}
          disabled={weightCalculations.isAddDisabled || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-semibold h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Objective
        </Button>
      </div>

      <form.Field
        name="wfpObjectives"
        children={(field) => (
          <div className="space-y-4">
            {field.state.value?.map((objVal, objIndex) => {
              const selectedActivities = objVal.wfpObjectiveActivities || []
              const activeMode = activityModes[objIndex] || 'opcr'

              return (
                <Card key={objIndex} className="relative overflow-hidden border border-slate-200 shadow-2xs">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />

                  <CardContent className="pt-4 pb-4 space-y-3.5 ml-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Specific Objective {objIndex + 1}
                      </h3>
                      {field.state.value.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeObjective(objIndex)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Objective Description Input */}
                    <form.Field
                      name={`wfpObjectives[${objIndex}].description`}
                      children={(descField) => (
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-700">
                            Objective Description <span className="text-rose-500">*</span>
                          </Label>
                          <Textarea
                            placeholder="Enter Specific Objective"
                            value={descField.state.value}
                            onBlur={descField.handleBlur}
                            onChange={(e) => descField.handleChange(e.target.value)}
                            className="resize-none min-h-[60px] text-xs"
                          />
                          <FieldInfo field={descField} />
                        </div>
                      )}
                    />

                    {/* Outcome & Weight Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2 space-y-1">
                        <form.Field
                          name={`wfpObjectives[${objIndex}].outcome`}
                          children={(outcomeField) => (
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold text-slate-700">Expected Outcome</Label>
                              <Input
                                placeholder="Enter Expected Outcome"
                                value={outcomeField.state.value}
                                onBlur={outcomeField.handleBlur}
                                onChange={(e) => outcomeField.handleChange(e.target.value)}
                                className="text-xs h-8"
                              />
                              <FieldInfo field={outcomeField} />
                            </div>
                          )}
                        />
                      </div>

                      {/* Weight Input */}
                      <form.Field
                        name={`wfpObjectives[${objIndex}].weight`}
                        children={(weightField) => {
                          const currentRemaining = weightCalculations.remainingWeights[objIndex]
                          return (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <Label className="text-xs font-semibold text-slate-700">
                                  Weight <span className="text-rose-500">*</span>
                                </Label>
                                <span className="text-[10px] text-slate-500">
                                  Remaining: <span className="text-emerald-600 font-bold">{currentRemaining}%</span>
                                </span>
                              </div>
                              <Input
                                type="number"
                                placeholder="Weight %"
                                value={weightField.state.value || ''}
                                onBlur={weightField.handleBlur}
                                onChange={(e) => {
                                  const val = Number(e.target.value)
                                  weightField.handleChange(val < 0 ? 0 : val)
                                }}
                                className="text-xs h-8"
                              />
                              <FieldInfo field={weightField} />
                            </div>
                          )
                        }}
                      />
                    </div>

                    {/* ── Activities Selection & Manual Add Section ── */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-bold text-slate-800">
                            Activities Under This Objective
                          </Label>
                          <Badge variant="outline" className="text-[10px] font-semibold bg-blue-50 text-blue-700 border-blue-200">
                            {selectedActivities.length} Activities Attached
                          </Badge>
                        </div>

                        {/* Mode Selector Buttons */}
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                          {availableOpcrActivities.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActivityModes((prev) => ({ ...prev, [objIndex]: 'opcr' }))}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                activeMode === 'opcr'
                                  ? 'bg-white text-blue-700 shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Select from Source OPCR ({availableOpcrActivities.length})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setActivityModes((prev) => ({ ...prev, [objIndex]: 'manual' }))}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              activeMode === 'manual' || availableOpcrActivities.length === 0
                                ? 'bg-white text-blue-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            + Manually Add Custom
                          </button>
                        </div>
                      </div>

                      {/* Mode A: Select from Source OPCR */}
                      {activeMode === 'opcr' && availableOpcrActivities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/40 max-h-48 overflow-y-auto">
                          {availableOpcrActivities.map((act) => {
                            const isSelected = selectedActivities.some((a) => a.opcrActivityId === act.id)
                            return (
                              <div
                                key={act.id}
                                onClick={() => toggleOpcrActivity(objIndex, act)}
                                className={`p-2 rounded-md border cursor-pointer transition-all flex items-start justify-between gap-2 text-xs ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-300'
                                    : 'border-slate-200 bg-white hover:border-blue-300'
                                }`}
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <p className="font-bold text-slate-800 truncate">{act.name}</p>
                                  {act.description && (
                                    <p className="text-[10px] text-slate-500 line-clamp-1">{act.description}</p>
                                  )}
                                  <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                                    {act.weight}% Weight
                                  </Badge>
                                </div>
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3" />}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        /* Mode B: Manually Add Custom Activities */
                        <div className="space-y-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/30">
                          {selectedActivities.map((act, actIndex) => (
                            <div key={actIndex} className="p-2 border border-slate-200 rounded-md bg-white space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <Input
                                  placeholder="Activity Name"
                                  value={act.activityName}
                                  onChange={(e) => {
                                    const updated = [...selectedActivities]
                                    updated[actIndex].activityName = e.target.value
                                    form.setFieldValue(`wfpObjectives[${objIndex}].wfpObjectiveActivities`, updated)
                                  }}
                                  className="text-xs h-7 flex-1"
                                />
                                <Input
                                  placeholder="Indicator / Target"
                                  value={act.indicator || ''}
                                  onChange={(e) => {
                                    const updated = [...selectedActivities]
                                    updated[actIndex].indicator = e.target.value
                                    form.setFieldValue(`wfpObjectives[${objIndex}].wfpObjectiveActivities`, updated)
                                  }}
                                  className="text-xs h-7 flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeActivity(objIndex, actIndex)}
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addManualActivity(objIndex)}
                            className="w-full h-7 text-xs border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 gap-1 font-semibold"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Activity Entry
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      />

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting} className="px-6 text-xs h-8">
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 text-xs h-8 font-semibold">
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          Create Objective & Activities
        </Button>
      </div>
    </form>
  )
}