import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X, CornerDownRight, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ExpenditureItemOption } from '../utils/expenditureHierarchyHelpers'

export interface ExpenditureItemComboboxProps {
  items: ExpenditureItemOption[]
  value?: string | null
  onValueChange: (
    value: string,
    selectedItem?: ExpenditureItemOption | null
  ) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  isLoading?: boolean
  className?: string
  id?: string
  hasError?: boolean
}

export function ExpenditureItemCombobox({
  items = [],
  value,
  onValueChange,
  placeholder = 'Select item of expenditure',
  searchPlaceholder = 'Search by code or name (e.g. 50604050, ICT, Equipment)...',
  emptyMessage = 'No expenditure items found.',
  disabled = false,
  isLoading = false,
  className,
  id,
  hasError = false,
}: ExpenditureItemComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Find currently selected item
  const selectedItem = useMemo(() => {
    if (!value) return null
    return items.find((item) => item.id === value) || null
  }, [items, value])

  // Filter items based on multi-token search
  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return items

    const tokens = query.split(/\s+/).filter(Boolean)

    return items.filter((item) => {
      // Build a searchable string of code, clean code, name, and parent details
      const cleanCode = (item.code || '').replace(/[\s-]+/g, '').toLowerCase()
      const rawCode = (item.code || '').toLowerCase()
      const name = (item.name || '').toLowerCase()
      const parentName = (item.parentName || '').toLowerCase()
      const parentCode = (item.parentCode || '').toLowerCase()

      const fullHaystack = `${rawCode} ${cleanCode} ${name} ${parentCode} ${parentName}`

      return tokens.every((token) => fullHaystack.includes(token))
    })
  }, [items, searchValue])

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
        setSearchValue('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item: ExpenditureItemOption) => {
    if (!item.isSelectable && !item.isLeaf) return // Ignore click on category group headers
    const isDeselect = value === item.id
    onValueChange(isDeselect ? '' : item.id, isDeselect ? null : item)
    setOpen(false)
    setSearchValue('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange('', null)
  }

  const isSearching = Boolean(searchValue.trim())

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full max-w-full min-w-0', className)}
    >
      {/* Combobox Trigger Button */}
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
          hasError && 'ring-1 ring-red-500 border-red-500 focus:ring-red-500',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-100'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden pr-1">
          {isLoading ? (
            <span className="text-gray-400 text-sm">Loading items...</span>
          ) : selectedItem ? (
            <div className="flex flex-col min-w-0 text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedItem.code && (
                  <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {selectedItem.code}
                  </span>
                )}
                {selectedItem.depth >= 2 ? (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Sub-Object Specification
                  </span>
                ) : selectedItem.depth === 1 ? (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Object Code
                  </span>
                ) : null}
              </div>
              <span
                className="text-xs font-medium text-gray-800 truncate mt-0.5"
                title={selectedItem.name}
              >
                {selectedItem.name}
              </span>
              {selectedItem.parentName && (
                <span className="text-[10px] text-gray-400 truncate">
                  under {selectedItem.parentCode ? `[${selectedItem.parentCode}] ` : ''}
                  {selectedItem.parentName}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedItem && !disabled && (
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
        <div className="absolute z-[9999] left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100 min-w-[340px]">
          {/* Search Header */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8 pr-8 h-8 text-xs bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue('')
                    inputRef.current?.focus()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-gray-500 space-y-1">
                <Layers className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                <p className="font-medium">{emptyMessage}</p>
                {isSearching && (
                  <p className="text-[11px] text-gray-400">
                    Try searching by code numbers or another keyword
                  </p>
                )}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = value === item.id
                const isGroupHeader = item.depth === 0 && !item.isSelectable

                if (isGroupHeader && !isSearching) {
                  return (
                    <div
                      key={item.id}
                      className="px-2.5 py-1.5 bg-slate-50/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-100 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="truncate">{item.name}</span>
                      {item.code && (
                        <span className="text-[10px] text-slate-400 font-normal ml-auto">
                          {item.code}
                        </span>
                      )}
                    </div>
                  )
                }

                // Indentation for tree view when browsing
                const indentPx = isSearching ? 8 : item.depth * 16 + 8

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    style={{ paddingLeft: `${indentPx}px` }}
                    className={cn(
                      'w-full text-left p-2 rounded-md hover:bg-blue-50/70 transition-colors flex items-start justify-between gap-2 group',
                      isSelected && 'bg-blue-50/90 ring-1 ring-blue-200'
                    )}
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!isSearching && item.depth > 0 && (
                          <CornerDownRight className="h-3 w-3 text-slate-400 shrink-0 mr-0.5" />
                        )}
                        {item.code && (
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200 group-hover:bg-white transition-colors">
                            {item.code}
                          </span>
                        )}
                        {item.depth >= 2 ? (
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Sub-Object
                          </span>
                        ) : item.hasChildren ? (
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            General Code
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs font-medium text-gray-900 group-hover:text-blue-900 leading-snug">
                        {item.name}
                      </div>

                      {item.parentName && (
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <span className="text-slate-400">Under:</span>
                          <span className="font-medium text-slate-600 truncate">
                            {item.parentCode ? `[${item.parentCode}] ` : ''}
                            {item.parentName}
                          </span>
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="shrink-0 pt-0.5">
                        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white shadow-xs">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
