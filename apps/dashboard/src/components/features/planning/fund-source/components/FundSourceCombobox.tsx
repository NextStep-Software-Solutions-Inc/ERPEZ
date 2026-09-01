import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X, Layers, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseUACSFundSource } from '@/utils/uacsFundSource'

export interface FundSourceOptionItem {
  id: string
  code?: string
  name: string
  [key: string]: any
}

interface FundSourceComboboxProps {
  options: FundSourceOptionItem[]
  value?: string | null
  onValueChange: (value: string, selectedItem?: FundSourceOptionItem | null) => void
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
}

export function FundSourceCombobox({
  options = [],
  value,
  onValueChange,
  placeholder = 'Select Fund Source',
  searchPlaceholder = 'Search by code, name, authorization (e.g. 01102, continuing)...',
  emptyMessage = 'No fund sources found.',
  disabled = false,
  isLoading = false,
  className,
  id,
  valueKey = 'id',
}: FundSourceComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedAuthFilter, setSelectedAuthFilter] = useState<string>('all')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse all options with UACS metadata
  const parsedOptions = useMemo(() => {
    return options.map((opt) => {
      const parsed = parseUACSFundSource(opt.code || '', opt.name || '')
      return {
        raw: opt,
        id: opt.id,
        code: opt.code || '',
        name: opt.name || '',
        parsed,
      }
    })
  }, [options])

  // Find currently selected option
  const selectedParsed = useMemo(() => {
    if (!value) return null
    return (
      parsedOptions.find((item) =>
        valueKey === 'id' ? item.id === value : item.code === value
      ) || null
    )
  }, [parsedOptions, value, valueKey])

  // Extract available authorization codes present in current options for filter pills
  const availableAuthCodes = useMemo(() => {
    const codes = new Set<string>()
    parsedOptions.forEach((opt) => {
      if (opt.parsed.authorizationCode) {
        codes.add(opt.parsed.authorizationCode)
      }
    })
    return Array.from(codes).sort()
  }, [parsedOptions])

  // Filter options based on search query and authorization filter
  const filteredOptions = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    return parsedOptions.filter((item) => {
      // Authorization filter match
      if (
        selectedAuthFilter !== 'all' &&
        item.parsed.authorizationCode !== selectedAuthFilter
      ) {
        return false
      }

      // If no search query, keep
      if (!query) return true

      // Match against precomputed rich search string
      return item.parsed.searchString.includes(query)
    })
  }, [parsedOptions, searchValue, selectedAuthFilter])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: (typeof parsedOptions)[0]) => {
    const selectedVal = valueKey === 'id' ? item.id : item.code
    const isDeselect = value === selectedVal
    onValueChange(isDeselect ? '' : selectedVal, isDeselect ? null : item.raw)
    setOpen(false)
    setSearchValue('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange('', null)
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
            setTimeout(() => inputRef.current?.focus(), 50)
          }
        }}
        className={cn(
          'w-full max-w-full h-auto min-h-10 py-1.5 px-3 justify-between bg-white text-left font-normal border-gray-300 hover:bg-gray-50 focus:ring-1 focus:ring-blue-500',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-100'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden pr-1">
          {isLoading ? (
            <span className="text-gray-400 text-sm">Loading fund sources...</span>
          ) : selectedParsed ? (
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedParsed.code && (
                  <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {selectedParsed.code}
                  </span>
                )}
                {selectedParsed.parsed.authorizationName && (
                  <span
                    className={cn(
                      'text-[11px] font-medium px-1.5 py-0.5 rounded border',
                      selectedParsed.parsed.badge.bg,
                      selectedParsed.parsed.badge.text,
                      selectedParsed.parsed.badge.border
                    )}
                  >
                    {selectedParsed.parsed.badge.shortLabel}
                  </span>
                )}
              </div>
              <span
                className="text-xs font-medium text-gray-800 truncate mt-0.5"
                title={selectedParsed.name}
              >
                {selectedParsed.name}
              </span>
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
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 min-w-[320px] max-w-[600px]">
          {/* Search Header */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/50 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-white border-gray-200 focus-visible:ring-blue-500"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick Authorization Filter Chips (if multiple authorization types exist) */}
            {availableAuthCodes.length > 1 && (
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5 text-[11px] no-scrollbar">
                <span className="text-gray-400 text-[10px] font-semibold uppercase shrink-0 flex items-center gap-0.5 mr-1">
                  <Filter className="h-3 w-3" /> Auth:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedAuthFilter('all')}
                  className={cn(
                    'px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors border',
                    selectedAuthFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  All ({parsedOptions.length})
                </button>
                {availableAuthCodes.map((code) => {
                  const badge = parseUACSFundSource(`011${code}000`).badge
                  const count = parsedOptions.filter(
                    (p) => p.parsed.authorizationCode === code
                  ).length

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() =>
                        setSelectedAuthFilter(
                          selectedAuthFilter === code ? 'all' : code
                        )
                      }
                      className={cn(
                        'px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors border',
                        selectedAuthFilter === code
                          ? 'bg-blue-600 text-white border-blue-600'
                          : cn(badge.bg, badge.text, badge.border, 'hover:brightness-95')
                      )}
                    >
                      {badge.shortLabel} ({count})
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-600">{emptyMessage}</p>
                {searchValue && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    No fund sources match "{searchValue}"
                  </p>
                )}
              </div>
            ) : (
              filteredOptions.map((item) => {
                const isSelected =
                  valueKey === 'id'
                    ? value === item.id
                    : value === item.code

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      'w-full text-left p-2.5 rounded-md hover:bg-blue-50/70 transition-colors flex items-start justify-between gap-3 group',
                      isSelected && 'bg-blue-50/90 ring-1 ring-blue-200'
                    )}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Top row: Code & Authorization Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.code && (
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 group-hover:bg-white transition-colors">
                            {item.code}
                          </span>
                        )}
                        {item.parsed.authorizationName && (
                          <span
                            className={cn(
                              'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border',
                              item.parsed.badge.bg,
                              item.parsed.badge.text,
                              item.parsed.badge.border
                            )}
                          >
                            {item.parsed.badge.label}
                          </span>
                        )}
                      </div>

                      {/* Middle row: Fund Source Name */}
                      <div className="text-xs font-semibold text-gray-900 group-hover:text-blue-900 leading-snug">
                        {item.name}
                      </div>

                      {/* Bottom row: Cluster & Financing Source Details */}
                      {(item.parsed.clusterName || item.parsed.financingName) && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <span>{item.parsed.clusterName || 'Standard Cluster'}</span>
                          {item.parsed.financingName && (
                            <>
                              <span>•</span>
                              <span>{item.parsed.financingName}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="shrink-0 pt-0.5">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white shadow-sm">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer showing count */}
          <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>
              Showing {filteredOptions.length} of {parsedOptions.length} sources
            </span>
            <span className="text-[10px] text-gray-400">UACS Philippine Standard</span>
          </div>
        </div>
      )}
    </div>
  )
}
