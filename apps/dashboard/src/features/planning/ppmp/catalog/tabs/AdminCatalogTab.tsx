/**
 * AdminCatalogTab
 * Master Library management for administrators
 * Features: Full CRUD, bulk operations, price adjustments
 */

import { useState } from 'react'
import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import { Search, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

import { UserCatalogDetailPanel } from '../panels/UserCatalogDetailPanel'
import { catalogDetailSelectedIdAtom } from '../atoms/requestAtoms'
import { catalogItemsAtom } from '../atoms/catalogAtoms'
import { useFilteredAdminCatalog } from '../hooks/useRequestFilters'
import { CostItemMasterPage } from '../components/CostItemMasterPage'
import {
  createItemDialogOpenAtom,
  editItemDialogOpenAtom,
  deleteItemDialogOpenAtom,
  bulkPricingDialogOpenAtom,
  selectedItemIdsAtom,
} from '../atoms/catalogDialogAtoms'

export function AdminCatalogTab() {
  const [adminView, setAdminView] = useState<'catalog' | 'cost-master'>('catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<
    'All' | 'Active' | 'Inactive'
  >('All')
  const [selectedIds, setSelectedIds] = useAtom(selectedItemIdsAtom)
  const catalogItems = useAtomValue(catalogItemsAtom)
  const setCatalogItems = useSetAtom(catalogItemsAtom)
  const setSelectedItemId = useSetAtom(catalogDetailSelectedIdAtom)
  const setCreateDialogOpen = useSetAtom(createItemDialogOpenAtom)
  const setEditDialogOpen = useSetAtom(editItemDialogOpenAtom)
  const setDeleteDialogOpen = useSetAtom(deleteItemDialogOpenAtom)
  const setBulkPricingDialogOpen = useSetAtom(bulkPricingDialogOpenAtom)

  // Filter by search term
  const filteredBySearch = useFilteredAdminCatalog(searchTerm).items

  // Filter by visibility (Active/Inactive/All)
  const filteredItems = filteredBySearch.filter((item) => {
    if (visibilityFilter === 'All') return true
    if (visibilityFilter === 'Active') return item.isActive === true
    if (visibilityFilter === 'Inactive') return item.isActive === false
    return true
  })

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredItems.map((item) => item.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleToggleVisibility = (itemId: string) => {
    setCatalogItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isActive: !item.isActive } : item,
      ),
    )
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
          Item Library
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
          <h2 className="text-2xl font-bold">Master Library</h2>
          <p className="text-sm text-muted-foreground">
            {catalogItems.length} total items
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Toolbar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, specification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={visibilityFilter}
          onValueChange={(v: any) => setVisibilityFilter(v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by visibility..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Items</SelectItem>
            <SelectItem value="Active">Active (Visible to Users)</SelectItem>
            <SelectItem value="Inactive">
              Inactive (Hidden from Users)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Checkbox
            checked={
              selectedIds.length === filteredItems.length &&
              filteredItems.length > 0
            }
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''}{' '}
            selected
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              Bulk Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkPricingDialogOpen(true)}
            >
              Adjust Prices
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3 w-3" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/50 flex items-center gap-3">
          <Checkbox
            checked={
              selectedIds.length > 0 &&
              selectedIds.length === filteredItems.length
            }
            onCheckedChange={handleSelectAll}
          />
          <span className="text-xs font-medium text-muted-foreground uppercase">
            Select All
          </span>
        </div>

        <div className="divide-y max-h-96 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No items found matching your filters
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-muted/50 flex items-center gap-3 last:border-b-0 transition-colors group cursor-pointer"
                onClick={() => setSelectedItemId(item.id)}
              >
                <Checkbox
                  checked={selectedIds.includes(item.id)}
                  onCheckedChange={() => handleSelectItem(item.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} • {item.unitOfMeasure}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    ₱
                    {item.currentPrice.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      item.isActive === true
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.isActive === true ? 'Visible' : 'Hidden'}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(item.id)
                    }}
                    title={item.isActive ? 'Hide from users' : 'Show to users'}
                  >
                    {item.isActive === true ? (
                      <Eye className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItemId(item.id)
                      setEditDialogOpen(true)
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedItemId(item.id)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <UserCatalogDetailPanel />
        </>
      )}
    </div>
  )
}
