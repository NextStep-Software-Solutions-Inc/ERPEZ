import React from 'react'
import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'

import { assignPersonnelSchema, type AssignPersonnelFormValues } from './CreatePersonnelForm'
import type { Person } from '@/services/mock/personnel'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

import { fetchUsers, getUserDisplayName, type User } from '@/services/api/users'
import { useAllPositions, useVacantPositions, usePersonnelPosition, useUpdatePerson } from '@/pages/planning/organization/hooks/useOrgUnits'

import type { PositionDropdownItem } from '../types'

interface UpdatePersonnelFormProps {
  personnelId: string
  onUpdated: () => void
  onClose: () => void
  availablePositions?: PositionDropdownItem[]
  isDirtyCallback?: (isDirty: boolean) => void
}

/**
 * Placeholder component for editing personnel records.
 *
 * The form is currently a stub mirroring the dialog's original message.
 * Later iterations should populate the fields with the
 * selected personnelPosition entry and wire up an update API call.
 */
export function UpdatePersonnelForm({
  personnelId,
  onUpdated,
  onClose,
  availablePositions,
  isDirtyCallback,
}: UpdatePersonnelFormProps) {
  const updateMutation = useUpdatePerson()
  const [userSearchInput, setUserSearchInput] = React.useState('')
  const [showUserSuggestions, setShowUserSuggestions] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [assignmentType, setAssignmentType] = React.useState<'permanent' | 'oic'>('permanent')

  // fetch all users for the autocomplete
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  })

  // fetch positions and vacancies just like create
  const { data: allPositions = [] } = useAllPositions()
  const { data: vacantPositions = [] } = useVacantPositions()

  // load the personnel record to edit
  const { data: personnel, isLoading: isLoadingPersonnel } = usePersonnelPosition(personnelId)

  // build list based on assignment type or external override
  const positionsToDisplay = availablePositions ||
    (assignmentType === 'oic'
      ? allPositions.filter((p) => p.status === 'filled' && p.title.toLowerCase().includes('chief'))
      : vacantPositions)
      .map((p) => ({
        id: p.id,
        title: p.title,
        code: p.code,
        isVacant: p.status === 'vacant',
      }))

  // filtered users same as create
  const filteredUsers = React.useMemo(() => {
    if (!userSearchInput || selectedUser) return []
    return users.filter(user => {
      const displayName = getUserDisplayName(user).toLowerCase()
      const empNumber = user.employeeNumber.toLowerCase()
      const email = user.email.toLowerCase()
      const search = userSearchInput.toLowerCase()
      return displayName.includes(search) || empNumber.includes(search) || email.includes(search)
    })
  }, [users, userSearchInput, selectedUser])

  const form = useForm({
    defaultValues: {
      userId: '',
      assignmentType: 'permanent' as const,
      positionId: '',
      startDate: '',
      status: 'active' as const,
    } as AssignPersonnelFormValues,
    validators: {
      onChange: assignPersonnelSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // user object is required for the backend payload
        const userObj = selectedUser || users.find(u => u.id === value.userId)
        if (!userObj) {
          console.error('User not found; userId=', value.userId)
          return
        }

        // prepare updates for Person mock; we only update those fields available
        const updates: Partial<Person> = {
          positionId: value.positionId || null,
          startDate: value.startDate ? new Date(value.startDate).toISOString() : undefined,
          status: value.status,
        }

        await updateMutation.mutateAsync({ id: personnelId, updates })
        onUpdated()
      } catch (error) {
        console.error('Failed to update personnel:', error)
      }
    },
  })

  // when personnel record loads, populate the form fields and selection states
  React.useEffect(() => {
    if (!personnel) return

    // assignment type may come capitalized
    const at = personnel.assignmentType?.toLowerCase() as 'permanent' | 'oic' | undefined
    if (at) setAssignmentType(at)

    form.reset({
      userId: personnel.userId,
      assignmentType: at || 'permanent',
      positionId: personnel.positionId || '',
      startDate: personnel.startDate ? personnel.startDate.split('T')[0] : '',
      status: personnel.status as 'active' | 'on-leave' | 'resigned',
    })

    // if user list already fetched, set selectedUser
    const u = users.find((u) => u.id === personnel.userId)
    if (u) {
      setSelectedUser(u)
      setUserSearchInput('')
    }
  }, [personnel, users, form])

  // notify parent when dirty state changes
  React.useEffect(() => {
    isDirtyCallback?.(form.state.isDirty)
  }, [form.state.isDirty, isDirtyCallback])

  if (isLoadingPersonnel) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-default-500" />
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4">
        {/* User Selection copied from create form */}
        <form.Field
          name="userId"
          children={(field) => (
            <div className="space-y-2 relative">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Select User
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  type="text"
                  placeholder="Search by name, employee number, or email..."
                  value={selectedUser ? getUserDisplayName(selectedUser) : userSearchInput}
                  onFocus={() => {
                    if (!selectedUser && !userSearchInput) {
                      setShowUserSuggestions(true)
                    } else if (!selectedUser && userSearchInput) {
                      setShowUserSuggestions(true)
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowUserSuggestions(false), 200)}
                  onChange={(e) => {
                    const value = e.target.value
                    if (!value) {
                      setUserSearchInput('')
                      if (selectedUser) {
                        setSelectedUser(null)
                        field.handleChange('')
                      }
                      setShowUserSuggestions(true)
                    } else {
                      setUserSearchInput(value)
                      setShowUserSuggestions(true)
                      if (selectedUser) {
                        setSelectedUser(null)
                        field.handleChange('')
                      }
                    }
                  }}
                  className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md pr-10"
                />
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null)
                      setUserSearchInput('')
                      field.handleChange('')
                      setShowUserSuggestions(false)
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {showUserSuggestions && userSearchInput && !selectedUser && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-default-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setSelectedUser(user)
                        setUserSearchInput('')
                        field.handleChange(user.id)
                        setShowUserSuggestions(false)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-default-50 transition-colors border-b border-default-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-default-900">{getUserDisplayName(user)}</div>
                      <div className="text-xs text-default-500">{user.employeeNumber} • {user.email}</div>
                    </button>
                  ))}
                </div>
              )}

              {field.state.meta.errors && (
                <p className="text-[10px] font-medium text-destructive mt-1">
                  {typeof field.state.meta.errors[0] === 'string'
                    ? field.state.meta.errors[0]
                    : field.state.meta.errors[0]?.message || String(field.state.meta.errors[0])}
                </p>
              )}
            </div>
          )}
        />

        {/* ... the rest of fields identical to CreatePersonnelForm ... (assignment type, position, status, start date) ... */}

        <form.Field
          name="assignmentType"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Assignment Type
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  const v = value as 'permanent' | 'oic'
                  field.handleChange(v)
                  setAssignmentType(v)
                }}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                  <SelectValue placeholder="Select assignment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="oic">OIC (Officer In Charge)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="positionId"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Position Assignment {assignmentType === 'oic' ? '(Chief Positions)' : '(Vacant Positions)'}
              </Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md">
                  <SelectValue placeholder="Select available position" />
                </SelectTrigger>
                <SelectContent>
                  {positionsToDisplay?.map((position) => (
                    <SelectItem key={position.id} value={position.id}>
                      {position.title} - {position.code} ({position.isVacant ? 'Vacant' : 'Filled'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="status"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Status
              </Label>
              <Select
                value={field.state.value}
                onValueChange={(val) => field.handleChange(val as 'active' | 'on-leave' | 'resigned')}
              >
                <SelectTrigger className="h-10 border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md capitalize">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="resigned">Resigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <form.Field
          name="startDate"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold text-default-700 uppercase tracking-wider">
                Start Date
              </Label>
              <input
                id={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full h-10 px-3 border border-default-200 focus:border-primary focus:ring-primary/20 transition-all rounded-md"
              />
            </div>
          )}
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="font-medium h-10 border-default-200 text-default-600 hover:bg-default-50"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="font-semibold h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
        >
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Personnel'
          )}
        </Button>
      </div>
    </form>
  )
}
