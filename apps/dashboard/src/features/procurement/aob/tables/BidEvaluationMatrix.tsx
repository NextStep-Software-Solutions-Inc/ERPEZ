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
 * - Clean spacious layout matching preferred visual aesthetic
 */

import React, { useMemo, useState } from 'react'
import { Table as UITable, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ChevronLeft, ChevronRight, Lock, AlertTriangle } from 'lucide-react'
import { BidDetailsViewer } from '../components/BidDetailsViewer'
import { BidMatrixItemHeader, BidMatrixItemSubheaders } from './BidMatrixItemHeader'
import { BidMatrixSupplierRow } from './BidMatrixSupplierRow'
import { BidMatrixKpiCards } from './BidMatrixKpiCards'
import type { BidMatrix, LineItem, Supplier, SupplierBid } from '../types/aobTypes'

interface BidEvaluationMatrixProps {
  bidMatrix: BidMatrix
  itemsPerPage?: number
  actions?: React.ReactNode
}

function formatPHP(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '-'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function BidEvaluationMatrix({
  bidMatrix,
  itemsPerPage = 6,
  actions,
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

  const lineItems = useMemo(() => {
    return bidMatrix.lineItems || []
  }, [bidMatrix.lineItems])

  // Pagination
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

  // Calculate total bids, won items, and awarded amount per supplier across all items
  const supplierTotals = useMemo(() => {
    const totals: Record<string, { total: number; wonCount: number; awardedTotal: number }> = {}
    suppliers.forEach((supplier) => {
      let total = 0
      let wonCount = 0
      let awardedTotal = 0
      lineItems.forEach((item) => {
        const bid = item.lineItems?.find((b) => b.supplierId === supplier.id)
        if (bid?.totalBid && bid.totalBid > 0) {
          total += bid.totalBid
        }
        if (bid?.isWinner) {
          wonCount++
          if (bid.totalBid && bid.totalBid > 0) {
            awardedTotal += bid.totalBid
          }
        }
      })
      totals[supplier.id] = { total, wonCount, awardedTotal }
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

  // Calculate KPI card statistics
  const kpiData = useMemo(() => {
    let totalABC = 0
    let totalAwardAmount = 0
    let totalAwardedABC = 0
    let winnerCount = 0
    const winningSupplierIds = new Set<string>()

    lineItems.forEach((item) => {
      const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
      const qty = item.quantity || 1
      const itemTotalABC = item.totalABC || (abcUnitPrice * qty)
      totalABC += itemTotalABC

      const winnerBid = item.lineItems?.find((b) => b.isWinner)
      if (winnerBid) {
        winnerCount++
        winningSupplierIds.add(winnerBid.supplierId)
        const awardedAmt = winnerBid.totalBid || ((winnerBid.unitBid || 0) * qty)
        totalAwardAmount += awardedAmt
        totalAwardedABC += itemTotalABC
      }
    })

    const totalSavings = totalAwardedABC > totalAwardAmount ? totalAwardedABC - totalAwardAmount : 0
    const totalSavingsPercent = totalAwardedABC > 0 ? (totalSavings / totalAwardedABC) * 100 : 0
    const allAwarded = lineItems.length > 0 && winnerCount === lineItems.length
    const pendingCount = lineItems.length - winnerCount

    const winningSuppliersList = Array.from(winningSupplierIds)
      .map((id) => suppliers.find((s) => s.id === id)?.supplierName || suppliers.find((s) => s.id === id)?.name)
      .filter(Boolean)

    const winningSuppliersSubtitle =
      winningSuppliersList.length === 1
        ? winningSuppliersList[0]!
        : winningSuppliersList.length > 1
        ? `${winningSuppliersList.length} suppliers selected`
        : `${suppliers.length} participating suppliers`

    return {
      totalItems: lineItems.length,
      totalABC,
      responsiveBids: 0,
      totalSuppliers: suppliers.length,
      winnerCount,
      allAwarded,
      pendingCount,
      uniqueWinningSuppliersCount: winningSupplierIds.size,
      winningSuppliersSubtitle,
      totalAwardAmount,
      totalAwardedABC,
      totalSavings,
      totalSavingsPercent,
    }
  }, [lineItems, suppliers])

  const handleViewBidDetails = (supplier: Supplier, item: LineItem, bid: SupplierBid) => {
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
        <CardContent className="pt-6 text-center py-10">
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <AlertCircle className="w-8 h-8 text-muted-foreground/60" aria-hidden="true" />
            <p className="font-semibold text-foreground">No bid data available</p>
            <p className="text-xs text-muted-foreground">Please link RFQs to generate the comparison matrix.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
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
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {/* Top KPI Cards */}
          <BidMatrixKpiCards {...kpiData} />

          {/* Minimum Canvass Warning Alert */}
          {bidMatrix.hasMinimumCanvassWarning && (
            <Alert className="border-amber-300 bg-amber-50 text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <AlertTitle className="font-semibold text-amber-800">Minimum Canvass Notice</AlertTitle>
              <AlertDescription className="text-sm text-amber-700">
                Fewer than three (3) suppliers have submitted quotations. Under Philippine Procurement Law (RA 9184 & RA 12009) guidelines for Alternative Procurement (Shopping & Small Value Procurement), please ensure at least three suppliers are canvassed where possible.
              </AlertDescription>
            </Alert>
          )}

          {/* Sealed Bids Alert */}
          {bidMatrix.isBidsOpened === false && (
            <Alert className="border-blue-300 bg-blue-50 text-blue-900">
              <Lock className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <AlertTitle className="font-semibold text-blue-800">Sealed Bids Notice</AlertTitle>
              <AlertDescription className="text-sm text-blue-700">
                Quotation prices and attachments remain sealed until the scheduled Opening Date: {bidMatrix.openingDate ? new Date(bidMatrix.openingDate).toLocaleString() : 'Opening Date'}.
              </AlertDescription>
            </Alert>
          )}

          {/* Matrix Table */}
          <div className="overflow-x-auto border rounded-lg bg-card shadow-xs">
            <UITable>
              <TableHeader>
                <TableRow className="border-b bg-muted/40">
                  {/* Sticky Supplier Corner Header (Center Aligned) */}
                  <TableHead
                    rowSpan={2}
                    className="w-[200px] min-w-[200px] sticky left-0 top-0 z-30 bg-background border-r text-center align-middle font-semibold text-xs text-foreground py-3 shadow-xs"
                  >
                    Supplier / Bidder
                  </TableHead>

                  {/* Line Item Headers */}
                  {paginatedItems.map((item, idx) => (
                    <BidMatrixItemHeader
                      key={item.id}
                      item={item}
                      itemNumber={startIndex + idx + 1}
                      formatPHP={formatPHP}
                    />
                  ))}

                  {/* Package Total Header (Center Aligned) */}
                  <TableHead
                    rowSpan={2}
                    className="w-[140px] min-w-[140px] text-center bg-muted/30 border-x font-semibold text-xs align-middle text-foreground py-3"
                  >
                    Total Quotation
                  </TableHead>

                  {/* Award Header (Center Aligned with Amber Background) */}
                  <TableHead
                    rowSpan={2}
                    className="w-[120px] min-w-[120px] text-center bg-amber-50/70 dark:bg-amber-950/40 border-l align-middle font-semibold text-xs text-amber-900 dark:text-amber-300 py-3"
                  >
                    Award Status
                  </TableHead>
                </TableRow>

                {/* Subheaders: Unit Bid / Total Bid */}
                <TableRow className="border-b bg-muted/20">
                  {paginatedItems.map((item) => (
                    <BidMatrixItemSubheaders key={`${item.id}-subheaders`} itemId={item.id} />
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {suppliers.map((supplier) => {
                  const totalData = supplierTotals[supplier.id] || { total: 0, wonCount: 0, awardedTotal: 0 }
                  const isLowestOverall = lowestTotalSupplierId === supplier.id
                  const isFullPackageWinner = totalData.wonCount === lineItems.length && lineItems.length > 0

                  return (
                    <BidMatrixSupplierRow
                      key={supplier.id}
                      supplier={supplier}
                      paginatedItems={paginatedItems}
                      groupedBids={groupedData}
                      isBidsOpened={bidMatrix.isBidsOpened !== false}
                      awardCriterion={bidMatrix.awardCriterion || 'LCRB'}
                      totalData={totalData}
                      isLowestTotal={isLowestOverall}
                      isFullPackageWinner={isFullPackageWinner}
                      lineItemsCount={lineItems.length}
                      suppliersCount={suppliers.length}
                      formatPHP={formatPHP}
                      onViewBidDetails={handleViewBidDetails}
                    />
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
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
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
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
