/**
 * CatalogToolbar
 * Search input with 500ms debounce, column visibility toggle, and status filter.
 */

import { useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Table } from '@tanstack/react-table'
import {
  catalogSearchAtom,
  catalogStatusFilterAtom,
  catalogPaginationAtom,
} from '../atoms/catalogTableAtom'
import type { NonCseCatalogItem } from '../types'

interface CatalogToolbarProps {
  table: Table<NonCseCatalogItem>
  totalItems: number
}

export function CatalogToolbar({ table, totalItems }: CatalogToolbarProps) {
  const [search, setSearch] = useAtom(catalogSearchAtom)
  const [statusFilter, setStatusFilter] = useAtom(catalogStatusFilterAtom)
  const setPagination = useSetAtom(catalogPaginationAtom)

  // Local input state for debounce
  const [localSearch, setLocalSearch] = useState(search)

  // Debounce: update atom 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch)
      // Reset to first page when search changes
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 500)
    return () => clearTimeout(timer)
  }, [localSearch, setSearch, setPagination])

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as 'all' | 'active' | 'inactive')
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // Columns that can be toggled (exclude select, name which are always visible)
  const toggleableColumns = table
    .getAllColumns()
    .filter(
      (col) => col.getCanHide() && col.id !== 'select' && col.id !== 'name',
    )

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search input */}
      <div className="relative flex-1 min-w-48 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name, code, category, or tag…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Status filter */}
      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-32 h-9 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Column visibility dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Toggle columns
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {toggleableColumns.map((col) => (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={col.getIsVisible()}
              onCheckedChange={(checked) => col.toggleVisibility(checked)}
              className="text-sm capitalize"
            >
              {col.id.replace(/([A-Z])/g, ' $1').trim()}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Results count */}
      <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
        {totalItems.toLocaleString()} item{totalItems !== 1 ? 's' : ''}
        {statusFilter !== 'all' && (
          <Badge variant="soft" className="ml-2 text-xs">
            {statusFilter}
          </Badge>
        )}
      </span>
    </div>
  )
}
