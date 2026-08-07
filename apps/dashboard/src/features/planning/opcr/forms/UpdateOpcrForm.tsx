import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useAtom } from 'jotai'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useEffect, useMemo } from 'react'
import { updateFormDataAtom } from '../atoms/formAtoms'
import { getFiscalYearsRequest } from '@/components/features/planning/fiscal-year/handlers/getFiscalYearsRequest'
import { getDeliveryUnitsRequest } from '@/components/features/planning/delivery-unit/handlers/getDeliveryUnitsRequest'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import SubmitButton from '@/components/SubmitButton'
import { cn } from '@/lib/utils'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest)
const useDeliveryUnits = createQueryHookFromTemplate(getDeliveryUnitsRequest)

// Schema for OPCR update
export const updateOPCRFormSchema = z.object({
    fiscalYearId: z.string().min(1, 'Fiscal year is required'),
    deliveryUnitId: z.string().min(1, 'Delivery unit is required'),
})

export type UpdateOPCRFormValues = z.infer<typeof updateOPCRFormSchema>

interface UpdateOpcrFormProps {
    onSubmit: (data: UpdateOPCRFormValues) => void
    onClose?: () => void
    isSubmitting?: boolean
    initialData?: Partial<UpdateOPCRFormValues>
    deliveryUnitId?: string
}

export default function UpdateOpcrForm({
    onSubmit,
    onClose,
    isSubmitting = false,
    initialData,
    deliveryUnitId,
}: UpdateOpcrFormProps) {
    const [, setFormData] = useAtom(updateFormDataAtom)

    // Fetch fiscal years
    const { data: fiscalYearsData, isLoading: isFiscalYearsLoading } =
        useFiscalYears({
            pathParams: {},
            queryParams: { pageSize: 100, pageNumber: 1 },
        })

    const fiscalYears = useMemo(() => {
        return fiscalYearsData?.data || []
    }, [fiscalYearsData])

    // Fetch delivery units
    const { data: deliveryUnitsData, isLoading: isDeliveryUnitsLoading } =
        useDeliveryUnits({
            pathParams: {},
            queryParams: { pageSize: 100, pageNumber: 1, filters: `parentId==null` },
        })

    const deliveryUnits = useMemo(() => {
        return deliveryUnitsData?.data || []
    }, [deliveryUnitsData])

    const form = useForm({
        defaultValues: {
            fiscalYearId: initialData?.fiscalYearId || '',
            deliveryUnitId: initialData?.deliveryUnitId || deliveryUnitId || '',
        },
        validators: {
            onChange: updateOPCRFormSchema,
        },
        onSubmit: async ({ value }) => {
            onSubmit(value)
        },
    })
    // Save each keystroke to localStorage immediately
    useEffect(() => {
        setFormData({
            fiscalYearId: form.state.values.fiscalYearId,
            deliveryUnitId: form.state.values.deliveryUnitId,
        })
    }, [form.state.values, setFormData])

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-6"
        >
            {/* Fiscal Year Field */}
            <form.Field name="fiscalYearId">
                {(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="fiscalYearId">
                            Fiscal Year <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                            disabled={isFiscalYearsLoading || isSubmitting}
                        >
                            <SelectTrigger
                                id="fiscalYearId"
                                className={cn(
                                    field.state.meta.errors.length > 0 &&
                                    'border-destructive focus:ring-destructive',
                                )}
                            >
                                <SelectValue placeholder="Select fiscal year" />
                            </SelectTrigger>
                            <SelectContent>
                                {fiscalYears.map((fy) => (
                                    <SelectItem key={fy.id} value={fy.id}>
                                        {fy.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field.state.meta.errors.length > 0 && (
                            <p className="text-sm text-destructive">
                                {String(field.state.meta.errors[0])}
                            </p>
                        )}
                    </div>
                )}
            </form.Field>

            {/* Delivery Unit Field (hidden if provided via prop) */}
            {!deliveryUnitId && (
                <form.Field name="deliveryUnitId">
                    {(field) => (
                        <div className="space-y-2">
                            <Label htmlFor="deliveryUnitId">
                                Delivery Unit <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={field.state.value}
                                onValueChange={(value) => field.handleChange(value)}
                                disabled={isDeliveryUnitsLoading || isSubmitting}
                            >
                                <SelectTrigger
                                    id="deliveryUnitId"
                                    className={cn(
                                        field.state.meta.errors.length > 0 &&
                                        'border-destructive focus:ring-destructive',
                                    )}
                                >
                                    <SelectValue placeholder="Select delivery unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deliveryUnits.map((du) => (
                                        <SelectItem key={du.id} value={du.id}>
                                            {du.officeName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {field.state.meta.errors.length > 0 && (
                                <p className="text-sm text-destructive">
                                    {String(field.state.meta.errors[0])}
                                </p>
                            )}
                        </div>
                    )}
                </form.Field>
            )}

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
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    Update OPCR
                </SubmitButton>
            </div>
        </form>
    )
}
