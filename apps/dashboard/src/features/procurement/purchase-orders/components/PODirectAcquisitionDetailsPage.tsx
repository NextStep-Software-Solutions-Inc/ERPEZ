import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Truck,
  DollarSign,
  FileText,
  ListChecks,
  Store,
  BarChart2,
  Building2,
} from 'lucide-react'
import { PurchaseOrderStatusBadge } from './PurchaseOrderStatusBadge'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import type { ConsolidatedPRItem } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { useGetPurchaseOrderItems } from '../handlers'
import type { PurchaseOrder } from '../types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getMonthQty(item: ConsolidatedPRItem, monthIndex: number): number {
  if (!item.month) return 0
  const parts = item.month.split('-')
  const itemMonth = parts.length === 2 ? parseInt(parts[1], 10) - 1 : -1
  return itemMonth === monthIndex ? item.qty : 0
}

const DA_MOP_KEYWORDS = ['direct acquisition', 'direct contracting']
function isDaMop(mop?: string): boolean {
  if (!mop) return false
  return DA_MOP_KEYWORDS.some((k) => mop.toLowerCase().includes(k))
}

interface Props {
  purchaseOrder: PurchaseOrder
  onBack: () => void
}

export function PODirectAcquisitionDetailsPage({ purchaseOrder, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'by-office' | 'summary'>('by-office')

  const { data: apiItems = [] } = useGetPurchaseOrderItems(purchaseOrder.id)
  const poLineItems = useMemo(() => {
    if (apiItems && apiItems.length > 0) return apiItems
    return purchaseOrder.lineItems ?? purchaseOrder.items ?? []
  }, [apiItems, purchaseOrder.lineItems, purchaseOrder.items])

  const consolidatedPRs = useConsolidatedPRStore((s) => s.consolidatedPRs)
  const sourcePR = useMemo(
    () => consolidatedPRs.find((pr) => pr.id === purchaseOrder.sourceDocumentId) ?? null,
    [consolidatedPRs, purchaseOrder.sourceDocumentId],
  )

  // DA items from the linked Consolidated PR
  const daItems = useMemo<ConsolidatedPRItem[]>(() => {
    if (!sourcePR) return []
    return sourcePR.selectedPRItems.filter((item) =>
      isDaMop(sourcePR.itemMOPs?.[item.id]?.mop),
    )
  }, [sourcePR])

  // Group DA items by office
  const itemsByOffice = useMemo(() => {
    const map = new Map<string, ConsolidatedPRItem[]>()
    for (const item of daItems) {
      const office = item.prOffice || 'Unknown Office'
      if (!map.has(office)) map.set(office, [])
      map.get(office)!.push(item)
    }
    return map
  }, [daItems])

  const daTotal = useMemo(() => daItems.reduce((s, i) => s + i.totalAmount, 0), [daItems])

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-1">
          <ArrowLeft className="h-4 w-4" /> Back to Purchase Orders
        </Button>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{purchaseOrder.poNumber}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {purchaseOrder.description || 'No description provided.'}
              </CardDescription>
            </div>
            <PurchaseOrderStatusBadge status={purchaseOrder.status} />
          </div>
        </CardHeader>
      </Card>

      {/* PO Details */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Details</CardTitle>
          <CardDescription>Basic PO information created from the Direct Acquisition workflow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> PO Number
              </div>
              <div className="text-lg font-bold text-blue-900">{purchaseOrder.poNumber}</div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> PO Date
              </div>
              <div className="text-lg font-bold text-purple-900">
                {purchaseOrder.date
                  ? new Date(purchaseOrder.date).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
              <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Date of Delivery
              </div>
              <div className="text-lg font-bold text-cyan-900">
                {purchaseOrder.dateOfDelivery
                  ? new Date(purchaseOrder.dateOfDelivery).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 md:col-span-2">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Place of Delivery
              </div>
              <div className="text-base font-semibold text-amber-900">
                {purchaseOrder.placeOfDelivery || '—'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Total Amount
              </div>
              <div className="text-lg font-bold text-green-900">
                ₱{purchaseOrder.totalAmount.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" /> Delivery Term
              </div>
              <div className="text-sm font-semibold">{purchaseOrder.deliveryTerm || '—'}</div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> Payment Term
              </div>
              <div className="text-sm font-semibold">{purchaseOrder.paymentTerm || '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retail Supplier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Retail Supplier / Store
          </CardTitle>
          <CardDescription>Supplier selected during PO creation</CardDescription>
        </CardHeader>
        <CardContent>
          {purchaseOrder.supplierName ? (
            <div className="rounded-lg border bg-muted/20 divide-y text-sm">
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">Store Name</span>
                <span className="font-semibold">{purchaseOrder.supplierName}</span>
              </div>
              <div className="grid grid-cols-2 px-4 py-3 gap-2">
                <span className="text-muted-foreground font-medium">TIN</span>
                <span className="font-semibold">
                  {(purchaseOrder as any).supplierTin || '—'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <Store className="h-8 w-8 opacity-30" />
              <p className="text-sm">No supplier selected yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consolidated PR Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" />
            Consolidated PR Items
          </CardTitle>
          <CardDescription>
            {sourcePR ? (
              <>
                Items from the linked Consolidated PR{' '}
                <span className="font-semibold text-primary">({purchaseOrder.sourceDocumentNumber})</span>
              </>
            ) : (
              'No Consolidated PR linked to this purchase order'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {daItems.length === 0 ? (
            poLineItems.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-default-200">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poLineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">
                          ₱{item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-semibold">
                      <TableCell colSpan={4} className="text-right">Total</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ₱{purchaseOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <ListChecks className="h-8 w-8 opacity-30" />
                <p className="text-sm">No items linked to this purchase order.</p>
              </div>
            )
          ) : (
            <>
              {/* Tab bar */}
              <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-full mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('by-office')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'by-office'
                      ? 'bg-white shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  By Office
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'summary'
                      ? 'bg-white shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart2 className="h-4 w-4" />
                  Summary
                </button>
              </div>

              {activeTab === 'by-office' && (
                <div className="space-y-6">
                  {Array.from(itemsByOffice.entries()).map(([office, officeItems]) => {
                    const officeTotal = officeItems.reduce((s, i) => s + i.totalAmount, 0)
                    const prNumbers = [...new Set(officeItems.map((i) => i.prNumber).filter(Boolean))]
                    return (
                      <div key={office}>
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div>
                            <p className="font-semibold text-sm">{office}</p>
                            <p className="text-xs text-muted-foreground">
                              {prNumbers.join(', ')} · {officeItems.length} item(s)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Month: {officeItems[0]?.month ?? '—'} · Fund: {officeItems[0]?.fund ?? '—'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {prNumbers.length > 1 && (
                              <Badge variant="outline" className="text-xs">Multiple</Badge>
                            )}
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold">
                              ₱{officeTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </Badge>
                          </div>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-default-200">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead className="min-w-[160px]">Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Fund</TableHead>
                                {MONTHS.map((m) => (
                                  <TableHead key={m} className="text-center px-2 min-w-[48px]">{m}</TableHead>
                                ))}
                                <TableHead className="text-center">Total Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead>Mode of Procurement</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {officeItems.map((item) => {
                                const mop = sourcePR.itemMOPs?.[item.id]?.mop ?? '—'
                                return (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.itemName}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{item.fund}</TableCell>
                                    {MONTHS.map((_, idx) => {
                                      const q = getMonthQty(item, idx)
                                      return (
                                        <TableCell key={idx} className="text-center px-2 text-sm text-muted-foreground">
                                          {q > 0 ? `${q} ${item.unit}` : <span className="opacity-40">0 {item.unit}</span>}
                                        </TableCell>
                                      )
                                    })}
                                    <TableCell className="text-center">
                                      <Badge variant="outline" className="rounded-full font-bold text-primary border-primary/30">
                                        {item.qty} {item.unit}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                      ₱{item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-sm">
                                      ₱{item.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-sm">{mop}</TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="overflow-x-auto rounded-lg border border-default-200">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Office</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead>Mode of Procurement</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daItems.map((item) => {
                        const mop = sourcePR.itemMOPs?.[item.id]?.mop ?? '—'
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.itemName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.prOffice}</TableCell>
                            <TableCell className="text-center">{item.qty}</TableCell>
                            <TableCell className="text-sm">{item.unit}</TableCell>
                            <TableCell className="text-right text-sm">
                              ₱{item.unitPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-sm">
                              ₱{item.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="text-sm">{mop}</TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow className="bg-muted/30 font-semibold">
                        <TableCell colSpan={6} className="text-right">Total</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          ₱{daTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Return Reason */}
      {purchaseOrder.status === 'returned' && purchaseOrder.returnReason && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 text-base">Return Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">{purchaseOrder.returnReason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

