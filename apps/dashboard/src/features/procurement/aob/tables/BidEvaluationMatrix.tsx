/**
 * Bid Evaluation Matrix Table Component
 * Displays supplier bids by line item with pagination and specifications
 * 
 * Features:
 * - Paginated bid tabulation by supplier and item
 * - Award criteria columns (LCRB/MEARB/MARB)
 * - Winner selection per item
 * - Item specifications and brochure viewer
 * - Manual data entry with auto-calculation
 * - Quality scoring and ratio calculations
 */

import React, { useMemo, useState } from 'react'
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
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

  // State for pagination
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

  // Extract suppliers from bidMatrix
  const suppliers = useMemo(() => {
    return bidMatrix.suppliers || []
  }, [bidMatrix.suppliers])

  const lineItems = bidMatrix.lineItems || []

  // Calculate pagination
  const totalPages = Math.ceil(lineItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = lineItems.slice(startIndex, endIndex)

  // Build grouped data from paginatedItems
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
    setViewingBidDetails({
      open: true,
      itemCode: item.itemCode,
      itemDescription: item.description,
      itemABC: item.approvedBudgetForContract,
      supplierName: supplier.supplierName,
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
                {/* Row 1: Supplier | Item headers (spanning 2 cols each) | Winner | Specs */}
                <TableRow className="border-b-0">
                  <TableHead rowSpan={2} className="w-[180px] sticky left-0 bg-white z-10 border-r text-center align-middle">
                    Supplier
                  </TableHead>
                  {paginatedItems.map((item) => (
                    <TableHead key={item.id} colSpan={3} className="text-center bg-gray-50 border-x">
                      <div className="flex flex-col items-center gap-1">
                        <div>
                          <div className="font-semibold text-xs">{item.itemCode}</div>
                          <div className="text-xs text-gray-600 line-clamp-2">{item.description}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead rowSpan={2} className="w-[90px] text-center bg-yellow-50 align-middle">
                    Winner
                  </TableHead>
                </TableRow>
                {/* Row 2: Sub-headers for ABC / Unit / Total per item */}
                <TableRow>
                  {paginatedItems.map((item) => (
                    <React.Fragment key={`${item.id}-subheader`}>
                      <TableHead className="text-center text-xs bg-gray-50 font-medium w-[100px]">
                        ABC
                      </TableHead>
                      <TableHead className="text-center text-xs bg-gray-50 font-medium w-[110px]">
                        Unit Price
                      </TableHead>
                      <TableHead className="text-center text-xs bg-gray-50 font-medium w-[120px] border-r">
                        Total
                      </TableHead>
                    </React.Fragment>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium sticky left-0 bg-white z-10 border-r text-center align-middle">
                      {supplier.supplierName}
                    </TableCell>
                    {paginatedItems.map((item) => {
                      const bid = groupedData[supplier.id]?.find((b) => b.lineItemId === item.id)
                      const exceedsABC = bid?.totalBid && item.approvedBudgetForContract && bid.totalBid > item.approvedBudgetForContract
                      
                      return (
                        <React.Fragment key={`${supplier.id}-${item.id}`}>
                          <TableCell className="text-center text-xs align-middle bg-gray-50 font-medium">
                            ₱{item.approvedBudgetForContract.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center text-sm align-middle">
                            {bid?.unitBid ? `₱${bid.unitBid.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell 
                            className={`text-center text-sm font-semibold align-middle border-r cursor-pointer hover:underline ${
                              exceedsABC 
                                ? 'bg-red-100 text-red-900' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => bid && handleViewBidDetails(supplier, item, bid)}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {bid?.totalBid ? `₱${bid.totalBid.toLocaleString()}` : '-'}
                              {exceedsABC && (
                                <Badge variant="soft" className="text-xs bg-red-200 text-red-800">
                                  Over ABC
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </React.Fragment>
                      )
                    })}
                    <TableCell className="text-center align-middle">
                      {paginatedItems.some((item) =>
                        groupedData[supplier.id]?.find((b) => b.lineItemId === item.id && b.isWinner)
                      ) && <Trophy className="w-4 h-4 text-yellow-500 mx-auto" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UITable>
          </div>

          {/* Pagination Controls */}
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

      {/* Bid Details Viewer Dialog */}
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
            offerDocumentUrl: viewingBidDetails.bid.offerDocumentUrl,
            isWinner: viewingBidDetails.bid.isWinner,
          }}
        />
      )}
    </>
  )
}
