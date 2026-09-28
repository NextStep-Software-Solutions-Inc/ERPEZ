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
import { AlertTriangle, Building2, CheckCircle2, Clock, FileCheck, FileText, UserCheck } from 'lucide-react'
import FieldInfo from '@/components/FieldInfo'
import { BacProject } from '../../bac-resolution'
import { SupplierListItem } from '@/components/features/planning/procurement-library/suppliers/types'
import { cn } from '@/lib/utils'

export interface BacProjectMetadata {
    id: string
    resolutionNumber: string
    title: string
    amount: number
    formattedAmount: string
    sourceTypeLabel: string
    isConsolidatedPR: boolean
    prNumbers: string[]
    office: string
    status: string
    isApproved: boolean
}

interface ExtendedBacProjectFields {
    linkedConsolidatedPrs?: Array<{ prNumber?: string; cprNumber?: string }>
    officeName?: string
    bacResolutions?: Array<{ status?: string }>
}

export function getBacStatusBadgeConfig(status?: string): {
    label: string
    className: string
    isApproved: boolean
} {
    const raw = (status || 'Draft').trim()
    const normalized = raw.toLowerCase().replace(/[_-]/g, ' ')
    if (normalized === 'approved' || normalized === 'posted' || normalized === 'routed to portal') {
        return {
            label: 'BAC: APPROVED',
            className: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
            isApproved: true,
        }
    }
    if (normalized.includes('approval') || normalized.includes('review') || normalized === 'pending') {
        return {
            label: `BAC: ${raw.toUpperCase()}`,
            className: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
            isApproved: false,
        }
    }
    if (normalized === 'returned' || normalized === 'rejected') {
        return {
            label: `BAC: ${raw.toUpperCase()}`,
            className: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
            isApproved: false,
        }
    }
    return {
        label: `BAC: ${raw.toUpperCase()}`,
        className: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
        isApproved: false,
    }
}

