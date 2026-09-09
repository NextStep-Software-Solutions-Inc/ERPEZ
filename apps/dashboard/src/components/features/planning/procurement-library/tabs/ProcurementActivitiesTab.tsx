import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Search,
  Grid3x3,
  List,
  MoreHorizontal,
  Clock,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import PermissionCheck from '@/components/PermissionCheck'
import { useToast } from '@/components/ui/use-toast'
import { EditProcurementActivityDialog } from '../procurement-activities/dialog/EditProcurementActivityDialog'
import { CreateProcurementActivityDialog } from '../procurement-activities/dialog/CreateProcurementActivityDialog'
import { DeleteProcurementActivityDialog } from '../procurement-activities/dialog/DeleteProcurementActivityDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DebouncedInput from '@/components/DebouncedInput'
import { useThemeStore } from '@/store'
import type { ProcurementActivity, ProcurementActivityFormData } from '../types'
import type { MetaActions } from '@/types/global'
import {
  useProcurementActivityTypes,
  useDeleteProcurementActivityType,
} from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes'
import type { ProcurementActivityType } from '@/lib/fiscal-year-and-policies/types/procurementActivityTypes'

// Helper function to map API data to component format
const mapActivityTypeToActivity = (
  activityType: ProcurementActivityType,
): ProcurementActivity => ({
  id: activityType.id,
  activityName: activityType.name || '',
  activityCode: activityType.activityCode,
  description: activityType.description || '',
  minDays: activityType.minDays || 0,
  maxDays: activityType.maxDays || 0,
  createdAt: activityType.createdAt,
  updatedAt: activityType.updatedAt || activityType.createdAt,
})

