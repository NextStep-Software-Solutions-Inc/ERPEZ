/**
 * components/table/toolbar.tsx
 * Toolbar component with filters and search for PPMP list
 */

import { useMemo } from 'react'
import { Search, PlusCircle, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { Table as TableType } from '@tanstack/react-table'
import type { PPMP, PPMPState } from '../../types'
import { PPMPState as PPMPStateEnum } from '../../types'

const STATUS_FILTER_OPTIONS: { value: PPMPState | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: PPMPStateEnum.DRAFT, label: 'Draft' },
  { value: PPMPStateEnum.REJECTED, label: 'Rejected' },
  { value: PPMPStateEnum.PENDING_REVIEW, label: 'Pending Review' },
  { value: PPMPStateEnum.APPROVED, label: 'Approved' },
  { value: PPMPStateEnum.AMENDING, label: 'Amending' },
  { value: PPMPStateEnum.SUPERSEDED, label: 'Superseded' },
  { value: PPMPStateEnum.CONSOLIDATED, label: 'Consolidated' },
]

export interface ToolbarState {
  search: string
  statusFilter: PPMPState | 'all'
  fyFilter: string | 'all'
  officeFilter: string
  libFilter: string
}

export interface ToolbarCallbacks {
  onSearchChange: (value: string) => void
  onStatusChange: (value: PPMPState | 'all') => void
  onFyChange: (value: string | 'all') => void
  onOfficeChange: (value: string) => void
  onLibChange: (value: string) => void
  onCreateClick?: () => void
  onCreateMasterClick?: () => void
}

interface ToolbarProps {
  rows: PPMP[]
  state: ToolbarState
  callbacks: ToolbarCallbacks
  table?: TableType<PPMP>
}

export function PpmpTableToolbar({ rows, state, callbacks, table }: ToolbarProps) {
  const data = rows

  const fiscalYearOptions = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((p) => {
      if (p.fiscalYear) {
        map.set(p.fiscalYearId, p.fiscalYear.year)
      } else if (p.fiscalYearId) {
        const yearNum = Number(p.fiscalYearId)
        if (!isNaN(yearNum)) {
          map.set(p.fiscalYearId, yearNum)
        }
      }
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [data])

  const libOptions = useMemo(
    () => Array.from(new Set(data.map((p) => p.libName).filter((l): l is string => Boolean(l)))).sort(),
    [data],
  )

  const officeOptions = useMemo(() => {
    const map = new Map<string, string>()
    data.forEach((p) => {
      if (p.officeId && p.officeName) {
        map.set(p.officeId, p.officeName)
      } else if (p.officeId) {
        map.set(p.officeId, p.officeId)
      }
    })
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [data])

  console.log("PpmpTableToolbar render - columnVisibility from table:", table?.getState().columnVisibility, "columns visibility states:", table?.getAllColumns().map(c => ({ id: c.id, visible: c.getIsVisible() })))

  return (
    <div className="flex items-center gap-3 justify-between flex-wrap">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, number, FY, office, or LIB…"
            value={state.search}
            onChange={(e) => callbacks.onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={state.statusFilter}
          onValueChange={(v) =>
            callbacks.onStatusChange(v as PPMPState | 'all')
          }
        >
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fiscal Year Filter */}
        <Select
          value={state.fyFilter}
          onValueChange={(v) =>
            callbacks.onFyChange(v)
          }
        >
          <SelectTrigger className="w-32 bg-white">
            <SelectValue placeholder="FY" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All FY</SelectItem>
            {fiscalYearOptions.map(([id, year]) => (
              <SelectItem key={id} value={id}>
                FY {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Office Filter */}
        <Select
          value={state.officeFilter}
          onValueChange={callbacks.onOfficeChange}
        >
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="Office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {officeOptions.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* LIB Filter */}
        <Select value={state.libFilter} onValueChange={callbacks.onLibChange}>
          <SelectTrigger className="w-52 bg-white">
            <SelectValue placeholder="LIB" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All LIBs</SelectItem>
            {libOptions.map((libName) => (
              <SelectItem key={libName} value={libName}>
                {libName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {table && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 bg-white"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] bg-white border border-border shadow-md rounded-md p-1">
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-border/50" />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const headerText = typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : column.id === 'documentName' ? 'PPMP Name'
                    : column.id === 'ppmpNumber' ? 'PPMP No.'
                    : column.id === 'fiscalYear' ? 'FY'
                    : column.id === 'totalEstimatedBudget' ? 'Budget'
                    : column.id === 'state' ? 'Status'
                    : column.id === 'createdAt' ? 'Created'
                    : column.id
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {headerText}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {callbacks.onCreateClick && (
          <Button size="sm" onClick={callbacks.onCreateClick} className="gap-1.5">
            <PlusCircle className="h-3.5 w-3.5" />
            New PPMP
          </Button>
        )}
        {callbacks.onCreateMasterClick && (
          <Button
            size="sm"
            variant="outline"
            onClick={callbacks.onCreateMasterClick}
            className="gap-1.5"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Master PPMP
          </Button>
        )}
      </div>
    </div>
  )
}