export function extractBacProjectMeta(r: BacProject): BacProjectMetadata {
    const ext = r as BacProject & ExtendedBacProjectFields
    const resolutionNumber =
        r.resolutionNumber ||
        (r.title && r.title.startsWith('RES-') ? r.title : '') ||
        (r.id ? `RES-${r.id.slice(0, 8)}` : 'N/A')

    const title =
        r.title ||
        r.consolidatedPR?.description ||
        r.appItem?.ppmpItemName ||
        'Procurement Project'

    const amount =
        r.abc ??
        r.sumABC ??
        r.consolidatedPR?.totalAmount ??
        r.appItem?.effectiveABC ??
        0

    const formattedAmount = `₱${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

    let prNumbers: string[] = []
    if (
        Array.isArray(ext.linkedConsolidatedPrs) &&
        ext.linkedConsolidatedPrs.length > 0
    ) {
        prNumbers = ext.linkedConsolidatedPrs
            .map((pr) => pr?.prNumber || pr?.cprNumber)
            .filter((val): val is string => Boolean(val))
    } else if (r.consolidatedPR?.prNumber) {
        prNumbers = [r.consolidatedPR.prNumber]
    } else if (r.consolidatedPR?.selectedPRItems?.length) {
        prNumbers = r.consolidatedPR.selectedPRItems
            .map((item) => item.prNumber)
            .filter((num): num is string => Boolean(num))
    } else if (r.appItem?.APP?.appNumber) {
        prNumbers = [r.appItem.APP.appNumber]
    }
    prNumbers = Array.from(new Set(prNumbers))

    const office =
        r.consolidatedPR?.endUser ||
        r.consolidatedPR?.selectedPRItems?.[0]?.prOffice ||
        r.appItem?.officeName ||
        ext.officeName ||
        (r.endUserRepresentativeId ? `Rep: ${r.endUserRepresentativeId}` : 'N/A')

    const isConsolidatedPR =
        r.sourceType === 'ConsolidatedPR' || String(r.sourceType) === '0'
    const sourceTypeLabel = isConsolidatedPR ? 'Consolidated PR' : 'APP Item'

    const resolutionsList = Array.isArray(ext.bacResolutions) ? ext.bacResolutions : []
    const hasApprovedRes = resolutionsList.some(
        (res) => (res?.status || '').toLowerCase() === 'approved',
    )
    const effectiveStatus = hasApprovedRes
        ? 'Approved'
        : resolutionsList[0]?.status || r.status || 'Draft'

    const badgeCfg = getBacStatusBadgeConfig(effectiveStatus)

    return {
        id: r.id,
        resolutionNumber,
        title,
        amount,
        formattedAmount,
        sourceTypeLabel,
        isConsolidatedPR,
        prNumbers,
        office,
        status: effectiveStatus,
        isApproved: badgeCfg.isApproved,
    }
}

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
        const seen = new Set<string>()
        return resolutionOptions.filter((r) => {
            if (!r.id || r.id.trim() === '' || seen.has(r.id)) return false
            seen.add(r.id)
            return true
        })
    }, [resolutionOptions])

    const filteredSuppliers = useMemo(() => {
        const seen = new Set<string>()
        return suppliersList.filter((s) => {
            if (!s.id || s.id.trim() === '' || seen.has(s.id)) return false
            seen.add(s.id)
            return true
        })
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
                children={(field) => {
                    const selectedRes = resolutionOptions.find(
                        (r) => r.id === field.state.value,
                    )
                    const selectedMeta = selectedRes
                        ? extractBacProjectMeta(selectedRes)
                        : null
                    const selectedBadge = selectedMeta
                        ? getBacStatusBadgeConfig(selectedMeta.status)
                        : null

                    return (
                        <div>
                            <Label className="text-sm font-semibold">
                                BAC Resolution <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={field.state.value || undefined}
                                onValueChange={(val) => field.handleChange(val)}
                                disabled={isEdit}
                            >
                                <SelectTrigger className="mt-1.5 h-auto min-h-10 py-2">
                                    <SelectValue placeholder="Select BAC resolution...">
                                        {selectedMeta && selectedBadge ? (
                                            <div className="flex items-center justify-between gap-3 w-full pr-2 text-xs">
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                                    <span className="font-semibold text-foreground">
                                                        {selectedMeta.resolutionNumber}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-[10px] py-0 px-1.5 font-semibold shrink-0 border',
                                                            selectedBadge.className,
                                                        )}
                                                    >
                                                        {selectedBadge.label}
                                                    </Badge>
                                                    <span className="text-muted-foreground/60">—</span>
                                                    <span className="text-muted-foreground truncate">
                                                        {selectedMeta.title}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                                    {selectedMeta.formattedAmount}
                                                </span>
                                            </div>
                                        ) : undefined}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-80">
                                    {filteredResolutions.length > 0 ? (
                                        filteredResolutions.map((r) => {
                                            const meta = extractBacProjectMeta(r)
                                            const badgeCfg = getBacStatusBadgeConfig(meta.status)
                                            return (
                                                <SelectItem
                                                    key={r.id}
                                                    value={r.id}
                                                    className="py-2.5 px-3 cursor-pointer border-b border-border/30 last:border-b-0 focus:bg-muted/70 rounded-md my-0.5"
                                                >
                                                    <div className="flex flex-col gap-1.5 w-full whitespace-normal text-left">
                                                        {/* Top: Resolution Number + BAC Status Badge + Source Tag + ABC Badge */}
                                                        <div className="flex items-center justify-between gap-2 w-full">
                                                            <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                                                <FileCheck className="h-4 w-4 text-primary shrink-0" />
                                                                <span className="font-semibold text-sm text-foreground truncate">
                                                                    {meta.resolutionNumber}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'text-[10px] py-0 px-1.5 font-semibold shrink-0 border',
                                                                        badgeCfg.className,
                                                                    )}
                                                                >
                                                                    {badgeCfg.label}
                                                                </Badge>
                                                                <Badge
                                                                    variant="soft"
                                                                    color={
                                                                        meta.isConsolidatedPR
                                                                            ? 'secondary'
                                                                            : 'info'
                                                                    }
                                                                    className="text-[10px] py-0 px-1.5 shrink-0"
                                                                >
                                                                    {meta.sourceTypeLabel}
                                                                </Badge>
                                                            </div>
                                                            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                                                                {meta.formattedAmount}
                                                            </span>
                                                        </div>

                                                        {/* Middle: Title / Description */}
                                                        <div className="text-xs text-muted-foreground line-clamp-1 font-medium pl-6">
                                                            {meta.title}
                                                        </div>

                                                        {/* Bottom: Office & PR Numbers */}
                                                        <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px] text-muted-foreground pl-6">
                                                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                                                                <Building2 className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                                                <span className="truncate">
                                                                    {meta.office}
                                                                </span>
                                                            </div>
                                                            {meta.prNumbers.length > 0 && (
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <span className="text-[10px] text-muted-foreground/80">
                                                                        PR:
                                                                    </span>
                                                                    {meta.prNumbers
                                                                        .slice(0, 2)
                                                                        .map((pr) => (
                                                                            <Badge
                                                                                key={pr}
                                                                                variant="outline"
                                                                                color="secondary"
                                                                                className="text-[10px] py-0 px-1 font-normal"
                                                                            >
                                                                                {pr}
                                                                            </Badge>
                                                                        ))}
                                                                    {meta.prNumbers.length >
                                                                        2 && (
                                                                        <span className="text-[10px] text-muted-foreground font-semibold">
                                                                            +{meta.prNumbers.length - 2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })
                                    ) : (
                                        <SelectItem value="none" disabled>
                                            No BAC resolutions available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FieldInfo field={field} />
                        </div>
                    )
                }}
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
                                        <div className="flex items-center justify-between gap-3 w-full py-0.5 text-left">
                                            <span className="font-medium text-foreground">
                                                {s.name}
                                            </span>
                                            {s.philGEPSNumber && (
                                                <span className="text-[11px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 shrink-0">
                                                    PhilGEPS: {s.philGEPSNumber}
                                                </span>
                                            )}
                                        </div>
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
                    const meta = extractBacProjectMeta(selectedRes)
                    const badgeCfg = getBacStatusBadgeConfig(meta.status)

                    return (
                        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] dark:bg-primary/[0.06] p-4 space-y-3 transition-all animate-in fade-in-50 duration-200">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-2.5">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                        <FileCheck className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-sm text-foreground truncate">
                                                {meta.resolutionNumber}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'text-[10px] py-0 px-1.5 font-semibold shrink-0 border',
                                                    badgeCfg.className,
                                                )}
                                            >
                                                {badgeCfg.isApproved ? (
                                                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                                                ) : (
                                                    <Clock className="h-3 w-3 mr-1 inline" />
                                                )}
                                                {badgeCfg.label}
                                            </Badge>
                                            <Badge
                                                variant="soft"
                                                color={meta.isConsolidatedPR ? 'secondary' : 'info'}
                                                className="text-[10px] py-0 px-1.5 shrink-0"
                                            >
                                                {meta.sourceTypeLabel}
                                            </Badge>
                                        </div>
                                        <p
                                            className="text-xs text-muted-foreground line-clamp-1 mt-0.5"
                                            title={meta.title}
                                        >
                                            {meta.title}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">
                                        Approved Budget (ABC)
                                    </div>
                                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {meta.formattedAmount}
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                    <span className="truncate">
                                        <strong className="text-foreground font-medium">Office:</strong>{' '}
                                        {meta.office}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <FileText className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                    <span className="truncate">
                                        <strong className="text-foreground font-medium">Linked PR:</strong>{' '}
                                        {meta.prNumbers.length > 0
                                            ? meta.prNumbers.join(', ')
                                            : 'None specified'}
                                    </span>
                                </div>
                            </div>

                            {!meta.isApproved && (
                                <div className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <span>
                                        <strong>BAC Resolution Not Yet Approved ({meta.status}):</strong> You may draft this Direct Contracting request now, but it cannot be submitted for review or sent to the supplier until the BAC Resolution is <strong>Approved</strong>.
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                }}
            />
        </form>
    )
}
