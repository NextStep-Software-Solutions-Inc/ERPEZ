import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
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
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Edit2, FileDown, Plus, Trash2, CheckCircle, XCircle, Send, Lock } from 'lucide-react'
import {
  currentAppAtom,
  supplementalAPPDialogOpenAtom,
  appListAtom,
} from '@/features/planning/app-consolidation/atoms'
import type { AppMaster, UserRole } from '@/features/planning/app-consolidation/types'
import { canPerformActionOnApp } from '@/features/planning/app-consolidation/utils/rbacUtils'

interface AppActionsProps {
  app: AppMaster
  userRole?: UserRole
}

type DialogType = 'delete' | 'approve' | 'reject' | 'publish' | 'submit' | null

export function AppActions({ app, userRole = 'BAC_MEMBER' }: AppActionsProps) {
  const navigate = useNavigate() as any
  const setCurrentApp = useSetAtom(currentAppAtom)
  const setSupplementalDialog = useSetAtom(supplementalAPPDialogOpenAtom)
  const setAppList = useSetAtom(appListAtom)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeDialog, setActiveDialog] = useState<DialogType>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isDraft = app.status === 'draft' || app.status === 'Draft'
  const isPendingReview = app.status === 'pending-review' || app.status === 'submitted' || app.status === 'Submitted'
  const isApproved = app.status === 'approved' || app.status === 'Approved'
  const isFinal = app.status === 'final' || app.status === 'Locked' || (app as any).isLocked
  const hasValidPPMPs = app.ppmpIds && app.ppmpIds.length > 0

  // RBAC checks
  const canEdit = canPerformActionOnApp(userRole, 'edit', app.status)
  const canSubmit = canPerformActionOnApp(userRole, 'submit', app.status)
  const canApprove = canPerformActionOnApp(userRole, 'approve', app.status)
  const canReject = canPerformActionOnApp(userRole, 'reject', app.status)
  const canLock = canPerformActionOnApp(userRole, 'lock', app.status)
  const canDelete = canPerformActionOnApp(userRole, 'delete', app.status)

  const handleView = () => {
    setIsDropdownOpen(false)
    navigate({ to: '/v2/app-consolidation/$appId' as any, params: { appId: app.id } })
  }

  const handleEdit = () => {
    if (!isDraft) {
      toast.error('Only draft APPs can be edited')
      return
    }
    setIsDropdownOpen(false)
    setCurrentApp(app)
    navigate({ to: '/v2/app-consolidation/$appId' as any, params: { appId: app.id } })
  }

  const handleExport = async () => {
    setIsDropdownOpen(false)
    try {
      toast.success('Export feature coming soon')
    } catch (error) {
      toast.error('Export failed')
    }
  }

  const handleCreateSupplement = () => {
    setIsDropdownOpen(false)
    setCurrentApp(app)
    setSupplementalDialog(true)
  }

  const handleDelete = () => {
    setIsDropdownOpen(false)
    setTimeout(() => {
      setActiveDialog('delete')
    }, 100)
  }

  const handleSubmit = () => {
    setIsDropdownOpen(false)
    if (!hasValidPPMPs) {
      toast.error('APP must have at least one PPMP before submission')
      return
    }
    setActiveDialog('submit')
  }

  const handleApprove = () => {
    setIsDropdownOpen(false)
    setActiveDialog('approve')
  }

  const handleReject = () => {
    setIsDropdownOpen(false)
    setActiveDialog('reject')
  }

  const handlePublish = () => {
    setIsDropdownOpen(false)
    setActiveDialog('publish')
  }

  const confirmAction = async (action: Exclude<DialogType, null>) => {
    setIsLoading(true)
    try {
      const updateData: Partial<AppMaster> = {}

      switch (action) {
        case 'delete':
          setAppList((prev) => prev.filter((a) => a.id !== app.id))
          toast.success('APP deleted successfully')
          break
        case 'submit':
          updateData.status = 'Submitted'
          setAppList((prev) =>
            prev.map((a) => (a.id === app.id ? { ...a, ...updateData, status: 'Submitted' } : a))
          )
          toast.success('APP submitted for approval')
          break
        case 'approve':
          updateData.status = 'Approved'
          setAppList((prev) =>
            prev.map((a) => (a.id === app.id ? { ...a, ...updateData, status: 'Approved' } : a))
          )
          toast.success('APP approved')
          break
        case 'reject':
          updateData.status = 'Draft'
          setAppList((prev) =>
            prev.map((a) => (a.id === app.id ? { ...a, ...updateData, status: 'Draft' } : a))
          )
          toast.success('APP sent back to draft')
          break
        case 'publish':
          updateData.status = 'Locked'
          setAppList((prev) =>
            prev.map((a) => (a.id === app.id ? { ...a, ...updateData, status: 'Locked', isLocked: true, updatedAt: new Date().toISOString() } : a))
          )
          toast.success('APP set as Final and locked from further edits')
          break
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      toast.error(`Failed to ${action} APP`)
      console.error(error)
    } finally {
      setIsLoading(false)
      setActiveDialog(null)
    }
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* View - Always available */}
          <DropdownMenuItem onClick={handleView}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </DropdownMenuItem>

          {/* Edit - Only for draft APPs where user has edit permission */}
          {canEdit && isDraft && (
            <>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />

          {/* Submit - Only for draft with PPMPs and user has submit permission */}
          {canSubmit && isDraft && (
            <DropdownMenuItem 
              onClick={handleSubmit}
              disabled={!hasValidPPMPs}
              title={!hasValidPPMPs ? 'Add at least one PPMP to submit' : ''}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </DropdownMenuItem>
          )}

          {/* Approve - Only for submitted APPs where user has approve permission */}
          {canApprove && isPendingReview && (
            <DropdownMenuItem onClick={handleApprove}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </DropdownMenuItem>
          )}

          {/* Reject - Only for submitted APPs where user has reject permission */}
          {canReject && isPendingReview && (
            <DropdownMenuItem onClick={handleReject} className="text-orange-600 focus:text-orange-600">
              <XCircle className="w-4 h-4 mr-2" />
              Send Back
            </DropdownMenuItem>
          )}

          {/* Publish - Only for approved APPs where user has lock permission */}
          {canLock && isApproved && !isFinal && (
            <DropdownMenuItem onClick={handlePublish} className="bg-purple-50 focus:bg-purple-100">
              <Lock className="w-4 h-4 mr-2 text-purple-600" />
              Set as Final APP
            </DropdownMenuItem>
          )}

          {/* Final/Locked - Display only */}
          {isFinal && (
            <DropdownMenuItem disabled className="text-gray-500">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Final (Locked)
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Export - Always available */}
          <DropdownMenuItem onClick={handleExport}>
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </DropdownMenuItem>

          {/* Create Supplement - Always available except when published */}
          <DropdownMenuItem onClick={handleCreateSupplement}>
            <Plus className="w-4 h-4 mr-2" />
            Supplement
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete - Only for draft APPs where user has delete permission */}
          {canDelete && isDraft && (
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation */}
      <AlertDialog open={activeDialog === 'delete'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Annual Procurement Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{app.appName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction('delete')}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit for Approval Confirmation */}
      <AlertDialog open={activeDialog === 'submit'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit for Approval?</AlertDialogTitle>
            <AlertDialogDescription>
              Submit "{app.appName}" for approval. Once submitted, changes will be locked until reviewed by an approver.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction('submit')}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirmation */}
      <AlertDialog open={activeDialog === 'approve'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Annual Procurement Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Approve "{app.appName}". The APP will be ready for publication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction('approve')}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject/Send Back Confirmation */}
      <AlertDialog open={activeDialog === 'reject'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Back to Draft?</AlertDialogTitle>
            <AlertDialogDescription>
              Send "{app.appName}" back to draft status. It will be available for editing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction('reject')}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Sending...' : 'Send Back'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Set as Final APP Confirmation */}
      <AlertDialog open={activeDialog === 'publish'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set as Final Annual Procurement Plan?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <div>Set "{app.appName}" as the official Final APP for this fiscal year.</div>
              <div className="font-semibold text-red-600">⚠️ Warning: This action is IRREVERSIBLE!</div>
              <div className="text-sm">Once set as Final:</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>No further edits will be allowed</li>
                <li>Line items cannot be deleted</li>
                <li>It becomes the locked baseline for the fiscal year</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction('publish')}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? 'Setting as Final...' : 'Set as Final'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
