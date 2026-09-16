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
import { Trophy, AlertCircle, ChevronLeft, ChevronRight, Lock, AlertTriangle } from 'lucide-react'
import { BidDetailsViewer } from '../components/BidDetailsViewer'
import type { BidMatrix, SupplierBid } from '../types/aobTypes'

interface BidEvaluationMatrixProps {
  bidMatrix: BidMatrix
  itemsPerPage?: number
}

export function BidEvaluationMatrix({
  bidMatrix,
  itemsPerPage = 3,
}: BidEvaluationMatrixProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [viewingBidDetails, setViewingBidDetails] = useState<{
    open: boolean
    itemCode: string
    itemDescription: string
    itemABC: number
    unitABC?: number
    quantity?: number
    supplierName: string
    bid: SupplierBid | null
  }>({
    open: false,
    itemCode: '',
    itemDescription: '',
    itemABC: 0,
    unitABC: 0,
    quantity: 0,
    supplierName: '',
    bid: null,
  })

  const suppliers = useMemo(() => {
    return bidMatrix.suppliers || []
  }, [bidMatrix.suppliers])

  const lineItems = bidMatrix.lineItems || []

  const totalPages = Math.ceil(lineItems.length / itemsPerPage)
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

  const handleViewBidDetails = (supplier: typeof suppliers[0], item: typeof paginatedItems[0], bid: SupplierBid) => {
    const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
    const totalABC = item.totalABC || (abcUnitPrice * (item.quantity || 1))

    setViewingBidDetails({
      open: true,
      itemCode: item.itemCode || item.id.substring(0, 8),
      itemDescription: item.description || item.name || '',
      itemABC: totalABC,
      unitABC: abcUnitPrice,
      quantity: item.quantity,
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
              Fewer than three (3) suppliers have submitted quotations. Under Philippine Procurement Law (RA 12009) guidelines for Alternative Procurement (Shopping & Small Value Procurement), please ensure at least three suppliers are canvassed where possible.
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
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bid Evaluation Matrix</CardTitle>
                <CardDescription>
                  Tabulation of bids by supplier and line item with award criteria evaluation
                  {lineItems.length > itemsPerPage && (
                    <span className="ml-2 text-xs font-medium">
                      (Showing {startIndex + 1} - {Math.min(endIndex, lineItems.length)} of {lineItems.length} items)
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto border rounded-lg">
              <UITable>
                <TableHeader>
                  <TableRow className="border-b-0">
                    <TableHead rowSpan={2} className="w-[180px] sticky left-0 bg-white z-10 border-r text-center align-middle">
                      Supplier
                    </TableHead>
                    {paginatedItems.map((item) => {
                      const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
                      const totalABC = item.totalABC || (abcUnitPrice * (item.quantity || 1))

                      return (
                        <TableHead key={item.id} colSpan={3} className="text-center bg-gray-50 border-x py-2.5">
                          <div className="flex flex-col items-center gap-1 px-1">
                            <div className="font-semibold text-xs text-gray-900">{item.itemCode || item.id.substring(0, 8)}</div>
                            <div className="text-xs text-gray-600 line-clamp-2 max-w-[280px]" title={item.description || item.name}>
                              {item.description || item.name}
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-0.5 text-xs">
                              <span className="text-gray-500 font-medium">Qty: {item.quantity}</span>
                              <span className="text-gray-300">•</span>
                              <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 text-blue-700 border-blue-200 py-0.5 px-2">
                                Approved ABC: ₱{totalABC.toLocaleString()}
                              </Badge>
                            </div>
                          </div>
                        </TableHead>
                      )
                    })}
                    <TableHead rowSpan={2} className="w-[90px] text-center bg-yellow-50 align-middle">
                      Winner
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    {paginatedItems.map((item) => {
                      const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
                      const totalABC = item.totalABC || (abcUnitPrice * (item.quantity || 1))

                      return (
                        <React.Fragment key={`${item.id}-subheader`}>
                          <TableHead className="text-center text-xs bg-gray-50 font-medium w-[100px]">
                            ABC Unit
                          </TableHead>
                          <TableHead className="text-center text-xs bg-gray-50 font-medium w-[110px]">
                            Unit Price
                          </TableHead>
                          <TableHead className="text-center text-xs bg-gray-50 font-medium w-[120px] border-r">
                            <div className="flex flex-col items-center leading-tight">
                              <span>Total</span>
                              <span className="text-[10px] text-gray-400 font-normal">ABC: ₱{totalABC.toLocaleString()}</span>
                            </div>
                          </TableHead>
                        </React.Fragment>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium sticky left-0 bg-white z-10 border-r text-center align-middle">
                        <div>
                          <div>{supplier.supplierName || supplier.name}</div>
                          {supplier.submissionType && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 mt-1 font-normal">
                              {supplier.submissionType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      {paginatedItems.map((item) => {
                        const bid = groupedData[supplier.id]?.find((b) => b.lineItemId === item.id || b.rfqItemId === item.id)
                        const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
                        const itemTotalABC = item.totalABC || (abcUnitPrice * (item.quantity || 1))
                        const exceedsABC = bid?.isOverABC || (bid?.unitBid && abcUnitPrice > 0 && bid.unitBid > abcUnitPrice)
                        
                        return (
                          <React.Fragment key={`${supplier.id}-${item.id}`}>
                            <TableCell className="text-center text-xs align-middle bg-gray-50 font-medium">
                              ₱{abcUnitPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center text-sm align-middle">
                              {bidMatrix.isBidsOpened === false ? (
                                <span className="text-xs text-muted-foreground italic">Sealed</span>
                              ) : bid?.unitBid ? (
                                <div>
                                  <div>₱{bid.unitBid.toLocaleString()}</div>
                                  {bid.rank && bid.rank > 0 && !exceedsABC && (
                                    <Badge variant="outline" className="text-[10px] py-0 px-1 font-semibold text-emerald-700 bg-emerald-50 border-emerald-300">
                                      Rank {bid.rank} ({bid.score}%)
                                    </Badge>
                                  )}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell 
                              className={`text-center text-sm font-semibold align-middle border-r cursor-pointer ${
                                exceedsABC 
                                  ? 'bg-red-50 text-red-900' 
                                  : 'hover:bg-gray-100'
                              }`}
                              title={exceedsABC ? `Exceeds Approved ABC of ₱${itemTotalABC.toLocaleString()}` : undefined}
                              onClick={() => bid && handleViewBidDetails(supplier, item, bid)}
                            >
                              {bidMatrix.isBidsOpened === false ? (
                                <span className="text-xs text-muted-foreground italic">Sealed</span>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span>{bid?.totalBid ? `₱${bid.totalBid.toLocaleString()}` : '-'}</span>
                                  {exceedsABC && (
                                    <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-300" title={`Exceeds Approved ABC of ₱${itemTotalABC.toLocaleString()}`}>
                                      Over ABC
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </React.Fragment>
                        )
                      })}
                      <TableCell className="text-center align-middle">
                        {paginatedItems.some((item) =>
                          groupedData[supplier.id]?.find((b) => (b.lineItemId === item.id || b.rfqItemId === item.id) && b.isWinner)
                        ) && <Trophy className="w-4 h-4 text-yellow-500 mx-auto" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </UITable>
            </div>

            {lineItems.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
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
          unitABC={viewingBidDetails.unitABC}
          quantity={viewingBidDetails.quantity}
          supplierName={viewingBidDetails.supplierName}
          bidDetails={{
            unitBid: viewingBidDetails.bid.unitBid,
            totalBid: viewingBidDetails.bid.totalBid,
            brand: viewingBidDetails.bid.brand,
            model: viewingBidDetails.bid.model,
            color: viewingBidDetails.bid.color,
            rank: viewingBidDetails.bid.rank,
            score: viewingBidDetails.bid.score,
            qualityScore: viewingBidDetails.bid.qualityScore,
            calculatedQualityPriceRatio: viewingBidDetails.bid.calculatedQualityPriceRatio,
            remarks: viewingBidDetails.bid.remarks,
            offerDocumentUrl: viewingBidDetails.bid.brochureFileUrl || viewingBidDetails.bid.offerDocumentUrl,
            brochureFileUrl: viewingBidDetails.bid.brochureFileUrl,
            isWinner: viewingBidDetails.bid.isWinner,
          }}
        />
      )}
    </>
  )
}
