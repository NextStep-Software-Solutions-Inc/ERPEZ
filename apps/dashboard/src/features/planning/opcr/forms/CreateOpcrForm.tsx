import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { useUpdateFormData } from '../hooks/useUpdateFormData'
import type { FiscalYear } from '../../../../components/features/planning/fiscal-year'
import { getFiscalYearsRequest } from '@/components/features/planning/fiscal-year/handlers/getFiscalYearsRequest'
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
import { FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const useFiscalYears = createQueryHookFromTemplate(getFiscalYearsRequest) 
// Schema for OPCR creation
export const createOPCRFormSchema = z.object({ 
    fiscalYearId: z.string().min(1, 'Fiscal year is required'),
    deliveryUnitId: z.string().min(1, 'Delivery Unit ID is required'),
    name: z.union([z.string(), z.undefined()]),
})

export type CreateOPCRFormValues = z.infer<typeof createOPCRFormSchema>

interface CreateOpcrFormProps {
    onSubmit: (data: CreateOPCRFormValues) => void
    onClose?: () => void
    isSubmitting?: boolean
    initialData?: Partial<CreateOPCRFormValues>
}

export default function CreateOpcrForm({
    onSubmit,
    onClose,
    isSubmitting = false,
    initialData,
}: CreateOpcrFormProps) {
    const { deliveryUnitId } = useParams({ from: '/planning/$deliveryUnitId/opcr/' })
    const updateFormData = useUpdateFormData()

    // Fetch fiscal years
    const { data: fiscalYearsData, isLoading: isFiscalYearsLoading } =
        useFiscalYears({
            pathParams: {},
            queryParams: { pageSize: 1000, pageNumber: 1 },
        })

    const fiscalYears = useMemo(() => {
        return fiscalYearsData?.data || []
    }, [fiscalYearsData])

    const form = useForm({
        defaultValues: { 
            fiscalYearId: initialData?.fiscalYearId || '',
            deliveryUnitId: deliveryUnitId,
            name: initialData?.name || undefined
        },
        validators: {
            onChange: createOPCRFormSchema,
        },
        onSubmit: async ({ value }) => {
            onSubmit(value)
        },
    })

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
                            onValueChange={(value) => {
                                field.handleChange(value)
                                updateFormData('fiscalYearId', value)
                            }}
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
                                {fiscalYears.map((fy: FiscalYear) => (
                                    <SelectItem key={fy.id} value={fy.id}>
                                        {fy.year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError errors={field.state.meta.errors} /> 
                    </div>
                )}
            </form.Field>
            {/* OPCR Name Field */}
            <form.Field name="name">
                {(field) => (
                    <div className="space-y-2">
                        <Label htmlFor="name">OPCR Name</Label>
                        <Input
                            id="name"
                            placeholder="OPCR Name"
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
                    className="bg-[--button-green]"
                >
                    Create OPCR
                </SubmitButton>
            </div>
        </form>
    )
}
