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
  type OperationalRoleSummary,
} from '@/services/api/operationalRoles'
import { toast } from 'sonner'

export default function OperationalRolesTab() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || 'Failed to update operational roles.'
      toast.error(msg)
    },
  })

  // Filtered users list
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.employeeNumber?.toLowerCase().includes(q) ||
        u.officeName?.toLowerCase().includes(q),
    )
  }, [users, searchQuery])

  const handleOpenAssignModal = (user: User) => {
    setSelectedUser(user)
    setSelectedRoleIds([]) // Reset or initialize
    setIsDialogOpen(true)
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
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-slate-50/60 transition"
                >
                  <TableCell className="py-3">
                    <div className="font-medium text-slate-900">
                      {user.fullName}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{user.email}</span>
                      {user.employeeNumber && (
                        <>
                          <span>•</span>
                          <span>EMP: {user.employeeNumber}</span>
                        </>
                      )}
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
              Select operational roles to delegate to{' '}
              <strong className="text-slate-900">
                {selectedUser?.fullName}
              </strong>{' '}
              ({selectedUser?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-3">
            {isLoadingRoles ? (
              <div className="text-center py-8 text-slate-500">
                Loading assignable operational roles...
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
                      {role.permissionDisplayNames?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {role.permissionDisplayNames
                            .slice(0, 4)
                            .map((p, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                              >
                                {p}
                              </span>
                            ))}
                          {role.permissionDisplayNames.length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{role.permissionDisplayNames.length - 4} more
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
    </div>
  )
}
