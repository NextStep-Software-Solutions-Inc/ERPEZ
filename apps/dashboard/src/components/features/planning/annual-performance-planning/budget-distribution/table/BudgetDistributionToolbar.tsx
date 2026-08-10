/**
 * Budget Distribution Toolbar
 * Search and filter controls for budget allocation table
 */

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { MOCK_OFFICES } from '../mocks'

interface BudgetDistributionToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedOffice: string | 'all'
  onOfficeChange: (value: string | 'all') => void
  selectedStatus: 'all' | 'pending' | 'allocated' | 'approved'
  onStatusChange: (value: 'all' | 'pending' | 'allocated' | 'approved') => void
}

export function BudgetDistributionToolbar({
  searchTerm,
  onSearchChange,
  selectedOffice,
  onOfficeChange,
  selectedStatus,
  onStatusChange,
}: BudgetDistributionToolbarProps) {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      {/* Search */}
      <div className="flex-1 min-w-64">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by KPI name, code, or office..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Office Filter */}
      <select
        value={String(selectedOffice)}
        onChange={(e) => {
          const value = e.target.value
          onOfficeChange(value === 'all' ? 'all' : value)
        }}
        className="w-40 h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
      >
        <option value="all">All Offices</option>
        {MOCK_OFFICES.map((office) => (
          <option key={office.id} value={office.id}>
            {office.name}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) =>
          onStatusChange(e.target.value as 'all' | 'pending' | 'allocated' | 'approved')
        }
        className="w-40 h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
      >
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="allocated">Allocated</option>
        <option value="approved">Approved</option>
      </select>
    </div>
  )
}
