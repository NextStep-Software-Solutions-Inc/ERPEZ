import { useState, useMemo } from 'react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getProcurementItemsRequest, type ProcurementItem } from '../handlers/getProcurementItemsRequest'
import { ProcurementItemFilters } from '../components/ProcurementItemFilters'
import { ProcurementItemsTable } from '../components/ProcurementItemsTable'
import { ProcurementItemsPagination } from '../components/ProcurementItemsPagination'

const useProcurementItems = createQueryHookFromTemplate(getProcurementItemsRequest)

interface SelectProcurementItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectItems: (items: ProcurementItem[]) => void
  excludeItemNames?: string[]
}

export function SelectProcurementItemDialog({
  open,
  onOpenChange,
  onSelectItems,
  excludeItemNames = [],
}: SelectProcurementItemDialogProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('__all')
  const [cseFilter, setCseFilter] = useState('__all')
  const [pageNumber, setPageNumber] = useState(1)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  
  const pageSize = 10

  const { data: itemsResponse, isLoading } = useProcurementItems({
    pathParams: {},
    queryParams: {
      pageNumber: 1,
      pageSize: 100,
    },
  })

  const allItems = itemsResponse?.data || []

  // Get unique types from items
  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(allItems.map((item) => item.type))).filter(Boolean).sort()
  }, [allItems])

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    const excludeSet = new Set(excludeItemNames)
    return allItems.filter((item) => {
      // Skip already selected items
      if (excludeSet.has(item.name)) {
        return false
      }

      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.specifications?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.objectCodeName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = typeFilter === '__all' || !typeFilter || item.type === typeFilter
      const matchesCSE =
        cseFilter === '__all' || !cseFilter ? true : cseFilter === 'cse' ? item.isCSE : !item.isCSE
      const isActive = item.isActive

      return matchesSearch && matchesType && matchesCSE && isActive
    })
  }, [allItems, searchTerm, typeFilter, cseFilter, excludeItemNames])

  // Paginate filtered items
  const totalPages = Math.ceil(filteredItems.length / pageSize)
  const paginatedItems = filteredItems.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  )

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedItems.map((item) => item.id))
      setSelectedItems(allIds)
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleConfirm = () => {
    const itemsToAdd = allItems.filter((item) => selectedItems.has(item.id))
    onSelectItems(itemsToAdd)
    handleReset()
  }

  const handleReset = () => {
    onOpenChange(false)
    setSearchTerm('')
    setTypeFilter('__all')
    setCseFilter('__all')
    setPageNumber(1)
    setSelectedItems(new Set())
  }

  const allChecked = paginatedItems.length > 0 && paginatedItems.every((item) => selectedItems.has(item.id))
  const indeterminate = paginatedItems.some((item) => selectedItems.has(item.id)) && !allChecked

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] flex flex-col" size="lg">
        <DialogHeader>
          <DialogTitle>Select Procurement Items</DialogTitle>
        </DialogHeader>

        {/* Search and Filters */}
        <ProcurementItemFilters
          searchTerm={searchTerm}
          onSearchChange={(term) => {
            setSearchTerm(term)
            setPageNumber(1)
          }}
          typeFilter={typeFilter}
          onTypeFilterChange={(filter) => {
            setTypeFilter(filter)
            setPageNumber(1)
          }}
          cseFilter={cseFilter}
          onCseFilterChange={(filter) => {
            setCseFilter(filter)
            setPageNumber(1)
          }}
          uniqueTypes={uniqueTypes}
          onClearFilters={() => {
            setSearchTerm('')
            setTypeFilter('__all')
            setCseFilter('__all')
            setPageNumber(1)
          }}
        />

        {/* Items Table */}
        <div className="flex-1 border-t overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Loading items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              {allItems.length === 0
                ? 'No procurement items available'
                : 'No items match your search'}
            </div>
          ) : (
            <>
              <ProcurementItemsTable
                items={paginatedItems}
                isLoading={isLoading}
                selectedItems={selectedItems}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                allChecked={allChecked}
                indeterminate={indeterminate}
                hasItems={filteredItems.length > 0}
              />
              <ProcurementItemsPagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={setPageNumber}
                selectedCount={selectedItems.size}
                totalFilteredCount={filteredItems.length}
                pageSize={pageSize}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="border-t px-6 py-3">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedItems.size === 0}
          >
            Add ({selectedItems.size}) Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
