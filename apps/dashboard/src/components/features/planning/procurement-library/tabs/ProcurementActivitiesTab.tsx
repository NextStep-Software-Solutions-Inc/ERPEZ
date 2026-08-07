import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Grid3x3, List, MoreHorizontal, Clock, Edit, Trash2 } from 'lucide-react'
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
const mapActivityTypeToActivity = (activityType: ProcurementActivityType): ProcurementActivity => ({
  id: activityType.id,
  activityName: activityType.name || '',
  description: activityType.description || '',
  minDays: activityType.minDays || 0,
  maxDays: activityType.maxDays || 0,
  createdAt: activityType.createdAt,
  updatedAt: activityType.updatedAt || activityType.createdAt,
})

export function ProcurementActivitiesTab() {
  const { toast } = useToast()
  const actions: MetaActions = ['write', 'delete', 'read']
  
  // API hooks
  const { data: activityTypesData, isLoading, refetch } = useProcurementActivityTypes({
    pathParams: {},
    queryParams: {},
  })
  const { mutate: deleteActivityType, isPending: isDeleting } = useDeleteProcurementActivityType()

  // Map API data to component format
  const allData = useMemo(() => {
    if (!activityTypesData?.data) return []
    return activityTypesData.data
      .filter(activity => activity.isActive) // Only show active activities
      .map(mapActivityTypeToActivity)
  }, [activityTypesData])

  const [editingActivity, setEditingActivity] = useState<ProcurementActivity | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState<ProcurementActivity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  useThemeStore()

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return allData
    const search = searchTerm.toLowerCase()
    return allData.filter(activity =>
      activity.activityName.toLowerCase().includes(search) ||
      activity.minDays.toString().includes(search) ||
      activity.maxDays.toString().includes(search)
    )
  }, [allData, searchTerm])

  const handleAddActivity = (newActivityData: ProcurementActivityFormData) => {
    // Refetch data after successful creation
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

  const handleUpdateActivity = (data: ProcurementActivityFormData, _activityId: string | number) => {
    // Refetch data after successful update
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
          refetch()
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
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Procurement Activities & Timeline</h2>
        <p className="text-sm text-muted-foreground">Define procurement activities and timelines</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search Bar - Left */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <DebouncedInput
            placeholder="Search activities..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full pl-10"
          />
        </div>

        {/* View Mode Toggle and Add Activity Button - Right */}
        <div className="ml-auto flex items-center gap-4">
          <CreateProcurementActivityDialog actions={actions} onCreateSuccess={handleAddActivity} />

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
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((activity) => (
              <Card key={activity.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{activity.activityName}</CardTitle>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <PermissionCheck action="write" actions={actions}>
                          <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
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
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
                      <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">{activity.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Days</p>
                      <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">{activity.minDays} days</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Days</p>
                      <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">{activity.maxDays} days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((activity) => (
              <Card key={activity.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h3 className="text-base font-semibold truncate">{activity.activityName}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
                          <p className="font-medium text-foreground mt-1">{activity.description || 'No description provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Days</p>
                          <p className="font-medium text-foreground mt-1">{activity.minDays} days</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Days</p>
                          <p className="font-medium text-foreground mt-1">{activity.maxDays} days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <PermissionCheck action="write" actions={actions}>
                          <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
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
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full p-6 mb-6 border-2 border-gray-200">
            <Search className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No activities found</h3>
          <p className="text-gray-500 text-center max-w-md">Try adjusting your search or add a new activity to get started with your procurement timeline.</p>
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
