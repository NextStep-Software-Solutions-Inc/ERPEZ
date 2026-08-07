/**
 * CostItemMasterTable
 * Admin table for managing predefined cost items.
 */

import { useMemo, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Search, Plus, Edit2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { formatCurrencyPHP } from '@/utils/formatters'
import {
  costMasterItemsAtom,
  toggleCostItemActiveAtom,
} from '../../atoms/costMasterAtoms'
import {
  createCostItemDialogOpenAtom,
  editCostItemDialogOpenAtom,
  costItemToEditAtom,
} from '../atoms/costMasterDialogAtoms'
import type { CostItemMaster } from '../../types'

const formatCurrency = formatCurrencyPHP

export function CostItemMasterTable() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>(
    'All',
  )
  const items = useAtomValue(costMasterItemsAtom)
  const setCreateDialogOpen = useSetAtom(createCostItemDialogOpenAtom)
  const setEditDialogOpen = useSetAtom(editCostItemDialogOpenAtom)
  const setCostItemToEdit = useSetAtom(costItemToEditAtom)
  const toggleCostItemActive = useSetAtom(toggleCostItemActiveAtom)

  const categories = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.category))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [items],
  )

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return items.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.costItemName,
          item.category,
          item.subcategory,
          item.description,
          item.unitOfMeasure,
          item.uacsCode,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))

      const matchesCategory =
        categoryFilter === 'All' || item.category === categoryFilter

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && item.isActive) ||
        (statusFilter === 'Inactive' && !item.isActive)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [items, searchTerm, categoryFilter, statusFilter])

  const handleEdit = (item: CostItemMaster) => {
    setCostItemToEdit(item)
    setEditDialogOpen(true)
  }

  const handleToggleActive = (item: CostItemMaster) => {
    toggleCostItemActive(item.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cost Item Master</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} predefined cost items
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Cost Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, description, or UACS code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Badge variant="outline" className="px-3 py-1.5">
          {items.filter((item) => item.isActive).length} Active
        </Badge>
        <Badge variant="outline" className="px-3 py-1.5">
          {items.filter((item) => !item.isActive).length} Inactive
        </Badge>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as 'All' | 'Active' | 'Inactive')
          }
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="bg-muted/40 border-b border-border">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Cost Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Standard Cost</th>
                <th className="px-4 py-3 font-medium">UoM</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No cost items found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'border-b border-border last:border-b-0 hover:bg-muted/30',
                      !item.isActive && 'bg-muted/20',
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-medium">{item.costItemName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.subcategory ? `${item.subcategory} · ` : ''}
                          {item.uacsCode ?? 'No UACS code'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(item.standardUnitCost)}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">
                      {item.unitOfMeasure}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'border',
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-muted text-muted-foreground border-border',
                        )}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(item)}
                          title="Edit cost item"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleActive(item)}
                          title={item.isActive ? 'Deactivate item' : 'Activate item'}
                        >
                          {item.isActive ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
