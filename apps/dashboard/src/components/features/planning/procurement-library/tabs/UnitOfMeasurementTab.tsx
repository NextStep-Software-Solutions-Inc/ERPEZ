import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Info, Search, Grid3x3, List, MoreHorizontal, Ruler, Filter, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import DebouncedInput from '@/components/DebouncedInput'
import PermissionCheck from '@/components/PermissionCheck'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateUnitOfMeasurementDialog } from '../unit-of-measurement/dialog/CreateUnitOfMeasurementDialog'
import { EditUnitOfMeasurementDialog } from '../unit-of-measurement/dialog/EditUnitOfMeasurementDialog'
import { DeleteUnitOfMeasurementDialog } from '../unit-of-measurement/dialog/DeleteUnitOfMeasurementDialog'
import { ToggleUnitOfMeasurementDialog } from '../unit-of-measurement/dialog/ToggleUnitOfMeasurementDialog'
import { useToast } from '@/components/ui/use-toast'
import { useUOMs, useDeleteUOM } from '../unit-of-measurement/useUnitOfMeasurement'
import type { UnitOfMeasurement } from '../types'
import type { MetaActions } from '@/types/global'
import type { UOMApiItem } from '../unit-of-measurement/types'

/** Map API response item to the UI UnitOfMeasurement type */
function mapApiToUOM(item: UOMApiItem): UnitOfMeasurement {
  return {
    id: item.id,
    name: item.name ?? '',
    abbreviation: item.code ?? '',
    parentUnitId: item.parentId ?? undefined,
    parentUnitName: item.parentName ?? undefined,
    conversionFactor: item.conversionFactor ?? 1,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? item.createdAt,
    usedByActiveItems: false,
  }
}

