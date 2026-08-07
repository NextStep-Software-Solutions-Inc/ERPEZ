import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useParams } from '@tanstack/react-router'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useUpdateFormData } from '../hooks/useUpdateFormData'
import { getKpiRequest } from '../../kpi/handlers/getKpiRequest'
import { getKpiTargetsRequest } from '../../kpi-target/handlers/getKpiTargetsRequest'
import { getDeliveryUnitsRequest } from '../../delivery-unit/handlers/getDeliveryUnitsRequest'
import { getDuKpiAssignmentsRequest } from '../../kpi-assignment-for-du/handlers/getDuKpiAssignmentsRequest'
import type { KPITarget } from '../../kpi'
import type { DeliveryUnit } from '../../delivery-unit'
import { KpiTargetCard } from '@/components/KpiTargetCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import SubmitButton from '@/components/SubmitButton'
import { cn } from '@/lib/utils'
import { FieldError } from '@/components/ui/field' 

// Schema for OPCR Activity creation
export const createOPCRActivityFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255, 'Name must be at most 255 characters'), 
    budget: z.number().min(0, 'Budget must be a positive number'),
    PAPDepartmentIds: z.array(z.string()),
})

export type CreateOPCRActivityFormValues = z.infer<typeof createOPCRActivityFormSchema>

export type CreateOPCRActivityPayload = CreateOPCRActivityFormValues & {
    opcrId: string
    dukpiAssignmentId: string
}

