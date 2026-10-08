import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext'
import {
  fetchAssignableOperationalRoles,
  assignOperationalRoles,
} from '@/services/api/operationalRoles'
import { inviteTenantMember } from '@/services/api/tenantMembers'
import {
  UserPlus,
  Mail,
  Clock,
  Trash2,
  Loader2,
  Users,
  Info,
  Shield,
  CheckCircle2,
  Check,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'

export function InviteWorkspaceMemberModal() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'org:member' | 'org:admin'>('org:member')
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [invitationResult, setInvitationResult] = useState<{
    email: string
    token: string
    expiresAt?: string
  } | null>(null)
  const [hasCopied, setHasCopied] = useState(false)

  const {
    inviteWorkspaceMember,
    revokeWorkspaceInvitation,
    workspaceInvitations = [],
    activeTenant,
    activeRole,
    role: currentAuthRole,
    isSuperAdmin,
    user: currentAuthUser,
  } = useUnifiedAuth()

  const currentRole = activeRole || currentAuthRole || ''
  const isDashboardAdmin =
    Boolean(isSuperAdmin) ||
    currentRole === 'System Administrator' ||
    currentRole === 'Dashboard System Admin' ||
    currentRole === 'Workspace Admin' ||
    currentRole === 'Workspace Administrator' ||
    Boolean(currentAuthUser?.publicMetadata?.isSuperAdmin)

  if (!isDashboardAdmin) {
    return null
  }

  // Fetch available operational ERP roles
  const { data: operationalRoles = [], isLoading: isLoadingOperationalRoles } =
    useQuery({
      queryKey: ['assignable-operational-roles'],
      queryFn: fetchAssignableOperationalRoles,
    })

  // Set intelligent role defaults (Viewer for member, System Admin for admin)
  useEffect(() => {
    if (operationalRoles.length > 0 && selectedRoleIds.length === 0) {
      if (role === 'org:admin') {
        const adminRole = operationalRoles.find(
          (r: any) =>
            r.name.toLowerCase().includes('administrator') ||
            r.name.toLowerCase().includes('admin'),
        )
        if (adminRole) setSelectedRoleIds([adminRole.id])
      } else {
        const viewerRole = operationalRoles.find(
          (r: any) =>
            r.name.toLowerCase().includes('viewer') ||
            r.name.toLowerCase().includes('employee'),
        )
        if (viewerRole) setSelectedRoleIds([viewerRole.id])
      }
    }
  }, [operationalRoles, role])

  const handleRoleChange = (newRole: 'org:member' | 'org:admin') => {
    setRole(newRole)
    if (newRole === 'org:admin') {
      const adminRole = operationalRoles.find(
        (r: any) =>
          r.name.toLowerCase().includes('administrator') ||
          r.name.toLowerCase().includes('admin'),
      )
      if (adminRole && !selectedRoleIds.includes(adminRole.id)) {
        setSelectedRoleIds((prev) => [...prev, adminRole.id])
      }
    }
  }

  const handleToggleOperationalRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    )
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      toast.error('Please enter a valid email address.')
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Send workspace invitation via TenantManagement.Api (calls Clerk user invitation and tracks Pending state in TenantMembers)
      const res = await inviteTenantMember({
        email: trimmedEmail,
        roleIds: selectedRoleIds.length > 0 ? selectedRoleIds : undefined,
      })

      // 2. Pre-assign operational roles in the planning database with IsActive = false (pending activation)
      if (selectedRoleIds.length > 0) {
        try {
          await assignOperationalRoles({
            email: trimmedEmail,
            fullName: trimmedEmail.split('@')[0],
            roleIds: selectedRoleIds,
          })
        } catch (roleErr: any) {
          console.warn('Failed to pre-assign operational roles during invitation:', roleErr)
        }
      }

      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
      queryClient.invalidateQueries({ queryKey: ['ams-all-role-assignments'] })

      const token = res?.data?.invitationToken || res?.invitationToken
      if (token) {
        setInvitationResult({
          email: trimmedEmail,
          token,
          expiresAt: res?.data?.invitationExpiresAtUtc || res?.invitationExpiresAtUtc,
        })
      } else {
        toast.success(`Invitation sent successfully to ${trimmedEmail} via Clerk.`)
        setIsOpen(false)
      }
      setEmail('')
      setRole('org:member')
      setSelectedRoleIds([])
    } catch (error: any) {
      console.error('Failed to invite member:', error)
      const message =
        error?.response?.data?.message ||
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
      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
      queryClient.invalidateQueries({ queryKey: ['ams-all-role-assignments'] })
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

      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {invitationResult ? (
          <>
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    Invitation Dispatched
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    {activeTenant?.name ? `Workspace: ${activeTenant.name}` : 'Workspace Invitation'}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-semibold text-emerald-950 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Invitation registered for: <strong>{invitationResult.email}</strong></span>
                </div>
                <p className="leading-relaxed text-emerald-800">
                  The member has been added in the Control Plane with status <strong>Pending</strong>. Their pre-delegated operational roles will activate automatically upon acceptance.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Direct Acceptance Link</span>
                  {hasCopied && (
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied to clipboard!
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':5173') : 'http://localhost:5173'}/accept-invitation?token=${invitationResult.token}`}
                    className="text-xs font-mono bg-slate-50 select-all h-9"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const portalOrigin = typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':5173') : 'http://localhost:5173'
                      const url = `${portalOrigin}/accept-invitation?token=${invitationResult.token}`
                      navigator.clipboard.writeText(url)
                      setHasCopied(true)
                      toast.success('Invitation link copied!')
                      setTimeout(() => setHasCopied(false), 3000)
                    }}
                    className="gap-1.5 text-xs shrink-0 h-9 px-3"
                  >
                    {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopied ? 'Copied' : 'Copy Link'}</span>
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  If Clerk automated email dispatch is active, an email was sent. You can also share this direct link directly with the user.
                </p>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-slate-50/50 flex items-center justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setInvitationResult(null)
                  setIsOpen(false)
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
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
              Pre-selected <strong>Operational ERP Roles</strong> will be bound immediately so their dashboard and functional modules activate as soon as they accept and sign in.
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
                onValueChange={(val: 'org:member' | 'org:admin') => handleRoleChange(val)}
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

            {/* Operational ERP Roles Selection */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span>Assign Operational ERP Roles</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {selectedRoleIds.length} role{selectedRoleIds.length === 1 ? '' : 's'} selected
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Choose the ERP business roles to delegate to this user. Access to PBMS, PMS, and Procurement modules will activate automatically upon their first sign-in.
              </p>

              {isLoadingOperationalRoles ? (
                <div className="text-center py-4 text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading operational roles...</span>
                </div>
              ) : operationalRoles.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-2.5 border rounded-md bg-slate-50">
                  No assignable operational roles found in this workspace.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {operationalRoles.map((opRole: any) => {
                    const isChecked = selectedRoleIds.includes(opRole.id)
                    return (
                      <label
                        key={opRole.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition text-xs ${
                          isChecked
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleToggleOperationalRole(opRole.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">
                              {opRole.name}
                            </span>
                            {opRole.isSystemRole && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-3.5 text-slate-500 bg-white font-normal"
                              >
                                System
                              </Badge>
                            )}
                          </div>
                          {opRole.description && (
                            <p className="text-[11px] text-slate-600 line-clamp-2">
                              {opRole.description}
                            </p>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
