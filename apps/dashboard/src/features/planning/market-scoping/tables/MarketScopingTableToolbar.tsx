/**
 * Market Scoping Table Toolbar
 * Search and status filter controls with Jotai atom state management
 * Matches APP Consolidation pattern with centralized filter atom
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
import { Plus, List, LayoutGrid, BookOpen } from 'lucide-react'
import {
  marketScopingListFilterAtom,
  createMarketScopingDialogOpenAtom,
  marketScopingViewTypeAtom,
  marketScopingGuideOpenAtom,
} from '../atoms/marketScopingStateAtom'
import { MARKET_SCOPING_STATUSES } from '../utils/constants'
import type { Table } from '@tanstack/react-table'
import type { MarketScopingForm } from '../types/marketScopingTypes'

interface MarketScopingTableToolbarProps {
  table?: Table<MarketScopingForm>
  showColumnVisibility?: boolean
}

export function MarketScopingTableToolbar({}: MarketScopingTableToolbarProps) {
  const [filter, setFilter] = useAtom(marketScopingListFilterAtom)
  const [, setCreateDialogOpen] = useAtom(createMarketScopingDialogOpenAtom)
  const [viewType, setViewType] = useAtom(marketScopingViewTypeAtom)
  const [, setGuideOpen] = useAtom(marketScopingGuideOpenAtom)

  const handleCreateNew = () => {
    setCreateDialogOpen(true)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full p-1">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
        {/* Search Input */}
        <Input
          placeholder="Search market scoping forms..."
          value={filter.searchTerm}
          onChange={(e) =>
            setFilter({ ...filter, searchTerm: e.target.value })
          }
          className="w-full sm:w-64 max-w-sm font-medium"
        />

        {/* Status Filter */}
        <Select
          value={filter.statusFilter}
          onValueChange={(value) =>
            setFilter({ ...filter, statusFilter: value })
          }
        >
          <SelectTrigger className="w-full sm:w-44 font-semibold text-slate-700">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(MARKET_SCOPING_STATUSES).map(([key, status]) => (
              <SelectItem key={key} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons - Grouped on the right */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Help Guide Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGuideOpen(true)}
          className="text-indigo-600 border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 gap-1.5 font-bold h-9"
        >
          <BookOpen className="h-4 w-4 text-indigo-500" />
          Guide & Help
        </Button>

        {/* Segmented Grid / List View Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewType('list')}
            className={`h-8 w-8 rounded-md transition-all ${
              viewType === 'list'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-indigo-650'
                : 'text-slate-450 hover:text-slate-700'
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewType('grid')}
            className={`h-8 w-8 rounded-md transition-all ${
              viewType === 'grid'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-indigo-650'
                : 'text-slate-450 hover:text-slate-700'
            }`}
            title="Card View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleCreateNew}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold shadow-xs h-9"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Create Market Scoping
        </Button>
      </div>
    </div>
  )
}