export function ProcurementActivitiesTab() {
  const { toast } = useToast()
  const actions: MetaActions = ['write', 'delete', 'read']

  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [editingActivity, setEditingActivity] =
    useState<ProcurementActivity | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activityToDelete, setActivityToDelete] =
    useState<ProcurementActivity | null>(null)

  useThemeStore()

  // Sieve filter for server-side search
  const sieveFilters = useMemo(() => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return undefined
    return `Name@=*${trimmed}|ActivityCode@=*${trimmed}|Description@=*${trimmed}`
  }, [searchTerm])

  // API hooks with dynamic pagination queryParams
  const {
    data: activityTypesData,
    isLoading,
    refetch,
  } = useProcurementActivityTypes({
    pathParams: {},
    queryParams: {
      pageNumber: pageNumber,
      pageSize,
      filters: sieveFilters,
    },
  })
  const { mutate: deleteActivityType, isPending: isDeleting } =
    useDeleteProcurementActivityType()

  // Map API data to component format
  const allData = useMemo(() => {
    if (!activityTypesData?.data) return []
    return activityTypesData.data
      .filter((activity) => activity.isActive) // Only show active activities
      .map(mapActivityTypeToActivity)
  }, [activityTypesData])

  // Filter data based on search term as safety client-side filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return allData
    const search = searchTerm.toLowerCase()
    return allData.filter(
      (activity) =>
        activity.activityName.toLowerCase().includes(search) ||
        (activity.activityCode &&
          activity.activityCode.toLowerCase().includes(search)) ||
        activity.description?.toLowerCase().includes(search) ||
        activity.minDays.toString().includes(search) ||
        activity.maxDays.toString().includes(search),
    )
  }, [allData, searchTerm])

  const totalCount = activityTypesData?.meta.totalItems ?? allData.length
  const totalPages =
    activityTypesData?.meta.totalPages ??
    Math.max(1, Math.ceil(totalCount / pageSize))
  const startItem = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1
  const endItem = Math.min(pageNumber * pageSize, totalCount)

  // Calculate visible page buttons with smart ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    pages.push(1)

    if (pageNumber > 4) {
      pages.push('ellipsis')
    }

    const start = Math.max(
      2,
      pageNumber - (pageNumber > totalPages - 3 ? 3 : 1),
    )
    const end = Math.min(totalPages - 1, pageNumber + (pageNumber < 4 ? 3 : 1))

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (pageNumber < totalPages - 3) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)

    return pages
  }, [totalPages, pageNumber])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPageNumber(1)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPageNumber(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage)
    }
  }

  const handleAddActivity = (newActivityData: ProcurementActivityFormData) => {
    refetch()
    toast({
      title: 'Success',
      description: `Activity "${newActivityData.activityName}" has been created successfully.`,
      color: 'success',
    })
  }

  const handleEditActivity = (activity: ProcurementActivity) => {
    setEditingActivity(activity)
    setEditDialogOpen(true)
  }

  const handleUpdateActivity = (
    data: ProcurementActivityFormData,
    _activityId: string | number,
  ) => {
    refetch()
    setEditDialogOpen(false)
    setEditingActivity(null)
    toast({
      title: 'Success',
      description: `Activity "${data.activityName}" has been updated successfully.`,
      color: 'warning',
    })
  }

  const handleDeleteActivity = (activity: ProcurementActivity) => {
    setActivityToDelete(activity)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteActivity = () => {
    if (!activityToDelete) return

    deleteActivityType(
      {
        pathParams: { id: String(activityToDelete.id) },
      },
      {
        onSuccess: () => {
          if (allData.length === 1 && pageNumber > 1) {
            setPageNumber((prev) => prev - 1)
          } else {
            refetch()
          }
          setDeleteDialogOpen(false)
          setActivityToDelete(null)
          toast({
            title: 'Success',
            description: 'Activity has been deleted successfully.',
            color: 'info',
          })
        },
        onError: (error) => {
          console.error('Error deleting activity:', error)
          toast({
            title: 'Error',
            description: 'Failed to delete activity. Please try again.',
            color: 'destructive',
          })
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">
          Procurement Activities & Timeline
        </h2>
        <p className="text-sm text-muted-foreground">
          Define procurement activities and timelines
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Bar - Left */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <DebouncedInput
            placeholder="Search activities..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10"
          />
        </div>

        {/* View Mode Toggle and Add Activity Button - Right */}
        <div className="ml-auto flex items-center gap-4">
          <CreateProcurementActivityDialog
            actions={actions}
            onCreateSuccess={handleAddActivity}
          />

          <div className="flex items-center gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-2"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading activities...</p>
        </div>
      ) : filteredData.length > 0 ? (
        <div className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((activity) => (
                <Card
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base truncate">
                              {activity.activityName}
                            </CardTitle>
                            {activity.activityCode && (
                              <span className="font-mono text-xs bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                                {activity.activityCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <PermissionCheck action="write" actions={actions}>
                            <DropdownMenuItem
                              onClick={() => handleEditActivity(activity)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionCheck>
                          <PermissionCheck action="delete" actions={actions}>
                            <DropdownMenuItem
                              onClick={() => handleDeleteActivity(activity)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </PermissionCheck>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-3 pt-0">
                    <div className="space-y-2 pt-2">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Description
                        </p>
                        <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">
                          {activity.description || 'No description provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Min Days
                        </p>
                        <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">
                          {activity.minDays} days
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Max Days
                        </p>
                        <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">
                          {activity.maxDays} days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((activity) => (
                <Card
                  key={activity.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-semibold truncate">
                              {activity.activityName}
                            </h3>
                            {activity.activityCode && (
                              <span className="font-mono text-xs bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                                {activity.activityCode}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Description
                            </p>
                            <p className="font-medium text-foreground mt-1">
                              {activity.description ||
                                'No description provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Min Days
                            </p>
                            <p className="font-medium text-foreground mt-1">
                              {activity.minDays} days
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Max Days
                            </p>
                            <p className="font-medium text-foreground mt-1">
                              {activity.maxDays} days
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                          <PermissionCheck action="write" actions={actions}>
                            <DropdownMenuItem
                              onClick={() => handleEditActivity(activity)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </PermissionCheck>
                          <PermissionCheck action="delete" actions={actions}>
                            <DropdownMenuItem
                              onClick={() => handleDeleteActivity(activity)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </PermissionCheck>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 bg-white rounded-lg p-4 shadow-xs">
            {/* Left: Summary */}
            <div className="text-xs sm:text-sm text-muted-foreground font-medium">
              Showing{' '}
              <span className="font-semibold text-foreground">{startItem}</span>{' '}
              to{' '}
              <span className="font-semibold text-foreground">{endItem}</span>{' '}
              of{' '}
              <span className="font-semibold text-foreground">
                {totalCount}
              </span>{' '}
              {totalCount === 1 ? 'activity' : 'activities'}
            </div>

            {/* Right: Page Size & Navigation */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-end">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Page size:
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(val) => handlePageSizeChange(Number(val))}
                >
                  <SelectTrigger className="h-8 w-[76px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(1)}
                  disabled={pageNumber <= 1}
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="sr-only">First Page</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 gap-1 text-xs"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Prev</span>
                </Button>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-1 text-xs text-muted-foreground select-none"
                        >
                          ...
                        </span>
                      )
                    }
                    return (
                      <Button
                        key={page}
                        variant={pageNumber === page ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 w-8 p-0 text-xs font-semibold transition-colors ${
                          pageNumber === page
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => handlePageChange(Number(page))}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 gap-1 text-xs"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={pageNumber >= totalPages}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={pageNumber >= totalPages}
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                  <span className="sr-only">Last Page</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full p-6 mb-6 border-2 border-gray-200">
            <Search className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No activities found
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            {searchTerm
              ? `No activities match "${searchTerm}". Try adjusting your search term.`
              : 'Try adjusting your search or add a new activity to get started with your procurement timeline.'}
          </p>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearchChange('')}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {editingActivity && (
        <EditProcurementActivityDialog
          activity={editingActivity}
          actions={actions}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEditSuccess={handleUpdateActivity}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {activityToDelete && (
        <DeleteProcurementActivityDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          activityName={activityToDelete.activityName}
          onConfirm={confirmDeleteActivity}
          isLoading={isDeleting}
        />
      )}
    </div>
  )
}
