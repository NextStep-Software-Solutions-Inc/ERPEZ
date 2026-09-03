import { useState, useMemo } from 'react'
import {
  Search,
  Inbox,
  SlidersHorizontal,
  X,
  RotateCcw,
  ArrowUpDown,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { BacResolutionCard } from './BacResolutionCard'
import type {
  BacProject,
  BacResolutionInboxFilter,
  BacResolutionListRoutePath,
  BacResolutionRole,
  BacResolutionWorkspaceScope,
} from '../types'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getBacResolutionsRequest } from '../handlers/getBacResolutionsRequest'
import { cn } from '@/lib/utils'

const useBacResolutions = createQueryHookFromTemplate(getBacResolutionsRequest)

interface InboxPanelProps {
  inboxCards: {
    status: BacResolutionInboxFilter
    label: string
    count: number
  }[]
  selectedId: string | null
  onSelectId: (id: string) => void
  searchValue: string
  setSearchValue: (v: string) => void
  filter: BacResolutionInboxFilter
  setFilter: (v: BacResolutionInboxFilter) => void
  sourceTypeFilter?: 'all' | 'APP_ITEM' | 'CONSOLIDATED_PR'
  setSourceTypeFilter?: (v: 'all' | 'APP_ITEM' | 'CONSOLIDATED_PR') => void
  budgetTier?: 'all' | 'under-1m' | '1m-5m' | 'above-5m' | 'custom'
  setBudgetTier?: (
    v: 'all' | 'under-1m' | '1m-5m' | 'above-5m' | 'custom',
  ) => void
  customMinBudget?: number | null
  setCustomMinBudget?: (v: number | null) => void
  customMaxBudget?: number | null
  setCustomMaxBudget?: (v: number | null) => void
  sortBy?: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc'
  setSortBy?: (v: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc') => void
  resetAllFilters?: () => void
  role: BacResolutionRole
  workspaceScope: BacResolutionWorkspaceScope
  bacListRoutePath: BacResolutionListRoutePath
  onEdit?: (resolution: BacProject) => void
  onDelete?: (id: string) => void
  onViewDetails?: (id: string) => void
}

export function InboxPanel({
  inboxCards,
  selectedId,
  onSelectId,
  searchValue,
  setSearchValue,
  filter,
  setFilter,
  sourceTypeFilter = 'all',
  setSourceTypeFilter,
  budgetTier = 'all',
  setBudgetTier,
  customMinBudget,
  setCustomMinBudget,
  customMaxBudget,
  setCustomMaxBudget,
  sortBy = 'newest',
  setSortBy,
  resetAllFilters,
  role,
  workspaceScope,
  bacListRoutePath,
  onEdit,
  onDelete,
  onViewDetails,
}: InboxPanelProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // Fetch real list from API
  const { data: responseData, isPending: isLoading } = useBacResolutions({
    pathParams: {},
    queryParams: {},
  })

  const rawProjects = useMemo<BacProject[]>(() => {
    if (!responseData) return []
    if (Array.isArray(responseData)) return responseData
    if (typeof responseData === 'object' && responseData !== null) {
      const record = responseData as Record<string, unknown>
      if (Array.isArray(record.data)) return record.data as BacProject[]
      if (Array.isArray(record.items)) return record.items as BacProject[]
    }
    return []
  }, [responseData])

  // Client-side filtering & sorting
  const filteredResolutions = useMemo(() => {
    return rawProjects
      .filter((item) => {
        // Status filter
        if (filter !== 'all') {
          const itemStatus = (item.status || 'draft').toLowerCase()
          const targetFilter = filter.toLowerCase()
          if (targetFilter === 'for-approval') {
            if (itemStatus !== 'for-approval' && itemStatus !== 'submitted' && itemStatus !== 'submit') return false
          } else if (itemStatus !== targetFilter) {
            return false
          }
        }

        // Source type filter
        if (sourceTypeFilter !== 'all') {
          if (sourceTypeFilter === 'APP_ITEM' && item.sourceType !== 'APPItem') return false
          if (sourceTypeFilter === 'CONSOLIDATED_PR' && item.sourceType !== 'ConsolidatedPR') return false
        }
        // Budget tier filter
        const abc = item.abc || 0
        if (budgetTier === 'under-1m' && abc >= 1000000) return false
        if (budgetTier === '1m-5m' && (abc < 1000000 || abc > 5000000)) return false
        if (budgetTier === 'above-5m' && abc <= 5000000) return false
        if (budgetTier === 'custom') {
          if (customMinBudget !== null && customMinBudget !== undefined && abc < customMinBudget) return false
          if (customMaxBudget !== null && customMaxBudget !== undefined && abc > customMaxBudget) return false
        }
        // Search text
        if (searchValue.trim()) {
          const term = searchValue.toLowerCase()
          const titleMatch = (item.title || '').toLowerCase().includes(term)
          const numMatch = (item.resolutionNumber || '').toLowerCase().includes(term)
          const appMatch = (item.appItem?.ppmpItemName || '').toLowerCase().includes(term)
          const prMatch = (item.consolidatedPR?.description || '').toLowerCase().includes(term)
          if (!titleMatch && !numMatch && !appMatch && !prMatch) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return (b.abc || 0) - (a.abc || 0)
        if (sortBy === 'amount-asc') return (a.abc || 0) - (b.abc || 0)
        // newest/oldest (default newest)
        return 0
      })
  }, [
    rawProjects,
    filter,
    sourceTypeFilter,
    budgetTier,
    customMinBudget,
    customMaxBudget,
    searchValue,
    sortBy,
  ])

  // Count active non-default filters
  const activeFiltersCount =
    (filter !== 'all' ? 1 : 0) +
    (sourceTypeFilter !== 'all' ? 1 : 0) +
    (budgetTier !== 'all' ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0)

  const handleReset = () => {
    if (resetAllFilters) {
      resetAllFilters()
    } else {
      setFilter('all')
      setSourceTypeFilter?.('all')
      setBudgetTier?.('all')
      setCustomMinBudget?.(null)
      setCustomMaxBudget?.(null)
      setSortBy?.('newest')
      setSearchValue('')
    }
  }

  const getBudgetTierLabel = (tier: string) => {
    switch (tier) {
      case 'under-1m':
        return '< ₱1,000,000'
      case '1m-5m':
        return '₱1M – ₱5M'
      case 'above-5m':
        return '> ₱5,000,000'
      case 'custom':
        return `₱${(customMinBudget || 0).toLocaleString()} – ₱${(customMaxBudget || 0).toLocaleString()}`
      default:
        return 'All Amounts'
    }
  }

  return (
    <Card className="border border-default-200 shadow-sm h-full flex flex-col">
      <CardHeader className="space-y-2.5 pb-3">
        {/* Header Title with Total Count */}
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Inbox className="h-4 w-4 text-primary" />
            BAC-Resolutions
          </CardTitle>
          <span className="text-[11px] font-semibold text-muted-foreground bg-default-100 px-2 py-0.5 rounded-full">
            {filteredResolutions.length} of {rawProjects.length}
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search resolution #, title, PR..."
              className="pl-8 pr-7 text-xs h-8.5"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Popover Trigger */}
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={activeFiltersCount > 0 ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'h-8.5 px-2.5 gap-1.5 text-xs shrink-0',
                  activeFiltersCount > 0
                    ? 'bg-primary text-white'
                    : 'border-default-300 text-default-700 hover:bg-default-50',
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white text-primary text-[10px] font-bold px-1">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end"
              className="w-80 p-4 space-y-4 shadow-xl z-50 bg-white border border-default-200"
            >
              <div className="flex items-center justify-between border-b border-default-100 pb-2">
                <span className="font-bold text-xs text-foreground uppercase tracking-wider">
                  Filter Resolutions
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset All
                  </button>
                )}
              </div>

              {/* 1. Status Filter */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Status
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {inboxCards.map((card) => {
                    const isSelected = filter === card.status
                    return (
                      <button
                        key={card.status}
                        type="button"
                        onClick={() => setFilter(card.status)}
                        className={cn(
                          'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors text-left',
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary font-bold'
                            : 'bg-default-50 border-default-200 text-default-700 hover:bg-default-100/70',
                        )}
                      >
                        <span className="truncate">{card.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Source Type Filter */}
              {setSourceTypeFilter && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Procurement Source
                  </Label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: 'all', label: 'All Sources' },
                      { id: 'APP_ITEM', label: 'APP Item' },
                      { id: 'CONSOLIDATED_PR', label: 'Consolidated PR' },
                    ].map((src) => {
                      const isSelected = sourceTypeFilter === src.id
                      return (
                        <button
                          key={src.id}
                          type="button"
                          onClick={() =>
                            setSourceTypeFilter(
                              src.id as 'all' | 'APP_ITEM' | 'CONSOLIDATED_PR',
                            )
                          }
                          className={cn(
                            'px-2 py-1.5 rounded-lg border text-center font-medium transition-colors text-[11px]',
                            isSelected
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-default-50 border-default-200 text-default-700 hover:bg-default-100/70',
                          )}
                        >
                          {src.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 3. Budget Tier Filter */}
              {setBudgetTier && (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Budget (ABC) Range
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { id: 'all', label: 'All Amounts' },
                      { id: 'under-1m', label: '< ₱1,000,000' },
                      { id: '1m-5m', label: '₱1M – ₱5M' },
                      { id: 'above-5m', label: '> ₱5,000,000' },
                    ].map((b) => {
                      const isSelected = budgetTier === b.id
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() =>
                            setBudgetTier(
                              b.id as 'all' | 'under-1m' | '1m-5m' | 'above-5m',
                            )
                          }
                          className={cn(
                            'px-2 py-1.5 rounded-lg border text-center font-medium transition-colors text-[11px]',
                            isSelected
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-default-50 border-default-200 text-default-700 hover:bg-default-100/70',
                          )}
                        >
                          {b.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Custom Min/Max Inputs */}
                  {setCustomMinBudget && setCustomMaxBudget && (
                    <div className="pt-2 flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min ₱"
                        value={customMinBudget ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                            ? Number(e.target.value)
                            : null
                          setCustomMinBudget(val)
                          if (val !== null) setBudgetTier('custom')
                        }}
                        className="text-xs h-7 px-2"
                      />
                      <span className="text-muted-foreground text-xs">–</span>
                      <Input
                        type="number"
                        placeholder="Max ₱"
                        value={customMaxBudget ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                            ? Number(e.target.value)
                            : null
                          setCustomMaxBudget(val)
                          if (val !== null) setBudgetTier('custom')
                        }}
                        className="text-xs h-7 px-2"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 4. Sort By */}
              {setSortBy && (
                <div className="space-y-1.5 border-t border-default-100 pt-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" />
                    Sort By
                  </Label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as
                        'newest' | 'oldest' | 'amount-desc' | 'amount-asc',
                      )
                    }
                    className="w-full h-8 rounded-lg border border-default-200 bg-default-50 px-2.5 py-1 text-xs text-default-800 focus:outline-none focus:border-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="amount-desc">
                      Budget: Highest to Lowest
                    </option>
                    <option value="amount-asc">
                      Budget: Lowest to Highest
                    </option>
                  </select>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters Chips Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {filter !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary border border-primary/20">
                Status: {filter}
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className="hover:text-primary/70"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {sourceTypeFilter !== 'all' && setSourceTypeFilter && (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-200">
                Source:{' '}
                {sourceTypeFilter === 'APP_ITEM'
                  ? 'APP Item'
                  : 'Consolidated PR'}
                <button
                  type="button"
                  onClick={() => setSourceTypeFilter('all')}
                  className="hover:text-blue-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {budgetTier !== 'all' && setBudgetTier && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                Budget: {getBudgetTierLabel(budgetTier)}
                <button
                  type="button"
                  onClick={() => {
                    setBudgetTier('all')
                    setCustomMinBudget?.(null)
                    setCustomMaxBudget?.(null)
                  }}
                  className="hover:text-emerald-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] text-muted-foreground hover:text-foreground underline pl-1"
            >
              Clear all
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-2 overflow-y-auto max-h-[750px] p-3.5 ">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
            <p>Loading BAC Resolutions...</p>
          </div>
        ) : filteredResolutions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-default-200 bg-default-50/70 p-6 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-default-800">
              No resolutions found
            </p>
            <p>Try adjusting your search query or active filters.</p>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-2 text-xs h-7"
              >
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          filteredResolutions.map((resolution) => {
            const isActive = resolution.id === selectedId
            return (
              <BacResolutionCard
                key={resolution.id}
                resolution={resolution}
                isActive={isActive}
                onSelect={() => onSelectId(resolution.id)}
                role={role}
                workspaceScope={workspaceScope}
                bacListRoutePath={bacListRoutePath}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
              />
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

export default InboxPanel
