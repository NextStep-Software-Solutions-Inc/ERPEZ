/**
 * AdminCatalogTab
 * Master Catalog management for administrators
 * Features: Live catalog listing, search, item detail inspection, and soft-delete catalog management
 */

import { useState } from 'react'
import { useSetAtom } from 'jotai'
import { Search, Trash2, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserCatalogDetailPanel } from '../panels/UserCatalogDetailPanel'
import { catalogDetailSelectedIdAtom } from '../atoms/requestAtoms'
import { useNonCSEItems, useDeleteNonCSEItemMutation } from '../hooks/useNonCSEItemQueries'
import { CostItemMasterPage } from '../components/CostItemMasterPage'
import type { NONCSEItem } from '@/features/planning/non-cse-item/types/non-cse.type'
import { formatCurrencyPHP } from '@/utils/formatters'
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

export function AdminCatalogTab() {
  const [adminView, setAdminView] = useState<'catalog' | 'cost-master'>('catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null)

  const setSelectedItemId = useSetAtom(catalogDetailSelectedIdAtom)

  const filterString = searchTerm ? `Name@=*${searchTerm}|Description@=*${searchTerm}` : undefined
  const { data, isLoading } = useNonCSEItems({
    filters: filterString,
    pageSize: 100,
  })

  const deleteMutation = useDeleteNonCSEItemMutation()

  const items: NONCSEItem[] = data?.data || []
  const total = data?.totalRows || items.length

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id)
      setItemToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        <Button
          variant={adminView === 'catalog' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 px-3"
          onClick={() => setAdminView('catalog')}
        >
          Item Catalog
        </Button>
        <Button
          variant={adminView === 'cost-master' ? 'default' : 'ghost'}
          size="sm"
          className="h-8 px-3"
          onClick={() => setAdminView('cost-master')}
        >
          Cost Master
        </Button>
      </div>

      {adminView === 'cost-master' ? (
        <CostItemMasterPage />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Master Catalog</h2>
              <p className="text-sm text-muted-foreground">
                {total} items in catalog
              </p>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search master catalog by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table Container */}
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-dashed">
                <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h3 className="font-semibold text-base">No Catalog Items Found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Approved item requests will automatically appear in this master catalog.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-muted/40 flex items-center justify-between gap-4 transition-colors group cursor-pointer"
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">
                          {item.name || 'Unnamed Item'}
                        </p>
                        {item.productCode && (
                          <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {item.productCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.description || 'No specifications'}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatCurrencyPHP(item.currentPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.procurementCategoryName || 'Goods'} • {item.uomName || 'Unit'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setItemToDelete({ id: item.id, name: item.name || 'Unnamed Item' })
                          }}
                          title="Delete catalog item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Catalog Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{itemToDelete?.name}&quot; from the catalog? This will soft-delete the item so it cannot be selected for future procurement plans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Slide-over Detail Panel */}
      <UserCatalogDetailPanel />
    </div>
  )
}
