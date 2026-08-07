/**
 * ApprovalDialog
 * Unified dialog for both approve and reject actions in the 3-tier workflow.
 * Role is injected from the calling context (simulating Keycloak roles).
 */

import { useState } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { toast } from 'sonner'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import type { ApprovalRole, PPMP } from '../types'
import { PpmpStatusBadge } from '../components'
import {
  approvalDialogOpenAtom,
  rejectionDialogOpenAtom,
  selectedPpmpForEditAtom,
} from '../atoms'
import { approvePpmpRequest, rejectPpmpRequest } from '../handlers'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const approveSchema = z.object({
  notes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters.')
    .optional(),
})

const rejectSchema = z.object({
  reason: z
    .string()
    .min(10, 'Rejection reason must be at least 10 characters.')
    .max(500, 'Reason must not exceed 500 characters.'),
})

type ApproveFormValues = z.infer<typeof approveSchema>
type RejectFormValues = z.infer<typeof rejectSchema>

// ─── Props ────────────────────────────────────────────────────────────────────

interface ApprovalDialogProps {
  /** Current user's Keycloak role — determines what approval action is valid */
  currentUserRole: ApprovalRole
  currentUserId?: string
  currentUserName?: string
  onSuccess?: () => void
}

// ─── Approve Sub-Form ─────────────────────────────────────────────────────────

function ApproveForm({
  ppmp,
  role,
  actorId,
  actorName,
  onClose,
  onSuccess,
}: {
  ppmp: PPMP
  role: ApprovalRole
  actorId: string
  actorName: string
  onClose: () => void
  onSuccess?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<ApproveFormValues>({
    resolver: zodResolver(approveSchema),
    defaultValues: { notes: '' },
  })

  const onSubmit = async (data: ApproveFormValues) => {
    setIsLoading(true)
    try {
      await approvePpmpRequest.fetcher({
        data: {
          ppmpId: ppmp.id,
          role,
          actorId,
          actorName,
          notes: data.notes,
        },
      })
      toast.success('PPMP approved successfully.')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes{' '}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any approver notes…"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            {isLoading ? 'Approving…' : 'Approve'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─── Reject Sub-Form ──────────────────────────────────────────────────────────

function RejectForm({
  ppmp,
  role,
  actorId,
  actorName,
  onClose,
  onSuccess,
}: {
  ppmp: PPMP
  role: ApprovalRole
  actorId: string
  actorName: string
  onClose: () => void
  onSuccess?: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: '' },
  })

  const onSubmit = async (data: RejectFormValues) => {
    setIsLoading(true)
    try {
      await rejectPpmpRequest.fetcher({
        data: {
          ppmpId: ppmp.id,
          role,
          actorId,
          actorName,
          rejectionReason: data.reason,
        },
      })
      toast.success('PPMP returned to drafter for revision.')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rejection failed.')
    } finally {
      setIsLoading(false)
    }
  }

  const charCount = form.watch('reason').length

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Rejection Reason <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain why this PPMP is being returned…"
                  rows={4}
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <FormMessage />
                <span>{charCount}/500</span>
              </div>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={isLoading}
            className="gap-1.5"
          >
            <ThumbsDown className="h-4 w-4" />
            {isLoading ? 'Returning…' : 'Return'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export function ApprovalDialog({
  currentUserRole,
  currentUserId = 'user-001',
  currentUserName = 'Current User',
  onSuccess,
}: ApprovalDialogProps) {
  const [approveOpen, setApproveOpen] = useAtom(approvalDialogOpenAtom)
  const [rejectOpen, setRejectOpen] = useAtom(rejectionDialogOpenAtom)
  const ppmp = useAtomValue(selectedPpmpForEditAtom)

  if (!ppmp) return null

  const isApproving = approveOpen
  const isRejecting = rejectOpen

  const handleClose = () => {
    setApproveOpen(false)
    setRejectOpen(false)
  }

  return (
    <ResponsiveDialog
      open={isApproving || isRejecting}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
      title={isApproving ? 'Approve PPMP' : 'Reject PPMP'}
      description={`Document: ${ppmp.documentName} · FY ${ppmp.fiscalYear}`}
      size="md"
      showCloseButton
    >
      <div className="space-y-4">
        {/* PPMP Status Context */}
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3 flex items-center gap-3 text-sm">
          <PpmpStatusBadge
            state={ppmp.state}
            currentApprovalStage={ppmp.currentApprovalStage ?? undefined}
          />
          <span className="text-muted-foreground">
            Total Budget:{' '}
            <strong className="text-foreground">
              {new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
              }).format(ppmp.totalBudget)}
            </strong>
          </span>
        </div>

        {/* Approval or Rejection form */}
        {isApproving ? (
          <ApproveForm
            ppmp={ppmp}
            role={currentUserRole}
            actorId={currentUserId}
            actorName={currentUserName}
            onClose={handleClose}
            onSuccess={onSuccess}
          />
        ) : (
          <RejectForm
            ppmp={ppmp}
            role={currentUserRole}
            actorId={currentUserId}
            actorName={currentUserName}
            onClose={handleClose}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </ResponsiveDialog>
  )
}
