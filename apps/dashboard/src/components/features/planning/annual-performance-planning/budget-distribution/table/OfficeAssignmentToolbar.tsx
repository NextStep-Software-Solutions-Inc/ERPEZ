/**
 * Office Assignment Toolbar
 * Search and filter controls for office assignment table
 */

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface OfficeAssignmentToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedStatus: 'all' | 'pending' | 'submitted' | 'approved'
  onStatusChange: (value: 'all' | 'pending' | 'submitted' | 'approved') => void
  editedFilter: 'all' | 'edited' | 'unchanged'
  onEditedFilterChange: (value: 'all' | 'edited' | 'unchanged') => void
}

export function OfficeAssignmentToolbar({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  editedFilter,
  onEditedFilterChange,
}: OfficeAssignmentToolbarProps) {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      {/* Search */}
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by KPI code or name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) =>
          onStatusChange(e.target.value as 'all' | 'pending' | 'submitted' | 'approved')
        }
        className="w-40 h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="submitted">Submitted</option>
        <option value="approved">Approved</option>
      </select>

      {/* Edited Filter */}
      <select
        value={editedFilter}
        onChange={(e) =>
          onEditedFilterChange(e.target.value as 'all' | 'edited' | 'unchanged')
        }
        className="w-40 h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
      >
        <option value="all">All Changes</option>
        <option value="edited">Edited Only</option>
        <option value="unchanged">Unchanged</option>
      </select>
    </div>
  )
}
