/**
 * Activity Types Table Toolbar
 * Search and status filter controls with Jotai atom state management
 * Integrated with TemplateTable pattern
 * Location: src/features/planning/market-scoping/tables/
 */

import { useAtom } from 'jotai'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search } from 'lucide-react'
import { activityTypeListFilterAtom } from '../atoms/managementStateAtoms'
import type { Table } from '@tanstack/react-table'
import type { ActivityTypeDefinition } from '../types/managementTypes'

interface ActivityTypesTableToolbarProps {
  table?: Table<ActivityTypeDefinition>
  onCreateNew?: () => void
}

export function ActivityTypesTableToolbar({
  onCreateNew,
}: ActivityTypesTableToolbarProps) {
  const [filter, setFilter] = useAtom(activityTypeListFilterAtom)

  return (
    <div className="flex flex-row space-x-2 items-center w-full">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by type, label, or description..."
          value={filter.searchTerm}
          onChange={(e) =>
            setFilter({ ...filter, searchTerm: e.target.value })
          }
          className="pl-10 max-w-sm"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filter.statusFilter}
        onValueChange={(value) =>
          setFilter({ ...filter, statusFilter: value as 'all' | 'active' | 'inactive' })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filter Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active Only</SelectItem>
          <SelectItem value="inactive">Inactive Only</SelectItem>
        </SelectContent>
      </Select>

      {/* Action Buttons - Grouped on the right */}
      <div className="ml-auto flex gap-2">
        {onCreateNew && (
          <Button
            size="sm"
            onClick={onCreateNew}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Activity Type
          </Button>
        )}
      </div>
    </div>
  )
}
