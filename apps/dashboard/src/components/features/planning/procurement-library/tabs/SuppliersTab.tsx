import { useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Table as TableType } from '@tanstack/react-table'
import { AlertCircle, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { TemplateTable } from '@/components/TemplateTable'
import DebouncedInput from '@/components/DebouncedInput'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import PermissionCheck from '@/components/PermissionCheck'
import { SupplierDetailPage } from '../suppliers/page/SupplierDetailPage'
import { SupplierRegistryForm } from '../suppliers/dialog/SupplierRegistryForm'
import { Column } from '../suppliers/table'
import {
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplierStatus,
} from '../suppliers/useSuppliers'
import type { SupplierListItem } from '../suppliers/types'

type BulkDeleteFailure = {
  supplier: SupplierListItem
  message: string
}

export function SuppliersTab() {
  const queryClient = useQueryClient()
  const tableRef = useRef<TableType<SupplierListItem> | null>(null)
  const { data: suppliersData, isLoading } = useSuppliers({
    pathParams: {},
    queryParams: {},
  })

  const updateStatusMutation = useUpdateSupplierStatus()
  const deleteMutation = useDeleteSupplier()

  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  )
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null,
  )
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineStatusNote, setDeclineStatusNote] = useState('')
  const [decliningSupplier, setDecliningSupplier] =
    useState<SupplierListItem | null>(null)
  const [supplierToDelete, setSupplierToDelete] =
    useState<SupplierListItem | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<
    SupplierListItem[]
  >([])
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState({
    current: 0,
    total: 0,
  })
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const suppliers = suppliersData?.data ?? []
  const blacklistedCount = suppliers.filter(
    (supplier) => supplier.isBlacklisted,
  ).length

  const filteredData = useMemo(() => {
    if (!globalFilter) {
      return suppliers
    }

    const search = globalFilter.toLowerCase()
    return suppliers.filter((supplier) => {
      return [
        supplier.name,
        supplier.businessPermitNo,
        supplier.contactPerson,
        supplier.contactNumber,
        supplier.email,
        supplier.tinNumber,
        supplier.philGEPSNumber,
        supplier.supplierCategoryName,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(search))
    })
  }, [suppliers, globalFilter])

  const invalidateSuppliers = () => {
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0]
        return typeof key === 'string' && key.startsWith('/suppliers')
      },
    })
  }

  const handleCreateSupplier = () => {
    setEditingSupplierId(null)
    setSupplierDialogOpen(true)
  }

  const handleEditSupplier = (supplier: SupplierListItem) => {
    setEditingSupplierId(supplier.id)
    setSupplierDialogOpen(true)
  }

  const handleViewSupplier = (supplier: SupplierListItem) => {
    setSelectedSupplierId(supplier.id)
  }

  const handleApproveSupplier = async (supplier: SupplierListItem) => {
    try {
      await updateStatusMutation.mutateAsync({
        pathParams: { id: supplier.id },
        payload: { status: 'Approved' },
      })

      toast.success(
        `Supplier "${supplier.name || 'Unnamed supplier'}" approved`,
      )
      invalidateSuppliers()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to approve supplier',
      )
    }
  }

  const handleDeclineSupplier = async (supplier: SupplierListItem) => {
    setDecliningSupplier(supplier)
    setDeclineStatusNote('')
    setDeclineDialogOpen(true)
  }

  const handleSubmitDeclineSupplier = async () => {
    if (!decliningSupplier) {
      return
    }

    const note = declineStatusNote.trim()

    if (!note) {
      toast.error('Status note is required when declining a supplier')
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        pathParams: { id: decliningSupplier.id },
        payload: {
          status: 'Declined',
          statusNote: note,
        },
      })

      toast.success(
        `Supplier "${decliningSupplier.name || 'Unnamed supplier'}" declined`,
      )
      invalidateSuppliers()
      setDeclineDialogOpen(false)
      setDecliningSupplier(null)
      setDeclineStatusNote('')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to decline supplier',
      )
    }
  }

  const handleToggleBlacklist = async (supplier: SupplierListItem) => {
    const willBlock = !supplier.isBlacklisted
    try {
      await updateStatusMutation.mutateAsync({
        pathParams: { id: supplier.id },
        payload: { isBlocked: !supplier.isBlacklisted },
      })

      toast.success(
        willBlock
          ? `Supplier "${supplier.name || 'Unnamed supplier'}" blocked`
          : `Supplier "${supplier.name || 'Unnamed supplier'}" unblocked`,
      )
      invalidateSuppliers()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update supplier status',
      )
    }
  }

  const handleDeleteSupplier = (supplier: SupplierListItem) => {
    setSupplierToDelete(supplier)
  }

  const handleOpenBulkDelete = (suppliers: SupplierListItem[]) => {
    if (suppliers.length === 0) {
      return
    }

    setBulkDeleteTargets(suppliers)
    setBulkDeleteProgress({ current: 0, total: suppliers.length })
    setBulkDeleteDialogOpen(true)
  }

  const handleCloseBulkDeleteDialog = () => {
    if (isBulkDeleting) {
      return
    }

    setBulkDeleteDialogOpen(false)
    setBulkDeleteTargets([])
    setBulkDeleteProgress({ current: 0, total: 0 })
  }

  const handleConfirmBulkDelete = async () => {
    if (isBulkDeleting || bulkDeleteTargets.length === 0) {
      return
    }

    const targets = [...bulkDeleteTargets]
    const failures: BulkDeleteFailure[] = []
    let successCount = 0

    setIsBulkDeleting(true)

    try {
      for (const [index, supplier] of targets.entries()) {
        setBulkDeleteProgress({ current: index + 1, total: targets.length })

        try {
          await deleteMutation.mutateAsync({
            pathParams: { id: supplier.id },
          })
          successCount += 1
        } catch (error) {
          failures.push({
            supplier,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to delete supplier',
          })
        }
      }

      tableRef.current?.resetRowSelection()
      invalidateSuppliers()
      setBulkDeleteDialogOpen(false)
      setBulkDeleteTargets([])
      setBulkDeleteProgress({ current: 0, total: 0 })

      if (failures.length === 0) {
        toast.success(`Deleted ${successCount} supplier(s)`)
      } else {
        const firstFailure = failures[0]
        const failedNames = failures
          .map(({ supplier }) => supplier.name || 'Unnamed supplier')
          .join(', ')

        toast.error(
          `Deleted ${successCount} supplier(s); failed ${failures.length} supplier(s)${failedNames ? `: ${failedNames}` : ''}${firstFailure?.message ? ` (${firstFailure.message})` : ''}`,
        )
      }
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleConfirmDelete = () => {
    if (!supplierToDelete) {
      return
    }

    deleteMutation.mutate(
      {
        pathParams: { id: supplierToDelete.id },
      },
      {
        onSuccess: () => {
          toast.success(
            `Supplier "${supplierToDelete.name || 'Unnamed supplier'}" deleted`,
          )
          invalidateSuppliers()
          setSupplierToDelete(null)
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'Failed to delete supplier',
          )
        },
      },
    )
  }

  const supplierDetailActionCallbacks = useMemo(
    () => ({
      onApprove: async () => undefined,
      onDecline: async () => undefined,
      onBlock: async () => undefined,
    }),
    [],
  )

  if (selectedSupplierId) {
    return (
      <SupplierDetailPage
        supplierId={selectedSupplierId}
        onBack={() => setSelectedSupplierId(null)}
        {...supplierDetailActionCallbacks}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Supplier Registry</h2>
          <p className="text-sm text-muted-foreground">
            Manage supplier records, compliance status, and procurement access.
          </p>
        </div>

        <Button onClick={handleCreateSupplier} className="gap-2">
          <Plus className="h-4 w-4" />
          New Supplier
        </Button>
      </div>

      {blacklistedCount > 0 && (
        <Alert variant="soft" className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-3 w-3" />
          <AlertTitle className="text-sm text-red-900">
            Blacklisted Suppliers Found
          </AlertTitle>
          <AlertDescription className="text-sm text-red-800">
            {blacklistedCount} supplier(s) are blacklisted and cannot be used in
            procurement processes.
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            placeholder="Search by supplier name, category, email, or TIN..."
            value={globalFilter}
            onChange={setGlobalFilter}
            className="h-10 w-full pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          Loading suppliers...
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-12 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No suppliers found</h3>
          <p className="text-muted-foreground">
            {globalFilter
              ? 'Try adjusting your search.'
              : 'Create your first supplier to get started.'}
          </p>
        </div>
      ) : (
        <TemplateTable
          actions={['write', 'delete', 'read']}
          columns={Column}
          data={filteredData}
          readonly={false}
          forTab={true}
          onTableReady={(table) => {
            tableRef.current = table
          }}
          toolbar={(table) => {
            const selectedSuppliers = table
              .getFilteredSelectedRowModel()
              .rows.map((row) => row.original as SupplierListItem)
            const actions = table.options.meta?.actions ?? []
            const readonly = table.options.meta?.readonly ?? false

            return (
              <div className="flex w-full items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  {selectedSuppliers.length} selected
                </div>

                {selectedSuppliers.length > 0 &&
                  actions.includes('delete') &&
                  !readonly && (
                    <PermissionCheck action="delete" actions={actions}>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleOpenBulkDelete(selectedSuppliers)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedSuppliers.length})
                      </Button>
                    </PermissionCheck>
                  )}
              </div>
            )
          }}
          onView={handleViewSupplier}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          meta={{
            onView: handleViewSupplier,
            onEdit: handleEditSupplier,
            onApprove: handleApproveSupplier,
            onDecline: handleDeclineSupplier,
            onToggleBlacklist: handleToggleBlacklist,
            onDelete: handleDeleteSupplier,
          }}
        />
      )}

      <SupplierRegistryForm
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        supplierId={editingSupplierId}
        onSaved={invalidateSuppliers}
      />

      <AlertDialog
        open={Boolean(supplierToDelete)}
        onOpenChange={(open) => !open && setSupplierToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              {supplierToDelete?.name || 'this supplier'}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseBulkDeleteDialog()
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Suppliers</AlertDialogTitle>
            <AlertDialogDescription>
              {isBulkDeleting
                ? `Deleting ${bulkDeleteProgress.current} of ${bulkDeleteProgress.total} selected supplier(s)...`
                : `Are you sure you want to delete ${bulkDeleteTargets.length} selected supplier(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {!isBulkDeleting && bulkDeleteTargets.length > 0 && (
            <div className="max-h-40 space-y-1 overflow-auto rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
              {bulkDeleteTargets.slice(0, 5).map((supplier) => (
                <div key={supplier.id} className="truncate">
                  {supplier.name || 'Unnamed supplier'}
                </div>
              ))}
              {bulkDeleteTargets.length > 5 && (
                <div>
                  +{bulkDeleteTargets.length - 5} more selected supplier(s)
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBulkDelete}
              disabled={isBulkDeleting || bulkDeleteTargets.length === 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting
                ? `Deleting ${bulkDeleteProgress.current}/${bulkDeleteProgress.total}`
                : `Delete ${bulkDeleteTargets.length} Supplier${bulkDeleteTargets.length === 1 ? '' : 's'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={declineDialogOpen}
        onOpenChange={(open) => {
          setDeclineDialogOpen(open)
          if (!open) {
            setDecliningSupplier(null)
            setDeclineStatusNote('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Supplier</DialogTitle>
            <DialogDescription>
              Add a status note before declining this supplier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="supplier-decline-note">Status Note</Label>
            <Textarea
              id="supplier-decline-note"
              value={declineStatusNote}
              onChange={(event) => setDeclineStatusNote(event.target.value)}
              placeholder="Enter the reason for declining this supplier"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeclineDialogOpen(false)
                setDecliningSupplier(null)
                setDeclineStatusNote('')
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSubmitDeclineSupplier}>
              Decline Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
