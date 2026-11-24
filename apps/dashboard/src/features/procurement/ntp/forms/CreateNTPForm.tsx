/**
 * Create NTP Form
 * RA 12009 Compliant Notice to Proceed form linked to an approved Contract.
 */

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FileText, Building2, Calendar, ShieldCheck, AlertCircle } from 'lucide-react'
import type { AvailableContractForNoticeToProceed } from '../types/ntpTypes'

export const createNoticeToProceedSchema = z.object({
  contractId: z.string().min(1, 'Please select an approved Contract'),
  ntpNumber: z
    .string()
    .max(50, 'NTP Number must be 50 characters or less')
    .optional()
    .or(z.literal('')),
  ntpDate: z.string().min(1, 'NTP Date is required'),
  effectivityDate: z.string().optional().or(z.literal('')),
  commencementDate: z.string().optional().or(z.literal('')),
  implementationPeriodDays: z.coerce.number().int().positive().optional().or(z.nan()),
  implementationPeriodText: z.string().max(100).optional().or(z.literal('')),
  placeOfDelivery: z.string().max(300).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  remarks: z.string().max(1000).optional().or(z.literal('')),
})

export const createNTPSchema = createNoticeToProceedSchema
export type CreateNTPSchema = z.infer<typeof createNTPSchema>
export type CreateNoticeToProceedFormValues = z.infer<typeof createNoticeToProceedSchema>

export interface CreateNTPFormProps {
  availableContracts?: AvailableContractForNoticeToProceed[]
  selectedContractId?: string
  isSubmitting?: boolean
  onSubmit: (values: CreateNoticeToProceedFormValues) => void
  onCancel?: () => void
}

export function CreateNTPForm({
  availableContracts = [],
  selectedContractId,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CreateNTPFormProps) {
  const todayStr = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

  const form = useForm<CreateNoticeToProceedFormValues>({
    resolver: zodResolver(createNoticeToProceedSchema),
    defaultValues: {
      contractId: selectedContractId || '',
      ntpNumber: '',
      ntpDate: todayStr,
      effectivityDate: todayStr,
      commencementDate: '',
      implementationPeriodDays: undefined,
      implementationPeriodText: '',
      placeOfDelivery: '',
      description: '',
      remarks: '',
    },
  })

  const currentContractId = form.watch('contractId')

  useEffect(() => {
    if (selectedContractId) {
      form.setValue('contractId', selectedContractId, { shouldValidate: true })
    }
  }, [selectedContractId, form])

  const selectedContract = useMemo(() => {
    return availableContracts.find((c) => (c.contractId || c.id) === currentContractId)
  }, [availableContracts, currentContractId])

  // Calculate statutory SLA warning (within 3 calendar days of Contract Approval)
  const slaWarning = useMemo(() => {
    const approvedDateStr = selectedContract?.contractApprovedDate || selectedContract?.contractApprovedAt
    if (!approvedDateStr) return null
    const approved = new Date(approvedDateStr)
    if (Number.isNaN(approved.getTime())) return null

    const maxDate = new Date(approved)
    maxDate.setDate(maxDate.getDate() + 3)

    const now = new Date()
    const diffMs = maxDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    return {
      approvedDate: format(approved, 'MMM d, yyyy'),
      targetDate: format(maxDate, 'MMM d, yyyy'),
      isPastDue: diffDays < 0,
      daysRemaining: diffDays,
    }
  }, [selectedContract])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Statutory SLA Note */}
        <div className="flex items-start gap-3 p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">RA 12009 Section 66 Statutory Requirement:</span>
            <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
              The Procuring Entity must issue the Notice to Proceed within <strong className="font-semibold">three (3) calendar days</strong> from the date of approval of the contract by the Head of the Procuring Entity (HoPE).
            </p>
          </div>
        </div>

        {/* Contract Selection */}
        <FormField
          control={form.control}
          name="contractId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">
                Approved Contract <span className="text-rose-500">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={Boolean(selectedContractId)}
              >
                <FormControl>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select an approved/executed contract..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {availableContracts.length === 0 ? (
                    <div className="p-3 text-xs text-muted-foreground text-center">
                      No available contracts ready for NTP
                    </div>
                  ) : (
                    availableContracts.map((c) => {
                      const cid = c.contractId || c.id || ''
                      const amount = c.awardedAmount ?? c.totalAmount ?? 0
                      return (
                        <SelectItem key={cid} value={cid} className="text-xs py-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {c.contractNumber} — {c.supplierName || 'Unknown Supplier'}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-sm">
                              {c.projectTitle || 'No Title'} • {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount)}
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
              <FormDescription className="text-[11px]">
                Only bilateral contracts in Approved or Executed status without an active NTP are eligible.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selected Contract Metadata Card */}
        {selectedContract && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedContract.contractNumber}</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                {typeof selectedContract.status === 'number'
                  ? (selectedContract.status === 3 ? 'Approved' : selectedContract.status === 4 ? 'Executed' : String(selectedContract.status))
                  : (selectedContract.status || 'Approved')}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
              <div>
                <span className="text-slate-400 block">Supplier:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedContract.supplierName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Awarded Amount:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
                    selectedContract.awardedAmount ?? selectedContract.totalAmount ?? 0
                  )}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Project:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedContract.projectTitle || '—'}</span>
              </div>
            </div>

            {slaWarning && (
              <div className={`p-2 rounded flex items-center gap-2 text-[11px] ${
                slaWarning.isPastDue
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Contract Approved: {slaWarning.approvedDate} — Target NTP Issuance: {slaWarning.targetDate}
                  {slaWarning.isPastDue ? ' (Statutory 3-day SLA exceeded)' : ` (${slaWarning.daysRemaining} days remaining)`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Row: NTP Number & NTP Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ntpNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">NTP Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Auto-generated (e.g. NTP-2026-001)"
                    {...field}
                    autoComplete="off"
                    className="text-xs"
                  />
                </FormControl>
                <FormDescription className="text-[11px]">
                  Leave blank to auto-generate the next official sequence.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ntpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">
                  NTP Issuance Date <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="text-xs" />
                </FormControl>
                <FormDescription className="text-[11px]">Official date of issuance</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row: Effectivity Date & Commencement Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="effectivityDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Effectivity Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="text-xs" />
                </FormControl>
                <FormDescription className="text-[11px]">
                  Contract effectivity start date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commencementDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Commencement Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="text-xs" />
                </FormControl>
                <FormDescription className="text-[11px]">
                  Date work or delivery begins
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row: Implementation Period & Delivery Place */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="implementationPeriodDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Period in Calendar Days</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 30"
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    className="text-xs"
                  />
                </FormControl>
                <FormDescription className="text-[11px]">Duration for delivery / completion</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="placeOfDelivery"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Place of Delivery</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Central Office Warehouse, Manila"
                    {...field}
                    className="text-xs"
                  />
                </FormControl>
                <FormDescription className="text-[11px]">Designated delivery site / address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Implementation Period Text */}
        <FormField
          control={form.control}
          name="implementationPeriodText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Implementation Period Description (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Thirty (30) Calendar Days upon receipt of this Notice"
                  {...field}
                  className="text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description / Scope */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Description / Terms (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional terms, instructions, or scope summary for the contractor..."
                  rows={2}
                  className="resize-none text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remarks */}
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">Internal Remarks (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Internal procurement notes..."
                  rows={2}
                  className="resize-none text-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !currentContractId}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          >
            {isSubmitting ? 'Creating Draft NTP...' : 'Create Draft Notice to Proceed'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
