/**
 * Bid Evaluation Matrix Table Component
 * Displays supplier bids by line item with pagination, specifications, and GPPB compliance rules
 * 
 * Features:
 * - Paginated bid tabulation by supplier and item
 * - Award criteria calculations (LCRB/MEARB/MARB)
 * - Over-ABC flagging and Rank 1 disqualification
 * - Minimum Canvass warning alert (< 3 suppliers)
 * - Sealed bid privacy gating
 * - Item specifications and brochure viewer
 */

import React, { useMemo, useState } from 'react'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Trophy, AlertCircle, ChevronLeft, ChevronRight, Lock, AlertTriangle, TrendingDown } from 'lucide-react'
import { BidDetailsViewer } from '../components/BidDetailsViewer'
import type { BidMatrix, SupplierBid } from '../types/aobTypes'

interface BidEvaluationMatrixProps {
  bidMatrix: BidMatrix
  itemsPerPage?: number
}

function formatPHP(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '-'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getSavingsPercent(bidAmount: number, abcAmount: number): string | null {
  if (!abcAmount || !bidAmount || bidAmount >= abcAmount) return null
  const percent = ((abcAmount - bidAmount) / abcAmount) * 100
  return `-${percent.toFixed(1)}%`
}

export function BidEvaluationMatrix({
  bidMatrix,
  itemsPerPage = 6,
}: BidEvaluationMatrixProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingBidDetails, setViewingBidDetails] = useState<{
    open: boolean
    itemCode: string
    itemDescription: string
    itemABC: number
    supplierName: string
    bid: SupplierBid | null
  }>({
    open: false,
    itemCode: '',
    itemDescription: '',
    itemABC: 0,
    supplierName: '',
    bid: null,
  })

  const suppliers = useMemo(() => {
    return bidMatrix.suppliers || []
  }, [bidMatrix.suppliers])

  const lineItems = bidMatrix.lineItems || []

  const totalPages = Math.max(1, Math.ceil(lineItems.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = lineItems.slice(startIndex, endIndex)

  const groupedData = useMemo(() => {
    const grouped: Record<string, SupplierBid[]> = {}
    suppliers.forEach((supplier) => {
      grouped[supplier.id] = []
    })
    paginatedItems.forEach((item) => {
      const itemBids = item.lineItems || []
      itemBids.forEach((bid) => {
        if (!grouped[bid.supplierId]) {
          grouped[bid.supplierId] = []
        }
        grouped[bid.supplierId].push(bid)
      })
    })
    return grouped
  }, [suppliers, paginatedItems])

  // Calculate total bids and won items per supplier across all items
  const supplierTotals = useMemo(() => {
    const totals: Record<string, { total: number; wonCount: number }> = {}
    suppliers.forEach((supplier) => {
      let total = 0
      let wonCount = 0
      lineItems.forEach((item) => {
        const bid = item.lineItems?.find((b) => b.supplierId === supplier.id)
        if (bid?.totalBid && bid.totalBid > 0) {
          total += bid.totalBid
        }
        if (bid?.isWinner) {
          wonCount++
        }
      })
      totals[supplier.id] = { total, wonCount }
    })
    return totals
  }, [suppliers, lineItems])

  // Lowest total responsive bidder across package
  const lowestTotalSupplierId = useMemo(() => {
    let lowestId: string | null = null
    let lowestAmount = Infinity
    suppliers.forEach((supplier) => {
      const data = supplierTotals[supplier.id]
      if (data && data.total > 0 && data.total < lowestAmount) {
        lowestAmount = data.total
        lowestId = supplier.id
      }
    })
    return lowestId
  }, [suppliers, supplierTotals])

  const handleViewBidDetails = (supplier: typeof suppliers[0], item: typeof paginatedItems[0], bid: SupplierBid) => {
    setViewingBidDetails({
      open: true,
      itemCode: item.itemCode || `Item #${lineItems.indexOf(item) + 1}`,
      itemDescription: item.description || item.name || '',
      itemABC: item.abcUnitPrice || item.approvedBudgetForContract || 0,
      supplierName: supplier.supplierName || supplier.name || '',
      bid,
    })
  }

  if (lineItems.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="w-5 h-5" />
            <span>No bid data available. Please link RFQs first.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {bidMatrix.hasMinimumCanvassWarning && (
          <Alert className="border-amber-300 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-semibold text-amber-800">Minimum Canvass Notice</AlertTitle>
            <AlertDescription className="text-sm text-amber-700">
              Fewer than three (3) suppliers have submitted quotations. Under Philippine Procurement Law (RA 9184 & RA 12009) guidelines for Alternative Procurement (Shopping & Small Value Procurement), please ensure at least three suppliers are canvassed where possible.
            </AlertDescription>
          </Alert>
        )}

        {bidMatrix.isBidsOpened === false && (
          <Alert className="border-blue-300 bg-blue-50 text-blue-900">
            <Lock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="font-semibold text-blue-800">Sealed Bids Notice</AlertTitle>
            <AlertDescription className="text-sm text-blue-700">
              Quotation prices and attachments remain sealed until the scheduled Opening Date: {bidMatrix.openingDate ? new Date(bidMatrix.openingDate).toLocaleString() : 'Opening Date'}.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Bid Evaluation Matrix</CardTitle>
                <CardDescription>
                  Tabulation of quotations across suppliers with automatic ranking and GPPB compliance evaluation
                  {lineItems.length > itemsPerPage && (
                    <span className="ml-2 text-xs font-semibold text-primary">
                      (Showing items {startIndex + 1} – {Math.min(endIndex, lineItems.length)} of {lineItems.length})
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="overflow-x-auto border rounded-lg bg-card shadow-xs">
              <UITable>
                <TableHeader>
                  <TableRow className="border-b bg-muted/40">
                    <TableHead rowSpan={2} className="w-[200px] min-w-[200px] sticky left-0 bg-background z-20 border-r text-center align-middle font-semibold text-foreground">
                      Supplier / Bidder
                    </TableHead>

                    {paginatedItems.map((item, idx) => {
                      const itemNumber = startIndex + idx + 1
                      const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
                      const totalABC = item.totalABC || (abcUnitPrice * (item.quantity || 1))

                      return (
                        <TableHead key={item.id} colSpan={2} className="text-center bg-muted/20 border-x py-3 px-3">
                          <div className="flex flex-col items-center gap-1.5 min-w-[220px]">
                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                              <Badge variant="secondary" className="font-semibold text-xs py-0 px-2">
                                {item.itemCode || `Item #${itemNumber}`}
                              </Badge>
                              {item.category && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1 text-muted-foreground">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            <div className="font-semibold text-xs text-foreground line-clamp-2 text-center" title={item.description || item.name}>
                              {item.description || item.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-normal">
                              Quantity: <span className="font-semibold text-foreground">{item.quantity}</span> {item.unit || 'units'}
                            </div>
                            <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 w-full text-center">
                              <span className="font-medium text-[10px] uppercase text-emerald-700 block">ABC Unit Budget</span>
                              <span className="font-bold text-xs">{formatPHP(abcUnitPrice)}</span>
                              <span className="text-[10px] text-emerald-600 block">Total: {formatPHP(totalABC)}</span>
                            </div>
                          </div>
                        </TableHead>
                      )
                    })}

                    <TableHead rowSpan={2} className="w-[140px] min-w-[140px] text-center bg-muted/30 border-x font-semibold text-xs align-middle">
                      Total Quotation
                    </TableHead>

                    <TableHead rowSpan={2} className="w-[110px] min-w-[110px] text-center bg-amber-50/70 align-middle font-semibold text-xs text-amber-900">
                      Award Status
                    </TableHead>
                  </TableRow>

                  <TableRow className="border-b bg-muted/20">
                    {paginatedItems.map((item) => (
                      <React.Fragment key={`${item.id}-subheaders`}>
                        <TableHead className="text-center text-xs font-semibold text-foreground w-[110px] min-w-[110px] border-l">
                          Unit Bid
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold text-foreground w-[120px] min-w-[120px] border-r">
                          Total Bid
                        </TableHead>
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {suppliers.map((supplier) => {
                    const totalData = supplierTotals[supplier.id] || { total: 0, wonCount: 0 }
                    const isLowestOverall = lowestTotalSupplierId === supplier.id

                    return (
                      <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors">
                        {/* Supplier Info */}
                        <TableCell className="font-medium sticky left-0 bg-background z-10 border-r text-center align-middle py-3">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="font-semibold text-xs text-foreground leading-tight">
                              {supplier.supplierName || supplier.name}
                            </span>
                            {supplier.submissionType && (
                              <Badge variant="outline" className="text-[10px] py-0 px-1 font-normal text-muted-foreground">
                                {supplier.submissionType}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Line Item Bids */}
                        {paginatedItems.map((item) => {
                          const bid = groupedData[supplier.id]?.find(
                            (b) => b.lineItemId === item.id || b.rfqItemId === item.id
                          )
                          const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
                          const exceedsABC = Boolean(
                            bid?.isOverABC || (bid?.unitBid && abcUnitPrice > 0 && bid.unitBid > abcUnitPrice)
                          )
                          const savingsPercent = bid?.unitBid ? getSavingsPercent(bid.unitBid, abcUnitPrice) : null

                          return (
                            <React.Fragment key={`${supplier.id}-${item.id}`}>
                              {/* Unit Bid Cell */}
                              <TableCell className="text-center text-sm align-middle border-l py-2.5">
                                {bidMatrix.isBidsOpened === false ? (
                                  <span className="text-xs text-muted-foreground italic flex items-center justify-center gap-1">
                                    <Lock className="w-3 h-3" /> Sealed
                                  </span>
                                ) : bid?.unitBid ? (
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="font-semibold text-xs">{formatPHP(bid.unitBid)}</span>
                                    {bid.rank === 1 && !exceedsABC && (
                                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] py-0 px-1.5 font-bold shadow-xs">
                                        Rank 1 (LCRB)
                                      </Badge>
                                    )}
                                    {bid.rank > 1 && !exceedsABC && (
                                      <Badge variant="outline" className="text-[10px] py-0 px-1 font-medium text-slate-700 bg-slate-50 border-slate-300">
                                        Rank {bid.rank} ({bid.score}%)
                                      </Badge>
                                    )}
                                    {exceedsABC && (
                                      <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-300">
                                        Disqualified
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">-</span>
                                )}
                              </TableCell>

                              {/* Total Bid Cell */}
                              <TableCell
                                className={`text-center text-sm align-middle border-r cursor-pointer transition-colors py-2.5 ${
                                  exceedsABC
                                    ? 'bg-red-50/70 text-red-900 font-semibold'
                                    : 'hover:bg-muted font-medium'
                                }`}
                                onClick={() => bid && handleViewBidDetails(supplier, item, bid)}
                                title="Click to view quotation specifications and attachments"
                              >
                                {bidMatrix.isBidsOpened === false ? (
                                  <span className="text-xs text-muted-foreground italic">Sealed</span>
                                ) : (
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="font-semibold text-xs">{bid?.totalBid ? formatPHP(bid.totalBid) : '-'}</span>
                                    {exceedsABC ? (
                                      <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-300">
                                        Over ABC
                                      </Badge>
                                    ) : savingsPercent ? (
                                      <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1 rounded border border-emerald-200">
                                        <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                                        {savingsPercent} vs ABC
                                      </span>
                                    ) : null}
                                  </div>
                                )}
                              </TableCell>
                            </React.Fragment>
                          )
                        })}

                        {/* Overall Total Quotation Column */}
                        <TableCell className="text-center align-middle border-x py-2.5 font-medium">
                          {bidMatrix.isBidsOpened === false ? (
                            <span className="text-xs text-muted-foreground italic">Sealed</span>
                          ) : totalData.total > 0 ? (
                            <div className="flex flex-col items-center justify-center gap-0.5">
                              <span className="font-bold text-xs text-foreground">{formatPHP(totalData.total)}</span>
                              {isLowestOverall && suppliers.length > 1 && (
                                <Badge variant="outline" className="text-[10px] py-0 px-1 font-semibold text-emerald-700 bg-emerald-50 border-emerald-300">
                                  Lowest Package
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Award Status Column */}
                        <TableCell className="text-center align-middle py-2.5 bg-amber-50/30">
                          {totalData.wonCount > 0 ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-[11px] py-0.5 px-2 font-semibold shadow-xs inline-flex items-center">
                              <Trophy className="w-3 h-3" />
                              Winner ({totalData.wonCount})
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </UITable>
            </div>

            {/* Pagination Controls */}
            {lineItems.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages} ({lineItems.length} total items)
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="h-8 gap-1 text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous Items
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="h-8 gap-1 text-xs"
                  >
                    Next Items
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {viewingBidDetails.bid && (
        <BidDetailsViewer
          open={viewingBidDetails.open}
          onOpenChange={(open) => {
            if (!open) {
              setViewingBidDetails((prev) => ({ ...prev, open: false }))
            }
          }}
          itemCode={viewingBidDetails.itemCode}
          itemDescription={viewingBidDetails.itemDescription}
          itemABC={viewingBidDetails.itemABC}
          supplierName={viewingBidDetails.supplierName}
          bidDetails={{
            unitBid: viewingBidDetails.bid.unitBid,
            totalBid: viewingBidDetails.bid.totalBid,
            qualityScore: viewingBidDetails.bid.qualityScore,
            calculatedQualityPriceRatio: viewingBidDetails.bid.calculatedQualityPriceRatio,
            remarks: viewingBidDetails.bid.remarks,
            offerDocumentUrl: viewingBidDetails.bid.brochureFileUrl || viewingBidDetails.bid.offerDocumentUrl,
            isWinner: viewingBidDetails.bid.isWinner,
          }}
        />
      )}
    </>
  )
}
