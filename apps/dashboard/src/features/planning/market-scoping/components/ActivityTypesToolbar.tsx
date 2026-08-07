/**
 * Activity Types Table Toolbar
 * Toolbar with search, filter, and action buttons for activity types management
 */

import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ActivityTypesToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onCreateNew: () => void
  totalCount?: number
}

export default function ActivityTypesToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateNew,
  totalCount = 0,
}: ActivityTypesToolbarProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Activity Types</h2>
          <p className="text-sm text-gray-600">
            Total: {totalCount} {totalCount === 1 ? 'activity' : 'activities'}
          </p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          New Activity Type
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by type, label, or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>
    </div>
  )
}
