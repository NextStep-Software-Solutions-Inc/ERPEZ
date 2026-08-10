/**
 * NTP List Toolbar (User/Creator View)
 * Provides search, filtering, and CREATE action button for NTP list
 * Used by NTPListPage for users who can create NTPs
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
import type { NTPStatus } from '../types/ntpTypes'

export interface NTPListToolbarProps {
  onSearch: (query: string) => void
  onStatusFilter: (status: NTPStatus | 'All') => void
  onCreateClick: () => void
  selectedStatus?: NTPStatus | 'All'
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
    <div className="flex gap-2 flex-col sm:flex-row sm:items-center justify-between mb-6">
      <div className="flex gap-2 flex-col sm:flex-row sm:items-center flex-1">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search NTP number or supplier..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={selectedStatus} onValueChange={(value) => onStatusFilter(value as NTPStatus | 'All')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="For Approval">For Approval</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Create NTP
      </Button>
    </div>
  )
}
