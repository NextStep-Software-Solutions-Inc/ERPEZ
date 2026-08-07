import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'

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
import { fetchUsers, getUserDisplayName, type User } from '@/services/api/users'
import { useAllPositions, useVacantPositions } from '@/pages/planning/organization/hooks/useOrgUnits'
import { useCreatePerson } from '@/pages/planning/organization/hooks/useOrgUnits'
import type { PositionDropdownItem } from '../types'
import { Loader2 } from 'lucide-react'

export const assignPersonnelSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  assignmentType: z.enum(['permanent', 'oic']),
  positionId: z.string().optional(),
  startDate: z.string().optional(),
  status: z.enum(['active', 'on-leave', 'resigned']),
})

export type AssignPersonnelFormValues = z.infer<typeof assignPersonnelSchema>

interface CreatePersonnelFormProps {
  onCreated: () => void
  onClose: () => void
  availablePositions?: PositionDropdownItem[]
  selectedPositionId?: string
  isDirtyCallback?: (isDirty: boolean) => void
}

export function CreatePersonnelForm({ onCreated, onClose, availablePositions, selectedPositionId, isDirtyCallback }: CreatePersonnelFormProps) {
  const createMutation = useCreatePerson()
  const [userSearchInput, setUserSearchInput] = useState('')
  const [showUserSuggestions, setShowUserSuggestions] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [assignmentType, setAssignmentType] = useState<'permanent' | 'oic'>('permanent')
  
  // Fetch all users from API
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  })

  // Fetch positions depending on assignment type
  const { data: allPositions = [] } = useAllPositions()
  const { data: vacantPositions = [] } = useVacantPositions()

  // compute list based on assignment type or externally-provided list
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

  // Filter users based on search input (only show when not selecting)
  const filteredUsers = useMemo(() => {
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
      positionId: selectedPositionId || '',
      startDate: '',
      status: 'active' as const,
    } as AssignPersonnelFormValues,
    validators: {
      onChange: assignPersonnelSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const userObj = selectedUser || users.find(u => u.id === value.userId)
        if (!userObj) {
          console.error('User not found; userId=', value.userId)
          return
        }

        // POST to backend personnel-positions endpoint
        // backend expects AssignmentType = "Permanent" or "OIC" (capitalized)
        const apiAssignmentType =
          value.assignmentType === 'oic' ? 'OIC' : 'Permanent'

        await createMutation.mutateAsync({
          userId: userObj.id,
          positionId: value.positionId || null,
          assignmentType: apiAssignmentType,
          isActive: true,
          startDate: value.startDate ? new Date(value.startDate).toISOString() : undefined,
          endDate: null,
        })

        onCreated()
      } catch (error) {
        console.error('Failed to assign personnel:', error)
      }
    },
  })

  // Notify parent when form dirty state changes
  useEffect(() => {
    isDirtyCallback?.(form.state.isDirty)
  }, [form.state.isDirty, isDirtyCallback])

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
        {/* User Selection with Suggestions */}
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
                    // If user clears the field, reset selection
                    if (!value) {
                      setUserSearchInput('')
                      if (selectedUser) {
                        setSelectedUser(null)
                        field.handleChange('')
                      }
                      setShowUserSuggestions(true)
                    } else {
                      // User is typing - show suggestions and clear previous selection
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
              
              {/* User Suggestions */}
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

        {/* Assignment Type */}
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

        {/* Position Assignment */}
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

        {/* Employment Status */}
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

        {/* Start Date */}
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
          disabled={createMutation.isPending}
          className="font-semibold h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : (
            'Assign Personnel'
          )}
        </Button>
      </div>
    </form>
  )
}
