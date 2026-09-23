import { useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UserCheck } from 'lucide-react'
import FieldInfo from '@/components/FieldInfo'
import { BacProject } from '../../bac-resolution'
import { SupplierListItem } from '@/components/features/planning/procurement-library/suppliers/types'

export const createDirectContractingSchema = z.object({
    name: z.string().min(1, 'Direct Contracting Name is required'),
    dcNumber: z.string().optional(),
    bacProjectId: z.string().min(1, 'BAC Resolution is required'),
    exclusiveSupplierId: z
        .string()
        .min(1, 'Exclusive Supplier assignment is required'),
    submissionDeadline: z.string().min(1, 'Submission Deadline is required'),
})

export type CreateDirectContractingFormValues = z.infer<
    typeof createDirectContractingSchema
>

export interface DirectContractingFormProps {
    formId?: string
    onSubmit?: (
        values: CreateDirectContractingFormValues,
    ) => void | Promise<void>
    initialValues?: Partial<CreateDirectContractingFormValues>
    isEdit?: boolean
    autoDCNumber?: string
    resolutionOptions: BacProject[]
    suppliersList: SupplierListItem[]
}

export function DirectContractingForm({
    formId = 'create-direct-contracting-form',
    onSubmit,
    initialValues,
    isEdit = false,
    autoDCNumber = '',
    resolutionOptions = [],
    suppliersList = [],
}: DirectContractingFormProps) {
    const filteredResolutions = useMemo(() => {
        return resolutionOptions.filter((r) => r.id && r.id.trim() !== '')
    }, [resolutionOptions])

    const filteredSuppliers = useMemo(() => {
        return suppliersList.filter((s) => s.id && s.id.trim() !== '')
    }, [suppliersList])

    const form = useForm({
        defaultValues: {
            name: initialValues?.name ?? '',
            dcNumber: initialValues?.dcNumber ?? '',
            bacProjectId: initialValues?.bacProjectId ?? '',
            exclusiveSupplierId: initialValues?.exclusiveSupplierId ?? '',
            submissionDeadline: initialValues?.submissionDeadline ?? '',
        } as CreateDirectContractingFormValues,
        validators: {
            onChange: createDirectContractingSchema,
        },
        onSubmit: async ({ value }) => {
            await onSubmit?.(value)
        },
    })

    return (
        <form
            id={formId}
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="space-y-5 py-2"
        >
            <form.Field
                name="name"
                children={(field) => (
                    <div>
                        <Label className="text-sm font-semibold">
                            Direct Contracting Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. Specialized Software Upgrade 2026"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="mt-1.5"
                        />
                        <FieldInfo field={field} />
                    </div>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <form.Field
                    name="dcNumber"
                    children={(field) => (
                        <div>
                            <Label className="text-sm font-semibold">
                                Direct Contracting number
                            </Label>
                            <Input
                                placeholder={autoDCNumber || 'e.g. DC-2026-0001'}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="mt-1.5"
                                disabled={isEdit}
                            />
                            <FieldInfo field={field} />
                        </div>
                    )}
                />

                <form.Field
                    name="submissionDeadline"
                    children={(field) => (
                        <div>
                            <Label className="text-sm font-semibold">
                                Submission Deadline <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="date"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="mt-1.5"
                            />
                            <FieldInfo field={field} />
                        </div>
                    )}
                />
            </div>

            <form.Field
                name="bacProjectId"
                children={(field) => (
                    <div>
                        <Label className="text-sm font-semibold">
                            BAC Resolution <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={field.state.value || undefined}
                            onValueChange={(val) => field.handleChange(val)}
                            disabled={isEdit}
                        >
                            <SelectTrigger className="mt-1.5">
                                <SelectValue placeholder="Select approved resolution..." />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredResolutions.length > 0 ? (
                                    filteredResolutions.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="font-medium">{r.resolutionNumber}</span>
                                                {/* <div className="flex flex-wrap gap-1">
                                                    {r.num.map((pr) => (
                                                        <Badge
                                                            key={pr}
                                                            variant="soft"
                                                            color="secondary"
                                                            className="text-[10px] py-0 px-1"
                                                        >
                                                            {pr}
                                                        </Badge>
                                                    ))}
                                                </div> */}
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        No approved resolutions available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <FieldInfo field={field} />
                    </div>
                )}
            />

            <form.Field
                name="exclusiveSupplierId"
                children={(field) => (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/40">
                        <Label className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                            <UserCheck className="h-4 w-4" /> Single Supplier Assignment{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 mb-3">
                            Direct Contracting requires exactly one registered supplier of
                            proprietary/exclusive items.
                        </p>
                        <Select
                            value={field.state.value || undefined}
                            onValueChange={(val) => field.handleChange(val)}
                        >
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select the exclusive supplier..." />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSuppliers.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldInfo field={field} />
                    </div>
                )}
            />

            <form.Subscribe
                selector={(state) => state.values.bacProjectId}
                children={(selectedResolutionId) => {
                    const selectedRes = resolutionOptions.find(
                        (r) => r.id === selectedResolutionId,
                    )
                    if (!selectedResolutionId || !selectedRes) return null
                    return (
                        <div className="text-xs space-y-1 p-3 bg-muted rounded border border-border/60">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Linked PR:</span>
                                <span className="font-medium">
                                    {selectedRes.resolutionNumber}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Office:</span>
                                <span className="font-medium">
                                    {selectedRes.endUserRepresentativeId || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-border/40 mt-1 pt-1">
                                <span className="text-muted-foreground font-semibold">
                                    Total ABC:
                                </span>
                                <span className="font-bold text-primary">
                                    ₱{(selectedRes.abc ?? 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )
                }}
            />
        </form>
    )
}
