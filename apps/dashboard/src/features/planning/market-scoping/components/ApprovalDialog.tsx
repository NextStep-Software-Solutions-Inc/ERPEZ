/**
 * Market Scoping - Approval Action Dialog
 * Modal for approve/reject actions with optional reason
 * Location: src/features/planning/market-scoping/components/
 */

import { useState } from 'react'
import { Check, X, RotateCcw, Upload, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: 'approve' | 'reject' | 'return' | null
  projectName: string
  rejectionReason: string
  onReasonChange: (reason: string) => void
  onApprove: (signedFile?: File | null) => Promise<void>
  onReject: () => Promise<void>
  onReturn?: () => Promise<void>
  isLoading: boolean
}

export function ApprovalDialog({
  open,
  onOpenChange,
  action,
  projectName,
  rejectionReason,
  onReasonChange,
  onApprove,
  onReject,
  onReturn,
  isLoading,
}: ApprovalDialogProps) {
  const [signedFile, setSignedFile] = useState<File | null>(null)

  const handleClose = () => {
    onOpenChange(false)
    onReasonChange('')
    setSignedFile(null)
  }

  const handleConfirm = () => {
    if (action === 'approve') return onApprove(signedFile)
    if (action === 'return' && onReturn) return onReturn()
    return onReject()
  }

  const getTitle = () => {
    if (action === 'approve') return 'Approve Market Scoping Form'
    if (action === 'return') return 'Return Form for Revision'
    return 'Reject Market Scoping Form'
  }

  const isConfirmDisabled = () => {
    if (isLoading) return true
    if (action === 'return' || action === 'reject') {
      return !rejectionReason.trim()
    }
    if (action === 'approve') {
      return !signedFile
    }
    return false
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{projectName}</DialogDescription>
        </DialogHeader>

        {/* Upload Signed Document for Approval */}
        {action === 'approve' && (
          <div className="space-y-4 my-2">
            <div>
              <Label className="text-sm font-medium">Upload Signed Document *</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Please attach the signed Market Scoping PDF or document before approving.
              </p>
              
              <div className="border-2 border-dashed border-muted-foreground/25 hover:border-indigo-500/50 transition-colors rounded-lg p-4 text-center cursor-pointer relative bg-muted/30">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSignedFile(e.target.files[0])
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  <Upload className="w-8 h-8 text-indigo-500" />
                  {signedFile ? (
                    <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm max-w-full px-2 overflow-hidden">
                      <FileText className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span className="truncate max-w-[220px] sm:max-w-[260px]" title={signedFile.name}>
                        {signedFile.name}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({(signedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        Click to select or drag & drop signed document
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, DOCX, or Image (max 10MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Remarks / Rejection Reason */}
        {(action === 'reject' || action === 'return') && (
          <div className="space-y-4 my-2">
            <div>
              <Label htmlFor="action-reason">
                {action === 'return' ? 'Return Remarks / Revision Notes *' : 'Reason for Rejection *'}
              </Label>
              <Textarea
                id="action-reason"
                value={rejectionReason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder={
                  action === 'return'
                    ? 'Specify required updates (e.g. Please attach additional price quotations)...'
                    : 'Please specify why you are rejecting this form...'
                }
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled()}
            className={
              action === 'reject'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : action === 'return'
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }
          >
            {action === 'approve' && (
              <>
                <Check className="mr-2 w-4 h-4" />
                {isLoading ? 'Approving...' : 'Approve Form'}
              </>
            )}
            {action === 'return' && (
              <>
                <RotateCcw className="mr-2 w-4 h-4" />
                {isLoading ? 'Returning...' : 'Return for Revision'}
              </>
            )}
            {action === 'reject' && (
              <>
                <X className="mr-2 w-4 h-4" />
                {isLoading ? 'Rejecting...' : 'Reject Form'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
