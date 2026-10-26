import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Shield,
  UserCheck,
  AlertCircle,
  RotateCw,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
} from 'lucide-react'
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
  fetchAllUserRoleAssignments,
} from '@/services/api/operationalRoles'
import { toast } from 'sonner'
import { LicenseStatusCard } from '@/components/ams/LicenseStatusCard'
import { AmsRolesManagementView } from '@/components/ams/AmsRolesManagementView'
import { useUnifiedAuth } from '@/auth/UnifiedAuthContext'
import { InviteWorkspaceMemberModal } from './InviteWorkspaceMemberModal'
import {
  fetchTenantMembers,
  resendTenantMemberInvitation,
  revokeTenantMemberInvitation,
  type TenantMemberDto,
} from '@/services/api/tenantMembers'
import {
  ROLES,
  isWorkspaceAdminRole,
  isTenantAdminRole,
  isPlatformAdminRole,
} from '@/constants/roles'

interface UnifiedWorkspaceMemberRow {
  key: string
  operationalUser: User | null
  tenantMember: TenantMemberDto | null
  displayName: string
  email: string
  authId: string
  avatarUrl?: string
  roleBadge?: string
  isCurrentUser: boolean
  initials: string
  employeeNumber?: string
  officeName?: string
  status: 'Active' | 'Pending' | 'Expired' | 'Disabled'
  invitationExpiresAtUtc?: string | null
  isPendingOrExpired: boolean
  assignedRoles: string[]
}

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
  } else if (user.employeeNumber?.startsWith('user_')) {
    authId = user.employeeNumber
  }

  // 1. Match against Clerk / Tenant workspace memberships
  const clerkMember = workspaceMembers.find(
    (m) =>
      (authId && m.userId && (
        m.userId.toLowerCase() === authId.toLowerCase() ||
        authId.toLowerCase().includes(m.userId.toLowerCase()) ||
        m.userId.toLowerCase().includes(authId.toLowerCase())
      )) ||
      (user.email && m.email && m.email.toLowerCase() === user.email.toLowerCase()) ||
      (user.username && m.userId && m.userId.toLowerCase() === user.username.toLowerCase())
  )

  // 2. Match against current logged-in user
  const isCurrentUser = Boolean(
    currentAuthUser &&
      ((authId && currentAuthUser.id && (
        currentAuthUser.id.toLowerCase() === authId.toLowerCase() ||
        authId.toLowerCase().includes(currentAuthUser.id.toLowerCase())
      )) ||
        (user.email &&
          currentAuthUser.email &&
          user.email.toLowerCase() === currentAuthUser.email.toLowerCase()))
  )

  const isPlaceholderName =
    !user.fullName ||
    user.fullName.startsWith('user_') ||
    user.fullName.includes('@keycloak.local') ||
    user.fullName === 'Workspace User' ||
    user.fullName === 'User'

  const isPlaceholderEmail =
    !user.email || user.email.includes('@keycloak.local')

  let displayName = user.fullName
  let email = user.email
  let avatarUrl: string | undefined = undefined
  let roleBadge: string | undefined = undefined

  if (clerkMember) {
    if ((isPlaceholderName || !displayName) && clerkMember.fullName) {
      displayName = clerkMember.fullName
    }
    if ((isPlaceholderEmail || !email) && clerkMember.email) {
      email = clerkMember.email
    }
    avatarUrl = clerkMember.imageUrl
    roleBadge =
      clerkMember.role === 'org:admin' || clerkMember.role === 'admin' || clerkMember.role === 'TenantAdmin'
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
  const {
    user: currentAuthUser,
    activeTenant,
    workspaceMembers = [],
    workspaceInvitations = [],
    revokeWorkspaceInvitation,
    activeRole,
    role,
    isSuperAdmin,
  } = useUnifiedAuth()
  const [viewMode, setViewMode] = useState<'assignments' | 'roles'>('assignments')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expired'>('all')
  const [selectedRow, setSelectedRow] = useState<UnifiedWorkspaceMemberRow | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingUserRoles, setLoadingUserRoles] = useState(false)

  const currentRole = activeRole || role || ''

  // Dashboard System Admin holds full operational role governance inside this workspace
  const isDashboardAdmin =
    Boolean(isSuperAdmin) ||
    isWorkspaceAdminRole(currentRole) ||
    Boolean(currentAuthUser?.publicMetadata?.isSuperAdmin)

  // Tenant Admin viewing ERP operational roles without Dashboard Admin role is a spectator
  const isTenantAdminSpectator =
    !isDashboardAdmin &&
    (isTenantAdminRole(currentRole) || isPlatformAdminRole(currentRole))

  // 1. Fetch active personnel/users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['workspace-users', activeTenant?.id],
    queryFn: fetchUsers,
  })

  // 2. Fetch assignable operational roles from backend
  const { data: operationalRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['assignable-operational-roles', activeTenant?.id],
    queryFn: fetchAssignableOperationalRoles,
  })

  // 3. Fetch all operational role assignments across the workspace
  const { data: allRoleAssignments = [] } = useQuery({
    queryKey: ['ams-all-role-assignments', activeTenant?.id],
    queryFn: fetchAllUserRoleAssignments,
  })

  // Role assignments lookup map
  const roleAssignmentsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const item of allRoleAssignments) {
      if (item.userId) map.set(item.userId.toLowerCase(), item.roles)
      if (item.externalIdentityId) map.set(item.externalIdentityId.toLowerCase(), item.roles)
      if (item.email) map.set(item.email.toLowerCase(), item.roles)
    }
    return map
  }, [allRoleAssignments])

  // 4. Fetch tenant members from TenantManagement.Api for comprehensive identification
  const { data: tenantMembers = [], isLoading: isLoadingTenantMembers } = useQuery({
    queryKey: ['tenant-members', activeTenant?.id],
    queryFn: fetchTenantMembers,
    staleTime: 30_000,
  })

  // Combine workspace members from Auth Provider (Clerk/Keycloak) and TenantManagement.Api
  const allWorkspaceMembers = useMemo(() => {
    const list = [...workspaceMembers]
    for (const tm of tenantMembers) {
      const userId = tm.userId || tm.externalIdentityId || tm.id
      const firstName = tm.firstName || ''
      const lastName = tm.lastName || ''
      const fullName =
        tm.fullName ||
        [firstName, lastName].filter(Boolean).join(' ') ||
        tm.email ||
        'Workspace Member'
      const existing = list.find(
        (m) =>
          (m.userId && userId && m.userId.toLowerCase() === userId.toLowerCase()) ||
          (m.email && tm.email && m.email.toLowerCase() === tm.email.toLowerCase())
      )
      if (existing) {
        if (fullName !== 'Workspace Member') existing.fullName = fullName
        if (tm.email) existing.email = tm.email
        if (tm.role) existing.role = tm.role
      } else {
        list.push({
          userId,
          email: tm.email || '',
          fullName,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          role: tm.role || (tm.roles && tm.roles[0]) || 'Member',
        })
      }
    }
    return list
  }, [workspaceMembers, tenantMembers])

  // 5. Mutation to assign operational roles
  const assignMutation = useMutation({
    mutationFn: (payload: {
      userId?: string
      email?: string
      fullName?: string
      externalIdentityId?: string
      roleIds: string[]
    }) => assignOperationalRoles(payload),
    onSuccess: () => {
      toast.success('Operational roles assigned successfully.')
      setIsDialogOpen(false)
      setSelectedRow(null)
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
      queryClient.invalidateQueries({ queryKey: ['assignable-operational-roles'] })
      queryClient.invalidateQueries({ queryKey: ['ams-all-role-assignments'] })
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || 'Failed to update operational roles.'
      toast.error(msg)
    },
  })

  // 5. Mutation to resend tenant member invitation
  const resendMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await resendTenantMemberInvitation(memberId)
    },
    onSuccess: () => {
      toast.success('Invitation resent successfully.')
      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to resend invitation.'
      toast.error(msg)
    },
  })

  // 6. Mutation to revoke invitation
  const revokeMutation = useMutation({
    mutationFn: async ({ id, isClerk }: { id: string; isClerk: boolean }) => {
      if (isClerk && revokeWorkspaceInvitation) {
        return await revokeWorkspaceInvitation(id)
      }
      return await revokeTenantMemberInvitation(id)
    },
    onSuccess: () => {
      toast.success('Invitation revoked successfully.')
      queryClient.invalidateQueries({ queryKey: ['tenant-members'] })
      queryClient.invalidateQueries({ queryKey: ['workspace-users'] })
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || 'Failed to revoke invitation.'
      toast.error(msg)
    },
  })

  // Unified list of all workspace members and pending/expired invitations
  const unifiedMembers = useMemo(() => {
    const rows: UnifiedWorkspaceMemberRow[] = []
    const matchedTenantMemberIds = new Set<string>()
    const matchedEmails = new Set<string>()

    // 1. Process operational users from planning.Users
    for (const u of users) {
      const resolved = resolveUserIdentity(u, allWorkspaceMembers, currentAuthUser)

      const tm = tenantMembers.find(
        (m: TenantMemberDto) =>
          (m.email && u.email && m.email.toLowerCase() === u.email.toLowerCase()) ||
          (m.userId && resolved.authId && m.userId.toLowerCase() === resolved.authId.toLowerCase()) ||
          (m.externalIdentityId && resolved.authId && m.externalIdentityId.toLowerCase() === resolved.authId.toLowerCase())
      )

      // Multi-tenant membership isolation:
      // Operational users from planning.Users must only be rendered in this workspace if they actually
      // belong to this workspace (via tenantMembers matching, or matching current logged-in user).
      // Prevents foreign tenant employees (e.g. NextJump dev users) from leaking into Pax Silica Inc.
      const isDefaultDevWorkspace = Boolean(
        activeTenant?.id?.includes('01a0d69d') ||
        activeTenant?.name?.toLowerCase().includes('nextjump')
      )
      const belongsToThisWorkspace = Boolean(
        tm ||
        resolved.isCurrentUser ||
        (tenantMembers.length === 0 && isDefaultDevWorkspace)
      )

      if (!belongsToThisWorkspace) {
        continue
      }

      if (tm) {
        matchedTenantMemberIds.add(tm.id)
      }
      if (u.email) {
        matchedEmails.add(u.email.toLowerCase())
      }

      let status: 'Active' | 'Pending' | 'Expired' | 'Disabled' = u.isActive ? 'Active' : 'Disabled'
      if (tm) {
        if (tm.status === 'Disabled') {
          status = 'Disabled'
        } else if (tm.status === 'Pending' || tm.status === 'Invited') {
          const isExpired = tm.invitationExpiresAtUtc ? new Date(tm.invitationExpiresAtUtc) < new Date() : false
          status = isExpired ? 'Expired' : 'Pending'
        } else if (tm.status === 'Active') {
          if (tm.externalIdentityId?.startsWith('inv_') || (!u.externalIdentityId && !u.isActive)) {
            status = 'Pending'
          } else {
            status = u.isActive ? 'Active' : 'Disabled'
          }
        }
      } else if (!u.externalIdentityId || !u.isActive) {
        status = 'Pending'
      }

      const rawAssigned =
        roleAssignmentsMap.get(u.id.toLowerCase()) ||
        (resolved.authId ? roleAssignmentsMap.get(resolved.authId.toLowerCase()) : undefined) ||
        (resolved.email ? roleAssignmentsMap.get(resolved.email.toLowerCase()) : undefined) ||
        []

      const isWorkspaceAdminMember =
        resolved.roleBadge === 'Workspace Admin' ||
        tm?.role === 'TenantAdmin' ||
        tm?.role === 'Workspace Administrator' ||
        tm?.roles?.some((r: string) => r.toLowerCase().includes('admin')) ||
        (resolved.isCurrentUser && (currentAuthUser?.publicMetadata?.isSuperAdmin || currentAuthUser?.role?.includes('Admin') || currentAuthUser?.roles?.some((r: string) => r.toLowerCase().includes('admin'))))

      const filteredRaw = isWorkspaceAdminMember
        ? rawAssigned.filter((r) => r !== ROLES.EMPLOYEE_VIEWER)
        : rawAssigned

      const assignedRoles = filteredRaw.length > 0
        ? filteredRaw
        : (isWorkspaceAdminMember ? [ROLES.SYSTEM_ADMINISTRATOR] : [])

      rows.push({
        key: `user-${u.id}`,
        operationalUser: u,
        tenantMember: tm || null,
        displayName: resolved.displayName,
        email: resolved.email,
        authId: resolved.authId,
        avatarUrl: resolved.avatarUrl,
        roleBadge: resolved.roleBadge,
        isCurrentUser: resolved.isCurrentUser,
        initials: resolved.initials,
        employeeNumber: u.employeeNumber,
        officeName: u.officeName,
        status,
        invitationExpiresAtUtc: tm?.invitationExpiresAtUtc,
        isPendingOrExpired: status === 'Pending' || status === 'Expired',
        assignedRoles,
      })
    }

    // 2. Process tenant members who do NOT yet exist in planning.Users (e.g. pending/invited)
    for (const tm of tenantMembers) {
      if (matchedTenantMemberIds.has(tm.id)) continue
      if (tm.email && matchedEmails.has(tm.email.toLowerCase())) continue

      const firstName = tm.firstName || ''
      const lastName = tm.lastName || ''
      const fullName =
        tm.fullName ||
        [firstName, lastName].filter(Boolean).join(' ') ||
        tm.email ||
        'Workspace Member'

      const email = tm.email || ''
      const authId = tm.userId || tm.externalIdentityId || tm.id

      const isCurrentUser = Boolean(
        currentAuthUser &&
          ((authId && currentAuthUser.id && currentAuthUser.id.toLowerCase() === authId.toLowerCase()) ||
            (email && currentAuthUser.email && email.toLowerCase() === currentAuthUser.email.toLowerCase()))
      )

      const isAuthActive = allWorkspaceMembers.some(
        (m) =>
          (m.email && email && m.email.toLowerCase() === email.toLowerCase()) ||
          (m.userId && authId && m.userId.toLowerCase() === authId.toLowerCase())
      )

      const isExpired = tm.invitationExpiresAtUtc ? new Date(tm.invitationExpiresAtUtc) < new Date() : false
      let status: 'Active' | 'Pending' | 'Expired' | 'Disabled' = 'Active'
      if (tm.status === 'Disabled') {
        status = 'Disabled'
      } else if (tm.status === 'Pending' || tm.status === 'Invited') {
        status = isExpired ? 'Expired' : 'Pending'
      } else if (tm.status === 'Active') {
        status = 'Active'
      }

      const roleBadge = tm.role === 'TenantAdmin' || tm.role === 'Workspace Administrator' || tm.roles?.some((r: string) => r.toLowerCase().includes('admin')) ? 'Workspace Admin' : 'Workspace Member'

      const rawRoles =
        (authId ? roleAssignmentsMap.get(authId.toLowerCase()) : undefined) ||
        (email ? roleAssignmentsMap.get(email.toLowerCase()) : undefined) ||
        []

      const isWorkspaceAdmin = roleBadge === 'Workspace Admin' || isCurrentUser;
      const assignedRoles = rawRoles.length > 0
        ? rawRoles
        : (isWorkspaceAdmin ? ['System Administrator'] : [])

      rows.push({
        key: `tm-${tm.id}`,
        operationalUser: null,
        tenantMember: tm,
        displayName: fullName,
        email,
        authId,
        avatarUrl: undefined,
        roleBadge,
        isCurrentUser,
        initials: getInitials(fullName),
        employeeNumber: undefined,
        officeName: status === 'Pending' || status === 'Expired' ? 'Pending Activation' : 'Unassigned (Pending Profile)',
        status,
        invitationExpiresAtUtc: tm.invitationExpiresAtUtc,
        isPendingOrExpired: status === 'Pending' || status === 'Expired',
        assignedRoles,
      })

      if (email) matchedEmails.add(email.toLowerCase())
    }

    // 3. Process workspace invitations from auth provider (e.g. Clerk) if any
    for (const inv of workspaceInvitations) {
      if (!inv.email || matchedEmails.has(inv.email.toLowerCase())) continue

      const alreadyActive =
        allWorkspaceMembers.some((m) => m.email && m.email.toLowerCase() === inv.email.toLowerCase()) ||
        users.some((u: User) => u.email && u.email.toLowerCase() === inv.email.toLowerCase())

      if (alreadyActive) continue

      rows.push({
        key: `inv-${inv.id}`,
        operationalUser: null,
        tenantMember: null,
        displayName: inv.email.split('@')[0],
        email: inv.email,
        authId: inv.id,
        avatarUrl: undefined,
        roleBadge: inv.role || 'Workspace Member',
        isCurrentUser: false,
        initials: getInitials(inv.email),
        employeeNumber: undefined,
        officeName: 'Pending Activation',
        status: 'Pending',
        invitationExpiresAtUtc: null,
        isPendingOrExpired: true,
        assignedRoles: [],
      })
      matchedEmails.add(inv.email.toLowerCase())
    }

    return rows
  }, [users, tenantMembers, workspaceInvitations, allWorkspaceMembers, currentAuthUser, roleAssignmentsMap])

  // Counts for status filter pills
  const counts = useMemo(() => {
    let active = 0
    let pending = 0
    let expired = 0
    for (const r of unifiedMembers) {
      if (r.status === 'Active') active++
      else if (r.status === 'Pending') pending++
      else if (r.status === 'Expired') expired++
    }
    return { active, pending, expired, total: unifiedMembers.length }
  }, [unifiedMembers])

  // Filtered rows list with search and status filtering
  const filteredRows = useMemo(() => {
    let result = unifiedMembers
    if (statusFilter === 'active') {
      result = result.filter((r) => r.status === 'Active')
    } else if (statusFilter === 'pending') {
      result = result.filter((r) => r.status === 'Pending')
    } else if (statusFilter === 'expired') {
      result = result.filter((r) => r.status === 'Expired')
    }

    if (!searchQuery.trim()) return result
    const q = searchQuery.toLowerCase()
    return result.filter(
      (r) =>
        r.displayName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.authId?.toLowerCase().includes(q) ||
        r.employeeNumber?.toLowerCase().includes(q) ||
        r.officeName?.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    )
  }, [unifiedMembers, statusFilter, searchQuery])

  const handleOpenAssignModal = async (row: UnifiedWorkspaceMemberRow) => {
    setSelectedRow(row)
    setSelectedRoleIds([]) // Reset or initialize
    setIsDialogOpen(true)
    setLoadingUserRoles(true)
    try {
      if (row.operationalUser?.id) {
        const assigned = await fetchUserAssignedRoles(row.operationalUser.id)
        setSelectedRoleIds(assigned.map((r: any) => r.id))
      } else {
        const existingNames = row.assignedRoles || []
        const matchedIds = operationalRoles
          .filter((r: any) => existingNames.includes(r.name))
          .map((r: any) => r.id)
        setSelectedRoleIds(matchedIds)
      }
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
    if (!selectedRow) return
    assignMutation.mutate({
      userId: selectedRow.operationalUser?.id,
      email: selectedRow.email,
      fullName: selectedRow.displayName,
      externalIdentityId:
        selectedRow.authId ||
        selectedRow.tenantMember?.userId ||
        selectedRow.tenantMember?.externalIdentityId,
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

          {/* Spectator Mode Banner */}
          {isTenantAdminSpectator && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/80 text-amber-900 shadow-xs">
              <Eye className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <div className="font-semibold text-amber-950 flex items-center gap-2">
                  <span>Spectator Mode (Read-Only)</span>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                    Tenant Administrator
                  </Badge>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  You are viewing this workspace’s operational roles as an Account Tenant Administrator. In the ERP dashboard, operational role assignments and member invitations are reserved exclusively for <strong>Dashboard System Admins</strong>.
                </p>
              </div>
            </div>
          )}

      {/* Toolbar / Search & Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search personnel, email, role, office..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Quick status filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('all')}
              className={`h-7 px-2.5 text-xs font-medium rounded-md transition ${
                statusFilter === 'all'
                  ? 'bg-white shadow-sm text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({counts.total})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('active')}
              className={`h-7 px-2.5 text-xs font-medium rounded-md transition ${
                statusFilter === 'active'
                  ? 'bg-white shadow-sm text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({counts.active})
            </Button>
            {counts.pending > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className={`h-7 px-2.5 text-xs font-medium rounded-md transition ${
                  statusFilter === 'pending'
                    ? 'bg-amber-100/90 text-amber-900 shadow-sm'
                    : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Pending ({counts.pending})
              </Button>
            )}
            {counts.expired > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('expired')}
                className={`h-7 px-2.5 text-xs font-medium rounded-md transition ${
                  statusFilter === 'expired'
                    ? 'bg-rose-100 text-rose-900 shadow-sm'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Expired ({counts.expired})
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Showing {filteredRows.length} of {unifiedMembers.length} workspace members & invites
          </div>
          {isDashboardAdmin && <InviteWorkspaceMemberModal />}
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
                Operational Roles
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
            {isLoadingUsers || isLoadingTenantMembers ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-slate-500"
                >
                  Loading workspace records and invitations...
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-slate-500"
                >
                  No workspace members or invitations found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((row) => (
                <TableRow
                  key={row.key}
                  className={`hover:bg-slate-50/60 transition ${
                    row.isPendingOrExpired ? 'bg-slate-50/40' : ''
                  }`}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      {row.avatarUrl ? (
                        <img
                          src={row.avatarUrl}
                          alt={row.displayName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full border flex items-center justify-center font-semibold text-xs shrink-0 ${
                            row.status === 'Expired'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : row.status === 'Pending'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-primary/10 border-primary/20 text-primary'
                          }`}
                        >
                          {row.initials}
                        </div>
                      )}
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900 truncate">
                            {row.displayName}
                          </span>
                          {row.isCurrentUser && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 font-medium"
                            >
                              You
                            </Badge>
                          )}
                          {row.roleBadge && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-700 font-normal"
                            >
                              {row.roleBadge}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 truncate">
                          <span>{row.email}</span>
                          {row.employeeNumber && (
                            <>
                              <span>•</span>
                              <span>EMP: {row.employeeNumber}</span>
                            </>
                          )}
                          {row.authId && !row.email.includes(row.authId) && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {row.authId.slice(0, 14)}...
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {row.assignedRoles && row.assignedRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {row.assignedRoles.map((roleName, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                              roleName.toLowerCase().includes('admin')
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : roleName.toLowerCase().includes('officer') || roleName.toLowerCase().includes('approver')
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {roleName}
                          </Badge>
                        ))}
                      </div>
                    ) : row.roleBadge === 'Workspace Admin' || row.isCurrentUser ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border-purple-200"
                      >
                        System Administrator (Workspace Admin)
                      </Badge>
                    ) : row.status === 'Active' ? (
                      <Badge
                        variant="outline"
                        className="text-[11px] font-normal px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border-slate-200"
                      >
                        Employee / Viewer (Default)
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400 italic">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {row.isPendingOrExpired ? (
                      <span className="text-slate-400 italic text-xs">
                        {row.status === 'Expired' ? 'Invitation Expired' : 'Pending Activation'}
                      </span>
                    ) : (
                      row.officeName || <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {row.status === 'Active' ? (
                      <Badge
                        variant="default"
                        className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </Badge>
                    ) : row.status === 'Expired' ? (
                      <Badge
                        variant="destructive"
                        className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 gap-1 font-medium"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Expired
                      </Badge>
                    ) : row.status === 'Pending' ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 gap-1 font-medium"
                      >
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending Invite
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        {row.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {isTenantAdminSpectator ? (
                      <span className="text-xs text-slate-400 italic">View Only</span>
                    ) : row.isPendingOrExpired ? (
                      <div className="flex items-center justify-end gap-1.5">
                        {row.tenantMember?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendMutation.mutate(row.tenantMember!.id)}
                            disabled={resendMutation.isPending}
                            className="gap-1 text-xs h-7 px-2 border-amber-300 text-amber-800 hover:bg-amber-50"
                          >
                            {resendMutation.isPending && resendMutation.variables === row.tenantMember.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCw className="h-3 w-3 text-amber-600" />
                            )}
                            <span>Resend</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm(`Revoke invitation for ${row.email}?`)) {
                              revokeMutation.mutate({
                                id: row.tenantMember?.id || row.authId,
                                isClerk: !row.tenantMember,
                              })
                            }
                          }}
                          disabled={revokeMutation.isPending}
                          className="gap-1 text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Revoke</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenAssignModal(row)}
                        className="gap-1.5 text-xs h-8"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                        Configure Roles
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
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
              {selectedRow && (
                <span>
                  Select operational roles to delegate to{' '}
                  <strong className="text-slate-900 font-semibold">
                    {selectedRow.displayName}
                  </strong>{' '}
                  ({selectedRow.email}).
                </span>
              )}
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
              operationalRoles.map((role: any) => {
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