export function UnitOfMeasurementTab() {
  const { toast } = useToast()
  const actions: MetaActions = ['write', 'delete', 'read']
  const [editingUom, setEditingUom] = useState<UnitOfMeasurement | null>(null)
  const [deletingUom, setDeletingUom] = useState<UnitOfMeasurement | null>(null)
  const [togglingUom, setTogglingUom] = useState<UnitOfMeasurement | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('list')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Fetch all UOMs from the API
  const { data: uomsData, isLoading, isError, refetch } = useUOMs({
    pathParams: {},
    queryParams: {},
  })

  const rawUoms = uomsData?.data ?? []
  const uoms: UnitOfMeasurement[] = rawUoms.map(mapApiToUOM).sort((a, b) => a.name.localeCompare(b.name))

  // Parent units options for the form (exclude the one being edited)
  const parentUnits = uoms.map(u => ({ id: u.id, name: u.name }))

  const { mutate: deleteUOM, isPending: isDeleteLoading } = useDeleteUOM()

  const handleDeleteUOM = () => {
    if (!deletingUom) return
    deleteUOM(
      { pathParams: { id: deletingUom.id } },
      {
        onSuccess: () => {
          setDeletingUom(null)
          refetch()
          toast({
            title: 'Success',
            description: 'Unit of Measurement deleted successfully.',
            color: 'info',
          })
        },
        onError: (error: unknown) => {
          console.error('Error deleting UOM:', error)
          toast({
            title: 'Error',
            description: 'Error deleting Unit of Measurement. Please try again.',
            color: 'destructive',
          })
        },
      }
    )
  }

  const handleToggleUOMStatus = () => {
    // Reuse the existing Edit dialog to perform the actual status update:
    // open the Edit dialog pre-filled with the same UOM but with flipped isActive.
    // This avoids introducing a new API hook here while making the toggle actionable.
    if (!togglingUom) return

    setEditingUom({
      ...togglingUom,
      isActive: !togglingUom.isActive,
    })
    setTogglingUom(null)

    toast({
      title: 'Info',
      description: `Opening edit dialog to ${!togglingUom.isActive ? 'activate' : 'deactivate'} the unit.`,
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  // Filter UOMs based on search term and status
  const filteredUoms = uoms.filter(uom => {
    const matchesSearch = uom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uom.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && uom.isActive) ||
                         (statusFilter === 'inactive' && !uom.isActive)
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading units of measurement...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          Failed to load units of measurement. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Units of Measurement</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and organize standardized measurement units for procurement</p>
        </div>
        <div className="flex items-center gap-2">
          <PermissionCheck action="write" actions={actions}>
            <CreateUnitOfMeasurementDialog
              actions={actions}
              parentUnits={parentUnits}
              onCreateSuccess={handleRefresh}
              onRefresh={handleRefresh}
            />
          </PermissionCheck>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Status: {statusFilter === 'all' ? 'All' : statusFilter === 'active' ? 'Active' : 'Inactive'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-1 border rounded-md p-0 h-10">
            <Button
              variant={displayMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDisplayMode('grid')}
              className="gap-1 rounded-none rounded-l-md"
              title="Grid View"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={displayMode === 'list' ? 'default' : 'ghost'}
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

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          Units cannot be deleted if they are assigned to active items. Some units have parent-child relationships for automatic conversion calculations.
        </AlertDescription>
      </Alert>

      {/* Search Bar */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <DebouncedInput
            placeholder="Search by unit name or abbreviation..."
            value={searchTerm}
            onChange={setSearchTerm}
            debounceMs={100}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background"
          />
        </div>
      </div>

      {/* Units Grid/List View */}
      {filteredUoms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No units found</h3>
          <p className="text-muted-foreground">Try adjusting your search or add a new unit.</p>
        </div>
      ) : (
        displayMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUoms.map((unit) => (
              <Card key={unit.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
                        <Ruler className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{unit.name} ({unit.abbreviation})</CardTitle>
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
                          <DropdownMenuItem onClick={() => setEditingUom(unit)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTogglingUom(unit)}>
                            {unit.isActive ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </PermissionCheck>
                        <PermissionCheck action="delete" actions={actions}>
                          <DropdownMenuItem
                            onClick={() => setDeletingUom(unit)}
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
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</p>
                      <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">{unit.parentUnitName ? 'Child Unit' : 'Base Unit'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent Unit</p>
                      <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">{unit.parentUnitName || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Factor</p>
                      <p className="text-sm font-medium text-foreground bg-gray-50 p-2 rounded mt-1">{unit.conversionFactor}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                      <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full border ${
                        unit.isActive
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {unit.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredUoms.map((unit) => (
              <Card key={unit.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0 mt-0.5">
                      <Ruler className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h3 className="text-base font-semibold truncate">{unit.name} ({unit.abbreviation})</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full border ${
                            unit.parentUnitName
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {unit.parentUnitName ? 'Child Unit' : 'Base Unit'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent</p>
                          <p className="font-medium text-foreground mt-1">{unit.parentUnitName || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversion Factor</p>
                          <p className="font-medium text-foreground mt-1">{unit.conversionFactor}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full border ${
                            unit.isActive
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {unit.isActive ? 'Active' : 'Inactive'}
                          </span>
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
                          <DropdownMenuItem onClick={() => setEditingUom(unit)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTogglingUom(unit)}>
                            {unit.isActive ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </PermissionCheck>
                        <PermissionCheck action="delete" actions={actions}>
                          <DropdownMenuItem
                            onClick={() => setDeletingUom(unit)}
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
      )}

      {/* Edit Dialog */}
      {editingUom && (
        <EditUnitOfMeasurementDialog
          actions={actions}
          uom={editingUom}
          open={!!editingUom}
          onOpenChange={(open) => !open && setEditingUom(null)}
          parentUnits={parentUnits.filter(p => p.id !== editingUom.id)}
          onUpdateSuccess={handleRefresh}
          onRefresh={handleRefresh}
        />
      )}

      {/* Delete Dialog */}
      {deletingUom && (
        <DeleteUnitOfMeasurementDialog
          open={!!deletingUom}
          onOpenChange={(open) => !open && setDeletingUom(null)}
          uomName={`${deletingUom.name} (${deletingUom.abbreviation})`}
          onConfirm={handleDeleteUOM}
          isLoading={isDeleteLoading}
        />
      )}

      {/* Toggle Status Dialog */}
      {togglingUom && (
        <ToggleUnitOfMeasurementDialog
          open={!!togglingUom}
          onOpenChange={(open) => !open && setTogglingUom(null)}
          uomName={`${togglingUom.name} (${togglingUom.abbreviation})`}
          isActive={togglingUom.isActive}
          onConfirm={handleToggleUOMStatus}
          isLoading={false}
        />
      )}
    </div>
  )
}
