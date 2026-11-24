import React from 'react'
import { ChevronDown, Trash2, FilePlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PRItem } from '../types'

interface PRPPMPItemsSectionProps {
  filteredGroupedPPMPs: { ppmpId: string; items: PRItem[] }[]
  expandedPPMPs: Set<string>
  toggleExpandPPMP: (ppmpId: string) => void
  isEditable: boolean
  masterCatalogIdentifiers: Set<string>
  modesResponseData?: any[]
  procurementModeOptions: string[]
  onUpdateProcurementMode: (item: PRItem, modeName?: string, modeId?: string) => void
  onUpdateItemQuantity: (item: PRItem, newQuantity: number) => void
  onDeleteItem: (item: PRItem) => void
  onDeletePPMPGroup: (ppmpId: string, displayName: string, items: PRItem[]) => void
  onOpenSubmitItemRequest: (item: PRItem) => void
}

export const PRPPMPItemsSection: React.FC<PRPPMPItemsSectionProps> = ({
  filteredGroupedPPMPs,
  expandedPPMPs,
  toggleExpandPPMP,
  isEditable,
  masterCatalogIdentifiers,
  modesResponseData,
  procurementModeOptions,
  onUpdateProcurementMode,
  onUpdateItemQuantity,
  onDeleteItem,
  onDeletePPMPGroup,
  onOpenSubmitItemRequest,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {filteredGroupedPPMPs.map(({ ppmpId, items }) => {
          const isExpanded = expandedPPMPs.has(ppmpId)
          const ppmpTotal = items.reduce(
            (sum, item) => sum + item.totalAmount,
            0,
          )
          const hasAnyMonth = items.some((i) => Boolean(i.month))

          return (
            <div
              key={ppmpId}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow my-3"
            >
              <div
                className="px-6 py-4 min-h-[68px] flex items-center gap-3 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-900 dark:hover:to-slate-800 cursor-pointer transition bg-gradient-to-r from-slate-50/30 to-slate-100/30 dark:from-slate-900/10 dark:to-slate-800/10"
                onClick={() => toggleExpandPPMP(ppmpId)}
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-slate-900 dark:text-slate-50">
                    {items[0]?.ppmpDocName ||
                      (ppmpId === 'independent-items'
                        ? items.every((i) => i.source === 'catalog' || masterCatalogIdentifiers.has((i.itemName || '').trim().toLowerCase()))
                          ? 'Master Catalog Items'
                          : items.every((i) => (i.source === 'custom' || (!i.source && !i.ppmpItemId && !i.aprItemId)) && !masterCatalogIdentifiers.has((i.itemName || '').trim().toLowerCase()))
                            ? 'Custom / Ad-hoc Items'
                            : 'Custom / Catalog Items (Independent)'
                        : 'Office PPMP')}
                  </div>
                  <div className="text-xs truncate text-slate-600 dark:text-slate-400">
                    {items.length} item(s)
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-3">
                  <Badge
                    color="default"
                    className="text-sm font-semibold"
                  >
                    ₱{ppmpTotal.toLocaleString()}
                  </Badge>

                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      title={`Delete ${ppmpId === 'independent-items' ? 'all independent items' : 'PPMP group'}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeletePPMPGroup(
                          ppmpId,
                          items[0]?.ppmpDocName ?? (ppmpId === 'independent-items' ? 'Independent Items' : 'Office PPMP'),
                          items,
                        )
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/10 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="min-w-[190px]">Mode of Procurement</TableHead>
                        <TableHead>Fund</TableHead>
                        {hasAnyMonth && <TableHead className="text-center">Month</TableHead>}
                        <TableHead className="text-center w-32">Req Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">
                          Total Amount
                        </TableHead>
                        {isEditable && (
                          <TableHead className="text-center w-64">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const unitPrice =
                          item.unitPrice ?? item.estimatedUnitPrice ?? 0

                        const isCatalogItem =
                          item.source === 'catalog' ||
                          (!item.ppmpDocId &&
                            masterCatalogIdentifiers.has((item.itemName || '').trim().toLowerCase()))
                        const isCustomItem = !isCatalogItem && item.source === 'custom'

                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                    {item.itemName}
                                  </span>
                                  {isCustomItem && (
                                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-semibold py-0 px-1.5">
                                      Custom / Ad-hoc
                                    </Badge>
                                  )}
                                  {isCatalogItem && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 text-[10px] font-semibold py-0 px-1.5">
                                      Master Catalog
                                    </Badge>
                                  )}
                                  {item.source === 'ppmp' && (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-semibold py-0 px-1.5">
                                      Office PPMP
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell className="min-w-[190px]">
                              {isEditable ? (
                                <Select
                                  value={item.procurementModeName || 'unassigned'}
                                  onValueChange={(val) => {
                                    const selectedModeName = val === 'unassigned' ? undefined : val
                                    const matchedMode = (modesResponseData ?? []).find(
                                      (m) => m.name?.trim().toLowerCase() === val.trim().toLowerCase()
                                    )
                                    onUpdateProcurementMode(item, selectedModeName, matchedMode?.id)
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs w-[180px] bg-white dark:bg-slate-900 border-slate-200">
                                    <SelectValue placeholder="Select MoP" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-56">
                                    <SelectItem value="unassigned" className="text-xs text-muted-foreground">
                                      Select MoP
                                    </SelectItem>
                                    {procurementModeOptions.map((mode) => (
                                      <SelectItem key={mode} value={mode} className="text-xs">
                                        {mode}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : item.procurementModeName ? (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold whitespace-nowrap">
                                  {item.procurementModeName}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>{item.fund || '—'}</TableCell>
                            {hasAnyMonth && (
                              <TableCell className="text-center">
                                {item.month || '—'}
                              </TableCell>
                            )}
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center justify-center gap-1">
                                <div className="flex items-center justify-center gap-1.5">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={item.quantity || 0}
                                    onChange={(e) => {
                                      const v = parseInt(e.target.value || '0', 10)
                                      const val = Number.isNaN(v) ? 0 : Math.max(0, v)
                                      onUpdateItemQuantity(item, val)
                                    }}
                                    disabled={!isEditable}
                                    className="h-8 w-20 text-center font-medium tabular-nums"
                                  />
                                  <span className="text-xs text-muted-foreground pointer-events-none">
                                    {item.unitOfMeasure || 'pcs'}
                                  </span>
                                </div>
                                {item.setQuantity !== undefined && item.setQuantity > 0 && (
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap block">
                                    Rem: <span className="font-semibold text-primary">{item.remainingQuantity ?? Math.max(0, item.setQuantity - (item.quantity || 0))}</span> / {item.setQuantity}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              ₱{unitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₱
                              {(
                                (item.quantity || 0) * unitPrice
                              ).toLocaleString()}
                            </TableCell>
                            {isEditable && (
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {isCustomItem && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs px-2.5 gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/50"
                                      title="Propose this item to the Master Catalog"
                                      onClick={() => onOpenSubmitItemRequest(item)}
                                    >
                                      <FilePlus className="h-3.5 w-3.5" />
                                      <span>Submit as Item Request</span>
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                    title={`Remove ${item.itemName}`}
                                    onClick={() => onDeleteItem(item)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