interface CreateOPCRActivityFormProps {
    onSubmit: (data: CreateOPCRActivityPayload) => void
    onClose?: () => void
    isSubmitting?: boolean
    initialData?: Partial<CreateOPCRActivityFormValues>
    mode?: 'create' | 'edit'
    opcrId?: string
    kpiId?: string
    deliveryUnitId?: string
    dukpiAssignmentId?: string
    onFormStateChange?: (isDirty: boolean) => void
    inAccordion?: boolean
}
export default function CreateOPCRActivityForm({
    onSubmit,
    onClose,
    isSubmitting = false,
    initialData,
    mode = 'create',
    opcrId: propOpcrId,
    kpiId: propKpiId,
    deliveryUnitId: propDeliveryUnitId,
    dukpiAssignmentId: propDukpiAssignmentId,
    onFormStateChange,
}: CreateOPCRActivityFormProps) {
    // Use props if provided, otherwise get from route params
    let kpiId = propKpiId || ''
    let opcrId = propOpcrId || ''
    let deliveryUnitId = propDeliveryUnitId || ''

    if (!kpiId || !opcrId || !deliveryUnitId) {
        try {
            const routeParams = useParams({ from: '/planning/$deliveryUnitId/opcr/$opcrId/kpi/$functionType/$kpiId/' })
            kpiId = kpiId || routeParams.kpiId
            opcrId = opcrId || routeParams.opcrId
            deliveryUnitId = deliveryUnitId || routeParams.deliveryUnitId
        } catch {
            // Try the parent route for accordion case
            try {
                const routeParams = useParams({ from: '/planning/$deliveryUnitId/opcr/$opcrId/kpi/$functionType/' })
                opcrId = opcrId || routeParams.opcrId
                deliveryUnitId = deliveryUnitId || routeParams.deliveryUnitId
            } catch {
                // Route params not available, use props only
            }
        }
    }
    const updateFormData = useUpdateFormData()
    const useKpi = createQueryHookFromTemplate(getKpiRequest)
    const useKpiTarget = createQueryHookFromTemplate(getKpiTargetsRequest)
    const useDeliveryUnits = createQueryHookFromTemplate(getDeliveryUnitsRequest);
    const useDuKpiAssignments = createQueryHookFromTemplate(getDuKpiAssignmentsRequest)
    const { data: kpi } = useKpi({
        pathParams: { id: kpiId },
        queryParams: {}
    })
    const { data: kpiAssignments } = useDuKpiAssignments({
        pathParams: {},
        queryParams: {
            filters: `kpiId==${kpiId}`
        }
    })
    const { data: kpiTargets } = useKpiTarget({
        pathParams: {},
        queryParams: {
            filters: `kpiId==${kpiId}`
        }
    })

    const { data: subDeliveryUnits } = useDeliveryUnits({
        pathParams: {},
        queryParams: {
            filters: `parentId==${deliveryUnitId}`
        }
    })
    const form = useForm({
        defaultValues: {
            name: initialData?.name || '', 
            budget: initialData?.budget || 0,
            PAPDepartmentIds: initialData?.PAPDepartmentIds || [],
        },
        validators: {
            onChange: createOPCRActivityFormSchema,
        },
        onSubmit: ({ value }) => {
            // Pre-fill opcrId and dukpiAssignmentId from props or defaults
            const payload: CreateOPCRActivityPayload = {
                ...value,
                opcrId: propOpcrId || opcrId, // Use prop if provided, else from params
                dukpiAssignmentId: propDukpiAssignmentId || kpiAssignments?.data[0]?.id || '', // Use prop if provided, else default
            }
            onSubmit(payload)
        },
    })

    // Track form dirty state and notify parent
    if (onFormStateChange) {
        onFormStateChange(form.state.isDirty)
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            {/* <KpiTargetCard
                title="Number of Startups Founded"
                targets={[{ id: 't1', value: 20, period: 'Annual' }]}
                targetLabel="Target: 20"
            /> */}
            {/* KPI Target Reference Card */}
            {kpi && kpiTargets && (
                <KpiTargetCard
                    title={kpi.data.name}
                    targets={kpiTargets.data.map((target: KPITarget) => ({
                        id: target.id,
                        value: target.targetValue,
                        period: target.period,
                    }))}
                    targetLabel={`Target: ${kpiTargets.data.reduce((sum: number, t: KPITarget) => sum + t.targetValue, 0)}`}
                />
            )}
            {/* Activity Name Field */}
            <form.Field name="name">
                {(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Activity/Program/Initiative <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="Enter activity name"
                            value={field.state.value}
                            onChange={(e) => {
                                field.handleChange(e.target.value)
                                updateFormData('name', e.target.value)
                            }}
                            disabled={isSubmitting}
                            className={cn(
                                field.state.meta.errors.length > 0 &&
                                'border-destructive focus:ring-destructive',
                            )}
                        />
                        <FieldError errors={field.state.meta.errors} />
                    </div>
                )}
            </form.Field> 
            {/* Budget Field */}
            <form.Field name="budget">
                {(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="budget">
                            Alloted Budget <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="budget"
                            type="number"
                            placeholder="0"
                            value={field.state.value || ''}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                field.handleChange(isNaN(value) ? 0 : value)
                                updateFormData('budget', isNaN(value) ? 0 : value)
                            }}
                            disabled={isSubmitting}
                            min="0"
                            step="0.01"
                            className={cn(
                                field.state.meta.errors.length > 0 &&
                                'border-destructive focus:ring-destructive',
                            )}
                        />
                        <FieldError errors={field.state.meta.errors} />
                    </div>
                )}
            </form.Field>

            {/* Sub-DUs Multi-Select Card */}
            <form.Field name="PAPDepartmentIds">
                {(field) => {
                    const selectedIds = field.state.value
                    const handleToggle = (id: string) => {
                        const newValue = selectedIds.includes(id)
                            ? selectedIds.filter((item: string) => item !== id)
                            : [...selectedIds, id]
                        field.handleChange(newValue)
                    }
                    return (
                        <div className="space-y-3">
                            <Label>Select Sub-DUs Involved</Label>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="space-y-3">
                                    {subDeliveryUnits?.data.map((du: DeliveryUnit) => <div key={du.id} className="flex items-center">
                                        <Input
                                                type="checkbox"
                                            id={`subdu-${du.id}`}
                                            checked={selectedIds.includes(du.id)}
                                            onChange={() => handleToggle(du.id)}
                                                disabled={isSubmitting}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                            />
                                        <Label
                                            htmlFor={`subdu-${du.id}`}
                                                className="ml-3 cursor-pointer select-none font-medium text-gray-700 hover:text-gray-900"
                                            >
                                            {du.officeName}
                                        </Label>
                                    </div>)}
                                </div>
                            </div>
                        </div>
                    )
                }}
            </form.Field>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
                {onClose && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <SubmitButton
                    type="submit"
                    disabled={
                        isSubmitting || !form.state.isValid || !form.state.canSubmit
                    }
                    loading={isSubmitting}
                    className="bg-(--button-green)"
                >
                    {mode === 'edit' ? 'Update Activity' : 'Create Activity'}
                </SubmitButton>
            </div>
        </form>
    )
}