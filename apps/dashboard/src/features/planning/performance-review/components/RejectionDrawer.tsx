/**
 * Performance Review – Rejection Drawer
 * Slide-in drawer for PMT to enter comments when returning for revision.
 * Pattern follows Procurement Library dialog conventions.
 */

import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface RejectionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (comment: string) => void
  isLoading?: boolean
}

export function RejectionDrawer({ open, onOpenChange, onConfirm, isLoading }: RejectionDrawerProps) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!comment.trim()) {
      setError('Please provide a reason for returning the evaluation.')
      return
    }
    setError('')
    onConfirm(comment.trim())
    setComment('')
  }

  const handleClose = () => {
    setComment('')
    setError('')
    onOpenChange(false)
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleClose}
      title="Return for Revision"
      description="Provide a clear explanation of what needs to be corrected. The ratee will see this comment."
      size="md"
      showCloseButton
      footer={(
        <div className="mx-auto w-full max-w-2xl px-6 pb-6">
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading || !comment.trim()}
            >
              {isLoading ? 'Sending…' : 'Return for Revision'}
            </Button>
          </div>
        </div>
      )}
    >
      <div className="mx-auto w-full max-w-2xl px-4 pb-4">
        <div className="space-y-4">
          <Label htmlFor="rejection-comment">
            Reason for Return <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="rejection-comment"
            placeholder="e.g., MOV files are missing for KPI #2 and #4. Please upload supporting documents before resubmitting."
            rows={5}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
              if (error) setError('')
            }}
            className={`min-h-[140px] resize-none text-sm ${error ? 'border-destructive' : ''}`}
          />
          <div className="flex items-center justify-between">
            {error ? <p className="text-xs text-destructive">{error}</p> : <div />}
            <p className="text-xs text-muted-foreground">{comment.length}/1000 characters</p>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  )
}
