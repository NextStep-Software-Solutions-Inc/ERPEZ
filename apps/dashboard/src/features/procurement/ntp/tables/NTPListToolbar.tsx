/**
 * NTP List Toolbar
 * Provides search, filtering, and CREATE action button for NTP list
 */

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface NTPListToolbarProps {
  onSearch: (query: string) => void
  onStatusFilter: (status: string) => void
  onCreateClick: () => void
  selectedStatus?: string
  searchQuery?: string
}

export function NTPListToolbar({
  onSearch,
  onStatusFilter,
  onCreateClick,
  selectedStatus = 'All',
  searchQuery = '',
}: NTPListToolbarProps) {
  const [search, setSearch] = useState(searchQuery)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearch(value)
  }

  return (
    <div className="flex gap-2 flex-col sm:flex-row sm:items-center justify-between mb-4">
      <div className="flex gap-2 flex-col sm:flex-row sm:items-center flex-1">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search NTP, Contract, Supplier, Project..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <Select value={selectedStatus} onValueChange={(value) => onStatusFilter(value)}>
          <SelectTrigger className="w-[160px] text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All" className="text-xs">All Status</SelectItem>
            <SelectItem value="Draft" className="text-xs">Draft</SelectItem>
            <SelectItem value="Issued" className="text-xs">Issued</SelectItem>
            <SelectItem value="Received" className="text-xs">Received (Conforme)</SelectItem>
            <SelectItem value="Cancelled" className="text-xs">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreateClick} size="sm" className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white">
        <Plus className="h-4 w-4" />
        Create Notice to Proceed
      </Button>
    </div>
  )
}
