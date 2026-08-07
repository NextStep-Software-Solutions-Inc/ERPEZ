import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertCircle } from 'lucide-react'


interface ManualOverrideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingState: boolean
  onConfirm: (confirmedState: boolean) => void
}

export default function ManualOverrideDialog({ open, onOpenChange, pendingState, onConfirm }: ManualOverrideDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warning" />
            <AlertDialogTitle>
              {pendingState ? 'Enable' : 'Disable'} Manual Workflow Override?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm mt-4 space-y-3">
            <div>
              {pendingState ? (
                <div className="space-y-2">
                  <p className="font-semibold text-default-900">You are about to <span className="text-warning">ENABLE</span> Manual Workflow Override</p>
                  <p className="text-default-600">This will:</p>
                  <ul className="list-disc list-inside text-default-600 space-y-1 text-[9px]">
                    <li>Allow manual adjustments to performance workflow processes</li>
                    <li>Bypass standard validation rules and approval chains</li>
                    <li>Require audit logging of all override actions</li>
                    <li>Apply to all offices in this organization</li>
                  </ul>
                  <p className="text-warning font-semibold mt-3">⚠️ Use with caution - only when absolutely necessary for system corrections</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-default-900">You are about to <span className="text-success">DISABLE</span> Manual Workflow Override</p>
                  <p className="text-default-600">This will:</p>
                  <ul className="list-disc list-inside text-default-600 space-y-1 text-[9px]">
                    <li>Restore standard validation rules and approval chains</li>
                    <li>Prevent manual workflow adjustments</li>
                    <li>Revert to normal performance evaluation procedures</li>
                    <li>Apply to all offices in this organization</li>
                  </ul>
                  <p className="text-success font-semibold mt-3">✓ Standard workflow controls will be restored</p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => { onConfirm(pendingState); onOpenChange(false) }} className={pendingState ? 'bg-warning text-warning-foreground hover:bg-warning/90' : 'bg-success text-success-foreground hover:bg-success/90'}>
            {pendingState ? 'Enable Override' : 'Disable Override'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
