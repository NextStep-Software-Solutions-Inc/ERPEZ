/**
 * Add Agency APP to APR Dialog Component
 * 
 * Modal for consolidating PPMP/APP items into APR
 * Users can filter by Year, Categories, Months, Funds
 * Max 200 lines
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'sonner'
import {
  addAgencyAPPDialogOpenAtom,
  aprConsolidatedItemsAtom,
  aprTotalAmountAtom,
} from '../atoms'
import { APRConsolidationFilter } from '../components/APRConsolidationFilter'
import type { ConsolidatedAPRItem } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

// Mock PPMP/APP items for demo
const MOCK_AVAILABLE_ITEMS: ConsolidatedAPRItem[] = [
  {
    id: '1',
    itemCode: 'GOODS-001',
    description: 'Office Chairs',
    unit: 'units',
    quantity: 50,
    unitCost: 2500,
    totalAmount: 125000,
    office: 'HR Office',
    fundSource: 'General Fund',
    ppmpId: 'ppmp-1',
    appId: 'app-1',
    itemCategory: 'Goods',
    allotmentClass: 'MOOE' as const,
    sourceFiscalYear: 2026,
    sourceCategory: 'Office Equipment',
    sourceMonth: 'January',
    appLineItemId: 'app-item-1',
    appApprovedQuantity: 50,
    appApprovedBudget: 125000,
  },
  {
    id: '2',
    itemCode: 'SERVICES-002',
    description: 'Janitorial Services',
    unit: 'service',
    quantity: 1,
    unitCost: 50000,
    totalAmount: 50000,
    office: 'Building Management',
    fundSource: 'SEF',
    ppmpId: 'ppmp-2',
    appId: 'app-2',
    itemCategory: 'Services',
    allotmentClass: 'CO' as const,
    sourceFiscalYear: 2026,
    sourceCategory: 'Maintenance',
    sourceMonth: 'February',
    appLineItemId: 'app-item-2',
    appApprovedQuantity: 1,
    appApprovedBudget: 50000,
  },
]

export function AddAgencyAPPDialog() {
  const [open, setOpen] = useAtom(addAgencyAPPDialogOpenAtom)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [, setConsolidatedItems] = useAtom(aprConsolidatedItemsAtom)
  const [, setTotalAmount] = useAtom(aprTotalAmountAtom)
  const [search, setSearch] = useState('')
  const [isPending, setIsPending] = useState(false)

  const filteredItems = MOCK_AVAILABLE_ITEMS.filter(
    (item) =>
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleAddItems = () => {
    const itemsToAdd = MOCK_AVAILABLE_ITEMS.filter((item) =>
      selectedItems.has(item.id)
    )

    if (itemsToAdd.length === 0) {
      toast.error('Please select at least one item')
      return
    }

    try {
      setIsPending(true)
      setConsolidatedItems((prev) => [...prev, ...itemsToAdd])
      setTotalAmount((prev) =>
        prev + itemsToAdd.reduce((sum, item) => sum + item.totalAmount, 0)
      )

      toast.success(`Added ${itemsToAdd.length} items to APR`)
      setOpen(false)
      setSelectedItems(new Set())
      setSearch('')
    } catch (error) {
      toast.error('Failed to add items')
    } finally {
      setIsPending(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Items to APR from Agency APP/PPMP</DialogTitle>
          <DialogDescription>
            Search and select CSE items from your approved PPMP/APP to consolidate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <APRConsolidationFilter />

          {/* Search */}
          <Input
            placeholder="Search by item code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Items Table */}
          <ScrollArea className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(
                            new Set(filteredItems.map((item) => item.id))
                          )
                        } else {
                          setSelectedItems(new Set())
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => handleSelectItem(item.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.itemCode}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₱{item.unitCost.toLocaleString()}</TableCell>
                    <TableCell>₱{item.totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddItems}
            disabled={isPending || selectedItems.size === 0}
          >
            Add {selectedItems.size > 0 ? `(${selectedItems.size})` : ''} Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
