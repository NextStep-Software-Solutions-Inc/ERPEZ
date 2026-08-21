/**
 * CatalogPickerModal
 * Enhanced PPMP catalog browser with CSE / Non-CSE tabs, side filters,
 * card selection, pagination, and a sticky add-to-workspace tray.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  LucidePackage,
  LucidePackageOpen,
  MapPin,
  Package,
  RefreshCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { CatalogItem, CatalogType } from '../types'
import { formatCurrency, getSuggestedMoP } from '../lib/ppmpUtils'
import { useNonCSEItems } from '../catalog/hooks/useNonCSEItemQueries'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'
import { usePSDBMItems, usePSDBMDepots } from '@/features/procurement/psdbm/hooks'
import { PSDBMCatalogMode } from '@/features/procurement/psdbm/types'
import type { PSDBMItem } from '@/features/procurement/psdbm/types'
import {
  catalogPickerModalOpenAtom,
  catalogPickerTabAtom,
  catalogPickerSearchAtom,
  selectedCatalogItemsAtom,
  targetIoEBlockIdAtom,
} from '../atoms'
import { addItemsToPpmpRequest } from '../handlers'

interface CatalogPickerModalProps {
  ppmpId: string
  onItemsAdded?: () => void
}

type CatalogTab = 'cse' | 'non-cse'
type PriceMode = 'ps-dbm' | 'agency'
type PriceBand = 'all' | 'under-5k' | '5k-25k' | '25k-plus'

interface CatalogCardItem extends CatalogItem {
  thumbnailLabel: string
  psDbmPrice: number
  agencyPrice: number
  specification?: string | null
  supplier?: string | null
}

type CatalogSourceItem = CatalogItem | NONCSEItem

interface TabFilters {
  categories: string[]
  unitOfMeasures: string[]
  priceBand: PriceBand
  pageIndex: number
}

const PAGE_SIZE = 8
const DEFAULT_FILTERS: TabFilters = {
  categories: [],
  unitOfMeasures: [],
  priceBand: 'all',
  pageIndex: 0,
}

function cloneFilters(): TabFilters {
  return { ...DEFAULT_FILTERS }
}

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'IT'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

function hash(value: string): number {
  let n = 0
  for (let i = 0; i < value.length; i += 1) {
    n = (n << 5) - n + value.charCodeAt(i)
    n |= 0
  }
  return Math.abs(n)
}

function tone(value: string): string {
  const tones = [
    'from-sky-500/20 via-cyan-500/15 to-teal-500/20',
    'from-violet-500/20 via-fuchsia-500/15 to-pink-500/20',
    'from-amber-500/20 via-orange-500/15 to-rose-500/20',
    'from-emerald-500/20 via-lime-500/15 to-green-500/20',
    'from-indigo-500/20 via-blue-500/15 to-sky-500/20',
    'from-rose-500/20 via-pink-500/15 to-fuchsia-500/20',
  ]
  return tones[hash(value) % tones.length] ?? tones[0]!
}

function mapPsdbmItemToCatalogItem(item: PSDBMItem): CatalogItem {
  const baseItem: CatalogItem = {
    id: item.itemCode,
    itemCode: item.itemCode,
    name: item.description,
    category: item.category || 'Uncategorized',
    unitPrice: item.unitPrice,
    unitOfMeasure: item.unit,
    catalogType: 'cse',
    defaultMoP: 'NP-53.5',
  }
  return {
    ...baseItem,
    defaultMoP: getSuggestedMoP(baseItem, item.unitPrice),
  }
}

function normalizeCatalogItem(
  item: CatalogSourceItem,
  catalogType: CatalogType,
): CatalogItem {
  if ('catalogType' in item && item.catalogType) return item as CatalogItem

  const raw = item as Record<string, unknown>
  const unitPrice =
    typeof raw.currentPrice === 'number'
      ? raw.currentPrice
      : typeof raw.unitPrice === 'number'
        ? raw.unitPrice
        : 0

  const itemName =
    typeof raw.name === 'string' && raw.name
      ? raw.name
      : typeof raw.description === 'string' && raw.description
        ? raw.description
        : 'Unnamed Item'

  const category =
    typeof raw.category === 'string' && raw.category
      ? raw.category
      : typeof raw.procurementCategoryName === 'string' &&
          raw.procurementCategoryName
        ? raw.procurementCategoryName
        : typeof raw.remarks === 'string' && raw.remarks
          ? raw.remarks
          : 'General Goods'

  const unitOfMeasure =
    typeof raw.unitOfMeasure === 'string' && raw.unitOfMeasure
      ? raw.unitOfMeasure
      : typeof raw.uomName === 'string' && raw.uomName
        ? raw.uomName
        : 'unit'

  const itemCode =
    typeof raw.itemCode === 'string' && raw.itemCode
      ? raw.itemCode
      : typeof raw.productCode === 'string' && raw.productCode
        ? raw.productCode
        : typeof raw.uacsCode === 'string' && raw.uacsCode
          ? raw.uacsCode
          : String(raw.id || '')

  const subtype =
    typeof raw.subtype === 'string'
      ? raw.subtype
      : typeof raw.itemType === 'string'
        ? raw.itemType
        : typeof raw.procurementCategoryName === 'string'
          ? raw.procurementCategoryName
          : undefined

  const baseItem: CatalogItem = {
    id: String(raw.id || itemCode),
    name: itemName,
    category,
    unitPrice,
    unitOfMeasure,
    catalogType,
    defaultMoP: catalogType === 'cse' ? 'NP-53.5' : 'NP-53.9',
    itemCode,
    subtype,
  }

  return {
    ...baseItem,
    defaultMoP: getSuggestedMoP(baseItem, unitPrice),
  }
}

function buildCards(
  items: CatalogSourceItem[],
  catalogType: CatalogType,
): CatalogCardItem[] {
  return items.map((item, index) => {
    const normalized = normalizeCatalogItem(item, catalogType)
    const base = normalized.unitPrice
    const raw = item as Record<string, unknown>
    const specification =
      typeof raw.specification === 'string' ? raw.specification : null
    const supplier = typeof raw.supplier === 'string' ? raw.supplier : null
    const psDbmPrice =
      catalogType === 'cse' ? base : Math.round(base * 0.97 * 100) / 100
    const agencyPrice =
      catalogType === 'cse' ? Math.round(base * 1.06 * 100) / 100 : base
    return {
      ...normalized,
      catalogType,
      thumbnailLabel: initials(normalized.name || normalized.itemCode),
      psDbmPrice,
      agencyPrice,
      specification,
      supplier,
      itemCode: normalized.itemCode || `${catalogType}-${index}`,
    }
  })
}

function priceOf(item: CatalogCardItem, mode: PriceMode): number {
  return mode === 'ps-dbm' ? item.psDbmPrice : item.agencyPrice
}

function bandMatches(price: number, band: PriceBand): boolean {
  if (band === 'all') return true
  if (band === 'under-5k') return price < 5_000
  if (band === '5k-25k') return price >= 5_000 && price <= 25_000
  return price > 25_000
}

function inSearch(item: CatalogCardItem, query: string): boolean {
  if (!query) return true
  return [
    item.name,
    item.category,
    item.itemCode,
    item.unitOfMeasure,
    item.supplier ?? '',
    item.specification ?? '',
    item.subtype ?? '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(query)
}

function toggle(values: string[], next: string): string[] {
  return values.includes(next)
    ? values.filter((value) => value !== next)
    : [...values, next]
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
      <Package className="h-10 w-10 text-muted-foreground/40" />
      <p className="mt-3 text-sm font-medium text-foreground">No items found</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
    </div>
  )
}

export function CatalogPickerModal({
  ppmpId,
  onItemsAdded,
}: CatalogPickerModalProps) {
  const [open, setOpen] = useAtom(catalogPickerModalOpenAtom)
  const [activeTab, setActiveTab] = useAtom(catalogPickerTabAtom)
  const [search, setSearch] = useAtom(catalogPickerSearchAtom)
  const [selected, setSelected] = useAtom(selectedCatalogItemsAtom)
  const targetIoEBlockId = useAtomValue(targetIoEBlockIdAtom)
  const clearTarget = useSetAtom(targetIoEBlockIdAtom)

  // Live Non-CSE Query from backend /non-cse-items
  const { data: nonCseResponse, isLoading: isNonCseLoading } = useNonCSEItems()
  const rawNonCseItems = useMemo(() => {
    return nonCseResponse?.data || []
  }, [nonCseResponse])

  // Live CSE Query from PS-DBM
  const [cseMode, setCseMode] = useState<PSDBMCatalogMode>(
    PSDBMCatalogMode.REGIONAL,
  )
  const [selectedDepot, setSelectedDepot] = useState<string>('')

  const { data: depotsData, isLoading: isDepotsLoading } = usePSDBMDepots({
    enabled: open && activeTab === 'cse',
  })

  const depots = useMemo(() => {
    const allDepots = depotsData?.data || []
    if (cseMode === PSDBMCatalogMode.REGIONAL) {
      return allDepots.filter(
        (d) =>
          d.mode?.toLowerCase() === 'regional' ||
          (!d.mode && !d.name.includes('(LGU)') && !d.region?.includes('LGU')),
      )
    }
    if (cseMode === PSDBMCatalogMode.LGU) {
      return allDepots.filter(
        (d) =>
          d.mode?.toLowerCase() === 'lgu' ||
          (!d.mode && (d.name.includes('(LGU)') || d.region?.includes('LGU'))),
      )
    }
    return allDepots
  }, [depotsData, cseMode])

  const isDepotRequired = cseMode !== PSDBMCatalogMode.MAIN
  const isReadyToFetchCse = !isDepotRequired || Boolean(selectedDepot)

  const { data: psdbmItemsData, isLoading: isPsdbmLoading } = usePSDBMItems({
    pathParams: { mode: cseMode },
    queryParams: {
      depot: (cseMode !== PSDBMCatalogMode.MAIN && selectedDepot) || undefined,
      max: 1000,
    },
    enabled: open && activeTab === 'cse' && isReadyToFetchCse,
  })

  const cseCatalogItems = useMemo<CatalogItem[]>(() => {
    const items = psdbmItemsData?.data?.items || []
    return items.map(mapPsdbmItemToCatalogItem)
  }, [psdbmItemsData])

  const [priceMode, setPriceMode] = useState<PriceMode>('ps-dbm')
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [filtersByTab, setFiltersByTab] = useState<
    Record<CatalogTab, TabFilters>
  >({
    cse: cloneFilters(),
    'non-cse': cloneFilters(),
  })

  const catalogs = useMemo(
    () => ({
      cse: buildCards(cseCatalogItems, 'cse'),
      'non-cse': buildCards(rawNonCseItems, 'non-cse'),
    }),
    [cseCatalogItems, rawNonCseItems],
  )

  const selectedIds = useMemo(
    () => new Set(selected.map((item) => item.id)),
    [selected],
  )
  const currentItems = catalogs[activeTab]
  const currentFilters = filtersByTab[activeTab]
  const normalizedSearch = search.trim().toLowerCase()

  const filterOptions = useMemo(() => {
    return {
      categories: Array.from(
        new Set(currentItems.map((item) => item.category)),
      ).sort(),
      units: Array.from(
        new Set(currentItems.map((item) => item.unitOfMeasure)),
      ).sort(),
    }
  }, [currentItems])

  const filteredItems = useMemo(() => {
    return currentItems.filter((item) => {
      if (!inSearch(item, normalizedSearch)) return false
      if (
        currentFilters.categories.length &&
        !currentFilters.categories.includes(item.category)
      )
        return false
      if (
        currentFilters.unitOfMeasures.length &&
        !currentFilters.unitOfMeasures.includes(item.unitOfMeasure)
      )
        return false
      if (!bandMatches(priceOf(item, priceMode), currentFilters.priceBand))
        return false
      return true
    })
  }, [currentFilters, currentItems, normalizedSearch, priceMode])

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const safePageIndex = Math.min(currentFilters.pageIndex, pageCount - 1)
  const pageItems = filteredItems.slice(
    safePageIndex * PAGE_SIZE,
    safePageIndex * PAGE_SIZE + PAGE_SIZE,
  )

  const selectedCount = selected.length
  const updateCurrentFilters = useCallback(
    (patch: Partial<TabFilters>, resetPage = false) => {
      setFiltersByTab((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          ...patch,
          pageIndex: resetPage
            ? 0
            : (patch.pageIndex ?? prev[activeTab].pageIndex),
        },
      }))
    },
    [activeTab, setFiltersByTab],
  )

  const resetCurrentFilters = useCallback(() => {
    setSearch('')
    setFiltersByTab((prev) => ({ ...prev, [activeTab]: cloneFilters() }))
  }, [activeTab, setFiltersByTab, setSearch])

  const toggleFiltersCollapsed = useCallback(() => {
    setIsFiltersCollapsed((prev) => !prev)
  }, [])

  const toggleSelected = useCallback(
    (item: CatalogCardItem) => {
      setSelected((prev) =>
        prev.some((picked) => picked.id === item.id)
          ? prev.filter((picked) => picked.id !== item.id)
          : [...prev, item],
      )
    },
    [setSelected],
  )

  const handleClose = useCallback(() => {
    setSelected([])
    setSearch('')
    setPriceMode('ps-dbm')
    setIsFiltersCollapsed(false)
    setFiltersByTab({ cse: cloneFilters(), 'non-cse': cloneFilters() })
    setActiveTab('cse')
    setSelectedDepot('')
    setOpen(false)
    clearTarget(null)
  }, [
    clearTarget,
    setActiveTab,
    setFiltersByTab,
    setOpen,
    setPriceMode,
    setIsFiltersCollapsed,
    setSearch,
    setSelected,
  ])

  const handleConfirm = useCallback(async () => {
    if (selectedCount === 0) {
      toast.warning('Please select at least one item.')
      return
    }
    if (!targetIoEBlockId) {
      toast.error('No Item of Expenditure block targeted. Please try again.')
      return
    }
    setIsAdding(true)
    try {
      await addItemsToPpmpRequest.fetcher({
        data: {
          ppmpId,
          ioEBlockId: targetIoEBlockId,
          catalogItemIds: selected.map((item) => item.id),
          items: selected,
        },
      })
      toast.success(
        `${selectedCount} item(s) added to the selected Item of Expenditure block.`,
      )
      onItemsAdded?.()
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add items.')
    } finally {
      setIsAdding(false)
    }
  }, [
    handleClose,
    onItemsAdded,
    ppmpId,
    selected,
    selectedCount,
    targetIoEBlockId,
  ])

  useEffect(() => {
    setPriceMode(activeTab === 'cse' ? 'ps-dbm' : 'agency')
  }, [activeTab, setPriceMode])
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
      title="Add Items to Workspace"
      description="Browse CSE / PS-DBM and Non-CSE / Agency catalog items, filter quickly, and add selected items into the active Item of Expenditure block."
      size="5xl"
      showCloseButton
      footer={
        <div className="sticky bottom-0 border-t border-border bg-background/95 px-1 pt-4 backdrop-blur">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge
                variant="soft"
                color={selectedCount > 0 ? 'default' : 'secondary'}
              >
                {selectedCount} selected
              </Badge>
              <span>
                {selectedCount > 0
                  ? 'Ready to add to the current Item of Expenditure block.'
                  : 'Select one or more items to continue.'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelected([])}
                disabled={selectedCount === 0 || isAdding}
              >
                Clear selection
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={selectedCount === 0 || isAdding || !targetIoEBlockId}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {isAdding ? 'Adding…' : 'Add to Workspace'}
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pr-1">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as CatalogTab)}
        >
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Catalog selection
              </div>
              <p className="text-xs text-muted-foreground">
                Choose between CSE and Non-CSE catalogs, then refine using the
                side panel.
              </p>
            </div>
            <TabsList
              variant="bordered"
              className="p-2 justify-start gap-1 overflow-x-auto group-data-[orientation=horizontal]/tabs:h-fit "
            >
              <TabsTrigger
                value="cse"
                className="gap-2 flex items-center px-2.5 sm:px-3 p-1"
              >
                <LucidePackage className="h-4 w-4" />
                CSE / PS-DBM
              </TabsTrigger>
              <TabsTrigger
                value="non-cse"
                className="gap-2 flex items-center px-2.5 sm:px-3 p-1"
              >
                <LucidePackageOpen className="h-4 w-4" />
                Non-CSE / Agency
              </TabsTrigger>
            </TabsList>
          </div>

          {(['cse', 'non-cse'] as const).map((tab) => {
            const tabFilters = filtersByTab[tab]
            const tabItems = catalogs[tab]
            const tabFiltered = tab === activeTab ? filteredItems : tabItems
            const tabPageCount =
              tab === activeTab
                ? pageCount
                : Math.max(1, Math.ceil(tabFiltered.length / PAGE_SIZE))
            const tabPageIndex =
              tab === activeTab ? safePageIndex : tabFilters.pageIndex
            const tabPageItems =
              tab === activeTab
                ? pageItems
                : tabFiltered.slice(
                    tabPageIndex * PAGE_SIZE,
                    tabPageIndex * PAGE_SIZE + PAGE_SIZE,
                  )

            return (
              <TabsContent key={tab} value={tab} className="mt-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
                  <aside
                    className={cn(
                      'lg:sticky lg:top-0 lg:self-start transition-all duration-200',
                      isFiltersCollapsed ? 'lg:w-16' : 'lg:w-[300px]',
                    )}
                  >
                    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                      <div
                        className={cn(
                          'flex items-center gap-2 border-b border-border bg-muted/20',
                          isFiltersCollapsed
                            ? 'flex-col justify-center px-2 py-3'
                            : 'justify-between px-4 py-3',
                        )}
                      >
                        {isFiltersCollapsed ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={toggleFiltersCollapsed}
                              className="h-9 w-9 p-0"
                              title="Expand filters"
                              aria-label="Expand filters"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={resetCurrentFilters}
                              className="h-9 w-9 p-0"
                              title="Reset filters"
                              aria-label="Reset filters"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Search className="h-4 w-4 text-primary" />
                                <span>Search & filters</span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {tabFilters.categories.length} categories,{' '}
                                {tabFilters.unitOfMeasures.length} units,{' '}
                                {tabFilters.priceBand === 'all'
                                  ? 'any price'
                                  : tabFilters.priceBand}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetCurrentFilters}
                                className="h-8 gap-1 px-2 text-xs"
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Reset
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={toggleFiltersCollapsed}
                                className="h-8 w-8 p-0"
                                title="Collapse filters"
                                aria-label="Collapse filters"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      {!isFiltersCollapsed ? (
                        <div className="space-y-4 p-4">
                          {tab === 'cse' && (
                            <>
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                  PS-DBM Catalog Mode
                                </label>
                                <div className="grid grid-cols-3 gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCseMode(PSDBMCatalogMode.REGIONAL)
                                      setSelectedDepot('')
                                    }}
                                    className={cn(
                                      'rounded-md border px-1.5 py-1.5 text-xs font-medium transition-colors text-center truncate',
                                      cseMode === PSDBMCatalogMode.REGIONAL
                                        ? 'border-primary bg-primary/10 text-foreground'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground',
                                    )}
                                    title="Regional Depot"
                                  >
                                    Regional
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCseMode(PSDBMCatalogMode.LGU)
                                      setSelectedDepot('')
                                    }}
                                    className={cn(
                                      'rounded-md border px-1.5 py-1.5 text-xs font-medium transition-colors text-center truncate',
                                      cseMode === PSDBMCatalogMode.LGU
                                        ? 'border-primary bg-primary/10 text-foreground'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground',
                                    )}
                                    title="LGU Depot"
                                  >
                                    LGU
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCseMode(PSDBMCatalogMode.MAIN)
                                      setSelectedDepot('')
                                    }}
                                    className={cn(
                                      'rounded-md border px-1.5 py-1.5 text-xs font-medium transition-colors text-center truncate',
                                      cseMode === PSDBMCatalogMode.MAIN
                                        ? 'border-primary bg-primary/10 text-foreground'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground',
                                    )}
                                    title="Main (National Catalog)"
                                  >
                                    Main
                                  </button>
                                </div>
                              </div>

                              {isDepotRequired && (
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    {cseMode === PSDBMCatalogMode.REGIONAL
                                      ? 'Regional Warehouse / Depot'
                                      : 'LGU Location'}
                                  </label>
                                  <Select
                                    value={selectedDepot}
                                    onValueChange={setSelectedDepot}
                                    disabled={isDepotsLoading}
                                  >
                                    <SelectTrigger className="h-9 text-xs bg-background">
                                      <SelectValue placeholder="Choose a depot to load warehouse stocks..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-56">
                                      {depots.map((d) => (
                                        <SelectItem
                                          key={d.id}
                                          value={d.name}
                                          className="text-xs"
                                        >
                                          {d.name}{' '}
                                          {d.region ? `(${d.region})` : ''}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <Separator />
                            </>
                          )}

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Search
                            </label>
                            <div className="relative">
                              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                placeholder="Name, code, category, supplier…"
                                value={search}
                                onChange={(event) =>
                                  setSearch(event.target.value)
                                }
                                className="pl-9"
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                Category
                              </label>
                              <span className="text-[11px] text-muted-foreground">
                                {tabFilters.categories.length} selected
                              </span>
                            </div>
                            <ScrollArea className="h-44 rounded-md border border-border bg-muted/10 p-2">
                              <div className="space-y-2 pr-2">
                                {filterOptions.categories.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">
                                    No categories available.
                                  </p>
                                ) : (
                                  filterOptions.categories.map((category) => (
                                    <label
                                      key={category}
                                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                                    >
                                      <Checkbox
                                        checked={tabFilters.categories.includes(
                                          category,
                                        )}
                                        onCheckedChange={() =>
                                          updateCurrentFilters(
                                            {
                                              categories: toggle(
                                                tabFilters.categories,
                                                category,
                                              ),
                                            },
                                            true,
                                          )
                                        }
                                      />
                                      <span className="min-w-0 flex-1 truncate">
                                        {category}
                                      </span>
                                    </label>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-medium text-muted-foreground">
                                Unit of measure
                              </label>
                              <span className="text-[11px] text-muted-foreground">
                                {tabFilters.unitOfMeasures.length} selected
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {filterOptions.units.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  No unit of measure options available.
                                </p>
                              ) : (
                                filterOptions.units.map((unit) => (
                                  <button
                                    key={unit}
                                    type="button"
                                    onClick={() =>
                                      updateCurrentFilters(
                                        {
                                          unitOfMeasures: toggle(
                                            tabFilters.unitOfMeasures,
                                            unit,
                                          ),
                                        },
                                        true,
                                      )
                                    }
                                    className={cn(
                                      'rounded-full border px-3 py-1 text-xs transition-colors',
                                      tabFilters.unitOfMeasures.includes(unit)
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground',
                                    )}
                                  >
                                    {unit}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground">
                              Price band
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                              {(
                                [
                                  { value: 'all', label: 'All prices' },
                                  { value: 'under-5k', label: 'Below ₱5,000' },
                                  { value: '5k-25k', label: '₱5,000–₱25,000' },
                                  { value: '25k-plus', label: 'Above ₱25,000' },
                                ] as const
                              ).map((band) => (
                                <button
                                  key={band.value}
                                  type="button"
                                  onClick={() =>
                                    updateCurrentFilters(
                                      { priceBand: band.value },
                                      true,
                                    )
                                  }
                                  className={cn(
                                    'flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
                                    tabFilters.priceBand === band.value
                                      ? 'border-primary bg-primary/10 text-foreground'
                                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                                  )}
                                >
                                  <span>{band.label}</span>
                                  <span className="text-[11px] uppercase tracking-wide">
                                    {band.value === 'all' ? 'Any' : band.value}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 px-2 py-4 text-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40 text-primary ring-1 ring-border">
                            <SlidersHorizontal className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-foreground">
                              Filters hidden
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Expand to refine search.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </aside>

                  <section className="space-y-4">
                    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <SlidersHorizontal className="h-4 w-4 text-primary" />
                          {tab === activeTab
                            ? filteredItems.length.toLocaleString()
                            : tabFiltered.length.toLocaleString()}{' '}
                          result
                          {(tab === activeTab
                            ? filteredItems.length
                            : tabFiltered.length) === 1
                            ? ''
                            : 's'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Page {tabPageIndex + 1} of {tabPageCount}. Add
                          selections directly to the active Item of Expenditure
                          block.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="soft" color="info">
                          {selectedCount} selected
                        </Badge>
                        <Badge
                          variant="soft"
                          color={
                            priceMode === 'ps-dbm' ? 'default' : 'secondary'
                          }
                        >
                          {priceMode === 'ps-dbm'
                            ? 'PS-DBM prices'
                            : 'Agency prices'}
                        </Badge>
                      </div>
                    </div>

                    {tab === activeTab && tab === 'cse' && !isReadyToFetchCse ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
                        <MapPin className="h-10 w-10 text-muted-foreground/40" />
                        <p className="mt-3 text-sm font-medium text-foreground">
                          Depot Selection Required
                        </p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                          Please select a{' '}
                          {cseMode === PSDBMCatalogMode.REGIONAL
                            ? 'regional warehouse depot'
                            : 'LGU location'}{' '}
                          in the side panel to view current stock and prices, or
                          switch to Main Catalog.
                        </p>
                      </div>
                    ) : tab === activeTab && tab === 'cse' && isPsdbmLoading ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-3 text-sm font-medium text-foreground">
                          Loading PS-DBM Catalog...
                        </p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                          Fetching latest items and prices from PS-PhilGEPS
                          repository.
                        </p>
                      </div>
                    ) : tab === activeTab && tab === 'non-cse' && isNonCseLoading ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="mt-3 text-sm font-medium text-foreground">
                          Loading Agency Catalog...
                        </p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                          Fetching approved Non-CSE items from master catalog.
                        </p>
                      </div>
                    ) : (tab === activeTab
                        ? filteredItems.length
                        : tabFiltered.length) === 0 ? (
                      <EmptyState message="Try widening the price band, clearing a category filter, or changing the search query." />
                    ) : (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {tabPageItems.map((item) => {
                            const selectedState = selectedIds.has(item.id)
                            const displayPrice = priceOf(item, priceMode)

                            return (
                              <div
                                key={item.id}
                                role="button"
                                aria-pressed={selectedState}
                                tabIndex={0}
                                onClick={() => toggleSelected(item)}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === ' ' ||
                                    event.key === 'Enter'
                                  ) {
                                    event.preventDefault()
                                    toggleSelected(item)
                                  }
                                }}
                                className={cn(
                                  'group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-background p-3 text-left shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                                  selectedState
                                    ? 'border-primary/70 ring-2 ring-primary/20'
                                    : 'border-border',
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div
                                      className={cn(
                                        'flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-semibold text-foreground ring-1 ring-border',
                                        tone(item.id),
                                      )}
                                    >
                                      <span>{item.thumbnailLabel}</span>
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                      <div className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                                        {item.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {item.category} · {item.itemCode}
                                      </div>
                                      <div className="flex flex-wrap gap-1.5 pt-1">
                                        <Badge
                                          variant="soft"
                                          color={
                                            tab === 'cse' ? 'success' : 'info'
                                          }
                                        >
                                          {tab === 'cse' ? 'CSE' : 'Non-CSE'}
                                        </Badge>
                                        <Badge variant="soft" color="secondary">
                                          {item.unitOfMeasure}
                                        </Badge>
                                        {tab === 'non-cse' && item.isMixed && (
                                          <Badge variant="soft" color="warning">
                                            Mixed
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    onClick={(event) => event.stopPropagation()}
                                    className="mt-1 shrink-0"
                                  >
                                    <Checkbox
                                      checked={selectedState}
                                      onCheckedChange={() =>
                                        toggleSelected(item)
                                      }
                                      aria-label={`Select ${item.name}`}
                                    />
                                  </div>
                                </div>

                                <Separator className="my-3" />

                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                        Unit Price
                                      </div>
                                      <div className="text-sm font-semibold text-foreground">
                                        {formatCurrency(displayPrice)}
                                      </div>
                                    </div>
                                    <Badge
                                      variant="soft"
                                      color={
                                        priceMode === 'ps-dbm'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                    >
                                      {priceMode === 'ps-dbm'
                                        ? 'PS-DBM'
                                        : 'Agency'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div className="rounded-md border border-border bg-muted/10 px-2 py-1.5">
                                      <span className="block text-[11px] uppercase tracking-wide">
                                        Default MoP
                                      </span>
                                      <span className="font-medium text-foreground">
                                        {item.defaultMoP}
                                      </span>
                                    </div>
                                    <div className="rounded-md border border-border bg-muted/10 px-2 py-1.5">
                                      <span className="block text-[11px] uppercase tracking-wide">
                                        Price source
                                      </span>
                                      <span className="font-medium text-foreground">
                                        {priceMode === 'ps-dbm'
                                          ? 'PS-DBM'
                                          : 'Agency'}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="line-clamp-2 text-xs text-muted-foreground">
                                    {item.specification ??
                                      'Catalog entry ready for adding to the current Item of Expenditure block.'}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-muted-foreground">
                            Page {tabPageIndex + 1} of {tabPageCount} ·{' '}
                            {filteredItems.length.toLocaleString()} filtered
                            item
                            {filteredItems.length === 1 ? '' : 's'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCurrentFilters({
                                  pageIndex: Math.max(0, tabPageIndex - 1),
                                })
                              }
                              disabled={tabFilters.pageIndex <= 0}
                              className="gap-1.5"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateCurrentFilters({
                                  pageIndex: Math.min(
                                    tabPageCount - 1,
                                    tabPageIndex + 1,
                                  ),
                                })
                              }
                              disabled={
                                tabFilters.pageIndex >= tabPageCount - 1
                              }
                              className="gap-1.5"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </section>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </ResponsiveDialog>
  )
}
