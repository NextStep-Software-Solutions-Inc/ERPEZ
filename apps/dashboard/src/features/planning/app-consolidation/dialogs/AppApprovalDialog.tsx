import { useState } from 'react'
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import type { AppMaster } from '../types'

interface AppApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app: AppMaster | null
  action: 'approve' | 'reject' | 'set-final'
  onConfirm?: (action: 'approve' | 'reject', remarks?: string, setAsFinal?: boolean) => Promise<void>
}

/**
 * AppApprovalDialog - APP Approval Workflow Dialog
 *
 * Handles three workflow actions:
 * 1. Approve APP: Transitions Submitted → Approved (HoPE only)
 * 2. Reject APP: Returns Submitted → Draft with feedback (HoPE only)
 * 3. Set as Final: Locks Approved → Locked (Irreversible, HoPE only)
 *
 * Features:
 * - Action-specific dialogs with appropriate confirmations
 * - Optional remarks/rejection reason
 * - Optional "Set as Final" during approval
 * - Budget summary display
 * - Item count summary
 * - Clear warnings for irreversible actions
 */
export function AppApprovalDialog({
  open,
  onOpenChange,
  app,
  action,
  onConfirm,
}: AppApprovalDialogProps) {
  const [remarks, setRemarks] = useState('')
  const [setAsFinal, setSetAsFinal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!app) return null

  const itemCount = app.bac?.lineItems?.length || 0
  const totalBudget = app.bac?.totalBudget || 0
  const formattedBudget = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(totalBudget)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      if (action === 'reject') {
        if (!remarks.trim()) {
          toast.error('Please provide a rejection reason')
          return
        }
        await onConfirm?.('reject', remarks)
        toast.success('APP rejected successfully')
      } else if (action === 'approve') {
        await onConfirm?.('approve', remarks, setAsFinal)
        if (setAsFinal) {
          toast.success('APP approved and locked as final')
        } else {
          toast.success('APP approved successfully')
        }
      }
      setRemarks('')
      setSetAsFinal(false)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to process APP action')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Render content based on action
  const getTitle = () => {
    switch (action) {
      case 'approve':
        return 'Approve Annual Procurement Plan'
      case 'reject':
        return 'Reject Annual Procurement Plan'
      case 'set-final':
        return 'Lock APP as Final Baseline'
      default:
        return 'APP Action Required'
    }
  }

  const getDescription = () => {
    switch (action) {
      case 'approve':
        return 'Review the APP details below. You can optionally lock it as the final baseline immediately.'
      case 'reject':
        return 'Please provide detailed feedback. The APP will return to Draft status for revision.'
      case 'set-final':
        return 'This action is IRREVERSIBLE. The APP will be locked as the official baseline for the fiscal year. No further edits will be allowed.'
      default:
        return 'Confirm the action below.'
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {action === 'set-final' && <Lock className="h-5 w-5 text-red-600" />}
            {action === 'approve' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {action === 'reject' && <AlertCircle className="h-5 w-5 text-orange-600" />}
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* APP Summary */}
          <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{app.appName}</p>
                <p className="text-xs text-gray-600">{app.appCode}</p>
              </div>
              <Badge variant={app.status === 'Submitted' ? 'soft' : 'outline'}>
                {app.status}
              </Badge>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t text-xs">
              <div>
                <p className="text-gray-600">Items</p>
                <p className="font-semibold">{itemCount}</p>
              </div>
              <div>
                <p className="text-gray-600">Budget</p>
                <p className="font-semibold">{formattedBudget}</p>
              </div>
              <div>
                <p className="text-gray-600">Fiscal Year</p>
                <p className="font-semibold">{app.fiscalYear}</p>
              </div>
            </div>
          </div>

          {/* Action-specific content */}
          {(action === 'reject' || action === 'approve') && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="remarks" className="text-sm mb-2 block">
                  {action === 'reject' ? 'Rejection Reason *' : 'Remarks (Optional)'}
                </Label>
                <Textarea
                  id="remarks"
                  placeholder={
                    action === 'reject'
                      ? 'Explain why this APP is being rejected. This will be sent back to the BAC Secretariat for revision...'
                      : 'Add any comments or observations about this APP...'
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="min-h-24 text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Approve-specific: Set as Final option */}
              {action === 'approve' && (
                <div className="border rounded-lg p-3 space-y-2 bg-blue-50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="set-final"
                      checked={setAsFinal}
                      onCheckedChange={(checked) => setSetAsFinal(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="set-final"
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      Lock as Final APP
                    </Label>
                  </div>
                  <p className="text-xs text-gray-700 ml-6">
                    Makes this APP immutable and official baseline for FY {app.fiscalYear}.
                    Cannot be undone.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Set-final specific: Strong warning */}
          {action === 'set-final' && (
            <div className="border-2 border-red-300 rounded-lg p-3 bg-red-50 space-y-2">
              <p className="text-sm font-semibold text-red-900">⚠️ WARNING - IRREVERSIBLE ACTION</p>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li>The APP will be LOCKED permanently</li>
                <li>No line items can be edited or deleted</li>
                <li>This becomes the official baseline for the fiscal year</li>
                <li>This action CANNOT be undone</li>
              </ul>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || (action === 'reject' && !remarks.trim())}
            className={cn(
              action === 'reject' && 'bg-orange-600 hover:bg-orange-700',
              action === 'set-final' && 'bg-red-600 hover:bg-red-700',
            )}
          >
            {isLoading ? 'Processing...' : (
              action === 'approve' ? 'Approve' :
              action === 'reject' ? 'Reject' :
              'Lock as Final'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
