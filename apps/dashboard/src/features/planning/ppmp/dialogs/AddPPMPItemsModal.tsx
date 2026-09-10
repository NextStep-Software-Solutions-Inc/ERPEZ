/**
 * AddPPMPItemsModal
 * Premium batch catalog picker dialog for adding standard procurement items (CSE)
 * and Non-CSE items to a PPMP expenditure item block.
 * Features tab-scoped side filtering, pagination, selection persistence,
 * pre-populated inherited pricing, sequential creation, and safety loaders.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  LucidePackage,
  LucidePackageOpen,
  MapPin,
  Package,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  HelpCircle,
  Sparkles,
} from 'lucide-react'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'

import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import DocumentViewer from '@/components/DocumentViewer'
import { FieldDescriptionTooltip } from '../components/FieldDescriptionTooltip'
import { RequestItemDialog } from '../catalog/dialogs/RequestItemDialog'

import { getNONCSEItemsRequest } from '@/features/planning/non-cse-item/handlers/getNONCSEItemsRequest'
import { getProcurementModesRequest } from '@/lib/fiscal-year-and-policies/requests/getProcurementModesRequest'
import {
  usePSDBMItems,
  usePSDBMDepots,
  usePSDBMCategories,
  useTriggerPSDBMSync,
} from '@/features/procurement/psdbm/hooks'
import { PSDBMCatalogMode, type PSDBMItem } from '@/features/procurement/psdbm/types'
import { createPPMPItemRequest } from '../handlers/createPPMPItemRequest'
import { createPPMPItemAllocationRequest } from '../handlers/createPPMPItemAllocationRequest'
import type { AllocationMonth, ProcurementProjectType } from '../types'

import type { ProcurementItem } from '@/components/features/planning/procurement-item/types/procurementItem.types'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'

function mapPsdbmToProcurementItem(psdbm: PSDBMItem): ProcurementItem {
  return {
    id: psdbm.id || psdbm.itemCode,
    name: psdbm.description,
    specifications: psdbm.description,
    uomName: psdbm.unit,
    unitPrice: psdbm.unitPrice,
    hasPrice: true,
    objectCodeName: psdbm.category || 'General Goods',
    isCSE: true,
    isActive: true,
    productCode: psdbm.itemCode,
    imageURL: psdbm.imageUrl,
  } as ProcurementItem
}

const useNONCSEItems = createQueryHookFromTemplate(getNONCSEItemsRequest)
const useProcurementModes = createQueryHookFromTemplate(
  getProcurementModesRequest,
)
const useCreatePPMPItem = createMutationHookFromTemplate(createPPMPItemRequest)
const useCreatePPMPItemAllocation = createMutationHookFromTemplate(
  createPPMPItemAllocationRequest,
)

export interface ItemReviewConfig {
  unitPrice: number
  plannedQuantity?: number
  procurementModeId: string
  projectType:
    | 'Goods'
    | 'Infrastructure'
    | 'ConsultingServices'
    | 'GeneralSupportServices'
  papCode: string
  preProcurementConference: boolean
  procurementStartDate: string
  procurementEndDate: string
  expectedDeliveryStart: string
  expectedDeliveryEnd: string
  remarks: string
  enableAllocations: boolean
  monthlyQuantities: Record<AllocationMonth, number>
}

interface AddPPMPItemsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  ppmpExpenditureItemId: string
  officeId?: string
  officeName?: string
  fiscalYear?: number | string
  ppmpTitle?: string
  expenditureItemTitle?: string
  onSuccess?: () => void
}

type CatalogTab = 'cse' | 'non-cse'

interface TabFilters {
  categories: string[]
  unitOfMeasures: string[]
  pageIndex: number
}

const PAGE_SIZE = 25
const DEFAULT_FILTERS: TabFilters = {
  categories: [],
  unitOfMeasures: [],
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

function hash(value: string): string {
  let n = 0
  for (let i = 0; i < value.length; i += 1) {
    n = (n << 5) - n + value.charCodeAt(i)
    n |= 0
  }
  return Math.abs(n).toString()
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
  const valHash = Number.parseInt(hash(value)) || 0
  return tones[valHash % tones.length] ?? tones[0]!
}

function EmptyState({ message, onRequestItem }: { message: string; onRequestItem?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/25 bg-linear-to-b from-primary/5 via-muted/15 to-transparent px-6 py-12 text-center shadow-xs">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-1">
        <Package className="h-6 w-6 text-primary" />
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">No items found</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{message}</p>
      {onRequestItem && (
        <Button
          type="button"
          size="sm"
          onClick={onRequestItem}
          className="mt-4 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          Create Item Request
        </Button>
      )}
    </div>
  )
}

type SelectedItemWrapper =
  { type: 'cse'; item: ProcurementItem } | { type: 'non-cse'; item: NONCSEItem }

export default function AddPPMPItemsModal({
  isOpen,
  onOpenChange,
  ppmpExpenditureItemId,
  officeId,
  officeName,
  fiscalYear,
  ppmpTitle,
  expenditureItemTitle,
  onSuccess,
}: AddPPMPItemsModalProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: createItem } = useCreatePPMPItem()
  const { mutateAsync: createAllocation } = useCreatePPMPItemAllocation()

  // Steps: 'select' | 'configure'
  const [step, setStep] = useState<'select' | 'configure'>('select')

  // Search & Tab selections
  const [activeTab, setActiveTab] = useState<CatalogTab>('cse')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<
    Map<string, SelectedItemWrapper>
  >(new Map())
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false)

  // Request Item Dialog state
  const [requestItemDialogOpen, setRequestItemDialogOpen] = useState(false)

  // Configure step inputs
  const [configs, setConfigs] = useState<Record<string, ItemReviewConfig>>({})
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false)
  const [detailsItemId, setDetailsItemId] = useState<string | null>(null)
  const [detailsItemType, setDetailsItemType] = useState<CatalogTab | null>(
    null,
  )

  // Loading and batch states
  const [isAdding, setIsAdding] = useState(false)
  const [progressIndex, setProgressIndex] = useState(0)
  const [totalProgress, setTotalProgress] = useState(0)
  const isCommittedRef = useRef(false)

  // Filters by CSE tab vs Non-CSE tab
  const [filtersByTab, setFiltersByTab] = useState<
    Record<CatalogTab, TabFilters>
  >({
    cse: cloneFilters(),
    'non-cse': cloneFilters(),
  })

  // Live CSE Query from PS-DBM
  const [cseMode, setCseMode] = useState<PSDBMCatalogMode>(
    PSDBMCatalogMode.REGIONAL,
  )
  const [selectedDepot, setSelectedDepot] = useState<string>('')

  const { data: depotsData, isLoading: isDepotsLoading } = usePSDBMDepots({
    enabled: isOpen && activeTab === 'cse',
  })

  const { data: psdbmCategoriesResponse } = usePSDBMCategories({
    pathParams: { mode: cseMode },
    enabled: isOpen && activeTab === 'cse',
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

  const currentFilters = filtersByTab[activeTab]
  const normalizedSearch = search.trim().toLowerCase()

  const {
    data: psdbmItemsResponse,
    isLoading: isPsdbmLoading,
    refetch: refetchPsdbm,
  } = usePSDBMItems({
    pathParams: { mode: cseMode },
    queryParams: {
      depot: (cseMode !== PSDBMCatalogMode.MAIN && selectedDepot) || undefined,
      search: normalizedSearch || undefined,
      category:
        currentFilters.categories.length > 0
          ? currentFilters.categories[0]
          : undefined,
      pageNumber: currentFilters.pageIndex + 1,
      pageSize: PAGE_SIZE,
    },
    enabled: isOpen && activeTab === 'cse' && isReadyToFetchCse,
  })

  const { mutateAsync: triggerSync, isPending: isSyncing } =
    useTriggerPSDBMSync()

  const lastSyncTime = useMemo(() => {
    const timestamp = psdbmItemsResponse?.data?.lastSynchronizedAt
    if (!timestamp) return null
    try {
      return new Date(timestamp).toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return null
    }
  }, [psdbmItemsResponse])

  const { data: nonCseResponse, isLoading: isNonCseLoading } = useNONCSEItems({
    pathParams: {},
    queryParams: {
      search: normalizedSearch || undefined,
      category:
        currentFilters.categories.length > 0
          ? currentFilters.categories[0]
          : undefined,
      pageNumber: currentFilters.pageIndex + 1,
      pageSize: PAGE_SIZE,
    },
    enabled: isOpen && activeTab === 'non-cse',
  })

  const { data: modesResponse } = useProcurementModes({
    pathParams: {},
    queryParams: {
      pageSize: 1000,
    },
    enabled: isOpen,
  })

  const procurementItems = useMemo(
    () => (psdbmItemsResponse?.data?.items || []).map(mapPsdbmToProcurementItem),
    [psdbmItemsResponse],
  )
  const nonCseItems = useMemo(
    () => nonCseResponse?.data ?? [],
    [nonCseResponse],
  )
  const procurementModes = useMemo(
    () => modesResponse?.data ?? [],
    [modesResponse],
  )

  const currentItems =
    activeTab === 'cse' ? procurementItems : nonCseItems
  const isCatalogLoading =
    activeTab === 'cse' ? isPsdbmLoading : isNonCseLoading

  // Dynamic filter options
  const filterOptions = useMemo(() => {
    if (activeTab === 'cse') {
      const psdbmCats = (psdbmCategoriesResponse?.data || [])
        .map((c) => c.name)
        .filter(Boolean)
      const itemCats = procurementItems
        .map((item) => item.objectCodeName)
        .filter(Boolean)
      return {
        categories: Array.from(new Set([...psdbmCats, ...itemCats])).sort() as string[],
        units: Array.from(
          new Set(procurementItems.map((item) => item.uomName).filter(Boolean)),
        ).sort() as string[],
      }
    } else {
      const items = nonCseItems
      return {
        categories: Array.from(
          new Set(
            items.map((item) => item.procurementCategoryName).filter(Boolean),
          ),
        ).sort() as string[],
        units: Array.from(
          new Set(items.map((item) => item.uomName).filter(Boolean)),
        ).sort() as string[],
      }
    }
  }, [activeTab, psdbmCategoriesResponse, procurementItems, nonCseItems])

  // Resolve active item for View Details sheet directly from current/selected catalog data
  const activeDetailItem = useMemo(() => {
    if (!detailsItemId) return null
    const fromCurrent = currentItems.find((i) => i.id === detailsItemId)
    if (fromCurrent) return fromCurrent
    const fromSelected = selectedItems.get(detailsItemId)?.item
    return (fromSelected as ProcurementItem | NONCSEItem) || null
  }, [detailsItemId, currentItems, selectedItems])

  const detailData = activeDetailItem
  const isDetailLoading = false

  // Server-driven pagination metadata
  const totalMatchingCount = useMemo(() => {
    if (activeTab === 'cse') {
      return psdbmItemsResponse?.data?.totalItems ?? 0
    }
    return (
      nonCseResponse?.totalRows ?? (nonCseResponse?.data?.length ?? 0)
    )
  }, [activeTab, psdbmItemsResponse, nonCseResponse])

  const pageCount = Math.max(1, Math.ceil(totalMatchingCount / PAGE_SIZE))
  const safePageIndex = Math.min(currentFilters.pageIndex, Math.max(0, pageCount - 1))
  const pageItems = currentItems

  const selectedCount = selectedItems.size

  const totalStep2EstimatedCost = useMemo(() => {
    return Array.from(selectedItems.values()).reduce((sum, { item }) => {
      const config = configs[item.id]
      if (!config) return sum
      const qty = config.plannedQuantity || 0
      return sum + qty * config.unitPrice
    }, 0)
  }, [selectedItems, configs])

  // Warnings during unload
  useEffect(() => {
    if (!isAdding) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue =
        'Batch creation is in progress. Closing this page will interrupt the process.'
      return e.returnValue
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isAdding])

  useEffect(() => {
    if (isOpen) {
      isCommittedRef.current = false
    }
  }, [isOpen])

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
    [activeTab],
  )

  const handleSyncDepot = useCallback(async () => {
    const target =
      selectedDepot ||
      (cseMode === PSDBMCatalogMode.MAIN ? 'Main Catalog' : 'Catalog')

    const syncPromise = (async () => {
      const response = await triggerSync({
        pathParams: {},
        payload: {
          syncMode: 'Full',
          depots: selectedDepot ? [selectedDepot] : undefined,
          mode:
            cseMode === PSDBMCatalogMode.REGIONAL
              ? 'regional'
              : cseMode === PSDBMCatalogMode.LGU
                ? 'lgu'
                : undefined,
        },
      })
      await refetchPsdbm()
      updateCurrentFilters({ pageIndex: 0 })
      return response.data
    })()

    toast.promise(syncPromise, {
      loading: `Connecting to PS-PhilGEPS and synchronizing ${target} warehouse stocks...`,
      success: () =>
        `Successfully synchronized ${target}! Items and stocks updated.`,
      error: (err: unknown) => {
        const errorObj = err as {
          response?: { data?: { message?: string } }
          message?: string
        }
        return `Sync failed: ${errorObj?.response?.data?.message || errorObj?.message || 'Please check backend logs.'}`
      },
    })

    try {
      await syncPromise
    } catch (err) {
      console.error('PSDBM sync error:', err)
    }
  }, [selectedDepot, cseMode, triggerSync, refetchPsdbm, updateCurrentFilters])

  const resetCurrentFilters = useCallback(() => {
    setSearch('')
    setFiltersByTab((prev) => ({ ...prev, [activeTab]: cloneFilters() }))
  }, [activeTab])

  const toggleFiltersCollapsed = useCallback(() => {
    setIsFiltersCollapsed((prev) => !prev)
  }, [])

  const toggleSelected = useCallback(
    (item: ProcurementItem | NONCSEItem, type: CatalogTab) => {
      setSelectedItems((prev) => {
        const next = new Map(prev)
        if (next.has(item.id)) {
          next.delete(item.id)
          setConfigs((prevConfigs) => {
            const nextConfigs = { ...prevConfigs }
            delete nextConfigs[item.id]
            return nextConfigs
          })
        } else {
          next.set(item.id, { type, item } as SelectedItemWrapper)
          const price =
            type === 'cse'
              ? (item as ProcurementItem).hasPrice &&
                typeof (item as ProcurementItem).unitPrice === 'number' &&
                ((item as ProcurementItem).unitPrice ?? 0) > 0
                ? ((item as ProcurementItem).unitPrice ?? 0)
                : 0
              : ((item as NONCSEItem).currentPrice ?? 0)
          setConfigs((prevConfigs) => ({
            ...prevConfigs,
            [item.id]: {
              unitPrice: price,
              plannedQuantity: undefined,
              procurementModeId: '',
              projectType: 'Goods',
              papCode: '',
              preProcurementConference: false,
              procurementStartDate: '',
              procurementEndDate: '',
              expectedDeliveryStart: '',
              expectedDeliveryEnd: '',
              remarks: '',
              enableAllocations: false,
              monthlyQuantities: {
                January: 0,
                February: 0,
                March: 0,
                April: 0,
                May: 0,
                June: 0,
                July: 0,
                August: 0,
                September: 0,
                October: 0,
                November: 0,
                December: 0,
              },
            },
          }))
        }
        return next
      })
    },
    [],
  )

  const updateConfig = (itemId: string, patch: Partial<ItemReviewConfig>) => {
    setConfigs((prev) => {
      const current = prev[itemId]
      if (!current) return prev
      return {
        ...prev,
        [itemId]: {
          ...current,
          ...patch,
        },
      }
    })
  }

  const handleReset = useCallback(() => {
    setStep('select')
    setSelectedItems(new Map())
    setSearch('')
    setConfigs({})
    setExpandedItemId(null)
    setIsFiltersCollapsed(false)
    setFiltersByTab({ cse: cloneFilters(), 'non-cse': cloneFilters() })
    setActiveTab('cse')
    setIsAdding(false)
    setDetailsItemId(null)
    setDetailsItemType(null)
    setConfirmCloseOpen(false)
    isCommittedRef.current = false
  }, [])

  const forceClose = useCallback(() => {
    setConfirmCloseOpen(false)
    handleReset()
    onOpenChange(false)
  }, [handleReset, onOpenChange])

  const handleClose = useCallback(() => {
    if (isAdding) return
    if (isCommittedRef.current) {
      forceClose()
      return
    }
    if (selectedItems.size > 0) {
      setConfirmCloseOpen(true)
    } else {
      forceClose()
    }
  }, [isAdding, selectedItems.size, forceClose])

  const handleConfirmAdd = async () => {
    if (isAdding || selectedCount === 0) {
      if (selectedCount === 0) {
        toast.warning('Please select at least one item.')
      }
      return
    }

    const invalidItems = selectedList.filter(({ item }) => {
      const config = configs[item.id]
      if (!config) return true
      if (!config.plannedQuantity || config.plannedQuantity < 1) return true
      if (!config.procurementModeId) return true
      if (config.unitPrice < 0.01) return true
      if (!config.procurementStartDate || !config.procurementEndDate || config.procurementEndDate < config.procurementStartDate) return true
      if (!config.expectedDeliveryStart || !config.expectedDeliveryEnd || config.expectedDeliveryEnd < config.expectedDeliveryStart) return true
      if (config.expectedDeliveryStart < config.procurementStartDate) return true
      if (config.enableAllocations) {
        const totalAllocQty = Object.values(config.monthlyQuantities).reduce(
          (a, b) => a + b,
          0,
        )
        if (totalAllocQty > (config.plannedQuantity || 0)) return true
      }
      return false
    })

    if (invalidItems.length > 0) {
      toast.warning(
        'All items must have a Planned Quantity (>= 1), selected Procurement Mode, unit price >= ₱0.01, valid timeline dates, and monthly allocations not exceeding planned quantity.',
      )
      return
    }

    setIsAdding(true)
    isCommittedRef.current = false

    // Calculate total operations to track progress
    let totalOps = selectedList.length
    selectedList.forEach(({ item }) => {
      const config = configs[item.id]
      if (config?.enableAllocations) {
        const activeMonths = Object.entries(config.monthlyQuantities).filter(
          ([_, qty]) => qty > 0,
        )
        totalOps += activeMonths.length
      }
    })

    setTotalProgress(totalOps)
    setProgressIndex(0)

    let successCount = 0
    let failedCount = 0
    const successfullyCreatedIds: string[] = []

    try {
      for (const { type, item } of selectedList) {
        const config = configs[item.id]!
        setProgressIndex((prev) => prev + 1)

        let createdItemId = ''
        try {
          const payload = {
            ppmpExpenditureItemId,
            name: item.name || '',
            description: (
              type === 'cse'
                ? (item as ProcurementItem).specifications || ''
                : (item as NONCSEItem).description || ''
            ).slice(0, 4000),
            unit: (item.uomName || 'unit').trim() || 'unit',
            unitPrice: config.unitPrice,
            plannedQuantity: config.plannedQuantity || 1,
            procurementModeId: config.procurementModeId,
            cseItemId: undefined,
            nonCseItemId: type === 'non-cse' ? item.id : undefined,
            projectType: config.projectType,
            papCode: config.papCode || undefined,
            preProcurementConference: config.preProcurementConference,
            procurementStartDate: config.procurementStartDate || undefined,
            procurementEndDate: config.procurementEndDate || undefined,
            expectedDeliveryStart: config.expectedDeliveryStart || undefined,
            expectedDeliveryEnd: config.expectedDeliveryEnd || undefined,
            remarks: config.remarks || undefined,
            mopOverride: false,
          }

          const response = await createItem({
            pathParams: {},
            payload,
          })
          // Extract GUID from response - handle both string and object payloads
          createdItemId = typeof response.data === 'string' ? response.data : (response.data?.id ?? '')
          successCount++
          successfullyCreatedIds.push(item.id)
        } catch (err) {
          failedCount++
          console.error(`Failed to add item: ${item.name}`, err)
          continue // Skip allocations if item creation failed
        }

        // Add monthly allocations sequentially if enabled
        if (config.enableAllocations && createdItemId) {
          const activeMonths = Object.entries(config.monthlyQuantities).filter(
            ([_, qty]) => qty > 0,
          )
          for (const [month, qty] of activeMonths) {
            setProgressIndex((prev) => prev + 1)
            try {
              await createAllocation({
                pathParams: {},
                payload: {
                  ppmpItemId: createdItemId,
                  allocationMonth: month as AllocationMonth,
                  quantity: qty,
                },
              })
            } catch (err) {
              console.error(
                `Failed to add allocation for ${month}: ${item.name}`,
                err,
              )
            }
          }
        }
      }

      if (successfullyCreatedIds.length > 0) {
        // Remove successfully created items from selection
        setSelectedItems((prev) => {
          const next = new Map(prev)
          for (const id of successfullyCreatedIds) {
            next.delete(id)
          }
          return next
        })
        setConfigs((prev) => {
          const next = { ...prev }
          for (const id of successfullyCreatedIds) {
            delete next[id]
          }
          return next
        })

        toast.success(
          `Successfully added ${successCount} item(s) to expenditure block.`,
        )

        // Invalidate queries to refresh lists and workspace
        await queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].startsWith('/ppmp-items') ||
              query.queryKey[0].startsWith('/ppmp-expenditure-items') ||
              query.queryKey[0].startsWith('/ppmp')),
        })

        onSuccess?.()
      }

      if (failedCount > 0) {
        toast.error(`Failed to add ${failedCount} item(s).`)
      }

      // If all items succeeded, mark committed and close cleanly
      if (failedCount === 0 && successCount > 0) {
        isCommittedRef.current = true
        forceClose()
      }
    } catch (globalErr) {
      toast.error('An error occurred during batch creation.')
    } finally {
      setIsAdding(false)
    }
  }

  const selectedList = useMemo(
    () => Array.from(selectedItems.values()),
    [selectedItems],
  )

  return (
    <>
      <ResponsiveDialog
        open={isOpen}
        onOpenChange={(next) => {
          if (!next) {
            handleClose()
          }
        }}
        title={
          step === 'select'
            ? 'Add Items to Workspace'
            : 'Configure Selected Items'
        }
        description={
          step === 'select'
            ? 'Browse procurement catalog items, filter quickly, and select items to add to the PPMP.'
            : 'Define procurement mode and individual unit prices for the selected items.'
        }
        size="5xl"
        showCloseButton={!isAdding}
        onPointerDownOutside={
          isAdding
            ? (e) => e.preventDefault()
            : selectedItems.size > 0 && !isCommittedRef.current
              ? (e) => {
                  e.preventDefault()
                  setConfirmCloseOpen(true)
                }
              : undefined
        }
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
                  {step === 'select'
                    ? selectedCount > 0
                      ? 'Items ready to be configured.'
                      : 'Select one or more items to continue.'
                    : `Total Planned Cost: ${new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(totalStep2EstimatedCost)}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {step === 'select' ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItems(new Map())}
                      disabled={selectedCount === 0}
                    >
                      Clear selection
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setStep('configure')
                        if (selectedList.length > 0 && !expandedItemId) {
                          setExpandedItemId(selectedList[0].item.id)
                        }
                      }}
                      disabled={selectedCount === 0}
                    >
                      Review Selected ({selectedCount})
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setStep('select')}
                      disabled={isAdding}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Catalog
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConfirmAdd}
                      disabled={isAdding || selectedCount === 0}
                      className="gap-2 bg-primary hover:bg-primary/95 text-white"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        `Add to Workspace (${selectedCount})`
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        }
      >
        {/* 
        Safety Overlay during Batch Addition
      */}
        {isAdding && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-6 text-center">
            <div className="bg-background border border-border shadow-xl rounded-xl p-8 max-w-md w-full flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Creating PPMP Items
                </h3>
                <p className="text-sm text-muted-foreground">
                  Adding item{' '}
                  <span className="font-semibold text-foreground">
                    {progressIndex}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-foreground">
                    {totalProgress}
                  </span>
                  .
                </p>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(progressIndex / totalProgress) * 100}%` }}
                />
              </div>
              <p className="text-xs text-rose-500 font-medium">
                Please do not close the modal, refresh the page, or navigate
                away.
              </p>
            </div>
          </div>
        )}

        {step === 'select' ? (
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
                    Choose between CSE and Non-CSE catalogs, then refine using
                    the side panel.
                  </p>
                </div>
                <TabsList
                  variant="bordered"
                  className="p-2 justify-start gap-1 overflow-x-auto h-fit"
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

                return (
                  <TabsContent key={tab} value={tab} className="mt-4">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
                      {/* Filters Sidebar */}
                      <aside
                        className={cn(
                          'lg:sticky lg:top-0 lg:self-start transition-all duration-200',
                          isFiltersCollapsed ? 'lg:w-16' : 'lg:w-75',
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
                                    {tabFilters.unitOfMeasures.length} units
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetCurrentFilters}
                                    className="h-8 gap-1 px-2 text-xs"
                                    title="Clear search and selected filters"
                                  >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    Reset Filters
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
                                          updateCurrentFilters({ pageIndex: 0 })
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
                                          updateCurrentFilters({ pageIndex: 0 })
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
                                          updateCurrentFilters({ pageIndex: 0 })
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
                                        onValueChange={(val) => {
                                          setSelectedDepot(val)
                                          updateCurrentFilters({ pageIndex: 0 })
                                        }}
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
                                      {isReadyToFetchCse && (
                                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                                          {lastSyncTime && totalMatchingCount > 0 ? (
                                            <span
                                              className="truncate max-w-[125px]"
                                              title={`Last Synced: ${lastSyncTime}`}
                                            >
                                              Synced: {lastSyncTime}
                                            </span>
                                          ) : (
                                            <span>Catalog sync</span>
                                          )}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleSyncDepot}
                                            disabled={isSyncing}
                                            className="h-6 px-1.5 text-[10px] font-semibold text-primary hover:bg-primary/10 gap-1"
                                          >
                                            {isSyncing ? (
                                              <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Syncing...
                                              </>
                                            ) : (
                                              <>
                                                <RefreshCcw className="h-3 w-3" />
                                                Sync PS-DBM
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <Separator />
                                </>
                              )}

                              {/* Search Input */}
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">
                                  Search
                                </label>
                                <div className="relative">
                                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="Name, description, category…"
                                    value={search}
                                    onChange={(event) => {
                                      setSearch(event.target.value)
                                      updateCurrentFilters({ pageIndex: 0 })
                                    }}
                                    className="pl-9 text-xs h-9"
                                  />
                                </div>
                              </div>

                              <Separator />

                              {/* Category Filter */}
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
                                      filterOptions.categories.map(
                                        (category) => (
                                          <label
                                            key={category}
                                            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted/50"
                                          >
                                            <Checkbox
                                              checked={tabFilters.categories.includes(
                                                category,
                                              )}
                                              onCheckedChange={() =>
                                                updateCurrentFilters(
                                                  {
                                                    categories:
                                                      tabFilters.categories.includes(
                                                        category,
                                                      )
                                                        ? tabFilters.categories.filter(
                                                            (c) =>
                                                              c !== category,
                                                          )
                                                        : [
                                                            ...tabFilters.categories,
                                                            category,
                                                          ],
                                                  },
                                                  true,
                                                )
                                              }
                                            />
                                            <span className="min-w-0 flex-1 truncate">
                                              {category}
                                            </span>
                                          </label>
                                        ),
                                      )
                                    )}
                                  </div>
                                </ScrollArea>
                              </div>

                              {/* UOM Filter */}
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
                                      No unit options available.
                                    </p>
                                  ) : (
                                    filterOptions.units.map((unit) => {
                                      const isSelected =
                                        tabFilters.unitOfMeasures.includes(unit)
                                      return (
                                        <button
                                          key={unit}
                                          type="button"
                                          onClick={() =>
                                            updateCurrentFilters(
                                              {
                                                unitOfMeasures: isSelected
                                                  ? tabFilters.unitOfMeasures.filter(
                                                      (u) => u !== unit,
                                                    )
                                                  : [
                                                      ...tabFilters.unitOfMeasures,
                                                      unit,
                                                    ],
                                              },
                                              true,
                                            )
                                          }
                                          className={cn(
                                            'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                                            isSelected
                                              ? 'border-primary bg-primary/10 text-primary'
                                              : 'border-border bg-background text-muted-foreground hover:text-foreground',
                                          )}
                                        >
                                          {unit}
                                        </button>
                                      )
                                    })
                                  )}
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
                                  Expand to refine.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </aside>

                      {/* Items Grid & Pagination */}
                      <section className="space-y-4 min-w-0">
                        {activeTab === 'cse' && !isReadyToFetchCse ? (
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
                              in the side panel to view current stock and
                              prices, or switch to Main Catalog.
                            </p>
                          </div>
                        ) : isCatalogLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-xs">
                              {activeTab === 'cse'
                                ? 'Loading PS-DBM items...'
                                : 'Loading master catalog items...'}
                            </p>
                          </div>
                        ) : totalMatchingCount === 0 ? (
                          activeTab === 'cse' &&
                          isReadyToFetchCse &&
                          !search.trim() &&
                          currentFilters.categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed rounded-xl bg-muted/10 my-4">
                              <div className="rounded-full bg-amber-500/10 p-3 mb-3 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-6 w-6" />
                              </div>
                              <h4 className="text-sm font-semibold text-foreground">
                                {selectedDepot
                                  ? `Warehouse Stocks for ${selectedDepot} Not Synchronized`
                                  : 'PS-DBM Catalog Not Synchronized'}
                              </h4>
                              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                                {selectedDepot
                                  ? `No items are available locally for ${selectedDepot}. Click Sync PS-DBM Now to fetch real-time items, stocks, and pricing from PS-PhilGEPS.`
                                  : 'Click Sync PS-DBM Now to synchronize catalog items and pricing.'}
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleSyncDepot}
                                disabled={isSyncing}
                                className="mt-4 gap-1.5 h-8 text-xs font-semibold"
                              >
                                {isSyncing ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Syncing PS-DBM...
                                  </>
                                ) : (
                                  <>
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    Sync PS-DBM Now
                                  </>
                                )}
                              </Button>
                            </div>
                          ) : activeTab === 'cse' &&
                            (search.trim() ||
                              currentFilters.categories.length > 0) ? (
                            <div className="flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed rounded-2xl bg-muted/15 my-4">
                              <div className="rounded-full bg-muted p-3 mb-3 text-muted-foreground">
                                <Search className="h-6 w-6" />
                              </div>
                              <h4 className="text-sm font-semibold text-foreground">
                                No Matching CSE Items Found
                              </h4>
                              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                                No items match your active search or filters. If the required item is not available in the CSE catalog, you can create a Non-CSE item request.
                              </p>
                              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={resetCurrentFilters}
                                  className="gap-1.5 h-8 text-xs font-semibold"
                                >
                                  <RefreshCcw className="h-3.5 w-3.5" />
                                  Reset Filters
                                </Button>
                                <Button
                                  type="button"
                                  variant="default"
                                  size="sm"
                                  onClick={() => setRequestItemDialogOpen(true)}
                                  className="gap-1.5 h-8 text-xs font-semibold bg-primary hover:bg-primary/95 text-white shadow-2xs"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                  Create Item Request
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <EmptyState
                              message="Try clearing filters or checking your search query."
                              onRequestItem={() => setRequestItemDialogOpen(true)}
                            />
                          )
                        ) : (
                          <>
                            {/* Top result info */}
                            <div className="flex items-center justify-between border border-border bg-background px-4 py-3 rounded-xl shadow-sm">
                              <div className="text-xs font-semibold text-foreground">
                                {totalMatchingCount} matching item(s)
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Page {safePageIndex + 1} of {pageCount}
                              </div>
                            </div>

                            {/* Grid layout */}
                            <div className="grid gap-3 min-[350px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                              {pageItems.map((item) => {
                                const isSelected = selectedItems.has(item.id)
                                const bgTone = tone(item.name || item.id)
                                const categoryText =
                                  tab === 'cse'
                                    ? (item as ProcurementItem).objectCodeName
                                    : (item as NONCSEItem)
                                        .procurementCategoryName

                                return (
                                  <div
                                    key={item.id}
                                    role="button"
                                    aria-pressed={isSelected}
                                    tabIndex={0}
                                    onClick={() => toggleSelected(item, tab)}
                                    onKeyDown={(e) => {
                                      if (e.key === ' ' || e.key === 'Enter') {
                                        e.preventDefault()
                                        toggleSelected(item, tab)
                                      }
                                    }}
                                    className={cn(
                                      'group flex flex-col justify-between rounded-2xl border p-3.5 text-left bg-background transition-all duration-300 relative select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                      isSelected
                                        ? 'border-primary bg-primary/2 ring-1 ring-primary shadow-md scale-[1.01]'
                                        : 'border-slate-100 hover:border-slate-300 hover:shadow-lg hover:scale-[1.01]',
                                    )}
                                  >
                                    {/* Top Row: Floating Tags / Checkbox */}
                                    <div
                                      className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between pointer-events-none"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Badge
                                        variant="soft"
                                        color={
                                          tab === 'cse' ? 'success' : 'info'
                                        }
                                        className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider backdrop-blur-md bg-white/85 shadow-sm border border-slate-100/50"
                                      >
                                        {tab === 'cse' ? 'CSE' : 'Non-CSE'}
                                      </Badge>
                                      <div className="pointer-events-auto">
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() =>
                                            toggleSelected(item, tab)
                                          }
                                          className="h-5 w-5 rounded-md border-slate-300 bg-white/95 shadow-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                    </div>

                                    {/* Image Area */}
                                    <div
                                      className="w-full bg-slate-50/70 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center p-3 relative min-h-36"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {(item as ProcurementItem).imageURL ? (
                                        <div className="relative w-full h-32 flex items-center justify-center">
                                          <img
                                            src={(item as ProcurementItem).imageURL}
                                            alt={item.name}
                                            className="max-h-32 max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                            onError={(e) => {
                                              e.currentTarget.style.display = 'none'
                                              const fallback = e.currentTarget
                                                .nextElementSibling as HTMLElement | null
                                              if (fallback) fallback.style.display = 'flex'
                                            }}
                                          />
                                          <div
                                            style={{ display: 'none' }}
                                            className={cn(
                                              'flex-col items-center justify-center rounded-xl bg-gradient-to-br shadow-inner w-16 h-16 gap-1 text-slate-700',
                                              bgTone,
                                            )}
                                          >
                                            {tab === 'cse' ? (
                                              <LucidePackage className="h-6 w-6 text-primary/70 stroke-[1.5]" />
                                            ) : (
                                              <Package className="h-6 w-6 text-amber-600/70 stroke-[1.5]" />
                                            )}
                                            <span className="text-[11px] font-bold font-mono tracking-wider">
                                              {initials(item.name || '')}
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div
                                          className={cn(
                                            'flex flex-col items-center justify-center rounded-xl bg-gradient-to-br shadow-inner w-16 h-16 gap-1 text-slate-700',
                                            bgTone,
                                          )}
                                        >
                                          {tab === 'cse' ? (
                                            <LucidePackage className="h-6 w-6 text-primary/70 stroke-[1.5]" />
                                          ) : (
                                            <Package className="h-6 w-6 text-amber-600/70 stroke-[1.5]" />
                                          )}
                                          <span className="text-[11px] font-bold font-mono tracking-wider">
                                            {initials(item.name || '')}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Details Area */}
                                    <div className="mt-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                      <div className="space-y-1">
                                        <h4 className="line-clamp-2 text-xs font-semibold text-slate-800 leading-snug group-hover:text-primary transition-colors">
                                          {item.name || 'Unnamed Item'}
                                        </h4>
                                        <p className="text-[10px] tracking-wide text-slate-400 font-mono">
                                          {item.productCode ||
                                            item.id.slice(0, 12)}
                                        </p>
                                      </div>

                                      {/* Row of Badges / Details button */}
                                      <div className="pt-2 flex flex-col gap-2">
                                        <div className="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                                          <span
                                            className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100/80 px-2 py-0.5 rounded-full truncate max-w-35"
                                            title={categoryText || 'General'}
                                          >
                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                            {categoryText || 'General'}
                                          </span>
                                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100/80 px-2 py-0.5 rounded-full shrink-0">
                                            UOM: {item.uomName || 'pcs'}
                                          </span>
                                        </div>

                                        {((tab === 'cse' &&
                                          (item as ProcurementItem).unitPrice !==
                                            undefined) ||
                                          (tab === 'non-cse' &&
                                            (item as NONCSEItem).currentPrice !==
                                              undefined)) && (
                                          <div className="text-xs font-bold text-slate-850 flex items-center justify-between border-t border-slate-100/80 pt-1.5 mt-0.5">
                                            <span className="text-[10px] text-slate-400 font-normal">
                                              Catalog Price
                                            </span>
                                            <span className="text-primary font-extrabold text-[12px]">
                                              ₱
                                              {(tab === 'cse'
                                                ? (item as ProcurementItem)
                                                    .unitPrice ?? 0
                                                : (item as NONCSEItem)
                                                    .currentPrice ?? 0
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                        )}

                                        <div className="flex items-center justify-between border-t border-slate-100/80 pt-2 mt-1">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setDetailsItemId(item.id)
                                              setDetailsItemType(tab)
                                            }}
                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline transition-all"
                                          >
                                            <svg
                                              className="h-3 w-3 stroke-2"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                              />
                                            </svg>
                                            View Details
                                          </button>
                                          {isSelected && (
                                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Pagination controls */}
                            {pageCount > 1 && (
                              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4 mt-6">
                                <span className="text-xs text-slate-500 font-medium">
                                  Showing items{' '}
                                  <span className="font-semibold text-slate-800">
                                    {totalMatchingCount === 0
                                      ? 0
                                      : safePageIndex * PAGE_SIZE + 1}
                                  </span>{' '}
                                  –{' '}
                                  <span className="font-semibold text-slate-800">
                                    {Math.min(
                                      (safePageIndex + 1) * PAGE_SIZE,
                                      totalMatchingCount,
                                    )}
                                  </span>{' '}
                                  of{' '}
                                  <span className="font-semibold text-slate-800">
                                    {totalMatchingCount}
                                  </span>
                                </span>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={safePageIndex === 0}
                                    onClick={() =>
                                      updateCurrentFilters({
                                        pageIndex: safePageIndex - 1,
                                      })
                                    }
                                    className="h-8 text-xs font-semibold px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 transition-colors"
                                  >
                                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                                    Prev
                                  </Button>

                                  {/* Page numbers */}
                                  {Array.from({ length: pageCount }).map(
                                    (_, idx) => {
                                      const isCurrent = idx === safePageIndex
                                      const isNear =
                                        Math.abs(idx - safePageIndex) <= 2
                                      const isEnds =
                                        idx === 0 || idx === pageCount - 1

                                      if (!isNear && !isEnds) {
                                        if (
                                          idx === 1 ||
                                          idx === pageCount - 2
                                        ) {
                                          return (
                                            <span
                                              key={`ell-${idx}`}
                                              className="text-slate-400 px-1 text-xs select-none"
                                            >
                                              ...
                                            </span>
                                          )
                                        }
                                        return null
                                      }

                                      return (
                                        <Button
                                          key={idx}
                                          type="button"
                                          variant={
                                            isCurrent ? 'default' : 'outline'
                                          }
                                          size="sm"
                                          onClick={() =>
                                            updateCurrentFilters({
                                              pageIndex: idx,
                                            })
                                          }
                                          className={cn(
                                            'h-8 w-8 text-xs font-bold rounded-lg transition-all',
                                            isCurrent
                                              ? 'bg-primary text-white shadow-sm border-primary'
                                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600',
                                          )}
                                        >
                                          {idx + 1}
                                        </Button>
                                      )
                                    },
                                  )}

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={safePageIndex >= pageCount - 1}
                                    onClick={() =>
                                      updateCurrentFilters({
                                        pageIndex: safePageIndex + 1,
                                      })
                                    }
                                    className="h-8 text-xs font-semibold px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 transition-colors"
                                  >
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Persistent "Can't find the item you need?" Highlighted Context Strip */}
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-4 rounded-2xl border border-primary/25 bg-linear-to-r from-primary/8 via-primary/4 to-transparent shadow-xs transition-all hover:border-primary/40">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                              <HelpCircle className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-foreground">
                                  Can't find the item you need?
                                </p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  New Request
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Request a new item not currently available in the catalog for Technical Working Group evaluation.
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setRequestItemDialogOpen(true)}
                            className="gap-1.5 text-xs shrink-0 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] h-8.5 px-3.5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Create Item Request
                          </Button>
                        </div>
                      </section>
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </div>
        ) : (
          /* Step 2: Review and Batch Configuration */
          <div className="space-y-4 font-sans">
            {/* Header Banner */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 shadow-xs flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  Configure Selected Items
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Review and configure procurement parameters, delivery timelines, and optional monthly quantity distributions for each selected item.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="soft" color="default" className="font-semibold text-xs px-2.5 py-1">
                  {selectedCount} {selectedCount === 1 ? 'Item' : 'Items'} to Configure
                </Badge>
              </div>
            </div>

            {/* Scrollable Items Container */}
            <div className="border border-border rounded-xl overflow-hidden shadow-xs">
              <div className="bg-muted/30 px-4 py-3 border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">
                  Selected Items ({selectedCount})
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Click any item to expand / edit
                </span>
              </div>

              <ScrollArea className="max-h-[60vh] overflow-y-auto">
                <div className="divide-y divide-border">
                  {selectedList.map(({ type, item }, index) => {
                    const isPriceLocked =
                      type === 'cse'
                        ? (item as ProcurementItem).hasPrice &&
                          typeof (item as ProcurementItem).unitPrice ===
                            'number' &&
                          ((item as ProcurementItem).unitPrice ?? 0) > 0
                        : typeof (item as NONCSEItem).currentPrice ===
                            'number' &&
                          ((item as NONCSEItem).currentPrice ?? 0) > 0

                    const config = configs[item.id] || {
                      unitPrice:
                        type === 'cse'
                          ? (item as ProcurementItem).hasPrice &&
                            typeof (item as ProcurementItem).unitPrice ===
                              'number' &&
                            ((item as ProcurementItem).unitPrice ?? 0) > 0
                            ? ((item as ProcurementItem).unitPrice ?? 0)
                            : 0
                          : ((item as NONCSEItem).currentPrice ?? 0),
                      procurementModeId: '',
                      projectType: 'Goods',
                      papCode: '',
                      preProcurementConference: false,
                      procurementStartDate: '',
                      procurementEndDate: '',
                      expectedDeliveryStart: '',
                      expectedDeliveryEnd: '',
                      remarks: '',
                      enableAllocations: false,
                      monthlyQuantities: {
                        January: 0,
                        February: 0,
                        March: 0,
                        April: 0,
                        May: 0,
                        June: 0,
                        July: 0,
                        August: 0,
                        September: 0,
                        October: 0,
                        November: 0,
                        December: 0,
                      },
                    }

                    const isExpanded = expandedItemId === item.id
                    const plannedQty = config.plannedQuantity || 0
                    const allocatedQty = config.enableAllocations
                      ? Object.values(config.monthlyQuantities).reduce(
                          (a, b) => a + b,
                          0,
                        )
                      : 0
                    const remainingQty = Math.max(0, plannedQty - allocatedQty)
                    const calculatedTotal = plannedQty * config.unitPrice

                    const hasQtyError =
                      !config.plannedQuantity || config.plannedQuantity < 1
                    const hasPriceError =
                      !config.unitPrice || config.unitPrice < 0.01
                    const hasMopError = !config.procurementModeId
                    const hasAllocError =
                      config.enableAllocations && allocatedQty > plannedQty
                    
                    const hasProcStartError = !config.procurementStartDate
                    const hasProcEndError =
                      !config.procurementEndDate ||
                      (config.procurementStartDate &&
                        config.procurementEndDate < config.procurementStartDate)
                    const hasDelivStartError =
                      !config.expectedDeliveryStart ||
                      (config.procurementStartDate &&
                        config.expectedDeliveryStart < config.procurementStartDate)
                    const hasDelivEndError =
                      !config.expectedDeliveryEnd ||
                      (config.expectedDeliveryStart &&
                        config.expectedDeliveryEnd < config.expectedDeliveryStart)

                    const hasAnyError =
                      hasQtyError ||
                      hasPriceError ||
                      hasMopError ||
                      hasAllocError ||
                      hasProcStartError ||
                      hasProcEndError ||
                      hasDelivStartError ||
                      hasDelivEndError

                    const specText =
                      type === 'cse'
                        ? (item as ProcurementItem).specifications
                        : (item as NONCSEItem).description
                    const categoryText =
                      type === 'cse'
                        ? (item as ProcurementItem).objectCodeName
                        : (item as NONCSEItem).procurementCategoryName
                    const productCode =
                      type === 'cse'
                        ? (item as ProcurementItem).productCode
                        : (item as NONCSEItem).productCode
                    const imgUrl =
                      (item as ProcurementItem).imageURL || (item as any).imageUrl

                    const MONTH_NAMES: AllocationMonth[] = [
                      'January',
                      'February',
                      'March',
                      'April',
                      'May',
                      'June',
                      'July',
                      'August',
                      'September',
                      'October',
                      'November',
                      'December',
                    ]

                    const formatCurrency = (val: number): string =>
                      new Intl.NumberFormat('en-PH', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(val || 0)

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'p-4 sm:p-5 bg-background transition-colors flex flex-col gap-4 border-l-4',
                          hasAnyError
                            ? 'border-l-amber-500 bg-amber-500/2'
                            : 'border-l-emerald-500 bg-emerald-500/2',
                        )}
                      >
                        {/* ========================================================= */}
                        {/* SECTION A: ITEM SUMMARY HEADER                            */}
                        {/* ========================================================= */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div
                            className="min-w-0 flex-1 flex items-start sm:items-center gap-3.5 cursor-pointer select-none"
                            onClick={() =>
                              setExpandedItemId(isExpanded ? null : item.id)
                            }
                          >
                            {/* Item Thumbnail / Avatar */}
                            <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-border bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center shadow-2xs">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={item.name}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <div
                                  className={cn(
                                    'h-full w-full flex items-center justify-center bg-linear-to-br font-bold text-xs text-foreground/80',
                                    tone(item.name || ''),
                                  )}
                                >
                                  {initials(item.name || '')}
                                </div>
                              )}
                            </div>

                            {/* Item Title & Metadata Badges */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                                  #{index + 1}
                                </span>
                                <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-50 sm:max-w-md">
                                  {item.name}
                                </h4>
                                <Badge
                                  variant="soft"
                                  color={type === 'cse' ? 'success' : 'info'}
                                  className="text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider"
                                >
                                  {type === 'cse' ? 'CSE' : 'Non-CSE'}
                                </Badge>
                                {hasAnyError ? (
                                  <Badge className="text-[9px] px-2 py-0.5 font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                                    ● Configuration Required
                                  </Badge>
                                ) : (
                                  <Badge className="text-[9px] px-2 py-0.5 font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                                    ✓ Configuration Complete
                                  </Badge>
                                )}
                              </div>

                              {specText && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-xl">
                                  {specText}
                                </p>
                              )}

                              {/* Attributes strip */}
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
                                {productCode && (
                                  <span className="font-mono text-[10px] bg-muted/50 px-1.5 py-0.5 rounded border border-border/50">
                                    Code: <strong className="text-foreground">{productCode}</strong>
                                  </span>
                                )}
                                <span>
                                  Category: <strong className="text-foreground">{categoryText || 'General Goods'}</strong>
                                </span>
                                <span>
                                  UOM: <strong className="text-foreground">{item.uomName || 'pcs'}</strong>
                                </span>
                                <span>
                                  Planned: <strong className="text-foreground">{plannedQty > 0 ? plannedQty : '—'}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Summary Strip & Expand Toggle */}
                          <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDetailsItemId(item.id)
                                setDetailsItemType(type)
                              }}
                              className="h-8 text-[11px] font-semibold text-primary rounded-lg px-2.5 hover:bg-primary/5"
                            >
                              View Details
                            </Button>
                            
                            <div className="text-right pl-2 border-l border-border/60">
                              <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">
                                Estimated Cost
                              </div>
                              <div className="text-xs sm:text-sm font-extrabold text-primary">
                                {formatCurrency(calculatedTotal)}
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setExpandedItemId(isExpanded ? null : item.id)
                              }
                              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/60"
                              aria-label={isExpanded ? 'Collapse item configuration' : 'Expand item configuration'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* ========================================================= */}
                        {/* COLLAPSIBLE CONFIGURATION CONTENT                         */}
                        {/* ========================================================= */}
                        {isExpanded && (
                          <div className="space-y-4 border-t border-border/70 pt-4 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                            {/* Live Cost & Quantity Hero Strip */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/20 shadow-2xs">
                              <div className="space-y-0.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                                  Catalog Unit Price
                                </span>
                                <strong className="text-xs font-bold text-foreground">
                                  {formatCurrency(config.unitPrice)}
                                </strong>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                                  Planned Quantity
                                </span>
                                <strong className="text-xs font-bold text-foreground">
                                  {plannedQty > 0 ? `${plannedQty} ${item.uomName || 'units'}` : '—'}
                                </strong>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                                  Monthly Allocation
                                </span>
                                <strong className="text-xs font-bold text-foreground">
                                  {allocatedQty > 0
                                    ? `${allocatedQty} / ${plannedQty || 0} allocated (${remainingQty} rem)`
                                    : 'Not yet distributed'}
                                </strong>
                              </div>
                              <div className="space-y-0.5 sm:text-right">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-primary block">
                                  Estimated Total Cost
                                </span>
                                <strong className="text-sm font-extrabold text-primary">
                                  {formatCurrency(calculatedTotal)}
                                </strong>
                              </div>
                            </div>

                            {/* ========================================================= */}
                            {/* SECTION B: PROCUREMENT CONFIGURATION                      */}
                            {/* ========================================================= */}
                            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4 shadow-2xs">
                              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                <div className="flex items-center gap-2">
                                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Procurement Configuration
                                  </h4>
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  * Indicates required field
                                </span>
                              </div>

                              {/* Row 1: Core Parameters */}
                              <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
                                {/* Planned Quantity */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    <label
                                      htmlFor={`qty-${item.id}`}
                                      className="text-xs font-semibold text-foreground select-none"
                                    >
                                      Planned Quantity *
                                    </label>
                                    <FieldDescriptionTooltip fieldKey="plannedQuantity" className="h-3.5 w-3.5" />
                                  </div>
                                  <Input
                                    id={`qty-${item.id}`}
                                    type="number"
                                    min="1"
                                    placeholder="e.g. 100"
                                    value={config.plannedQuantity ?? ''}
                                    onChange={(e) =>
                                      updateConfig(item.id, {
                                        plannedQuantity:
                                          e.target.value === ''
                                            ? undefined
                                            : Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                                      })
                                    }
                                    className={cn(
                                      'text-xs h-9 w-full border-default-200 focus-visible:ring-primary/25',
                                      hasQtyError && 'border-red-500 bg-red-50/20',
                                    )}
                                  />
                                  {hasQtyError && (
                                    <p className="text-[10px] text-red-500 font-medium mt-0.5">Planned quantity is required (≥ 1)</p>
                                  )}
                                </div>

                                {/* Unit Price */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    <label
                                      htmlFor={`price-${item.id}`}
                                      className="text-xs font-semibold text-foreground select-none"
                                    >
                                      Unit Price *
                                    </label>
                                    <FieldDescriptionTooltip fieldKey="unitPrice" className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="relative w-full">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                                      ₱
                                    </span>
                                    <Input
                                      id={`price-${item.id}`}
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={config.unitPrice || ''}
                                      disabled={isPriceLocked}
                                      onChange={(e) =>
                                        updateConfig(item.id, {
                                          unitPrice: Math.max(
                                            0,
                                            Number.parseFloat(e.target.value) ||
                                              0,
                                          ),
                                        })
                                      }
                                      className={cn(
                                        'pl-6 text-xs h-9 w-full border-default-200 focus-visible:ring-primary/25',
                                        isPriceLocked &&
                                          'bg-default-100/60 cursor-not-allowed font-semibold text-default-600',
                                        hasPriceError &&
                                          'border-red-500 focus-visible:ring-red-500/25 bg-red-50/20',
                                      )}
                                    />
                                  </div>
                                  {isPriceLocked && (
                                    <p className="text-[10px] text-default-450 italic">
                                      Inherited locked catalog price
                                    </p>
                                  )}
                                </div>

                                {/* Procurement Mode */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    <label className="text-xs font-semibold text-foreground">
                                      Procurement Mode *
                                    </label>
                                    <FieldDescriptionTooltip fieldKey="procurementModeId" className="h-3.5 w-3.5" />
                                  </div>
                                  <Select
                                    value={config.procurementModeId}
                                    onValueChange={(val) =>
                                      updateConfig(item.id, {
                                        procurementModeId: val,
                                      })
                                    }
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        'w-full border-default-200 text-xs h-9 focus:ring-primary/25',
                                        hasMopError &&
                                          'border-red-500 bg-red-50/20',
                                      )}
                                    >
                                      <SelectValue placeholder="Select Mode *" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {procurementModes.map((m) => (
                                        <SelectItem
                                          key={m.id}
                                          value={m.id}
                                          className="text-xs"
                                        >
                                          {m.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Project Type */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    <label className="text-xs font-semibold text-foreground">
                                      Project Type
                                    </label>
                                    <FieldDescriptionTooltip fieldKey="projectType" className="h-3.5 w-3.5" />
                                  </div>
                                  <Select
                                    value={config.projectType}
                                    onValueChange={(
                                      val: ProcurementProjectType,
                                    ) =>
                                      updateConfig(item.id, { projectType: val })
                                    }
                                  >
                                    <SelectTrigger className="w-full border-default-200 text-xs h-9">
                                      <SelectValue placeholder="Select Project Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        value="Goods"
                                        className="text-xs"
                                      >
                                        Goods
                                      </SelectItem>
                                      <SelectItem
                                        value="Infrastructure"
                                        className="text-xs"
                                      >
                                        Infrastructure
                                      </SelectItem>
                                      <SelectItem
                                        value="ConsultingServices"
                                        className="text-xs"
                                      >
                                        Consulting Services
                                      </SelectItem>
                                      <SelectItem
                                        value="GeneralSupportServices"
                                        className="text-xs"
                                      >
                                        General Support Services
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Row 2: Timeline Schedules */}
                              <div className="grid gap-3.5 sm:grid-cols-2">
                                {/* Procurement Schedule */}
                                <div className="p-3 rounded-lg border border-border/70 bg-muted/10 space-y-2">
                                  <div className="flex items-center gap-1">
                                    <label className="text-xs font-semibold text-foreground">
                                      Procurement Schedule *
                                    </label>
                                    <FieldDescriptionTooltip fieldKey="procurementStartDate" className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-[10px] text-muted-foreground block mb-1">Start Date</span>
                                      <Input
                                        type="date"
                                        value={config.procurementStartDate || ''}
                                        onChange={(e) =>
                                          updateConfig(item.id, {
                                            procurementStartDate: e.target.value,
                                          })
                                        }
                                        className={cn(
                                          'text-xs h-9 border-default-200 w-full',
                                          hasProcStartError && 'border-red-500 bg-red-50/20'
                                        )}
                                        placeholder="Start"
                                      />
                                      {hasProcStartError && (
                                        <p className="text-[10px] text-red-500 font-medium mt-0.5">Start date is required</p>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-muted-foreground block mb-1">End Date</span>
                                      <Input
                                        type="date"
                                        value={config.procurementEndDate || ''}
                                        onChange={(e) =>
                                          updateConfig(item.id, {
                                            procurementEndDate: e.target.value,
                                          })
                                        }
                                        className={cn(
                                          'text-xs h-9 border-default-200 w-full',
                                          hasProcEndError && 'border-red-500 bg-red-50/20'
                                        )}
                                        placeholder="End"
                                      />
                                      {config.procurementEndDate && config.procurementStartDate && config.procurementEndDate < config.procurementStartDate ? (
                                        <p className="text-[10px] text-red-500 font-medium mt-0.5">Cannot be before start date</p>
                                      ) : !config.procurementEndDate ? (
                                        <p className="text-[10px] text-red-500 font-medium mt-0.5">End date is required</p>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                {/* Expected Delivery Window */}
                                <div className="p-3 rounded-lg border border-border/70 bg-muted/10 space-y-2">
                                  <div className="flex items-center gap-1">
                                    <label className="text-xs font-semibold text-foreground">
                                      Expected Delivery Window *
                                    </label>
                                    <FieldDescriptionTooltip fieldKey="expectedDeliveryStart" className="h-3.5 w-3.5" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="text-[10px] text-muted-foreground block mb-1">Start Date</span>
                                      <Input
                                        type="date"
                                        value={config.expectedDeliveryStart || ''}
                                        onChange={(e) =>
                                          updateConfig(item.id, {
                                            expectedDeliveryStart: e.target.value,
                                          })
                                        }
                                        className={cn(
                                          'text-xs h-9 border-default-200 w-full',
                                          hasDelivStartError && 'border-red-500 bg-red-50/20'
                                        )}
                                        placeholder="Start"
                                      />
                                      {config.expectedDeliveryStart && config.procurementStartDate && config.expectedDeliveryStart < config.procurementStartDate ? (
                                        <p className="text-[10px] text-red-500 font-medium mt-0.5">Cannot be before procurement start</p>
                                      ) : !config.expectedDeliveryStart ? (
                                        <p className="text-[10px] text-red-500 font-medium mt-0.5">Start date is required</p>
                                      ) : null}
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-muted-foreground block mb-1">End Date</span>
                                      <Input
                                        type="date"
                                        value={config.expectedDeliveryEnd || ''}
                                        onChange={(e) =>
                                          updateConfig(item.id, {
                                            expectedDeliveryEnd: e.target.value,
                                          })
                                        }
                                        className={cn(
                                          'text-xs h-9 border-default-200 w-full',
                                          hasDelivEndError && 'border-red-500 bg-red-50/20'
                                        )}
                                        placeholder="End"
                                      />
                                      {config.expectedDeliveryEnd && config.expectedDeliveryStart && config.expectedDeliveryEnd < config.expectedDeliveryStart ? (
                                        <p className="text-[10px] text-red-500 font-medium mt-0.5">Cannot be before start date</p>
                                      ) : !config.expectedDeliveryEnd ? (
                                        <p className="text-[10px] text-red-500 font-medium mt-0.5">End date is required</p>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Row 3: PAP Code & Conference */}
                              <div className="grid gap-3.5 sm:grid-cols-3 sm:items-end">
                                <div className="space-y-1.5 sm:col-span-2">
                                  <div className="flex items-center gap-1">
                                    <label className="text-xs font-semibold text-foreground">
                                      PAP Code
                                    </label>
                                    <FieldDescriptionTooltip fieldKey="papCode" className="h-3.5 w-3.5" />
                                  </div>
                                  <Input
                                    value={config.papCode || ''}
                                    placeholder="e.g. 5020301000"
                                    onChange={(e) =>
                                      updateConfig(item.id, {
                                        papCode: e.target.value,
                                      })
                                    }
                                    className="text-xs h-9 border-default-200"
                                  />
                                </div>

                                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/70 bg-muted/15 hover:bg-muted/30 cursor-pointer transition-colors">
                                  <Checkbox
                                    id={`conf-${item.id}`}
                                    checked={config.preProcurementConference}
                                    onCheckedChange={(checked) =>
                                      updateConfig(item.id, {
                                        preProcurementConference: !!checked,
                                      })
                                    }
                                  />
                                  <label
                                    htmlFor={`conf-${item.id}`}
                                    className="text-xs text-foreground cursor-pointer select-none font-semibold"
                                  >
                                    Pre-procurement Conference
                                  </label>
                                </div>
                              </div>

                              {/* Row 4: Remarks */}
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1">
                                  <label className="text-xs font-semibold text-foreground">
                                    Remarks / Notes
                                  </label>
                                  <FieldDescriptionTooltip fieldKey="remarks" className="h-3.5 w-3.5" />
                                </div>
                                <Textarea
                                  placeholder="Any specific comments or justifications..."
                                  value={config.remarks || ''}
                                  onChange={(e) =>
                                    updateConfig(item.id, {
                                      remarks: e.target.value,
                                    })
                                  }
                                  className="text-xs min-h-14 border-default-200"
                                />
                              </div>
                            </div>

                            {/* ========================================================= */}
                            {/* SECTION C: MONTHLY QUANTITY DISTRIBUTION                  */}
                            {/* ========================================================= */}
                            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3.5 shadow-2xs">
                              <div className="flex items-center justify-between pb-2 border-b border-border/60 flex-wrap gap-2">
                                <div className="flex items-center gap-2.5">
                                  <Checkbox
                                    id={`alloc-${item.id}`}
                                    checked={config.enableAllocations}
                                    onCheckedChange={(checked) =>
                                      updateConfig(item.id, {
                                        enableAllocations: !!checked,
                                      })
                                    }
                                  />
                                  <label
                                    htmlFor={`alloc-${item.id}`}
                                    className="text-xs font-bold text-foreground cursor-pointer select-none flex items-center gap-1.5"
                                  >
                                    Monthly Quantity Distribution
                                    <span className="text-[11px] font-normal text-muted-foreground">(Optional schedule)</span>
                                  </label>
                                </div>

                                {config.enableAllocations && (
                                  <div className="flex items-center gap-2">
                                    {hasAllocError ? (
                                      <Badge variant="soft" className="text-[10px] px-2 py-0.5 font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                                        ⚠ Over-allocated by {allocatedQty - plannedQty}
                                      </Badge>
                                    ) : allocatedQty === plannedQty && plannedQty > 0 ? (
                                      <Badge variant="soft" className="text-[10px] px-2 py-0.5 font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                        ✓ Fully allocated ({allocatedQty} / {plannedQty})
                                      </Badge>
                                    ) : allocatedQty > 0 ? (
                                      <Badge variant="soft" className="text-[10px] px-2 py-0.5 font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                                        {allocatedQty} / {plannedQty} allocated ({remainingQty} remaining)
                                      </Badge>
                                    ) : (
                                      <Badge variant="soft" className="text-[10px] px-2 py-0.5 font-medium text-muted-foreground bg-muted/40">
                                        Not yet distributed
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>

                              {config.enableAllocations && (
                                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 text-xs text-muted-foreground font-medium flex-wrap gap-2">
                                    <div className="flex items-center gap-3">
                                      <span>Planned: <strong className="text-foreground">{plannedQty}</strong></span>
                                      <span>·</span>
                                      <span>Allocated: <strong className={cn(hasAllocError ? 'text-red-500 font-bold' : 'text-foreground')}>{allocatedQty}</strong></span>
                                      <span>·</span>
                                      <span>Remaining: <strong className="text-foreground">{remainingQty}</strong></span>
                                    </div>
                                    {hasAllocError && (
                                      <span className="text-red-500 font-bold text-xs">
                                        ⚠ Exceeds planned quantity by {allocatedQty - plannedQty}
                                      </span>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                    {MONTH_NAMES.map((month) => {
                                      const val =
                                        config.monthlyQuantities[month] || ''
                                      return (
                                        <div key={month} className="space-y-1">
                                          <span className="text-[9px] uppercase font-bold text-muted-foreground block text-center">
                                            {month.substring(0, 3)}
                                          </span>
                                          <Input
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            value={val}
                                            onChange={(e) => {
                                              const qty = Math.max(
                                                0,
                                                Number.parseInt(e.target.value) ||
                                                  0,
                                              )
                                              const monthlyQuantities = {
                                                ...config.monthlyQuantities,
                                                [month]: qty,
                                              }
                                              updateConfig(item.id, {
                                                monthlyQuantities,
                                              })
                                            }}
                                            className="text-xs h-8 text-center border-default-200 focus-visible:ring-primary/20"
                                          />
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </ResponsiveDialog>

      <ConfirmAlertDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title="Discard Selection?"
        description="Are you sure you want to close this window? All your selected items and configurations will be lost."
        onConfirm={forceClose}
        onCancel={() => setConfirmCloseOpen(false)}
        confirmLabel="Discard & Close"
        cancelLabel="Keep Selection"
      />

      <Sheet
        open={!!detailsItemId}
        onOpenChange={(open) => {
          if (!open) {
            setDetailsItemId(null)
            setDetailsItemType(null)
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-background border-l border-border flex flex-col h-full p-6 shadow-2xl animate-in slide-in-from-right duration-200"
        >
          {isDetailLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs">Loading item details...</p>
            </div>
          ) : detailData ? (
            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pr-2">
              <SheetHeader className="border-b border-border pb-4">
                <Badge
                  variant="soft"
                  color={detailsItemType === 'cse' ? 'success' : 'info'}
                  className="w-fit mb-2"
                >
                  {detailsItemType === 'cse'
                    ? 'CSE / PS-DBM Item'
                    : 'Non-CSE / Agency Item'}
                </Badge>
                <SheetTitle className="text-base font-bold text-foreground">
                  {detailData.name || 'Unnamed Item'}
                </SheetTitle>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  Product Code: {detailData.productCode || detailData.id}
                </p>
              </SheetHeader>

              {/* Image */}
              {(detailData as ProcurementItem).imageURL && (
                <div className="flex items-center justify-center w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 relative group shadow-sm transition-all hover:shadow-md">
                  <DocumentViewer
                    src={(detailData as ProcurementItem).imageURL}
                    alt={detailData.name}
                    size="full"
                    aspectRatio="square"
                    className="max-h-55 max-w-55 border-none shadow-none bg-transparent hover:shadow-none mx-auto"
                    enableLightbox={true}
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-white/80 backdrop-blur border border-slate-100 px-2 py-0.5 rounded-md pointer-events-none">
                    Click to zoom
                  </div>
                </div>
              )}

              {/* Details fields */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Unit of Measure
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block">
                      {detailData.uomName || 'pcs'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Category
                    </span>
                    <span className="font-semibold text-foreground mt-0.5 block truncate">
                      {detailsItemType === 'cse'
                        ? (detailData as ProcurementItem).objectCodeName ||
                          'N/A'
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Description/Specifications */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Specifications
                  </span>
                  <p className="text-foreground leading-relaxed mt-1 text-xs bg-muted/20 p-3 rounded-lg border border-border/40 whitespace-pre-wrap">
                    {detailsItemType === 'cse'
                      ? (detailData as ProcurementItem).specifications ||
                        'No specifications provided.'
                      : 'No description provided.'}
                  </p>
                </div>

                {/* Metadata Fields */}
                <div className="space-y-3 border-t border-border/40 pt-4">
                  {detailsItemType === 'cse' &&
                    (detailData as ProcurementItem).type && (
                      <div className="flex justify-between py-1 border-b border-border/20">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-semibold text-foreground">
                          {(detailData as ProcurementItem).type}
                        </span>
                      </div>
                    )}
                  {detailsItemType === 'cse' &&
                    typeof (detailData as ProcurementItem).itemLife ===
                      'number' && (
                      <div className="flex justify-between py-1 border-b border-border/20">
                        <span className="text-muted-foreground">
                          Item Life:
                        </span>
                        <span className="font-semibold text-foreground">
                          {(detailData as ProcurementItem).itemLife} year(s)
                        </span>
                      </div>
                    )}
                  {detailsItemType === 'cse' &&
                    typeof (detailData as ProcurementItem).unitPrice ===
                      'number' && (
                      <div className="flex justify-between py-1 border-b border-border/20">
                        <span className="text-muted-foreground">
                          Catalog Unit Price:
                        </span>
                        <span className="font-semibold text-primary">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(
                            (detailData as ProcurementItem).unitPrice ?? 0,
                          )}
                        </span>
                      </div>
                    )}
                  {detailsItemType === 'non-cse' &&
                    typeof (detailData as NONCSEItem).currentPrice ===
                      'number' && (
                      <div className="flex justify-between py-1 border-b border-border/20">
                        <span className="text-muted-foreground">
                          Catalog Price:
                        </span>
                        <span className="font-semibold text-primary">
                          {new Intl.NumberFormat('en-PH', {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(
                            (detailData as NONCSEItem).currentPrice ?? 0,
                          )}
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
              Failed to load product details.
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Contextual Request Item Dialog */}
      <RequestItemDialog
        open={requestItemDialogOpen}
        onOpenChange={setRequestItemDialogOpen}
        initialOfficeId={officeId}
        ppmpContext={{
          ppmpId: ppmpExpenditureItemId,
          ppmpTitle,
          fiscalYear,
          officeId,
          officeName,
          expenditureItemTitle,
        }}
      />
    </>
  )
}
