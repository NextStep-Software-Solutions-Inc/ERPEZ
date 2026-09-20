import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X, Layers, Filter, CornerDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ObjectCodeOptionItem,
  ParsedUACSObjectCode,
  ExpenseClassCode,
  UACS_EXPENSE_CLASSES,
  parseUACSObjectCode,
  calculateObjectCodeRelevanceScore,
  groupParsedObjectCodes,
} from '@/utils/uacsObjectCode'

export interface ObjectCodeComboboxProps {
  options: ObjectCodeOptionItem[]
  value?: string | null
  onValueChange: (
    value: string,
    selectedItem?: ObjectCodeOptionItem | null
  ) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  id?: string
  /**
   * Optional helper to match value by id (default) or by code
   */
  valueKey?: 'id' | 'code'
  /**
   * Pass true to render error state styling (red ring/border)
   */
  hasError?: boolean
}

export function ObjectCodeCombobox({
  options = [],
  value,
  onValueChange,
  placeholder = 'Select Object Code',
  searchPlaceholder = 'Search by code, name, class (e.g. 50203, supplies)...',
  emptyMessage = 'No object codes found.',
  disabled = false,
  isLoading = false,
  className,
  id,
  valueKey = 'id',
  hasError = false,
}: ObjectCodeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Map options by ID for parent lookup
  const optionsMapById = useMemo(() => {
    const map = new Map<string, ObjectCodeOptionItem>()
    for (const opt of options) {
      if (opt.id) {
        map.set(opt.id, opt)
      }
    }
    return map
  }, [options])

  // Parse all options with UACS metadata and hierarchy
  const parsedOptions = useMemo<ParsedUACSObjectCode[]>(() => {
    return options.map((opt) => parseUACSObjectCode(opt, optionsMapById))
  }, [options, optionsMapById])

  // Find currently selected option
  const selectedParsed = useMemo(() => {
    if (!value) return null
    return (
      parsedOptions.find((item) =>
        valueKey === 'id' ? item.id === value : item.code === value
      ) || null
    )
  }, [parsedOptions, value, valueKey])

  // Extract available expense classes present in current options for filter pills
  const availableClasses = useMemo(() => {
    const set = new Set<ExpenseClassCode>()
    for (const opt of parsedOptions) {
      set.add(opt.expenseClass)
    }

    const priorityOrder: ExpenseClassCode[] = ['PS', 'MOOE', 'CO', 'FE', 'OTHER']
    return priorityOrder.filter((code) => set.has(code))
  }, [parsedOptions])

  // Multi-token search match across options (independent of class filter)
  const searchMatchedOptions = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return parsedOptions

    const tokens = query.split(/\s+/).filter(Boolean)
    return parsedOptions.filter((item) =>
      tokens.every((token) => item.searchString.includes(token))
    )
  }, [parsedOptions, searchValue])

  // Compute dynamic counts per expense class category based on search results
  const classCounts = useMemo(() => {
    const counts: Record<string, number> = { all: searchMatchedOptions.length }
    for (const opt of searchMatchedOptions) {
      const cls = opt.expenseClass
      counts[cls] = (counts[cls] || 0) + 1
    }
    return counts
  }, [searchMatchedOptions])

  // Filter options based on class filter
  const filteredOptions = useMemo(() => {
    let list = searchMatchedOptions
    if (selectedClassFilter !== 'all') {
      list = list.filter((item) => item.expenseClass === selectedClassFilter)
    }
    return list
  }, [searchMatchedOptions, selectedClassFilter])

  // When searching, sort filtered options by relevance score
  const sortedSearchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return []

    const tokens = query.split(/\s+/).filter(Boolean)

    return [...filteredOptions].sort((a, b) => {
      const scoreA = calculateObjectCodeRelevanceScore(a, query, tokens)
      const scoreB = calculateObjectCodeRelevanceScore(b, query, tokens)

      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }

      // Shorter code first
      if (a.code.length !== b.code.length) {
        return a.code.length - b.code.length
      }

      return a.code.localeCompare(b.code)
    })
  }, [filteredOptions, searchValue])

  // When browsing (no search query), group filtered options by Expense Class and Parent-Child hierarchy
  const hierarchicalGroups = useMemo(() => {
    if (searchValue.trim().length > 0) return []
    return groupParsedObjectCodes(filteredOptions)
  }, [filteredOptions, searchValue])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setSelectedClassFilter('all')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: ParsedUACSObjectCode) => {
    const selectedVal = valueKey === 'id' ? item.id : item.code
    const isDeselect = value === selectedVal
    onValueChange(isDeselect ? '' : selectedVal, isDeselect ? null : item.raw)
    setOpen(false)
    setSearchValue('')
    setSelectedClassFilter('all')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange('', null)
  }

  // Active filter label for banner
  const activeClassInfo =
    selectedClassFilter !== 'all'
      ? UACS_EXPENSE_CLASSES[selectedClassFilter as ExpenseClassCode] ||
        UACS_EXPENSE_CLASSES.OTHER
      : null

  // Helper renderer for a single option item
  const renderOptionItem = (
    item: ParsedUACSObjectCode,
    isIndented = false
  ) => {
    const isSelected =
      valueKey === 'id' ? value === item.id : value === item.code

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item)}
        className={cn(
          'w-full text-left p-2.5 rounded-md hover:bg-blue-50/70 transition-colors flex items-start justify-between gap-2.5 group',
          isIndented && 'pl-3.5 bg-slate-50/50 hover:bg-blue-50/70',
          isSelected && 'bg-blue-50/90 ring-1 ring-blue-200'
        )}
      >
        <div className="flex-1 min-w-0 space-y-1">
          {/* Top row: Code + Expense Class Badge + Sub-object / Parent Indicator */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {isIndented && (
              <CornerDownRight className="h-3 w-3 text-slate-400 shrink-0 mr-0.5" />
            )}
            {item.code && (
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 group-hover:bg-white transition-colors">
                {item.code}
              </span>
            )}
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border',
                item.expenseClassInfo.bg,
                item.expenseClassInfo.text,
                item.expenseClassInfo.border
              )}
            >
              {item.expenseClassInfo.shortLabel}
            </span>

            {item.isChild ? (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Sub-Account
              </span>
            ) : item.isParent ? (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                General Account ({item.childCount})
              </span>
            ) : null}
          </div>

          {/* Middle row: Object Name */}
          <div className="text-xs font-semibold text-gray-900 group-hover:text-blue-900 leading-snug">
            {item.name}
          </div>

          {/* Bottom row: Parent Context or Description */}
          {item.isChild && (item.parentName || item.parentCode) && (
            <div className="text-[11px] text-gray-500 flex items-center gap-1">
              <span className="text-slate-400">Parent:</span>
              <span className="font-medium text-slate-600 truncate">
                {item.parentCode ? `[${item.parentCode}] ` : ''}
                {item.parentName}
              </span>
            </div>
          )}
        </div>

        {/* Selected Checkmark */}
        {isSelected && (
          <div className="shrink-0 pt-0.5">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white shadow-xs">
              <Check className="h-3 w-3 stroke-[3]" />
            </span>
          </div>
        )}
      </button>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full max-w-full min-w-0', className)}
    >
      {/* Trigger Button */}
      <Button
        id={id}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled || isLoading}
        onClick={() => {
          if (disabled || isLoading) return
          const nextState = !open
          setOpen(nextState)
          if (nextState) {
            setSelectedClassFilter('all')
            setTimeout(() => inputRef.current?.focus(), 50)
          }
        }}
        className={cn(
          'w-full max-w-full h-auto min-h-10 py-1.5 px-3 justify-between bg-white text-left font-normal border-gray-300 hover:bg-gray-50 focus:ring-1 focus:ring-blue-500',
          hasError && 'ring-1 ring-red-500 border-red-500 focus:ring-red-500',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-100'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden pr-1">
          {isLoading ? (
            <span className="text-gray-400 text-sm">Loading object codes...</span>
          ) : selectedParsed ? (
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedParsed.code && (
                  <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {selectedParsed.code}
                  </span>
                )}
                <span
                  className={cn(
                    'text-[11px] font-medium px-1.5 py-0.5 rounded border',
                    selectedParsed.expenseClassInfo.bg,
                    selectedParsed.expenseClassInfo.text,
                    selectedParsed.expenseClassInfo.border
                  )}
                >
                  {selectedParsed.expenseClassInfo.shortLabel}
                </span>
                {selectedParsed.isChild && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Sub-Account
                  </span>
                )}
              </div>
              <span
                className="text-xs font-medium text-gray-800 truncate mt-0.5"
                title={selectedParsed.name}
              >
                {selectedParsed.name}
              </span>
              {selectedParsed.isChild && selectedParsed.parentName && (
                <span className="text-[10px] text-gray-400 truncate">
                  under {selectedParsed.parentCode ? `[${selectedParsed.parentCode}] ` : ''}
                  {selectedParsed.parentName}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedParsed && !disabled && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClear(e as any)
                }
              }}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </div>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-50 transition-transform duration-150',
              open && 'transform rotate-180'
            )}
          />
        </div>
      </Button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 min-w-[340px] max-w-[650px]">
          {/* Search Header */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/50 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => {
                  const val = e.target.value
                  setSearchValue(val)
                  if (val.trim() && selectedClassFilter !== 'all') {
                    setSelectedClassFilter('all')
                  }
                }}
                className="pl-9 pr-8 h-9 text-xs bg-white border-gray-200 focus-visible:ring-blue-500"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('')
                    setSelectedClassFilter('all')
                    inputRef.current?.focus()
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Expense Class Filter Chips */}
            {availableClasses.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 text-[11px] no-scrollbar">
                <span className="text-gray-400 text-[10px] font-semibold uppercase shrink-0 flex items-center gap-0.5 mr-1">
                  <Filter className="h-3 w-3" /> Class:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedClassFilter('all')}
                  className={cn(
                    'px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors border text-[11px]',
                    selectedClassFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  All ({classCounts['all'] || 0})
                </button>
                {availableClasses.map((code) => {
                  const info = UACS_EXPENSE_CLASSES[code]
                  const count = classCounts[code] || 0
                  const isSelected = selectedClassFilter === code

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        setSelectedClassFilter(isSelected ? 'all' : code)
                      }
                      className={cn(
                        'px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors border text-[11px]',
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : count === 0
                          ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-60'
                          : cn(info.bg, info.text, info.border, 'hover:brightness-95')
                      )}
                    >
                      {info.shortLabel} ({count})
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Category Filter Banner */}
          {selectedClassFilter !== 'all' && activeClassInfo && (
            <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50/90 border-b border-blue-100 text-[11px] text-blue-800">
              <span className="flex items-center gap-1.5 truncate">
                <Filter className="h-3 w-3 shrink-0 text-blue-600" />
                <span>
                  Filtered by: <strong>{activeClassInfo.name} ({activeClassInfo.shortLabel})</strong> ({filteredOptions.length} of {searchMatchedOptions.length})
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedClassFilter('all')}
                className="shrink-0 font-medium text-blue-700 hover:text-blue-950 underline ml-2 cursor-pointer"
              >
                Show all
              </button>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-600">{emptyMessage}</p>
                {searchValue && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    No object codes match "{searchValue}"
                    {selectedClassFilter !== 'all' && activeClassInfo
                      ? ` under ${activeClassInfo.shortLabel}`
                      : ''}
                  </p>
                )}
                {selectedClassFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedClassFilter('all')}
                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 underline inline-block cursor-pointer"
                  >
                    Search across all expense classes ({searchMatchedOptions.length} results)
                  </button>
                )}
              </div>
            ) : searchValue.trim().length > 0 ? (
              /* Search results sorted by relevance */
              <div className="space-y-0.5">
                {sortedSearchResults.map((item) => renderOptionItem(item, false))}
              </div>
            ) : (
              /* Browsing mode grouped by Expense Class and Parent-Child hierarchy */
              <div className="space-y-3 p-1">
                {hierarchicalGroups.map((group) => (
                  <div key={group.expenseClass} className="space-y-1">
                    {/* Expense Class Header */}
                    {selectedClassFilter === 'all' && (
                      <div className="flex items-center justify-between px-2 py-1 bg-slate-100/80 rounded text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={cn('w-2 h-2 rounded-full', group.info.dot)}
                          />
                          {group.info.name} ({group.info.shortLabel})
                        </span>
                        <span className="text-[10px] text-slate-500 lowercase font-normal">
                          {group.totalCount} items
                        </span>
                      </div>
                    )}

                    {/* Parent-Child Groups */}
                    {group.groups.map((itemGroup) => (
                      <div
                        key={itemGroup.parent.id}
                        className="rounded-md border border-slate-100 bg-white p-1 space-y-1"
                      >
                        {/* Parent Object Item */}
                        {renderOptionItem(itemGroup.parent, false)}

                        {/* Child Sub-Objects indented under parent */}
                        <div className="ml-3 pl-2.5 border-l-2 border-slate-200 space-y-1 my-1">
                          {itemGroup.children.map((child) =>
                            renderOptionItem(child, true)
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Standalone items */}
                    {group.standalone.map((item) => renderOptionItem(item, false))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer showing count */}
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>
              Showing {filteredOptions.length} of {parsedOptions.length} object codes
            </span>
            <span className="text-[10px] text-gray-400">UACS Philippine Standard</span>
          </div>
        </div>
      )}
    </div>
  )
}
