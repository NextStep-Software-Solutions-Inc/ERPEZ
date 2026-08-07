import { Button } from '@/components/ui/button'
import { Plus, Send, CheckCircle2, Lock } from 'lucide-react'

interface ActionButtonsBarProps {
  status: string
  appType?: string
  onAddPPMP: () => void
  onCreateSupplement: () => void
  onSubmit?: () => void
  onApprove?: () => void
  onMarkAsFinal?: () => void
}

export function ActionButtonsBar({
  status,
  appType,
  onAddPPMP,
  onCreateSupplement,
  onSubmit,
  onApprove,
  onMarkAsFinal,
}: ActionButtonsBarProps) {
  const isDraft = status === 'Draft' || status === 'draft'
  const isPendingReview = status === 'pending-review' || status === 'Submitted'
  // Supplements can only be added in non-draft, non-pending states (locked/approved)
  const canAddOrCreateSupplement = !isDraft && !isPendingReview
  const isIndicativeApp = appType === 'Indicative'
  const canMarkAsFinal = isDraft && isIndicativeApp && Boolean(onMarkAsFinal)

  return (
    <div className="flex gap-3 flex-wrap bg-white p-5 rounded-xl shadow-lg border border-gray-200">
      {/* Mark as Final - Draft Indicative Apps Only */}
      {canMarkAsFinal && (
        <Button 
          onClick={onMarkAsFinal} 
          className="pointer-events-auto cursor-pointer font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md"
        >
          <Lock className="w-4 h-4 mr-2" />
          Mark as Final
        </Button>
      )}

      {/* Draft Actions */}
      {isDraft && onSubmit && (
        <Button 
          onClick={onSubmit} 
          className="pointer-events-auto cursor-pointer font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit for Review
        </Button>
      )}

      {/* Pending Review Actions */}
      {isPendingReview && onApprove && (
        <Button 
          onClick={onApprove} 
          className="pointer-events-auto cursor-pointer font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Approve
        </Button>
      )}

      {/* PPMP Management Actions (only in draft) */}
      {canAddOrCreateSupplement && (
        <Button onClick={onAddPPMP} className="pointer-events-auto cursor-pointer font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Add PPMP
        </Button>
      )}
      {canAddOrCreateSupplement && (
        <Button onClick={onCreateSupplement} variant="outline" className="pointer-events-auto cursor-pointer font-semibold hover:bg-purple-50 hover:text-purple-700 border-gray-300 hover:border-purple-300">
          <Plus className="w-4 h-4 mr-2" />
          Create Supplement
        </Button>
      )}
    </div>
  )
}
