import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { forwardRef } from 'react' 
import EditBasicInformationSection from './EditBasicInformationSection'
import { useKpiData } from '@/providers/KpiProvider'

export const editKpiBasicInfoSchema = z.object({
    name: z.string().min(1, 'KPI name is required').max(100, 'KPI name must be at most 100 characters'),
    description: z.string(),
    MFOPAPId: z.string(),
    functionType: z.string().min(1, 'Function type is required'),
    isOfficeMandate: z.boolean(),
    isPercentage: z.boolean(),
    isTargetValueAllocable: z.boolean(),
    AttributeIds: z.array(z.string()),
    SDGIds: z.array(z.string()),
    KPIRatings: z.array(z.object({ id: z.string().optional(), performanceMeasureId: z.string(), numericalRating: z.number(), remarks: z.string() })),
    KPITargets: z.array(z.object({ period: z.string(), targetValue: z.number(), quarterName: z.string() })),
    KPIMOVs: z.array(z.object({ name: z.string(), description: z.string(), fileId: z.string().optional(), file: z.instanceof(File).optional() })),
})

export type EditKpiBasicInfoFormValues = z.infer<typeof editKpiBasicInfoSchema>
export type EditKpiBasicInfoSubmission = EditKpiBasicInfoFormValues

interface EditKpiBasicInfoFormProps {
    onSubmit: (data: EditKpiBasicInfoSubmission) => void
    isLoading?: boolean
    initialValues?: Partial<EditKpiBasicInfoFormValues>
}

const EditKpiBasicInfoForm = forwardRef<HTMLFormElement, EditKpiBasicInfoFormProps>(({
    onSubmit,
    isLoading = false,
    initialValues = {},
}, ref) => {
    const kpi = useKpiData() 
    const initialPrimaryAttrId = kpi.Attributes.find(a => a.parentAttributeId === null)?.id || ''
    const initialMandatoryAttrId = kpi.Attributes.find(a => a.parentAttributeId !== null)?.id || ''

    const form = useForm({
        defaultValues: {
            name: kpi.name,
            description: kpi.description,
            functionType: kpi.functionType,
            isOfficeMandate: kpi.isOfficeMandate || false,
            isPercentage: kpi.isPercentage || false,
            isTargetValueAllocable: kpi.isTargetValueAllocable || false,
            SDGIds: kpi.SDGs.map(s => s.id),
            AttributeIds: kpi.Attributes.map(a => a.id),
            MFOPAPId: kpi.MFOPAP?.id || '',
            KPITargets: kpi.KPITargets.map(t => ({
                id: t.id,
                period: t.period,
                targetValue: t.targetValue,
                quarterName: t.quarterName,
            })),
            KPIRatings: kpi.KPIRatings.map(r => ({
                id: r.id,
                performanceMeasureId: r.performanceMeasureId,
                numericalRating: r.numericalRating,
                remarks: r.remarks,
            })),
            KPIMOVs: kpi.KPIModeOfVerifications.map(m => ({
                id: m.id,
                name: m.name,
                description: m.description || '',
            })), 
            ...initialValues,
        }, 
        validators: {
            onChange: editKpiBasicInfoSchema,
        },
        onSubmit: ({ value }) => {
            onSubmit({
                ...value

            });
        },
    })
    return (
        <form
            ref={ref}
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            <EditBasicInformationSection
                form={form}
                isLoading={isLoading}
                initialPrimaryAttrId={initialPrimaryAttrId}
                initialMandatoryAttrId={initialMandatoryAttrId}
            />
        </form>
    )
})

EditKpiBasicInfoForm.displayName = 'EditKpiBasicInfoForm'

export default EditKpiBasicInfoForm
