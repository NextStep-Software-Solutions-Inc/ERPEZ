/**
 * Add Item Dialog (Refactored for PSDBM Integration)
 * 
 * Allows users to:
 * 1. Select PSDBM catalog mode (Main, Regional, LGU)
 * 2. Choose depot (for Regional/LGU modes)
 * 3. Search and filter items
 * 4. Select items and adjust quantities
 * 5. Add selected items to APR
 * 
 * Falls back to mock data when backend API not available
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { ConsolidatedAPRItem } from '@/features/procurement/apr/types'
import { PSDBMItemsGrid } from '@/features/procurement/psdbm/components'
import {
  usePSDBMItems,
  usePSDBMCategories,
  usePSDBMDepots,
} from '@/features/procurement/psdbm/hooks'
import type { PSDBMCatalogMode, PSDBMItemWithQuantity } from '@/features/procurement/psdbm/types'
import { convertPSDBMItemToAPR } from '@/features/procurement/psdbm/utils/convertToAPRItem'
import { PSDBMCatalogMode as PSDBMCatalogModeEnum } from '@/features/procurement/psdbm/types'

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingItemIds?: string[]
  onAddItems: (items: ConsolidatedAPRItem[]) => void
  isSubmitting?: boolean
}

export function AddItemDialog({
  open,
  onOpenChange,
  existingItemIds: _existingItemIds,
  onAddItems,
  isSubmitting = false,
}: AddItemDialogProps) {
  // Catalog mode state
  const [catalogMode, setCatalogMode] = useState<PSDBMCatalogMode>(PSDBMCatalogModeEnum.MAIN)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [selectedDepot, setSelectedDepot] = useState<string>('')
  const [maxResults, setMaxResults] = useState<number>(50)

  // Selected items state (Map: itemCode → PSDBMItemWithQuantity)
  const [selectedItems, setSelectedItems] = useState<
    Map<string, PSDBMItemWithQuantity>
  >(new Map())

  // Fetch categories for current mode
  const { data: categoriesData, isLoading: categoriesLoading } =
    usePSDBMCategories({
      pathParams: { mode: catalogMode },
      enabled: open,
    } as any)
  const categories = useMemo(() => {
    return categoriesData?.data || []
  }, [categoriesData])

  // Fetch depots
  const { data: depotsData, isLoading: depotsLoading } = usePSDBMDepots({
    enabled: open,
  })
  const depots = useMemo(() => {
    return depotsData?.data || []
  }, [depotsData])

  // Fetch items for current mode/search/category
  const itemsParams = useMemo(
    () => ({
      pathParams: { mode: catalogMode },
      queryParams: {
        search: searchTerm || undefined,
        category:
          categoryFilter && categoryFilter !== 'All' ? categoryFilter : undefined,
        depot:
          (catalogMode !== PSDBMCatalogModeEnum.MAIN && selectedDepot) || undefined,
        max: maxResults || undefined,
      },
      enabled: open,
    }),
    [catalogMode, searchTerm, categoryFilter, selectedDepot, maxResults, open]
  )

  const { data: itemsData, isLoading: itemsLoading, error: itemsError } = usePSDBMItems(
    itemsParams as any
  )

  // Get items from API response
  const items = useMemo(() => {
    return itemsData?.data?.items || []
  }, [itemsData])

  // Handler: Item selection toggle
  const handleItemSelect = useCallback((item: any, selected: boolean) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev)
      if (selected) {
        newMap.set(item.itemCode, {
          ...item,
          quantity: 1,
          selectedOffice: '',
          selectedFundSource: '',
        })
      } else {
        newMap.delete(item.itemCode)
      }
      return newMap
    })
  }, [])

  // Handler: Quantity change
  const handleQuantityChange = useCallback(
    (itemCode: string, quantity: number) => {
      setSelectedItems((prev) => {
        const newMap = new Map(prev)
        const item = newMap.get(itemCode)
        if (item) {
          newMap.set(itemCode, { ...item, quantity })
        }
        return newMap
      })
    },
    []
  )

  // Handler: Select all
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const newMap = new Map<string, PSDBMItemWithQuantity>()
      items.forEach((item) => {
        newMap.set(item.itemCode, {
          ...item,
          quantity: 1,
          selectedOffice: '',
          selectedFundSource: '',
        })
      })
      setSelectedItems(newMap)
    } else {
      setSelectedItems(new Map())
    }
  }, [items])

  // Handler: Add items
  const handleAddItems = useCallback(() => {
    const itemsToAdd: ConsolidatedAPRItem[] = Array.from(selectedItems.values()).map(
      (psdbmItem) =>
        convertPSDBMItemToAPR(psdbmItem, {
          quantity: psdbmItem.quantity,
          office: psdbmItem.selectedOffice || 'General',
          fundSource: psdbmItem.selectedFundSource || 'General Fund',
          mode: catalogMode,
          depot: selectedDepot,
          sourceCategory: categoryFilter,
        })
    )

    onAddItems(itemsToAdd)

    // Reset state
    setSelectedItems(new Map())
    setSearchTerm('')
    setCategoryFilter('All')
    setSelectedDepot('')
    setMaxResults(50)
    onOpenChange(false)
  }, [selectedItems, catalogMode, selectedDepot, categoryFilter, onAddItems, onOpenChange])

  // Determine if depot is required
  const isDepotRequired = catalogMode !== PSDBMCatalogModeEnum.MAIN
  const isDepotSelectDisabled = depotsLoading || depots.length === 0

  const isLoading = itemsLoading || categoriesLoading || depotsLoading
  const selectedCount = selectedItems.size
  const totalAmount = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" size="2xl">
        <DialogHeader>
          <DialogTitle>Add Items from PSDBM Catalog</DialogTitle>
          <DialogDescription>
            Search and select items from PS-PhilGEPS commodity database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Catalog Mode Tabs */}
          <Tabs
            value={catalogMode}
            onValueChange={(value) => {
              setCatalogMode(value as PSDBMCatalogMode)
              setSelectedDepot('')
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value={PSDBMCatalogModeEnum.MAIN}>Main Catalog</TabsTrigger>
              <TabsTrigger value={PSDBMCatalogModeEnum.REGIONAL}>Regional (Depot)</TabsTrigger>
              <TabsTrigger value={PSDBMCatalogModeEnum.LGU}>LGU</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Depot Selector (conditional for Regional/LGU modes) */}
            {isDepotRequired && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {catalogMode === PSDBMCatalogModeEnum.REGIONAL ? 'Select Regional Depot' : 'Select LGU'}
                </label>
                <Select value={selectedDepot} onValueChange={setSelectedDepot}>
                  <SelectTrigger disabled={isDepotSelectDisabled}>
                    <SelectValue placeholder="Choose a depot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {depots.map((depot) => (
                      <SelectItem key={depot.id} value={depot.name}>
                        {depot.name}
                        {depot.region && ` (${depot.region})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Items</label>
                <Input
                  placeholder="Item code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Results Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Results Per Page</label>
                <Select
                  value={String(maxResults)}
                  onValueChange={(value) => setMaxResults(Number(value))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                    <SelectItem value="500">500 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          {itemsError && (
            <div className="border rounded-lg p-4 bg-red-50">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Failed to load items</p>
                  <p>Unable to fetch from PSDBM catalog. Check your backend connection.</p>
                </div>
              </div>
            </div>
          )}

          <PSDBMItemsGrid
            items={items}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelect}
            onQuantityChange={handleQuantityChange}
            onSelectAll={handleSelectAll}
            isLoading={isLoading}
            error={itemsError ? 'Failed to load items from API. Using mock data.' : null}
          />

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                  </p>
                  <p className="text-sm text-blue-700">
                    Total: ₱
                    {totalAmount.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddItems}
            disabled={selectedCount === 0 || isSubmitting || isLoading}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add {selectedCount > 0 ? `(${selectedCount})` : ''} Item
            {selectedCount !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
