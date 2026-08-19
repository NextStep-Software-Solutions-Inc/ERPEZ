/**
 * Add Item Dialog (PSDBM Local Synchronization Integration)
 * 
 * Allows users to:
 * 1. Select PSDBM catalog mode (Main, Regional, LGU)
 * 2. Choose depot (for Regional/LGU modes) with stock verification
 * 3. Trigger manual or automatic synchronization with PS-PhilGEPS
 * 4. Inspect real-time stock on hand and remaining deliveries
 * 5. Select items and adjust quantities for APR
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
import { AlertCircle, Loader2, Database, MapPin, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/services/api'
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
  const [catalogMode, setCatalogMode] = useState<PSDBMCatalogMode>(PSDBMCatalogModeEnum.REGIONAL)

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [selectedDepot, setSelectedDepot] = useState<string>('')
  const [maxResults, setMaxResults] = useState<number>(50)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)

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

  // Determine if depot is required
  const isDepotRequired = catalogMode !== PSDBMCatalogModeEnum.MAIN
  const isReadyToFetch = !isDepotRequired || Boolean(selectedDepot)

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
      enabled: open && isReadyToFetch,
    }),
    [catalogMode, searchTerm, categoryFilter, selectedDepot, maxResults, open, isReadyToFetch]
  )

  const { data: itemsData, isLoading: itemsLoading, error: itemsError, refetch: refetchItems } = usePSDBMItems(
    itemsParams as any
  )

  // Get items from API response
  const items = useMemo(() => {
    return itemsData?.data?.items || []
  }, [itemsData])

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

  const isDepotSelectDisabled = depotsLoading || depots.length === 0
  const isLoading = isReadyToFetch && (itemsLoading || categoriesLoading || depotsLoading)
  const selectedCount = selectedItems.size
  const totalAmount = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" size="2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span>Add Items from PSDBM Catalog</span>
              </DialogTitle>
              <DialogDescription>
                Select warehouse-available goods and common-use supplies from PS-PhilGEPS
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
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value={PSDBMCatalogModeEnum.REGIONAL}>Regional Depot (Recommended)</TabsTrigger>
              <TabsTrigger value={PSDBMCatalogModeEnum.LGU}>LGU Depot</TabsTrigger>
              <TabsTrigger value={PSDBMCatalogModeEnum.MAIN}>Main (National Catalog)</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 gap-4">
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
                <Select value={selectedDepot} onValueChange={setSelectedDepot}>
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

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Filter */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Search Supplies</label>
                <Input
                  placeholder="Item code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
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
              <div className="space-y-1.5">
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
                    <SelectItem value="200">200 items</SelectItem>
                    <SelectItem value="500">500 items</SelectItem>
                  </SelectContent>
                </Select>
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
              {!lastSyncTime && !isLoading && items.length > 0 && (
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
                items={items}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onQuantityChange={handleQuantityChange}
                onSelectAll={handleSelectAll}
                isLoading={isLoading || (isSyncing && items.length === 0)}
                error={itemsError ? 'Failed to load items from local database.' : null}
              />
            </>
          )}

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
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
