/**
 * SelectCostItemDialog
 * Picker modal for choosing an active Cost Master item in the PPMP builder.
 */

import { useMemo, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUnifiedCostMaster } from '../hooks/useUnifiedCostMaster'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { CostItemMaster } from '../../types'

interface SelectCostItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: CostItemMaster) => void
}

const formatCurrency = formatCurrencyPHP

export function SelectCostItemDialog({
  open,
  onOpenChange,
  onSelect,
}: SelectCostItemDialogProps) {
  const [search, setSearch] = useState('')
  const { activeItems: items, isLoading } = useUnifiedCostMaster()

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return items

    return items.filter((item) =>
      [
        item.costItemName,
        item.category,
        item.subcategory,
        item.description,
        item.unitOfMeasure,
        item.uacsCode,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    )
  }, [items, search])

  const handleSelect = (item: CostItemMaster) => {
    onSelect(item)
    onOpenChange(false)
    setSearch('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setSearch('')
      }}
    >
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <DialogTitle>Add from Cost Master</DialogTitle>
          <DialogDescription>
            Select a predefined cost item. The name and standard unit cost are
            locked after selection.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, description, or UACS code…"
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">No cost items found.</span>
            </div>
          ) : (
            <ul className="divide-y">
              {filteredItems.map((item) => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto px-5 py-3 rounded-none hover:bg-muted/50"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex items-center justify-between gap-4 w-full min-w-0">
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {item.costItemName}
                          </p>
                          {item.source === 'non-cse' && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-700 bg-blue-50/60 font-medium"
                            >
                              Non-CSE
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.category}
                          {item.subcategory ? ` · ${item.subcategory}` : ''}
                        </p>
                        {item.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(item.standardUnitCost)}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.unitOfMeasure}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-5 py-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {filteredItems.length} item
            {filteredItems.length !== 1 ? 's' : ''} available
          </span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
