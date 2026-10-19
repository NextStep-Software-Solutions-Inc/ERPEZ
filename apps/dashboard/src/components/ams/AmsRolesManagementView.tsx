import * as React from 'react'
import {
  fetchAmsRoles,
  fetchPermissionCatalog,
  createAmsRole,
  updateAmsRole,
  deleteAmsRole,
  type AmsRoleDto,
  type PermissionGroupDto,
} from '@/services/api/amsLicense'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
} from 'lucide-react'

export function AmsRolesManagementView() {
  const [roles, setRoles] = React.useState<AmsRoleDto[]>([])
  const [permissionCatalog, setPermissionCatalog] = React.useState<PermissionGroupDto[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [editingRole, setEditingRole] = React.useState<AmsRoleDto | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [roleName, setRoleName] = React.useState('')
  const [roleDescription, setRoleDescription] = React.useState('')
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<{ text: string; isError: boolean } | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true)
      const [rolesData, permsData] = await Promise.all([
        fetchAmsRoles(),
        fetchPermissionCatalog(),
      ])
      setRoles(rolesData)
      setPermissionCatalog(permsData)
    } catch {
      setMessage({ text: 'Failed to load roles and permissions.', isError: true })
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const openCreateModal = () => {
    setEditingRole(null)
    setRoleName('')
    setRoleDescription('')
    setSelectedPermissions([])
    setIsCreating(true)
    setMessage(null)
  }

  const openEditModal = (role: AmsRoleDto) => {
    setEditingRole(role)
    setRoleName(role.name)
    setRoleDescription(role.description)
    setSelectedPermissions([...role.permissions])
    setIsCreating(false)
    setMessage(null)
  }

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    )
  }

  const toggleAllInCategory = (perms: string[]) => {
    const allSelected = perms.every((p) => selectedPermissions.includes(p))
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !perms.includes(p)))
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...perms])))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roleName.trim()) return

    try {
      setSubmitting(true)
      setMessage(null)

      if (editingRole) {
        await updateAmsRole(editingRole.id, {
          name: roleName.trim(),
          description: roleDescription.trim(),
          isActive: true,
          permissions: selectedPermissions,
        })
        setMessage({ text: `Role "${roleName}" updated successfully.`, isError: false })
      } else {
        await createAmsRole({
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissions: selectedPermissions,
        })
        setMessage({ text: `Role "${roleName}" created successfully.`, isError: false })
      }

      setEditingRole(null)
      setIsCreating(false)
      await loadData()
    } catch (err: any) {
      setMessage({
        text: err?.response?.data?.message || 'Failed to save role.',
        isError: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (role: AmsRoleDto) => {
    if (!window.confirm(`Are you sure you want to delete custom role "${role.name}"?`)) return

    try {
      await deleteAmsRole(role.id)
      setMessage({ text: `Role "${role.name}" deleted successfully.`, isError: false })
      await loadData()
    } catch (err: any) {
      setMessage({
        text: err?.response?.data?.message || 'Failed to delete role.',
        isError: true,
      })
    }
  }

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            AMS Operational Roles & Permissions
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure system and custom RBAC operational roles decoupled from tenant management.
          </p>
        </div>
        <Button onClick={openCreateModal} size="sm" className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Create Custom Role
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm flex items-center gap-2 ${
            message.isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}
        >
          {message.isError ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Editor Modal / Panel */}
      {(isCreating || editingRole) && (
        <Card className="border-2 border-indigo-200 dark:border-indigo-900 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Operational Role'}
            </CardTitle>
            <CardDescription>
              Assign atomic permissions across Planning, Budget, Procurement, and System Administration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Role Name
                  </label>
                  <Input
                    placeholder="e.g. Senior Procurement Reviewer"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    disabled={editingRole?.isSystemRole}
                    required
                  />
                  {editingRole?.isSystemRole && (
                    <span className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> System baseline role names cannot be altered.
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description of functional responsibilities"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Permissions Assignment ({selectedPermissions.length} selected)
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                  {permissionCatalog.map((group) => {
                    const allSelected = group.permissions.every((p) =>
                      selectedPermissions.includes(p),
                    )
                    return (
                      <div key={group.category} className="space-y-1.5">
                        <div className="flex items-center justify-between pb-1 border-b">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {group.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllInCategory(group.permissions)}
                            className="text-[11px] text-indigo-600 hover:underline"
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 pt-1">
                          {group.permissions.map((perm) => {
                            const isChecked = selectedPermissions.includes(perm)
                            return (
                              <label
                                key={perm}
                                className={`flex items-center gap-2 p-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                                  isChecked ? 'bg-indigo-50/80 text-indigo-900 font-medium dark:bg-indigo-950/40' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm)}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="truncate">{perm}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingRole(null)
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Role'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Role Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    {role.name}
                  </CardTitle>
                  <div className="flex items-center gap-1 shrink-0">
                    {role.isSystemRole && (
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700">
                        System
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-[10px]">
                      {role.permissionCount} perms
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {role.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 pb-3 flex items-center justify-between text-xs text-muted-foreground border-t mt-3 pt-2">
                <span>{role.userCount} assigned users</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEditModal(role)}
                    title="Edit Role & Permissions"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  {!role.isSystemRole && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(role)}
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
