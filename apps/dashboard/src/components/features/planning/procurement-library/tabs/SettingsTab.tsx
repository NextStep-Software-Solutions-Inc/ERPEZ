import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import type { Category, SupplierCategory, UNSPSCode } from '../types'
import { EditCategoryDialog } from './settings/dialog/EditCategoryDialog'
import { EditSupplierCategoryDialog } from './settings/dialog/EditSupplierCategoryDialog'
import { EditUNSPSCodeDialog } from './settings/dialog/EditUNSPSCodeDialog'
import { UNSPSCodeStatusToggleConfirmationDialog } from './settings/dialog/UNSPSCodeStatusToggleConfirmationDialog'
import {
  CategoryColumn,
  SupplierCategoryColumn,
  UNSPSCodeColumn,
  CategoryToolbar,
  SupplierCategoryToolbar,
  UNSPSCodeToolbar,
} from './settings/table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { SortingState, VisibilityState, ColumnFiltersState } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProcurementCategories } from '@/lib/fiscal-year-and-policies/requests/hooks/useProcurementCategories'
import { useSupplierCategories } from '@/lib/fiscal-year-and-policies/requests/hooks/useSupplierCategories'
import { 
  useUNSPSCCodes,
  useCreateUNSPSCCode,
  useUpdateUNSPSCCode,
  useDeleteUNSPSCCode
} from '@/lib/fiscal-year-and-policies/requests/hooks/useUNSPSCCodes'
import { useQueryClient } from 'erpez-shared-lib'
import type { ProcurementCategory } from '@/lib/fiscal-year-and-policies/procurement-threshold.types'
import type { SupplierCategory as APISupplierCategory } from '@/lib/fiscal-year-and-policies/supplier-category.types'
import type { UNSPSCCode as APIUNSPSCCode } from '@/lib/fiscal-year-and-policies/unspsc-code.types'
import type { MetaActions } from '@/types/global'

// Map API ProcurementCategory to local Category type
function mapApiCategoryToLocal(apiCategory: ProcurementCategory): Category {
  return {
    id: apiCategory.id,
    name: apiCategory.name ?? '',
    description: apiCategory.description,
    status: 'active',
    // TODO: Map isInUse from API response once backend provides this field
    // This field indicates whether the category is referenced by any procurement modes
    isInUse: false,
    createdAt: apiCategory.createdAt,
    updatedAt: apiCategory.updatedAt,
  }
}

// Map API SupplierCategory to local SupplierCategory type
function mapApiSupplierCategoryToLocal(apiCategory: APISupplierCategory): SupplierCategory {
  return {
    id: apiCategory.id,
    name: apiCategory.name ?? '',
    description: apiCategory.description,
    createdAt: apiCategory.createdAt,
    updatedAt: apiCategory.updatedAt,
  }
}

// Map API UNSPSCCode to local UNSPSCode type
function mapApiUNSPSCCodeToLocal(apiCode: APIUNSPSCCode): UNSPSCode {
  return {
    id: apiCode.id,
    Key: apiCode.code ?? apiCode.id, // use the code for display; fall back to id if code is null
    ParentId: apiCode.parentId ?? undefined,
    ParentName: apiCode.parentName ?? undefined,
    Name: apiCode.name ?? '',
    Code: apiCode.code ?? '',
    Level: apiCode.level,
    IsActive: apiCode.isActive,
    createdAt: apiCode.createdAt,
    updatedAt: apiCode.updatedAt ?? apiCode.createdAt,
    deletedAt: null,
  }
}

 // Form data type used by add/edit UNSPSC dialogs and handlers.
 // Keys use the same casing as the local UNSPSCode shape and the dialog forms.
 type UNSPSCodeFormData = {
   Code?: string | null
   Name?: string | null
   Level: number
   ParentId?: string | null
 }

