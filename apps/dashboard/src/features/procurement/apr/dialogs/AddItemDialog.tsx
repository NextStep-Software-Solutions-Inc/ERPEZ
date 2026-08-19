/**
 * Add Item Dialog (PSDBM Local Synchronization Integration)
 * 
 * Allows users to:
 * 1. Select PSDBM catalog mode (Main, Regional, LGU)
 * 2. Choose depot (filtered strictly by Regional vs LGU)
 * 3. Filter items by Search, Category, Stock Status, and Availability
 * 4. Navigate catalogue with client-side responsive pagination & page-size selector
 * 5. Synchronize depot catalog from PS-PhilGEPS
 * 6. Select items across pages and adjust quantities for APR
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
import {
  AlertCircle,
  Loader2,
  Database,
  MapPin,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/services/api'
import type { ConsolidatedAPRItem } from '@/features/procurement/apr/types'
import { PSDBMItemsGrid } from '@/features/procurement/psdbm/components'
import {
  usePSDBMItems,
  usePSDBMCategories,
  usePSDBMDepots,
} from '@/features/procurement/psdbm/hooks'
import type { PSDBMCatalogMode, PSDBMItemWithQuantity, PSDBMItem } from '@/features/procurement/psdbm/types'
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
  const [catalogMode, setCatalogMode] = useState<PSDBMCatalogMode>(PSDBMCatalogModeEnum.REGIONAL)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [selectedDepot, setSelectedDepot] = useState<string>('')

  // Pagination state
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(25)

  const [isSyncing, setIsSyncing] = useState<boolean>(false)

  // Selected items state (Map: itemCode → PSDBMItemWithQuantity)
  const [selectedItems, setSelectedItems] = useState<
    Map<string, PSDBMItemWithQuantity>
  >(new Map())

  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } =
    usePSDBMCategories({
      pathParams: { mode: catalogMode },
      enabled: open,
    } as any)

  // Fetch depots
  const { data: depotsData, isLoading: depotsLoading } = usePSDBMDepots({
    enabled: open,
  })

  // Segregate depots by Regional vs LGU
  const depots = useMemo(() => {
    const allDepots = depotsData?.data || []
    if (catalogMode === PSDBMCatalogModeEnum.REGIONAL) {
      return allDepots.filter(
        (d) =>
          d.mode?.toLowerCase() === 'regional' ||
          (!d.mode && !d.name.includes('(LGU)') && !d.region?.includes('LGU'))
      )
    }
    if (catalogMode === PSDBMCatalogModeEnum.LGU) {
      return allDepots.filter(
        (d) =>
          d.mode?.toLowerCase() === 'lgu' ||
          (!d.mode && (d.name.includes('(LGU)') || d.region?.includes('LGU')))
      )
    }
    return allDepots
  }, [depotsData, catalogMode])

  // Determine if depot is required
  const isDepotRequired = catalogMode !== PSDBMCatalogModeEnum.MAIN
  const isReadyToFetch = !isDepotRequired || Boolean(selectedDepot)

  // Fetch all items for current mode/depot (up to 1000 items)
  const itemsParams = useMemo(
    () => ({
      pathParams: { mode: catalogMode },
      queryParams: {
        depot: (catalogMode !== PSDBMCatalogModeEnum.MAIN && selectedDepot) || undefined,
        max: 1000,
      },
      enabled: open && isReadyToFetch,
    }),
    [catalogMode, selectedDepot, open, isReadyToFetch]
  )

  const { data: itemsData, isLoading: itemsLoading, error: itemsError, refetch: refetchItems } = usePSDBMItems(
    itemsParams as any
  )

  // Raw items from API response
  const rawItems: PSDBMItem[] = useMemo(() => {
    return itemsData?.data?.items || []
  }, [itemsData])

  // Compute available categories from both API categories and item categories
  const categories = useMemo(() => {
    const apiCats = categoriesData?.data || []
    const itemCats = Array.from(
      new Set(rawItems.map((i) => i.category).filter(Boolean))
    ) as string[]

    const combined = new Set<string>()
    apiCats.forEach((c) => combined.add(c.name))
    itemCats.forEach((c) => combined.add(c))

    return Array.from(combined)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ id: name, name }))
  }, [categoriesData, rawItems])

  // Instantaneous, multi-criteria filtering
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // 1. Search filter (itemCode and description)
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase()
        const matchCode = item.itemCode?.toLowerCase().includes(query)
        const matchDesc = item.description?.toLowerCase().includes(query)
        if (!matchCode && !matchDesc) return false
      }

      // 2. Category filter
      if (categoryFilter && categoryFilter !== 'All') {
        const itemCat = item.category?.trim().toLowerCase() || ''
        const selectedCat = categoryFilter.trim().toLowerCase()
        if (itemCat !== selectedCat) return false
      }

      // 3. Stock Status filter
      const stock = item.availableStock ?? 0
      const delivery = item.remainingQtyForDelivery ?? 0
      const isTextOutOfStock = item.availability?.toLowerCase().includes('out of stock')

      if (stockFilter === 'in_stock') {
        if (stock <= 0) return false
      } else if (stockFilter === 'low_stock') {
        if (stock <= 0 || stock > 50) return false
      } else if (stockFilter === 'out_of_stock') {
        if (stock > 0 && !isTextOutOfStock) return false
      } else if (stockFilter === 'has_delivery') {
        if (delivery <= 0) return false
      }

      // 4. Availability status filter
      if (availabilityFilter === 'Available') {
        if (isTextOutOfStock && stock === 0) return false
      } else if (availabilityFilter === 'Out of Stock') {
        if (!isTextOutOfStock && stock > 0) return false
      }

      return true
    })
  }, [rawItems, searchTerm, categoryFilter, stockFilter, availabilityFilter])

  // Paged items for the current page
  const totalFilteredItems = filteredItems.length
  const totalPages = Math.max(1, Math.ceil(totalFilteredItems / pageSize))

  const pagedItems = useMemo(() => {
    const start = (pageNumber - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, pageNumber, pageSize])

  const lastSyncTime = useMemo(() => {
    const timestamp = itemsData?.data?.lastSynchronizedAt
    if (!timestamp) return null
    try {
      return new Date(timestamp).toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return null
    }
  }, [itemsData])

  // Handler: Reset filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setCategoryFilter('All')
    setStockFilter('all')
    setAvailabilityFilter('all')
    setPageNumber(1)
  }, [])

  const hasActiveFilters = Boolean(
    searchTerm ||
    (categoryFilter && categoryFilter !== 'All') ||
    (stockFilter && stockFilter !== 'all') ||
    (availabilityFilter && availabilityFilter !== 'all')
  )

  // Handler: Sync Depot / Catalog
  const handleSyncDepot = useCallback(async () => {
    setIsSyncing(true)
    const target = selectedDepot || (catalogMode === PSDBMCatalogModeEnum.MAIN ? 'Main Catalog' : 'Catalog')

    const syncPromise = (async () => {
      const response = await api.post(
        '/api/psdbm/sync',
        {
          syncMode: 'Full',
          depots: selectedDepot ? [selectedDepot] : undefined,
          mode: catalogMode,
        },
        {
          timeout: 300000, // 5 minutes timeout for full depot web crawling
        }
      )
      await refetchItems()
      return response.data
    })()

    toast.promise(syncPromise, {
      loading: `Connecting to PS-PhilGEPS and synchronizing ${target} warehouse stocks...`,
      success: () => `Successfully synchronized ${target}! Stocks and items updated.`,
      error: (err: any) => `Sync failed: ${err?.response?.data?.message || err?.message || 'Please check backend logs.'}`,
    })

    try {
      await syncPromise
    } catch (err) {
      console.error('PSDBM sync error:', err)
    } finally {
      setIsSyncing(false)
    }
  }, [selectedDepot, catalogMode, refetchItems])

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

  // Handler: Select all (current page)
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const newMap = new Map<string, PSDBMItemWithQuantity>(selectedItems)
      pagedItems.forEach((item) => {
        if (!newMap.has(item.itemCode)) {
          newMap.set(item.itemCode, {
            ...item,
            quantity: 1,
            selectedOffice: '',
            selectedFundSource: '',
          })
        }
      })
      setSelectedItems(newMap)
    } else {
      const newMap = new Map<string, PSDBMItemWithQuantity>(selectedItems)
      pagedItems.forEach((item) => {
        newMap.delete(item.itemCode)
      })
      setSelectedItems(newMap)
    }
  }, [pagedItems, selectedItems])

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
    setStockFilter('all')
    setAvailabilityFilter('all')
    setSelectedDepot('')
    setPageNumber(1)
    onOpenChange(false)
  }, [selectedItems, catalogMode, selectedDepot, categoryFilter, onAddItems, onOpenChange])

  const isDepotSelectDisabled = depotsLoading || depots.length === 0
  const isLoading = isReadyToFetch && (itemsLoading || categoriesLoading || depotsLoading)
  const selectedCount = selectedItems.size
  const totalAmount = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  // Pagination bounds calculation
  const startItem = totalFilteredItems === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const endItem = Math.min(pageNumber * pageSize, totalFilteredItems)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto" size="2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span>Add Items from PSDBM Catalog</span>
              </DialogTitle>
              <DialogDescription>
                Search and select warehouse-available goods and common-use supplies from PS-PhilGEPS
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              {lastSyncTime && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border">
                  <Database className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Last Synced: {lastSyncTime}</span>
                </div>
              )}

              {isReadyToFetch && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSyncDepot}
                  disabled={isSyncing || isLoading}
                  className="h-8 gap-1.5 text-xs font-medium border-primary/30 hover:bg-primary/5"
                  title="Synchronize latest prices and warehouse stock counts from PS-PhilGEPS"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span>Syncing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 text-primary" />
                      <span>{selectedDepot ? `Sync ${selectedDepot}` : 'Sync Catalog'}</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Catalog Mode Tabs */}
          <Tabs
            value={catalogMode}
            onValueChange={(value) => {
              setCatalogMode(value as PSDBMCatalogMode)
              setSelectedDepot('')
              setPageNumber(1)
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value={PSDBMCatalogModeEnum.REGIONAL}>Regional Depot (Recommended)</TabsTrigger>
              <TabsTrigger value={PSDBMCatalogModeEnum.LGU}>LGU Depot</TabsTrigger>
              <TabsTrigger value={PSDBMCatalogModeEnum.MAIN}>Main (National Catalog)</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Depot Selector (conditional for Regional/LGU modes) */}
          {isDepotRequired && (
            <div className="space-y-1.5 bg-muted/30 p-3 rounded-lg border">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <label className="text-sm font-semibold">
                  {catalogMode === PSDBMCatalogModeEnum.REGIONAL ? 'Select Regional Warehouse / Depot' : 'Select LGU Location'}
                </label>
                <span className="text-xs text-red-500 font-medium">* Required for stock lookup</span>
              </div>
              <Select
                value={selectedDepot}
                onValueChange={(value) => {
                  setSelectedDepot(value)
                  setPageNumber(1)
                }}
              >
                <SelectTrigger disabled={isDepotSelectDisabled} className="bg-background">
                  <SelectValue placeholder="Choose a depot to load warehouse stocks..." />
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

          {/* Unified Catalogue Toolbar */}
          <div className="bg-card border rounded-lg p-3.5 space-y-3 shadow-xs">
            {/* Primary Search Row */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item code or description (e.g. 14111507-PP-M01, multicopy, marker)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPageNumber(1)
                }}
                disabled={isLoading && !isReadyToFetch}
                className="pl-9 pr-8 h-9 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setPageNumber(1)
                  }}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Filter */}
              <div className="w-48">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value)
                    setPageNumber(1)
                  }}
                  disabled={isLoading && !isReadyToFetch}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Category" />
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

              {/* Stock Filter */}
              <div className="w-44">
                <Select
                  value={stockFilter}
                  onValueChange={(value) => {
                    setStockFilter(value)
                    setPageNumber(1)
                  }}
                  disabled={isLoading && !isReadyToFetch}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stocks</SelectItem>
                    <SelectItem value="in_stock">In Stock (Stock &gt; 0)</SelectItem>
                    <SelectItem value="low_stock">Low Stock (≤ 50)</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="has_delivery">Has Pending Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability Filter */}
              <div className="w-36">
                <Select
                  value={availabilityFilter}
                  onValueChange={(value) => {
                    setAvailabilityFilter(value)
                    setPageNumber(1)
                  }}
                  disabled={isLoading && !isReadyToFetch}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Availability</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear Filters</span>
                </Button>
              )}

              {/* Count Indicator */}
              <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Filter className="h-3 w-3" />
                <span>
                  {totalFilteredItems} item{totalFilteredItems !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>

          {/* Items Grid or Depot Selection Prompt */}
          {!isReadyToFetch ? (
            <div className="border border-dashed rounded-lg p-10 text-center bg-muted/20">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <h4 className="text-sm font-medium text-foreground">Depot Selection Required</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Please select a regional or LGU warehouse above to view real-time stock on hand, delivery quantities, and localized pricing.
              </p>
            </div>
          ) : (
            <>
              {/* Unsynced depot banner */}
              {!lastSyncTime && !isLoading && rawItems.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 flex items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span>
                      Warehouse stock figures for <strong>{selectedDepot || 'this catalog'}</strong> have not been synchronized yet. Click <strong>Sync Now</strong> to fetch authoritative stock counts from PS-PhilGEPS.
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSyncDepot}
                    disabled={isSyncing}
                    className="h-7 text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 font-medium whitespace-nowrap"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Syncing...
                      </>
                    ) : (
                      'Sync Now'
                    )}
                  </Button>
                </div>
              )}

              {itemsError && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Failed to load items</p>
                      <p>Unable to retrieve PSDBM items. Please verify your connection.</p>
                    </div>
                  </div>
                </div>
              )}

              <PSDBMItemsGrid
                items={pagedItems}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onQuantityChange={handleQuantityChange}
                onSelectAll={handleSelectAll}
                isLoading={isLoading && rawItems.length === 0}
                error={itemsError ? 'Failed to load items from local database.' : null}
              />

              {/* Pagination & Results Controls Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t px-1 text-xs">
                {/* Showing Range */}
                <div className="text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{startItem}</span>–<span className="font-medium text-foreground">{endItem}</span> of{' '}
                  <span className="font-medium text-foreground">{totalFilteredItems}</span> items
                </div>

                {/* Navigation and Page Size */}
                <div className="flex items-center gap-4">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Per page:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        setPageSize(Number(value))
                        setPageNumber(1)
                      }}
                    >
                      <SelectTrigger className="h-7 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Page Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPageNumber(1)}
                      disabled={pageNumber <= 1 || isLoading}
                      title="First page"
                    >
                      <ChevronsLeft className="h-3.5 w-3.5" />
                    </Button>

                    {/* Previous Page */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                      disabled={pageNumber <= 1 || isLoading}
                      title="Previous page"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {/* Current Page Badge */}
                    <span className="px-2 py-1 font-medium text-xs bg-muted rounded border min-w-16 text-center">
                      Page {pageNumber} of {totalPages}
                    </span>

                    {/* Next Page */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                      disabled={pageNumber >= totalPages || isLoading}
                      title="Next page"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>

                    {/* Last Page */}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPageNumber(totalPages)}
                      disabled={pageNumber >= totalPages || isLoading}
                      title="Last page"
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected across pages
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Selected items will be converted to APR Consolidated line items.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">Estimated Subtotal</span>
                  <span className="text-base font-bold text-primary font-mono">
                    ₱{totalAmount.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || isLoading || isSyncing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddItems}
            disabled={selectedCount === 0 || isSubmitting || isLoading || isSyncing}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add {selectedCount > 0 ? `(${selectedCount})` : ''} Item
            {selectedCount !== 1 ? 's' : ''} to APR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
