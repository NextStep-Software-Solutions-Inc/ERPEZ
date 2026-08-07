import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useMemo, useState } from 'react'
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
import { useKpiData } from '@/providers/KpiProvider'

export const editTargetSectionSchema = z.object({
    KPITargets: z.array(z.object({
        id: z.string().optional(),
        period: z.string(),
        targetValue: z.number().min(0),
        quarterName: z.string()
    })).min(1, 'At least one target is required')
})

export type EditTargetSectionFormValues = z.infer<typeof editTargetSectionSchema>
export type EditTargetSectionSubmission = {
    KPITargets: EditTargetSectionFormValues['KPITargets']
}

interface EditTargetSectionFormProps {
    onSubmit: (data: EditTargetSectionSubmission) => void
    onCancel: () => void
    isLoading?: boolean
}

const QUARTERS = ['1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter']
const PERIOD_TYPE = {
  ANNUAL: 'Annual',
  QUARTERLY: 'Quarterly',
} as const

type PeriodType = (typeof PERIOD_TYPE)[keyof typeof PERIOD_TYPE]

export default function EditTargetSectionForm({
    onSubmit,
    onCancel,
    isLoading = false,
}: EditTargetSectionFormProps) {
    const kpi = useKpiData()
    const [periodType, setPeriodType] = useState<PeriodType>(
        kpi.KPITargets.length === 1 && kpi.KPITargets[0]?.quarterName === 'Annual'
            ? PERIOD_TYPE.ANNUAL
            : PERIOD_TYPE.QUARTERLY
    )

    const total = useMemo(() => {
        const targets = kpi.KPITargets
        const calculatedTotal = targets.reduce((acc, target) => {
            const v = parseFloat(String(target.targetValue || 0))
            return acc + (isNaN(v) ? 0 : v)
        }, 0)
        return calculatedTotal
    }, [kpi.KPITargets])

    const form = useForm({
        defaultValues: {
            KPITargets: kpi.KPITargets,
        } as EditTargetSectionFormValues,
        validators: {
            onChange: editTargetSectionSchema,
        },
        onSubmit: ({ value }) => {
            onSubmit({
                KPITargets: value.KPITargets,
            })
        },
    })

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
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label className="font-medium">Period Type *</Label>
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
                            {QUARTERS.map((quarter, index) => (
                                <div
                                    key={`quarter-${index}`}
                                    className="flex flex-col gap-2 p-4 border rounded-lg bg-green-50/50 min-w-0"
                                >
                                    <Label className="text-sm font-medium truncate">
                                        {quarter}
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
                                                placeholder={`${quarter} target value`}
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
                        {kpi.isPercentage ? '%' : ''}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            disabled={!canSubmit || isLoading}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                />
            </div>
        </form>
    )
}