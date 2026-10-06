import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, UserCheck, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchUsers, type User } from '@/services/api/users'
import {
  fetchAssignableOperationalRoles,
  assignOperationalRoles,
  fetchUserAssignedRoles,
  type OperationalRoleSummary,
} from '@/services/api/operationalRoles'
import { toast } from 'sonner'
import { LicenseStatusCard } from '@/components/ams/LicenseStatusCard'
import { AmsRolesManagementView } from '@/components/ams/AmsRolesManagementView'
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext'

interface ResolvedIdentity {
  displayName: string
  email: string
  authId: string
  avatarUrl?: string
  roleBadge?: string
  isCurrentUser: boolean
  initials: string
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function resolveUserIdentity(
  user: User,
  workspaceMembers: any[] = [],
  currentAuthUser: any = null,
): ResolvedIdentity {
  let authId = ''
  if (user.email?.includes('@keycloak.local')) {
    authId = user.email.replace('@keycloak.local', '')
  } else if (user.username?.startsWith('user_')) {
    authId = user.username
  } else if (user.fullName?.startsWith('user_')) {
    authId = user.fullName.split(/[@\s]/)[0]
  }

  // 1. Match against Clerk workspace memberships
  const clerkMember = workspaceMembers.find(
    (m) =>
      (authId && m.userId?.toLowerCase() === authId.toLowerCase()) ||
      (user.email && m.email && m.email.toLowerCase() === user.email.toLowerCase())
  )

  // 2. Match against current logged-in user
  const isCurrentUser = Boolean(
    currentAuthUser &&
      ((authId && currentAuthUser.id?.toLowerCase() === authId.toLowerCase()) ||
        (user.email &&
          currentAuthUser.email &&
          user.email.toLowerCase() === currentAuthUser.email.toLowerCase()))
  )

  const isPlaceholderName =
    !user.fullName ||
    user.fullName.startsWith('user_') ||
    user.fullName.includes('@keycloak.local')

  const isPlaceholderEmail =
    !user.email || user.email.includes('@keycloak.local')

  let displayName = user.fullName
  let email = user.email
  let avatarUrl: string | undefined = undefined
  let roleBadge: string | undefined = undefined

  if (clerkMember) {
    if (isPlaceholderName && clerkMember.fullName) {
      displayName = clerkMember.fullName
    }
    if (isPlaceholderEmail && clerkMember.email) {
      email = clerkMember.email
    }
    avatarUrl = clerkMember.imageUrl
    roleBadge =
      clerkMember.role === 'org:admin' || clerkMember.role === 'admin'
        ? 'Workspace Admin'
        : 'Member'
  } else if (isCurrentUser && currentAuthUser) {
    if (isPlaceholderName && currentAuthUser.displayName) {
      displayName = currentAuthUser.displayName
    }
    if (isPlaceholderEmail && currentAuthUser.email) {
      email = currentAuthUser.email
    }
    roleBadge = 'Workspace Admin'
  } else if (isPlaceholderName) {
    const short = authId ? `${authId.slice(0, 10)}...` : 'User'
    displayName = `Workspace Member (${short})`
  }

  if (isPlaceholderEmail && authId) {
    email = `ID: ${authId.slice(0, 16)}...`
  }

  return {
    displayName,
    email,
    authId,
    avatarUrl,
    roleBadge,
    isCurrentUser,
    initials: getInitials(displayName),
  }
}

export default function OperationalRolesTab() {
  const queryClient = useQueryClient()
  const { user: currentAuthUser, workspaceMembers = [] } = useUnifiedAuth()
  const [viewMode, setViewMode] = useState<'assignments' | 'roles'>('assignments')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingUserRoles, setLoadingUserRoles] = useState(false)

