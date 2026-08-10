import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ProcurementItem } from '../handlers/getProcurementItemsRequest'

interface ProcurementItemsTableProps {
  items: ProcurementItem[]
  isLoading: boolean
  selectedItems: Set<string>
  onSelectItem: (itemId: string) => void
  onSelectAll: (checked: boolean) => void
  allChecked: boolean
  indeterminate: boolean
  hasItems: boolean
}

export function ProcurementItemsTable({
  items,
  isLoading,
  selectedItems,
  onSelectItem,
  onSelectAll,
  allChecked,
  indeterminate,
  hasItems,
}: ProcurementItemsTableProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Loading items...
      </div>
    )
  }

  if (!hasItems) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        No items match your search
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-50">
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allChecked}
                ref={(el) => {
                  if (el) {
                    const input = el.querySelector('input') as HTMLInputElement | null
                    if (input) {
                      input.indeterminate = indeterminate
                    }
                  }
                }}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>UOM</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectItem(item.id)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={() => onSelectItem(item.id)}
                />
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.type}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={item.isCSE ? 'outline' : 'soft'}
                  className="text-xs"
                >
                  {item.isCSE ? 'CSE' : 'Non-CSE'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {item.objectCodeName}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {item.uomName}
              </TableCell>
              <TableCell className="text-xs text-gray-500 truncate max-w-xs">
                {item.specifications || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
