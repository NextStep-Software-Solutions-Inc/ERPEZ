/**
 * CatalogItemPickerModal
 * Lightweight modal for the PPMP Builder to select a Non-CSE catalog item.
 * Exposes an `onSelect` callback with the minimal item shape needed by the builder.
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2 } from 'lucide-react'
import { useCatalogItemPicker } from '../hooks/useCatalogItemPicker'

const CATEGORIES = [
  'Maintenance Services',
  'IT Services',
  'Catering Services',
  'Security Services',
  'Printing Services',
  'Transport Services',
  'Training Services',
  'Media Services',
  'Consultancy Services',
  'Event Services',
]

export interface PickedCatalogItem {
  id: string
  itemCode: string
  name: string
  unitOfMeasure: string
  unitPrice: number
  category: string
}

interface CatalogItemPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: PickedCatalogItem) => void
}

function formatPrice(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CatalogItemPickerModal({
  isOpen,
  onClose,
  onSelect,
}: CatalogItemPickerModalProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const { data: items = [], isLoading } = useCatalogItemPicker({
    search,
    category,
    enabled: isOpen,
  })

  const handleSelect = (item: (typeof items)[number]) => {
    onSelect({
      id: item.id,
      itemCode: item.itemCode,
      name: item.name,
      unitOfMeasure: item.unitOfMeasure,
      unitPrice: item.currentPrice,
      category: item.category,
    })
    onClose()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b">
          <DialogTitle>Select Catalog Item</DialogTitle>
          <DialogDescription>
            Browse and select an active Non-CSE item to add to your PPMP.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="px-5 py-3 border-b flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, or category…"
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Select
            value={category ?? 'all'}
            onValueChange={(v) => setCategory(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading items…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              No items found
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto px-5 py-3 rounded-none hover:bg-muted/50"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex items-center justify-between w-full gap-3 min-w-0">
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-medium truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.itemCode} · {item.category}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatPrice(item.currentPrice)}
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

        {/* Footer */}
        <div className="px-5 py-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} shown
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