  // 1. Fetch active personnel/users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['workspace-users'],
    queryFn: fetchUsers,
  })

  // 2. Fetch assignable operational roles from backend
  const { data: operationalRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['assignable-operational-roles'],
    queryFn: fetchAssignableOperationalRoles,
  })

  // 3. Mutation to assign operational roles
  const assignMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      assignOperationalRoles(userId, roleIds),
    onSuccess: () => {
      toast.success('Operational roles assigned successfully.')
      setIsDialogOpen(false)
      setSelectedUser(null)
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
      queryClient.invalidateQueries({ queryKey: ['assignable-operational-roles'] })
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || 'Failed to update operational roles.'
      toast.error(msg)
    },
  })

  // Filtered users list with resolved identity matching
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter((u) => {
      const resolved = resolveUserIdentity(u, workspaceMembers, currentAuthUser)
      return (
        resolved.displayName.toLowerCase().includes(q) ||
        resolved.email.toLowerCase().includes(q) ||
        resolved.authId.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.employeeNumber?.toLowerCase().includes(q) ||
        u.officeName?.toLowerCase().includes(q)
      )
    })
  }, [users, searchQuery, workspaceMembers, currentAuthUser])

  const handleOpenAssignModal = async (user: User) => {
    setSelectedUser(user)
    setSelectedRoleIds([]) // Reset or initialize
    setIsDialogOpen(true)
    setLoadingUserRoles(true)
    try {
      const assigned = await fetchUserAssignedRoles(user.id)
      setSelectedRoleIds(assigned.map((r: any) => r.id))
    } catch {
      // Keep empty if fetch fails
    } finally {
      setLoadingUserRoles(false)
    }
  }

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    )
  }

  const handleSaveAssignments = () => {
    if (!selectedUser) return
    assignMutation.mutate({
      userId: selectedUser.id,
      roleIds: selectedRoleIds,
    })
  }

  return (
    <div className="space-y-6">
      {/* License & Capacity Engine Card */}
      <LicenseStatusCard />

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 border-b pb-2">
        <Button
          variant={viewMode === 'assignments' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('assignments')}
          className="text-xs"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Personnel Role Assignments
        </Button>
        <Button
          variant={viewMode === 'roles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode('roles')}
          className="text-xs"
        >
          <Shield className="w-3.5 h-3.5 mr-1.5" /> AMS Roles & Permissions Catalog
        </Button>
      </div>

      {viewMode === 'roles' ? (
        <AmsRolesManagementView />
      ) : (
        <>
          {/* Top Banner / Explanation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg text-slate-900">
                  ERP Operational Role Governance
                </h3>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl">
                Operational roles (such as <strong>LIB Approver</strong>,{' '}
                <strong>Planning Officer</strong>,{' '}
                <strong>Procurement Officer</strong>, and{' '}
                <strong>Dashboard System Admin</strong>) grant workflow and
                functional execution permissions strictly inside this tenant
                workspace. Tenant management governance roles are separated in the
                account portal.
              </p>
            </div>
          </div>

      {/* Toolbar / Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search personnel by name, email, employee #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing {filteredUsers.length} of {users.length} workspace members
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">
                Personnel / Member
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Official Office
              </TableHead>
              <TableHead className="font-semibold text-slate-700">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-700 pr-6">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-slate-500"
                >
                  Loading personnel records...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-slate-500"
                >
                  No personnel records found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const resolved = resolveUserIdentity(user, workspaceMembers, currentAuthUser)
                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-slate-50/60 transition"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        {resolved.avatarUrl ? (
                          <img
                            src={resolved.avatarUrl}
                            alt={resolved.displayName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                            {resolved.initials}
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 truncate">
                              {resolved.displayName}
                            </span>
                            {resolved.isCurrentUser && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 font-medium"
                              >
                                You
                              </Badge>
                            )}
                            {resolved.roleBadge && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-700 font-normal"
                              >
                                {resolved.roleBadge}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 truncate">
                            <span>{resolved.email}</span>
                            {user.employeeNumber && (
                              <>
                                <span>•</span>
                                <span>EMP: {user.employeeNumber}</span>
                              </>
                            )}
                            {resolved.authId && !resolved.email.includes(resolved.authId) && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {resolved.authId.slice(0, 14)}...
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {user.officeName || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAssignModal(user)}
                        className="gap-1.5 text-xs h-8"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                        Configure Roles
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Assignment Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Assign Operational ERP Roles
            </DialogTitle>
            <DialogDescription>
              {(() => {
                if (!selectedUser) return null
                const resolved = resolveUserIdentity(selectedUser, workspaceMembers, currentAuthUser)
                return (
                  <span>
                    Select operational roles to delegate to{' '}
                    <strong className="text-slate-900 font-semibold">
                      {resolved.displayName}
                    </strong>{' '}
                    ({resolved.email}).
                  </span>
                )
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-3">
            {isLoadingRoles || loadingUserRoles ? (
              <div className="text-center py-8 text-slate-500">
                {isLoadingRoles ? 'Loading assignable operational roles...' : 'Loading member roles...'}
              </div>
            ) : operationalRoles.length === 0 ? (
              <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6 text-amber-500" />
                <span>
                  No operational roles found in the current workspace.
                </span>
              </div>
            ) : (
              operationalRoles.map((role) => {
                const isSelected = selectedRoleIds.includes(role.id)
                const perms = role.permissionDisplayNames || (role as any).permissions || []
                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleRole(role.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">
                          {role.name}
                        </span>
                        {role.isSystemRole && (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-slate-600 bg-white"
                          >
                            System Role
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {role.description}
                        </p>
                      )}
                      {perms.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {perms
                            .slice(0, 4)
                            .map((p: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                              >
                                {p}
                              </span>
                            ))}
                          {perms.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{perms.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                )
              })
            )}
          </div>

          <DialogFooter className="gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={assignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAssignments}
              disabled={assignMutation.isPending}
              className="gap-2"
            >
              {assignMutation.isPending ? 'Saving...' : 'Save Role Assignments'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )}
</div>
)
}