export function SettingsTab() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const actions: MetaActions = ['write', 'delete', 'read']
  const [activeTab, setActiveTab] = useState<'categories' | 'supplier-categories' | 'unspsc'>('categories')

  // --- Real API: Categories ---
  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useProcurementCategories({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const categories: Category[] = useMemo(() => {
    if (!categoriesResponse?.data) return []
    return categoriesResponse.data.map(mapApiCategoryToLocal)
  }, [categoriesResponse])

  const handleRefreshCategories = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some(
          (keyPart) => typeof keyPart === 'string' && keyPart.startsWith('/procurement-categories')
        ),
    })
  }

  // --- Real API: Supplier Categories ---
  const {
    data: supplierCategoriesResponse,
    isLoading: isSupplierCategoriesLoading,
    error: supplierCategoriesError,
  } = useSupplierCategories({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const supplierCategories: SupplierCategory[] = useMemo(() => {
    if (!supplierCategoriesResponse?.data) return []
    return supplierCategoriesResponse.data.map(mapApiSupplierCategoryToLocal)
  }, [supplierCategoriesResponse])

  const handleRefreshSupplierCategories = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some(
          (keyPart) => typeof keyPart === 'string' && keyPart.startsWith('/supplier-categories')
        ),
    })
  }

  // --- Real API: UNSPSC Codes ---
  const {
    data: unspscCodesResponse,
    isLoading: isUNSPSCCodesLoading,
    error: unspscCodesError,
  } = useUNSPSCCodes({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 1000 },
  })

  const unspscCodes: UNSPSCode[] = useMemo(() => {
    if (!unspscCodesResponse?.data) return []
    return unspscCodesResponse.data.map(mapApiUNSPSCCodeToLocal)
  }, [unspscCodesResponse])

  const createUNSPSCCodeMutation = useCreateUNSPSCCode()
  const updateUNSPSCCodeMutation = useUpdateUNSPSCCode()
  const deleteUNSPSCCodeMutation = useDeleteUNSPSCCode()

  const handleRefreshUNSPSCCodes = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey.some(
          (keyPart) => typeof keyPart === 'string' && keyPart.startsWith('/unspsc-codes')
        ),
    })
  }

  // --- Edit Category State ---
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false)

  // --- Edit Supplier Category State ---
  const [editingSupplierCategory, setEditingSupplierCategory] = useState<SupplierCategory | null>(null)
  const [editSupplierCategoryDialogOpen, setEditSupplierCategoryDialogOpen] = useState(false)

  // --- Edit UNSPSC State ---
  const [editingUNSPSCode, setEditingUNSPSCode] = useState<UNSPSCode | null>(null)
  const [editUNSPSCodeDialogOpen, setEditUNSPSCodeDialogOpen] = useState(false)
  const [statusToggleUNSPSCodeDialogOpen, setStatusToggleUNSPSCodeDialogOpen] = useState(false)
  const [togglingUNSPSCodeId, setTogglingUNSPSCodeId] = useState<string | null>(null)
  /**
   * Indicates whether a UNSPSC code toggle operation is currently in progress.
   *
   * - Type: boolean
   * - Initial value: false
   * - Purpose: used to drive UI state (disable controls, show spinners) and to prevent duplicate toggle requests
   * - Managed via: setIsTogglingUNSPSCode
   *
   * Notes:
   * - This is a local UI flag only; the canonical UNSPSC state should come from the API/hook responses.
   * - After a successful toggle API call the related procurement-category queries should be invalidated/refetched
   *   (follow the project's cache invalidation pattern documented under dashboard/documentations/).
   */
  const [isTogglingUNSPSCode, setIsTogglingUNSPSCode] = useState(false)

  // Category table state - isolated from UNSPSC table
  const [categorySorting, setCategorySorting] = useState<SortingState>([])
  const [categoryColumnFilters, setCategoryColumnFilters] = useState<ColumnFiltersState>([])
  const [categoryColumnVisibility, setCategoryColumnVisibility] = useState<VisibilityState>({})
  const [categoryRowSelection, setCategoryRowSelection] = useState({})
  const [categoryGlobalFilter, setCategoryGlobalFilter] = useState<string>('')

  // Supplier Category table state - isolated from other tables
  const [supplierCategorySorting, setSupplierCategorySorting] = useState<SortingState>([])
  const [supplierCategoryColumnFilters, setSupplierCategoryColumnFilters] = useState<ColumnFiltersState>([])
  const [supplierCategoryColumnVisibility, setSupplierCategoryColumnVisibility] = useState<VisibilityState>({})
  const [supplierCategoryRowSelection, setSupplierCategoryRowSelection] = useState({})
  const [supplierCategoryGlobalFilter, setSupplierCategoryGlobalFilter] = useState<string>('')

  // UNSPSC table state - isolated from Category table
  const [unspscSorting, setUnspscSorting] = useState<SortingState>([])
  const [unspscColumnFilters, setUnspscColumnFilters] = useState<ColumnFiltersState>([])
  const [unspscColumnVisibility, setUnspscColumnVisibility] = useState<VisibilityState>({})
  const [unspscRowSelection, setUnspscRowSelection] = useState({})
  const [unspscGlobalFilter, setUnspscGlobalFilter] = useState<string>('')

  // --- Category Handlers ---
  const handleEditCategory = (category: Category) => {
    if (category.isInUse) {
      toast({
        title: 'Action Blocked',
        description: 'This category is currently in use and cannot be modified or deleted.',
        color: 'destructive',
      })
      return
    }
    setEditingCategory(category)
    setEditCategoryDialogOpen(true)
  }

  const handleDeleteCategory = (_categoryId: string) => {
    // Actual deletion is handled inside CategoryActions via useDeleteProcurementCategory
    // This callback is called after successful deletion to refresh the list
    handleRefreshCategories()
  }

  // Category table
  const categoryTable = useReactTable({
    data: categories,
    columns: CategoryColumn({
      onEdit: handleEditCategory,
      onDelete: handleDeleteCategory,
      actions,
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setCategorySorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setCategoryColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setCategoryColumnVisibility,
    onRowSelectionChange: setCategoryRowSelection,
    enableRowSelection: true,
    onGlobalFilterChange: setCategoryGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      const name = String(row.getValue('name') ?? '').toLowerCase()
      const description = String(row.getValue('description') ?? '').toLowerCase()
      return name.includes(search) || description.includes(search)
    },
    state: {
      sorting: categorySorting,
      columnFilters: categoryColumnFilters,
      columnVisibility: categoryColumnVisibility,
      rowSelection: categoryRowSelection,
      globalFilter: categoryGlobalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
    meta: {
      readonly: false,
      actions,
    },
  })

  // --- Supplier Category Handlers ---
  const handleEditSupplierCategory = (category: SupplierCategory) => {
    setEditingSupplierCategory(category)
    setEditSupplierCategoryDialogOpen(true)
  }

  const handleDeleteSupplierCategory = (_categoryId: string) => {
    // Actual deletion is handled inside SupplierCategoryActions via useDeleteSupplierCategory
    // This callback is called after successful deletion to refresh the list
    handleRefreshSupplierCategories()
  }

  // Supplier Category table
  const supplierCategoryTable = useReactTable({
    data: supplierCategories,
    columns: SupplierCategoryColumn({
      onEdit: handleEditSupplierCategory,
      onDelete: handleDeleteSupplierCategory,
      actions,
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSupplierCategorySorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setSupplierCategoryColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setSupplierCategoryColumnVisibility,
    onRowSelectionChange: setSupplierCategoryRowSelection,
    enableRowSelection: true,
    onGlobalFilterChange: setSupplierCategoryGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      const name = String(row.getValue('name') ?? '').toLowerCase()
      const description = String(row.getValue('description') ?? '').toLowerCase()
      return name.includes(search) || description.includes(search)
    },
    state: {
      sorting: supplierCategorySorting,
      columnFilters: supplierCategoryColumnFilters,
      columnVisibility: supplierCategoryColumnVisibility,
      rowSelection: supplierCategoryRowSelection,
      globalFilter: supplierCategoryGlobalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
    meta: {
      readonly: false,
      actions,
    },
  })

  // --- UNSPSC Handlers ---
  const handleEditUNSPSCode = (unspscCode: UNSPSCode) => {
    setEditingUNSPSCode(unspscCode)
    setEditUNSPSCodeDialogOpen(true)
  }

  const handleDeleteUNSPSCode = (unspscCodeId: string) => {
    deleteUNSPSCCodeMutation.mutate(
      {
        pathParams: { id: unspscCodeId },
      },
      {
        onSuccess: () => {
          handleRefreshUNSPSCCodes()
          toast({
            title: 'Success',
            description: 'UNSPSC Code has been deleted successfully.',
            color: 'info',
          })
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          toast({
            title: 'Error',
            description: message || 'Failed to delete UNSPSC Code.',
            color: 'destructive',
          })
        },
      }
    )
  }
  const handleConfirmUNSPSCodeStatusToggle = async () => {
    if (!togglingUNSPSCodeId) return

    const codeToToggle = unspscCodes.find(code => code.id === togglingUNSPSCodeId)
    if (!codeToToggle) return

    try {
      setIsTogglingUNSPSCode(true)

      await updateUNSPSCCodeMutation.mutateAsync({
        pathParams: { id: togglingUNSPSCodeId },
        payload: {
          // Toggle the isActive flag based on the current code state
          isActive: !codeToToggle.IsActive,
        },
      })

      handleRefreshUNSPSCCodes()
      setStatusToggleUNSPSCodeDialogOpen(false)
      setTogglingUNSPSCodeId(null)

      toast({
        title: 'Success',
        description: 'UNSPSC Code status has been updated successfully.',
        color: 'info',
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast({
        title: 'Error',
        description: message || 'Failed to update UNSPSC Code status.',
        color: 'destructive',
      })
    } finally {
      setIsTogglingUNSPSCode(false)
    }
  }
  const handleAddUNSPSCode = (newUNSPSCodeData: UNSPSCodeFormData) => {
    createUNSPSCCodeMutation.mutate(
      {
        pathParams: {},
        payload: {
          code: newUNSPSCodeData.Code ?? null,
          name: newUNSPSCodeData.Name ?? null,
          level: newUNSPSCodeData.Level,
          parentId: newUNSPSCodeData.ParentId ?? null,
        },
      },
      {
        onSuccess: () => {
          handleRefreshUNSPSCCodes()
          toast({
            title: 'Success',
            description: `UNSPSC Code "${newUNSPSCodeData.Name}" has been created successfully.`,
            color: 'success',
          })
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          toast({
            title: 'Error',
            description: message || 'Failed to create UNSPSC Code.',
            color: 'destructive',
          })
        },
      }
    )
  }
  const handleUpdateUNSPSCode = (data: UNSPSCodeFormData, unspscCodeId: string) => {
    updateUNSPSCCodeMutation.mutate(
      {
        pathParams: { id: unspscCodeId },
        payload: {
          code: data.Code ?? null,
          name: data.Name ?? null,
          level: data.Level,
          parentId: data.ParentId ?? null,
        },
      },
      {
        onSuccess: () => {
          handleRefreshUNSPSCCodes()
          setEditUNSPSCodeDialogOpen(false)
          setEditingUNSPSCode(null)
          toast({
            title: 'Success',
            description: `UNSPSC Code "${data.Name}" has been updated successfully.`,
            color: 'warning',
          })
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error)
          toast({
            title: 'Error',
            description: message || 'Failed to update UNSPSC Code.',
            color: 'destructive',
          })
        },
      }
    )
  }

  // Handler to open the status-toggle confirmation dialog for a UNSPSC code.
  const handleToggleUNSPSCodeStatus = (id: string) => {
    setTogglingUNSPSCodeId(id)
    setStatusToggleUNSPSCodeDialogOpen(true)
  }

  // UNSPSC Code table
  const unspscTable = useReactTable({
    data: unspscCodes,
    columns: UNSPSCodeColumn({
      onEdit: handleEditUNSPSCode,
      onDelete: handleDeleteUNSPSCode,
      onToggleStatus: handleToggleUNSPSCodeStatus,
      actions,
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setUnspscSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setUnspscColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setUnspscColumnVisibility,
    onRowSelectionChange: setUnspscRowSelection,
    enableRowSelection: true,
    onGlobalFilterChange: setUnspscGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue ?? '').toLowerCase()
      const name = String(row.getValue('Name') ?? '').toLowerCase()
      const code = String(row.getValue('Code') ?? '').toLowerCase()
      const level = String(row.getValue('Level') ?? '').toLowerCase()
      const parentName = String(row.getValue('ParentName') ?? '').toLowerCase()

      return (
        name.includes(search) ||
        code.includes(search) ||
        level.includes(search) ||
        parentName.includes(search)
      )
    },
    state: {
      sorting: unspscSorting,
      columnFilters: unspscColumnFilters,
      columnVisibility: unspscColumnVisibility,
      rowSelection: unspscRowSelection,
      globalFilter: unspscGlobalFilter,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
    meta: {
      readonly: false,
      actions,
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage categories and UNSPSC codes for the procurement library</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-2 sm:gap-4 border-b overflow-x-auto scrollbar-hide pb-px">
        <button
          onClick={() => setActiveTab('categories')}
          className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Procurement Category
        </button>
        <button
          onClick={() => setActiveTab('supplier-categories')}
          className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'supplier-categories'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Supplier Category
        </button>
        <button
          onClick={() => setActiveTab('unspsc')}
          className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'unspsc'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          UNSPSC Code Management
        </button>
      </div>


      {/* Content */}
      {activeTab === 'categories' ? (
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isCategoriesLoading ? (
              <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : categoriesError ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-destructive">
                <p className="text-sm">Failed to load categories. Please try again.</p>
                <Button variant="outline" size="sm" onClick={handleRefreshCategories}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="w-full flex flex-col h-full p-2">
                <div className="flex items-center py-4 gap-1 flex-wrap">
                  <CategoryToolbar
                    table={categoryTable}
                    actions={actions}
                    onRefresh={handleRefreshCategories}
                  />
                </div>
                <div className="rounded-md border flex-1 flex flex-col min-h-0">
                  <Table>
                    <TableHeader className="bg-transparent border rounded-t-3xl">
                      {categoryTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="text-gray-500">
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {categoryTable.getRowModel().rows.length ? (
                        categoryTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No categories found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-row items-center justify-between space-x-2 py-4">
                  <div className="text-muted-foreground text-sm">
                    {categoryTable.getFilteredSelectedRowModel().rows.length} of{" "}
                    {categoryTable.getFilteredRowModel().rows.length} row(s) selected.
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Page {categoryTable.getState().pagination.pageIndex + 1} of{" "}
                    {categoryTable.getPageCount()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => categoryTable.previousPage()}
                      disabled={!categoryTable.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => categoryTable.nextPage()}
                      disabled={!categoryTable.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : activeTab === 'supplier-categories' ? (
        <Card>
          <CardHeader>
            <CardTitle>Supplier Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isSupplierCategoriesLoading ? (
              <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading supplier categories...</span>
              </div>
            ) : supplierCategoriesError ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-destructive">
                <p className="text-sm">Failed to load supplier categories. Please try again.</p>
                <Button variant="outline" size="sm" onClick={handleRefreshSupplierCategories}>
                  Retry
                </Button>
              </div>
            ) : (
              <div className="w-full flex flex-col h-full p-2">
                <div className="flex items-center py-4 gap-1 flex-wrap">
                  <SupplierCategoryToolbar
                    table={supplierCategoryTable}
                    actions={actions}
                    onRefresh={handleRefreshSupplierCategories}
                  />
                </div>
                <div className="rounded-md border flex-1 flex flex-col min-h-0">
                  <Table>
                    <TableHeader className="bg-transparent border rounded-t-3xl">
                      {supplierCategoryTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className="text-gray-500">
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {supplierCategoryTable.getRowModel().rows.length ? (
                        supplierCategoryTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            No supplier categories found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-row items-center justify-between space-x-2 py-4">
                  <div className="text-muted-foreground text-sm">
                    {supplierCategoryTable.getFilteredSelectedRowModel().rows.length} of{" "}
                    {supplierCategoryTable.getFilteredRowModel().rows.length} row(s) selected.
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Page {supplierCategoryTable.getState().pagination.pageIndex + 1} of{" "}
                    {supplierCategoryTable.getPageCount()}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => supplierCategoryTable.previousPage()}
                      disabled={!supplierCategoryTable.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => supplierCategoryTable.nextPage()}
                      disabled={!supplierCategoryTable.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (

        <Card>
          <CardHeader>
            <CardTitle>UNSPSC Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {isUNSPSCCodesLoading ? (
              <div className="flex items-center justify-center h-40 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading UNSPSC codes...</span>
              </div>
            ) : unspscCodesError ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-destructive">
              <p className="text-sm">Failed to load UNSPSC codes. Please try again.</p>
              <Button variant="outline" size="sm" onClick={handleRefreshUNSPSCCodes}>
                Retry
              </Button>
              </div>
            ) : (
              <div className="w-full flex flex-col h-full p-2">
              <div className="flex items-center py-4 gap-1 flex-wrap">
                <UNSPSCodeToolbar
                table={unspscTable}
                actions={actions}
                onAddUNSPSCode={handleAddUNSPSCode}
                availableParents={unspscCodes}
                />
              </div>

              <div className="rounded-md border flex-1 flex flex-col min-h-0">
                <Table>
                <TableHeader className="bg-transparent border rounded-t-3xl">
                  {unspscTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-gray-500">
                      {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                    ))}
                  </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {unspscTable.getRowModel().rows.length ? (
                  unspscTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                    </TableRow>
                  ))
                  ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                    No UNSPSC codes found
                    </TableCell>
                  </TableRow>
                  )}
                </TableBody>
                </Table>
              </div>

              <div className="flex flex-row items-center justify-between space-x-2 py-4">
                <div className="text-muted-foreground text-sm">
                {unspscTable.getFilteredSelectedRowModel().rows.length} of{" "}
                {unspscTable.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="text-muted-foreground text-sm">
                Page {unspscTable.getState().pagination.pageIndex + 1} of{" "}
                {unspscTable.getPageCount()}
                </div>
                <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unspscTable.previousPage()}
                  disabled={!unspscTable.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unspscTable.nextPage()}
                  disabled={!unspscTable.getCanNextPage()}
                >
                  Next
                </Button>
                </div>
              </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          category={editingCategory}
          actions={actions}
          open={editCategoryDialogOpen}
          onOpenChange={(open) => {
            setEditCategoryDialogOpen(open)
            if (!open) setEditingCategory(null)
          }}
          onRefresh={handleRefreshCategories}
        />
      )}

      {/* Edit Supplier Category Dialog */}
      {editingSupplierCategory && (
        <EditSupplierCategoryDialog
          category={editingSupplierCategory}
          actions={actions}
          open={editSupplierCategoryDialogOpen}
          onOpenChange={(open) => {
            setEditSupplierCategoryDialogOpen(open)
            if (!open) setEditingSupplierCategory(null)
          }}
          onRefresh={handleRefreshSupplierCategories}
        />
      )}

      {/* Edit UNSPSC Dialog */}
      {editingUNSPSCode && (
        <EditUNSPSCodeDialog
          unspscCode={editingUNSPSCode}
          actions={actions}
          open={editUNSPSCodeDialogOpen}
          onOpenChange={setEditUNSPSCodeDialogOpen}
          onEditSuccess={handleUpdateUNSPSCode}
          availableParents={unspscCodes}
        />
      )}

      {/* Status Toggle Confirmation Dialog */}
      {togglingUNSPSCodeId && (
        <UNSPSCodeStatusToggleConfirmationDialog
          open={statusToggleUNSPSCodeDialogOpen}
          onOpenChange={setStatusToggleUNSPSCodeDialogOpen}
          codeName={unspscCodes.find(code => code.id === togglingUNSPSCodeId)?.Name || 'UNSPSC Code'}
          currentStatus={
            unspscCodes.find(code => code.id === togglingUNSPSCodeId)?.IsActive ? 'active' : 'inactive'
          }
          onConfirm={handleConfirmUNSPSCodeStatusToggle}
          isLoading={isTogglingUNSPSCode}
        />
      )}
    </div>
  )
}
