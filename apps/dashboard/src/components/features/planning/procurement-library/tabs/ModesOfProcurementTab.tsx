import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Search,
  Grid3x3,
  List,
  MoreHorizontal,
  Eye,
  Package,
  Archive,
  Plus,
  ShoppingCart,
  Building2,
  Users,
  Loader2,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import DebouncedInput from '@/components/DebouncedInput'
import PermissionCheck from '@/components/PermissionCheck'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateModeOfProcurementDialog } from '../modes-of-procurement'
import { CreateThresholdDialog } from '../modes-of-procurement'
import { EditModeOfProcurementDialog } from '../modes-of-procurement'
import { ArchiveModeConfirmationDialog } from '../modes-of-procurement'
import { ModeDetailsView } from '../modes-of-procurement'
import { CreateSubModeDialog } from '../modes-of-procurement'
import { EditSubModeDialog } from '../modes-of-procurement'
import { DeleteSubModeConfirmationDialog } from '../modes-of-procurement'
import { useToast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ModeOfProcurement } from '../types'
import type { MetaActions } from '@/types/global'
import {
  useProcurementModes,
  useArchiveProcurementMode,
  useUnarchiveProcurementMode,
} from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementModes'
import { useQueryClient } from 'erpez-shared-lib'
import { mapProcurementModeToDisplay } from '@/lib/fiscal-year-and-policies/mappers/procurementModesMappers'
import { hasThresholdConfiguration as checkHasThresholdConfiguration } from '../utils'
import {
  getMockSubModesForParent,
  removeMockSubMode,
  seedMockSubModes,
  type SubProcurementMode,
} from '../modes-of-procurement/mockSubModes'
export function ModesOfProcurementTab() {
  const SHOW_SUBMODES = true
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const actions: MetaActions = ['write', 'delete', 'read']

  // Fetch modes from API
  const {
    data: modesResponse,
    isLoading,
    error,
  } = useProcurementModes({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  // Map API response to display format
  const modes: ModeOfProcurement[] = useMemo(() => {
    if (!modesResponse?.data) return []
    return modesResponse.data
      .filter((mode) => mode != null)
      .map(mapProcurementModeToDisplay)
  }, [modesResponse])

  // Archive/Unarchive mutations
  const { mutateAsync: archiveMode, isPending: isArchiving } =
    useArchiveProcurementMode()
  const { mutateAsync: unarchiveMode, isPending: isUnarchiving } =
    useUnarchiveProcurementMode()

  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [categorySearchTerm, setCategorySearchTerm] = useState('')
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('list')
  const [showArchived, setShowArchived] = useState(false)
  const [currentPageActive, setCurrentPageActive] = useState(1)
  const [currentPageArchived, setCurrentPageArchived] = useState(1)
  const [editingMode, setEditingMode] = useState<ModeOfProcurement | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archivingModeId, setArchivingModeId] = useState<string | null>(null)
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false)
  const [thresholdMode, setThresholdMode] = useState<ModeOfProcurement | null>(
    null,
  )
  const [viewMode, setViewMode] = useState<
    'categories' | 'modes' | 'details' | 'audit-log'
  >('modes')
  const [selectedMode, setSelectedMode] = useState<ModeOfProcurement | null>(
    null,
  )

  // Sub-mode state
  const [subModeDialogOpen, setSubModeDialogOpen] = useState(false)
  const [subModeParent, setSubModeParent] = useState<ModeOfProcurement | null>(null)
  // Tracks which parent cards have their sub-modes expanded
  const [expandedSubModes, setExpandedSubModes] = useState<Set<string>>(new Set())
  // Triggers re-render after mock store mutations
  const [subModeTick, setSubModeTick] = useState(0)
  const bumpSubModeTick = useCallback(() => setSubModeTick((n) => n + 1), [])
  // Edit sub-mode
  const [editSubModeOpen, setEditSubModeOpen] = useState(false)
  const [editingSubMode, setEditingSubMode] = useState<SubProcurementMode | null>(null)
  const [editingSubModeParent, setEditingSubModeParent] = useState<ModeOfProcurement | null>(null)
  // Delete sub-mode
  const [deleteSubModeOpen, setDeleteSubModeOpen] = useState(false)
  const [deletingSubMode, setDeletingSubMode] = useState<SubProcurementMode | null>(null)

  // Category definitions with colors and icons
  const categoryConfig = {
    'Goods and Services': {
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
      icon: ShoppingCart,
    },
    Infrastructure: {
      color: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
      icon: Building2,
    },
    'Consulting Services': {
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
      icon: Users,
    },
    '': {
      color: 'bg-gray-50',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200',
      icon: Package,
    },
  }

  // Get unique category names from modes
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>(
      modes.map((m) => m.categoryName ?? ''),
    )
    return Array.from(uniqueCategories)
  }, [modes])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPageActive(1)
    setCurrentPageArchived(1)
  }, [searchTerm])

  useEffect(() => {
    if (!selectedMode) return

    const refreshedMode = modes.find((mode) => mode.id === selectedMode.id)
    if (refreshedMode) {
      setSelectedMode(refreshedMode)
    }
  }, [modes, selectedMode?.id])

  // Seed demo sub-modes once real modes are loaded (no-op on subsequent renders)
  useEffect(() => {
    if (!SHOW_SUBMODES || modes.length === 0) return
    seedMockSubModes(
      modes.map((m) => ({
        id: m.id,
        modeName: m.modeName,
        minThreshold: m.minThreshold ?? 0,
        maxThreshold: m.maxThreshold ?? null,
        categoryId: m.categoryId,
        categoryName: m.categoryName,
      })),
    )
    // Auto-expand the first two modes by default
    setExpandedSubModes(new Set(modes.slice(0, 2).map((m) => m.id)))
    bumpSubModeTick()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modes.length > 0, SHOW_SUBMODES])

  // Get mode count for a category
  const getModeCountForCategory = (category: string) => {
    return modes.filter((mode) => {
      const categoryMatch =
        category === '' ? !mode.categoryName : mode.categoryName === category
      return categoryMatch && !mode.isArchived
    }).length
  }

  // Get modes for a category (or all categories if category is null)
  const getModesForCategory = (category: string | null) => {
    return modes
      .filter((mode) => {
        const matchesCategory = category ? mode.categoryName === category : true
        const matchesSearch =
          mode.modeName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false
        const matchesArchive = showArchived ? mode.isArchived : !mode.isArchived
        return matchesCategory && matchesSearch && matchesArchive
      })
      .sort((a, b) => (a.modeName ?? '').localeCompare(b.modeName ?? ''))
  }

  // Pagination
  const ITEMS_PER_PAGE = 10
  const currentPage = showArchived ? currentPageArchived : currentPageActive
  const setCurrentPage = showArchived
    ? setCurrentPageArchived
    : setCurrentPageActive

  const getPaginatedModes = () => {
    const allFilteredModes = getModesForCategory(null)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return allFilteredModes.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    const allFilteredModes = getModesForCategory(null)
    return Math.ceil(allFilteredModes.length / ITEMS_PER_PAGE)
  }

  // ... rest of handler functions remain the same but using API calls instead of state mutations
  const handleCreateSuccess = () => {
    // Toast is already shown in CreateModeOfProcurementDialog
    // Just ensure UI state is reset
  }

  const handleEditMode = (mode: ModeOfProcurement) => {
    setEditingMode(mode)
    setEditDialogOpen(true)
  }

  const handleUpdateMode = () => {
    // Toast is already shown in EditModeOfProcurementDialog
    // Just close the dialog
    setEditDialogOpen(false)
    setEditingMode(null)
  }

  const handleArchiveMode = (modeId: string) => {
    setArchivingModeId(modeId)
    setArchiveDialogOpen(true)
  }

  const handleConfirmArchive = async () => {
    if (!archivingModeId) return

    const modeToArchive = modes.find((mode) => mode.id === archivingModeId)
    if (!modeToArchive) return

    const isArchiving = !modeToArchive.isArchived

    try {
      if (isArchiving) {
        await archiveMode(
          { pathParams: { id: archivingModeId } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey.some(
                    (key) =>
                      typeof key === 'string' &&
                      key.includes('/procurement-modes'),
                  ),
              })
            },
          },
        )
      } else {
        await unarchiveMode(
          { pathParams: { id: archivingModeId } },
          {
            onSuccess: () => {
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  query.queryKey.some(
                    (key) =>
                      typeof key === 'string' &&
                      key.includes('/procurement-modes'),
                  ),
              })
            },
          },
        )
      }

      if (selectedMode?.id === archivingModeId && isArchiving) {
        setViewMode('modes')
        setSelectedMode(null)
      }

      toast({
        title: 'Success',
        description: `Mode "${modeToArchive.modeName}" has been ${isArchiving ? 'archived' : 'restored from archive'}.`,
        color: 'info',
      })

      setArchiveDialogOpen(false)
      setArchivingModeId(null)
    } catch (error) {
      console.error('Error archiving mode:', error)
      toast({
        title: 'Error',
        description: 'Failed to archive mode. Please try again.',
        color: 'destructive',
      })
    }
  }

  const handleViewModeDetails = (mode: ModeOfProcurement) => {
    setSelectedMode(mode)
    setViewMode('details')
  }

  const handleOpenThresholdDialog = (mode: ModeOfProcurement) => {
    setThresholdMode(mode)
    setThresholdDialogOpen(true)
  }

  const handleThresholdDialogOpenChange = (open: boolean) => {
    setThresholdDialogOpen(open)
    if (!open) {
      setThresholdMode(null)
    }
  }

  const handleOpenSubModeDialog = (mode: ModeOfProcurement) => {
    setSubModeParent(mode)
    setSubModeDialogOpen(true)
  }

  const handleSubModeCreated = (subMode: SubProcurementMode) => {
    // Auto-expand parent card to show the new entry
    setExpandedSubModes((prev) => new Set([...prev, subMode.parentModeId]))
    bumpSubModeTick()
  }

  const handleOpenEditSubMode = (sub: SubProcurementMode, parent: ModeOfProcurement) => {
    setEditingSubMode(sub)
    setEditingSubModeParent(parent)
    setEditSubModeOpen(true)
  }

  const handleSubModeEdited = () => {
    bumpSubModeTick()
  }

  const handleOpenDeleteSubMode = (sub: SubProcurementMode) => {
    setDeletingSubMode(sub)
    setDeleteSubModeOpen(true)
  }

  const handleConfirmDeleteSubMode = () => {
    if (!deletingSubMode) return
    const name = deletingSubMode.modeName
    removeMockSubMode(deletingSubMode.id)
    bumpSubModeTick()
    setDeleteSubModeOpen(false)
    setDeletingSubMode(null)
    toast({
      title: 'Sub-mode deleted',
      description: `"${name}" has been permanently deleted.`,
      color: 'destructive',
    })
  }

  const toggleSubModeExpansion = (modeId: string) => {
    setExpandedSubModes((prev) => {
      const next = new Set(prev)
      if (next.has(modeId)) {
        next.delete(modeId)
      } else {
        next.add(modeId)
      }
      return next
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading procurement modes...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return (
      <div className="text-red-600 p-4 bg-red-50 rounded border border-red-200">
        Error loading procurement modes: {errorMessage}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* CATEGORY VIEW */}
      {viewMode === 'categories' ? (
        <>
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold">Modes of Procurement</h2>
            <p className="text-sm text-muted-foreground">
              Browse procurement modes organized by category
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between w-full">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search categories"
                value={categorySearchTerm}
                onChange={setCategorySearchTerm}
                className="w-full pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <PermissionCheck action="write" actions={actions}>
                <CreateModeOfProcurementDialog
                  actions={actions}
                  onCreateSuccess={handleCreateSuccess}
                  existingModes={modes}
                />
              </PermissionCheck>
              <div className="flex gap-1 border rounded-md p-0 h-10">
                <Button
                  variant={displayMode === 'grid' ? 'soft' : 'ghost'}
                  size="sm"
                  onClick={() => setDisplayMode('grid')}
                  className="gap-1 rounded-none rounded-l-md"
                  title="Grid View"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={displayMode === 'list' ? 'soft' : 'ghost'}
                  size="sm"
                  onClick={() => setDisplayMode('list')}
                  className="gap-1 rounded-none rounded-r-md"
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Categories List */}
          {displayMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .filter((category: string) =>
                  category
                    .toLowerCase()
                    .includes(categorySearchTerm.toLowerCase()),
                )
                .map((category: string) => {
                  const config =
                    categoryConfig[category as keyof typeof categoryConfig] ||
                    categoryConfig['']
                  const IconComponent = config.icon
                  const modeCount = getModeCountForCategory(category)
                  const borderColor =
                    category === 'Goods and Services'
                      ? 'border-l-blue-500'
                      : category === 'Infrastructure'
                        ? 'border-l-green-500'
                        : category === 'Consulting Services'
                          ? 'border-l-purple-500'
                          : 'border-l-gray-500'

                  return (
                    <div
                      key={category}
                      className={`bg-white border border-gray-200 border-l-4 ${borderColor} rounded-lg p-5 transition-all hover:shadow-md group flex flex-col gap-4`}
                    >
                      {/* Top Section - Icon and Title */}
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          <div
                            className={`${config.color} border ${config.borderColor} rounded-lg p-4 flex items-center justify-center`}
                          >
                            <IconComponent
                              className={`${config.iconColor} w-6 h-6`}
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900">
                            {category || 'No Category'}
                          </h3>
                        </div>
                      </div>

                      {/* Middle Section - Description */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          Contains{' '}
                          <span className="font-semibold">{modeCount}</span>{' '}
                          procurement {modeCount === 1 ? 'mode' : 'modes'}
                        </p>
                      </div>

                      {/* Bottom Section - Button */}
                      <div className="shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewMode('modes')
                            setSearchTerm('')
                          }}
                          className="gap-2 w-full"
                        >
                          <Eye className="w-4 h-4" />
                          View Modes
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="space-y-4">
              {categories
                .filter((category: string) =>
                  category
                    .toLowerCase()
                    .includes(categorySearchTerm.toLowerCase()),
                )
                .map((category: string) => {
                  const config =
                    categoryConfig[category as keyof typeof categoryConfig] ||
                    categoryConfig['']
                  const IconComponent = config.icon
                  const modeCount = getModeCountForCategory(category)
                  const borderColor =
                    category === 'Goods and Services'
                      ? 'border-l-blue-500'
                      : category === 'Infrastructure'
                        ? 'border-l-green-500'
                        : category === 'Consulting Services'
                          ? 'border-l-purple-500'
                          : 'border-l-gray-500'

                  return (
                    <div
                      key={category}
                      className={`bg-white border border-gray-200 border-l-4 ${borderColor} rounded-lg p-5 transition-all hover:shadow-md group flex items-center justify-between gap-4`}
                    >
                      {/* Left Section - Icon */}
                      <div className="shrink-0">
                        <div
                          className={`${config.color} border ${config.borderColor} rounded-lg p-4 flex items-center justify-center`}
                        >
                          <IconComponent
                            className={`${config.iconColor} w-6 h-6`}
                          />
                        </div>
                      </div>

                      {/* Middle Section - Category Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900">
                          {category || 'No Category'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Contains{' '}
                          <span className="font-semibold">{modeCount}</span>{' '}
                          procurement {modeCount === 1 ? 'mode' : 'modes'}
                        </p>
                      </div>

                      {/* Right Section - View Button */}
                      <div className="shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewMode('modes')
                            setSearchTerm('')
                          }}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Modes
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </>
      ) : viewMode === 'modes' ? (
        /* MODES VIEW */
        <>
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold">All Procurement Modes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              List of all procurement modes with category indicators
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center w-full gap-4 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <DebouncedInput
                placeholder="Search procurement modes"
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full pl-10"
              />
            </div>
            <div className="flex gap-2 ml-auto items-center">
              <PermissionCheck action="write" actions={actions}>
                <CreateModeOfProcurementDialog
                  actions={actions}
                  onCreateSuccess={handleCreateSuccess}
                  existingModes={modes}
                />
              </PermissionCheck>
              <Button
                variant={showArchived ? 'soft' : 'outline'}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="gap-2"
              >
                <Archive className="w-4 h-4" />
                {showArchived ? 'Show Active' : 'Show Archived'}
              </Button>
            </div>
          </div>

          {/* Modes List */}
          {getPaginatedModes().length > 0 ? (
            <div className="space-y-3">
              {getPaginatedModes().map((mode) => {
                const config =
                  categoryConfig[
                    mode.categoryName as keyof typeof categoryConfig
                  ] || categoryConfig['']
                const IconComponent = config.icon
                const hasThresholdConfiguration =
                  checkHasThresholdConfiguration(mode)
                // Sub-modes from mock store (re-evaluated on subModeTick)
                const subModes: SubProcurementMode[] =
                  SHOW_SUBMODES && subModeTick >= 0 ? getMockSubModesForParent(mode.id) : []
                const isExpanded = expandedSubModes.has(mode.id)

                return (
                  <div
                    key={mode.id}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* ── Parent mode card ── */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left Section - Icon */}
                        <div className="shrink-0">
                          <div
                            className={`${config.color} border ${config.borderColor} rounded-xl p-3 flex items-center justify-center`}
                          >
                            <IconComponent
                              className={`${config.iconColor} w-5 h-5`}
                            />
                          </div>
                        </div>

                        {/* Middle Section - Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 mb-2">
                            {mode.modeName}
                          </h3>

                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {mode.categoryName || 'No Category'}
                            </Badge>
                            <Badge
                              color={mode.isActive ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {mode.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {subModes.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs gap-1 border-violet-300 text-violet-700 bg-violet-50"
                              >
                                <GitBranch className="w-3 h-3" />
                                {subModes.length} sub-mode{subModes.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>

                          {/* Description */}
                          {mode.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {mode.description}
                            </p>
                          )}

                          {/* Threshold Status Strip */}
                          <div
                            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${hasThresholdConfiguration ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${hasThresholdConfiguration ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              />
                              <span
                                className={`text-sm font-medium ${hasThresholdConfiguration ? 'text-emerald-800' : 'text-amber-800'}`}
                              >
                                {hasThresholdConfiguration
                                  ? 'Threshold configured'
                                  : 'No threshold configured'}
                              </span>
                            </div>

                            {!hasThresholdConfiguration && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                                onClick={() => handleOpenThresholdDialog(mode)}
                              >
                                <Plus className="w-4 h-4" />
                                Create Threshold
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Expand/collapse sub-modes toggle */}
                          {subModes.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                              title={isExpanded ? 'Collapse sub-modes' : 'Expand sub-modes'}
                              onClick={() => toggleSubModeExpansion(mode.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <PermissionCheck action="read" actions={actions}>
                                <DropdownMenuItem
                                  onClick={() => handleViewModeDetails(mode)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </PermissionCheck>
                              {SHOW_SUBMODES && (
                                <PermissionCheck action="write" actions={actions}>
                                  <TooltipProvider delayDuration={200}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        {/* span needed so Tooltip works on disabled elements */}
                                        <span>
                                          <DropdownMenuItem
                                            disabled={!hasThresholdConfiguration}
                                            onClick={() =>
                                              hasThresholdConfiguration &&
                                              handleOpenSubModeDialog(mode)
                                            }
                                            className={
                                              !hasThresholdConfiguration
                                                ? 'opacity-50 cursor-not-allowed'
                                                : ''
                                            }
                                          >
                                            <GitBranch className="w-4 h-4 mr-2" />
                                            Add Sub-Mode
                                          </DropdownMenuItem>
                                        </span>
                                      </TooltipTrigger>
                                      {!hasThresholdConfiguration && (
                                        <TooltipContent side="left" className="max-w-56">
                                          A threshold must be configured on this mode before
                                          sub-modes can be added.
                                        </TooltipContent>
                                      )}
                                    </Tooltip>
                                  </TooltipProvider>
                                </PermissionCheck>
                              )}
                              <DropdownMenuSeparator />
                              <PermissionCheck action="write" actions={actions}>
                                <DropdownMenuItem
                                  onClick={() => handleArchiveMode(mode.id)}
                                  className="text-orange-600 focus:text-orange-600"
                                >
                                  <Archive className="w-4 h-4 mr-2" />
                                  {mode.isArchived ? 'Restore' : 'Archive'}
                                </DropdownMenuItem>
                              </PermissionCheck>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* ── Sub-modes panel ── */}
                    {subModes.length > 0 && isExpanded && (
                      <div className="border-t border-violet-100 bg-violet-50/40 px-5 py-3 space-y-2">
                        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">
                          Sub-Modes
                        </p>
                        {subModes.map((sub) => {
                          const parentMin = mode.minThreshold ?? 0
                          const parentMax = mode.maxThreshold ?? null
                          const subMin = sub.minThreshold
                          const subMax = sub.maxThreshold

                          const isWithinBounds =
                            subMin >= parentMin &&
                            (parentMax === null || subMax === null || subMax <= parentMax)

                          return (
                            <div
                              key={sub.id}
                              className="flex items-center gap-3 rounded-xl border border-violet-200 bg-white px-4 py-3"
                            >
                              <GitBranch className="w-4 h-4 text-violet-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-800">
                                  {sub.modeName}
                                </span>
                                {sub.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {sub.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground">
                                    ₱{subMin.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    {' – '}
                                    {subMax !== null
                                      ? `₱${subMax.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                                      : 'Unlimited'}
                                  </span>
                                  {!isWithinBounds && (
                                    <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                                      Out of parent range
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {/* Sub-mode actions: Edit + Delete */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 shrink-0 text-gray-400 hover:text-gray-700"
                                  >
                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <PermissionCheck action="write" actions={actions}>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenEditSubMode(sub, mode)}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  </PermissionCheck>
                                  <DropdownMenuSeparator />
                                  <PermissionCheck action="delete" actions={actions}>
                                    <DropdownMenuItem
                                      onClick={() => handleOpenDeleteSubMode(sub)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </PermissionCheck>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                        })}

                        {/* Quick-add button inside expanded panel */}
                        <PermissionCheck action="write" actions={actions}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-1 gap-2 border border-dashed border-violet-300 text-violet-600 hover:bg-violet-100 rounded-xl"
                            onClick={() => handleOpenSubModeDialog(mode)}
                          >
                            <Plus className="w-4 h-4" />
                            Add another sub-mode
                          </Button>
                        </PermissionCheck>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No modes found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'No procurement modes available'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  getModesForCategory(null).length,
                )}{' '}
                of {getModesForCategory(null).length} modes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {getTotalPages()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(getTotalPages(), prev + 1),
                    )
                  }
                  disabled={currentPage === getTotalPages()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : viewMode === 'details' && selectedMode ? (
        /* DETAILS VIEW */
        <ModeDetailsView
          mode={selectedMode}
          auditLogs={selectedMode?.auditLogs}
          onBack={() => {
            setViewMode('modes')
            setSelectedMode(null)
          }}
          onEdit={() => handleEditMode(selectedMode)}
          onViewAuditLog={() => setViewMode('audit-log')}
          actions={actions}
        />
      ) : viewMode === 'audit-log' && selectedMode ? (
        /* AUDIT LOG VIEW */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => setViewMode('details')}
                className="gap-2 -ml-4 mb-4"
              >
                ← Back to {selectedMode.modeName}
              </Button>
              <h2 className="text-2xl font-bold">Audit Log</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Activity history for {selectedMode.modeName}
              </p>
            </div>
          </div>

          {/* Audit Log Content */}
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                Audit logs not available
              </h3>
              <p className="text-muted-foreground">
                Audit logging is not currently enabled for procurement modes.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Global Dialogs */}
      {editingMode && (
        <EditModeOfProcurementDialog
          mode={editingMode}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEditSuccess={handleUpdateMode}
          existingModes={modes}
        />
      )}

      {/* Delete dialog removed until delete mutation is implemented.
        TODO: implement a useDeleteProcurementMode mutation, track deletingMode/deleteDialogOpen
        and wire onConfirm to call the mutation and invalidate queries. */}
      <ArchiveModeConfirmationDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        modeName={
          modes.find((mode) => mode.id === archivingModeId)?.modeName || ''
        }
        isArchiving={
          modes.find((mode) => mode.id === archivingModeId)?.isArchived ===
          false
        }
        onConfirm={handleConfirmArchive}
        isLoading={isArchiving || isUnarchiving}
      />

      {thresholdMode && (
        <CreateThresholdDialog
          mode={thresholdMode}
          actions={actions}
          open={thresholdDialogOpen}
          onOpenChange={handleThresholdDialogOpenChange}
        />
      )}

      {SHOW_SUBMODES && subModeParent && (
        <CreateSubModeDialog
          parentMode={subModeParent}
          open={subModeDialogOpen}
          onOpenChange={(open) => {
            setSubModeDialogOpen(open)
            if (!open) setSubModeParent(null)
          }}
          onCreateSuccess={handleSubModeCreated}
        />
      )}

      {SHOW_SUBMODES && editingSubMode && editingSubModeParent && (
        <EditSubModeDialog
          parentMode={editingSubModeParent}
          subMode={editingSubMode}
          open={editSubModeOpen}
          onOpenChange={(open) => {
            setEditSubModeOpen(open)
            if (!open) {
              setEditingSubMode(null)
              setEditingSubModeParent(null)
            }
          }}
          onEditSuccess={handleSubModeEdited}
        />
      )}

      {SHOW_SUBMODES && (
        <DeleteSubModeConfirmationDialog
          open={deleteSubModeOpen}
          onOpenChange={(open) => {
            setDeleteSubModeOpen(open)
            if (!open) setDeletingSubMode(null)
          }}
          subModeName={deletingSubMode?.modeName ?? ''}
          parentModeName={deletingSubMode?.parentModeName ?? null}
          onConfirm={handleConfirmDeleteSubMode}
        />
      )}
    </div>
  )
}
