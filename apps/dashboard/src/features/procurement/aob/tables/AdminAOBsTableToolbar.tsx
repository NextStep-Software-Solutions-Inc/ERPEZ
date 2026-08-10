/**
 * Admin AOBs Table Toolbar Component
 * Provides search and filtering controls for AOB admin management table
 */

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AOBStatus } from '../types'

export const AOB_STATUSES: Record<AOBStatus, string> = {
  Draft: 'Draft',
  'For Approval': 'For Approval',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Cancelled: 'Cancelled',
}

interface AdminAOBsTableToolbarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  status: string
  onStatusChange: (status: string) => void
}

export function AdminAOBsTableToolbar({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
}: AdminAOBsTableToolbarProps) {
  return (
    <div className="flex gap-4 items-center flex-col sm:flex-row mb-4">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search AOB number, RFQ..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="Draft">Draft</SelectItem>
          <SelectItem value="For Approval">For Approval</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Rejected">Rejected</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
