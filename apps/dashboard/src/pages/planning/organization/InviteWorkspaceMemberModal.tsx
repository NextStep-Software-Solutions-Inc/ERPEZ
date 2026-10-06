import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext'
import {
  UserPlus,
  Mail,
  Shield,
  Clock,
  Trash2,
  Loader2,
  Users,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

export function InviteWorkspaceMemberModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'org:member' | 'org:admin'>('org:member')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const {
    inviteWorkspaceMember,
    revokeWorkspaceInvitation,
    workspaceInvitations = [],
    provider,
    activeTenant,
  } = useUnifiedAuth()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      toast.error('Please enter a valid email address.')
      return
    }

    try {
      setIsSubmitting(true)
      await inviteWorkspaceMember(trimmedEmail, role)
      toast.success(`Invitation sent successfully to ${trimmedEmail}.`)
      setEmail('')
      setRole('org:member')
    } catch (error: any) {
      console.error('Failed to invite member:', error)
      const message =
        error?.errors?.[0]?.message ||
        error?.message ||
        'Failed to send invitation. Please verify permissions or seat quota.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (invitationId: string, email: string) => {
    if (!revokeWorkspaceInvitation) return
    try {
      setRevokingId(invitationId)
      await revokeWorkspaceInvitation(invitationId)
      toast.success(`Invitation for ${email} has been revoked.`)
    } catch (error: any) {
      console.error('Failed to revoke invitation:', error)
      toast.error(error?.message || 'Failed to revoke invitation.')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 shadow-sm font-medium">
          <UserPlus className="h-4 w-4" />
          <span>Invite Member</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Invite Workspace Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {activeTenant?.name
                  ? `Collaborate in workspace: ${activeTenant.name}`
                  : 'Invite colleagues to collaborate in this workspace'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Explanation Alert */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs text-slate-700 leading-relaxed">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              Invited members receive an email link to join this workspace.
              Once they accept and sign in, you can assign them functional{' '}
              <strong>Operational ERP Roles</strong> (e.g. Planning Officer, BAC Member, Approver).
            </div>
          </div>

          {/* Invitation Form */}
          <form id="invite-member-form" onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="member-email" className="text-xs font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="member-email"
                  type="email"
                  placeholder="colleague@agency.gov.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="pl-9 h-10 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="member-role" className="text-xs font-semibold">
                Workspace Access Level
              </Label>
              <Select
                value={role}
                onValueChange={(val: 'org:member' | 'org:admin') => setRole(val)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="member-role" className="h-10 text-sm">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org:member">
                    <div className="flex flex-col text-left py-0.5">
                      <span className="font-medium text-xs">Workspace Member</span>
                      <span className="text-[11px] text-muted-foreground">
                        Standard collaborator. Eligible for operational ERP workflow roles.
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="org:admin">
                    <div className="flex flex-col text-left py-0.5">
                      <span className="font-medium text-xs">Workspace Admin</span>
                      <span className="text-[11px] text-muted-foreground">
                        Can invite members and manage operational ERP roles in this workspace.
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>

          {/* Pending Invitations List */}
          {workspaceInvitations.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>Pending Invitations ({workspaceInvitations.length})</span>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {workspaceInvitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-2.5 rounded-md border bg-slate-50/70 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="font-medium text-slate-900 truncate">
                        {inv.email}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-normal"
                        >
                          {inv.role || 'Member'}
                        </Badge>
                        {inv.createdAt && <span>Sent: {inv.createdAt}</span>}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(inv.id, inv.email)}
                      disabled={revokingId === inv.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2 text-xs shrink-0"
                    >
                      {revokingId === inv.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      <span>Revoke</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50/50 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Close
          </Button>
          <Button
            type="submit"
            form="invite-member-form"
            size="sm"
            disabled={isSubmitting || !email.trim()}
            className="gap-1.5 font-medium"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Send Invitation</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
