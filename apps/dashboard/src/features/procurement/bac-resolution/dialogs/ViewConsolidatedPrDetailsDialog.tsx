import { useMemo } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useConsolidatedPRStore, type ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { formatCurrencyPHP } from '@/utils/formatters'
import { ListChecks } from 'lucide-react'

interface ViewConsolidatedPrDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consolidatedPrId?: string | null
}

function formatStatusLabel(status: string) {
  return status
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split('-')
  if (!year || !month) return monthValue
  const parsedDate = new Date(Number(year), Number(month) - 1, 1)
  if (Number.isNaN(parsedDate.getTime())) return monthValue
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return monthNames[Number(month) - 1] || monthValue
}

function groupItemsByPr(items: ConsolidatedPRItem[]) {
  return items.reduce<Record<string, ConsolidatedPRItem[]>>((groups, item) => {
    if (!groups[item.prId]) {
      groups[item.prId] = []
    }
    groups[item.prId].push(item)
    return groups
  }, {})
}

export function ViewConsolidatedPrDetailsDialog({
  open,
  onOpenChange,
  consolidatedPrId,
}: ViewConsolidatedPrDetailsDialogProps) {
  const consolidatedPRs = useConsolidatedPRStore((state) => state.consolidatedPRs)

  const consolidatedPr = useMemo(
    () =>
      consolidatedPRs.find(
        (item) => item.id === consolidatedPrId || item.prNumber === consolidatedPrId
      ) ?? null,
    [consolidatedPRs, consolidatedPrId]
  )

  if (!consolidatedPr) return null

  const totalAmount = consolidatedPr.selectedPRItems.reduce(
    (total, item) => total + item.totalAmount,
    0
  )

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title={`Consolidated PR Details: ${consolidatedPr.prNumber}`}
      description={consolidatedPr.purpose || 'Overview of Consolidated Purchase Request and selected items.'}
      size="xl"
      showCloseButton
      footer={
        <div className="flex justify-end w-full">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      }
    >
      <ScrollArea className="max-h-[70vh] pr-4">
        <div className="space-y-6 pb-4 text-sm">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3 bg-muted/20 p-4 rounded-xl border border-default-200">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
              <p className="font-semibold text-foreground mt-0.5">{consolidatedPr.description || 'No description'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Amount</p>
              <p className="font-semibold text-foreground mt-0.5">{formatCurrencyPHP(totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
              <div className="mt-1">
                <Badge variant="soft" className="capitalize">
                  {formatStatusLabel(consolidatedPr.status)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Selected PR Items */}
          <div>
            <h4 className="flex items-center gap-2 font-bold text-foreground text-base mb-3 border-b pb-1.5">
              <ListChecks className="h-5 w-5 text-primary" />
              Selected PR Items
            </h4>
            {consolidatedPr.selectedPRItems.length === 0 ? (
              <p className="text-muted-foreground italic bg-default-50 p-3 rounded-lg border border-dashed text-center">
                No items attached.
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupItemsByPr(consolidatedPr.selectedPRItems)).map(
                  ([prId, items], index) => {
                    const sourceTotal = items.reduce(
                      (total, item) => total + item.totalAmount,
                      0
                    )

                    return (
                      <div key={prId} className="space-y-3">
                        {index > 0 && <Separator className="my-2" />}
                        <div className="flex flex-wrap items-start justify-between gap-3 bg-default-50 p-3 rounded-xl border border-default-100">
                          <div>
                            <p className="font-semibold text-foreground">{items[0]?.prNumber || prId}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Office: {items[0]?.prOffice || 'N/A'} · Month: {formatMonthLabel(items[0]?.month || '')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {items[0]?.prType === 'out-of-stock' ? 'Out of Stock' : 'Non-CSE'}
                            </Badge>
                            <Badge variant="outline" color="secondary">
                              {formatCurrencyPHP(sourceTotal)}
                            </Badge>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-default-200">
                          <Table>
                            <TableHeader className="bg-muted/10">
                              <TableRow>
                                <TableHead>Item Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-semibold">{item.itemName}</TableCell>
                                  <TableCell>{item.category}</TableCell>
                                  <TableCell className="text-center whitespace-nowrap">
                                    {item.qty} {item.unit}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {formatCurrencyPHP(item.unitPrice)}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrencyPHP(item.totalAmount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </ResponsiveDialogDashtail>
  )
}
