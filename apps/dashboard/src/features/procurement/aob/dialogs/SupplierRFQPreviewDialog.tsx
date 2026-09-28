/**
 * Supplier RFQ Preview Dialog
 * Displays the complete Request for Quotation (RFQ) submission document for a specific supplier
 * within the Abstract of Bids (AOB) matrix.
 */

import React, { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Calendar,
  Clock,
  Download,
  FileCheck,
  FileText,
  Lock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
  X,
} from 'lucide-react'
import type { BidMatrix, Supplier, LineItem, SupplierBid } from '../types/aobTypes'
import { getSupplierRfqPdfBlobUrl } from '@/features/procurement/rfq/utils/generateRfqDocumentRequest'

interface SupplierRFQPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier | null
  bidMatrix: BidMatrix
}

function formatPHP(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '-'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function SupplierRFQPreviewDialog({
  open,
  onOpenChange,
  supplier,
  bidMatrix,
}: SupplierRFQPreviewDialogProps) {
  const [activeTab, setActiveTab] = useState<'pdf' | 'summary'>('pdf')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open || !supplier) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
      setPdfUrl(null)
      setPdfError(null)
      setIsLoadingPdf(false)
      return
    }

    // Load PDF preview
    const loadPdf = async () => {
      // If supplier uploaded a manual routed RFQ document
      if (supplier.quotationDocumentUrl) {
        setPdfUrl(supplier.quotationDocumentUrl)
        return
      }

      const targetRfqId =
        supplier.rfqId ||
        bidMatrix.linkedRFQs?.[0]?.id ||
        (bidMatrix as any).rfqId

      if (!targetRfqId) {
        setPdfError('No RFQ ID found to generate PDF document.')
        setActiveTab('summary')
        return
      }

      setIsLoadingPdf(true)
      setPdfError(null)

      try {
        const url = await getSupplierRfqPdfBlobUrl(
          targetRfqId,
          supplier.supplierId || supplier.id,
          false
        )
        blobUrlRef.current = url
        setPdfUrl(url)
      } catch (err: any) {
        setPdfError(err?.message || 'Failed to generate submitted RFQ PDF preview.')
      } finally {
        setIsLoadingPdf(false)
      }
    }

    loadPdf()

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [open, supplier, bidMatrix])

  if (!supplier) return null

  const isBidsOpened = bidMatrix.isBidsOpened !== false
  const supplierName = supplier.supplierName || supplier.name || 'Supplier'
  const rfqNumber = supplier.rfqNumber || bidMatrix.linkedRFQs?.[0]?.rfqNumber || 'RFQ'

  // Match line items with this supplier's bids
  const quotedItems = (bidMatrix.lineItems || []).map((item, index) => {
    const bid = item.lineItems?.find((b) => b.supplierId === supplier.id)
    const abcUnitPrice = item.abcUnitPrice || item.approvedBudgetForContract || 0
    const quantity = item.quantity || 1
    const totalABC = item.totalABC || abcUnitPrice * quantity
    const unitBid = bid?.unitBid ?? (bid?.unitPrice ?? null)
    const totalBid = bid?.totalBid ?? (bid?.totalPrice ?? (unitBid ? unitBid * quantity : null))
    const isOverABC = bid?.isOverABC ?? (unitBid != null && abcUnitPrice > 0 && unitBid > abcUnitPrice)

    return {
      index: index + 1,
      itemCode: item.itemCode || `Item #${index + 1}`,
      description: item.description || item.name || '',
      quantity,
      unit: item.unit || 'units',
      abcUnitPrice,
      totalABC,
      unitBid,
      totalBid,
      brand: bid?.brand,
      model: bid?.model,
      color: bid?.color,
      brochureFileUrl: bid?.brochureFileUrl || bid?.offerDocumentUrl,
      isResponsive: bid?.isResponsive !== false,
      disqualificationReason: bid?.disqualificationReason,
      isOverABC,
      rank: bid?.rank,
      score: bid?.score,
    }
  })

  // Calculate totals
  const totalABC = quotedItems.reduce((sum, it) => sum + it.totalABC, 0)
  const totalQuoted = quotedItems.reduce((sum, it) => sum + (it.totalBid || 0), 0)
  const hasValidQuotation = quotedItems.some((it) => it.totalBid != null && it.totalBid > 0)
  const savings = totalABC > totalQuoted && hasValidQuotation ? totalABC - totalQuoted : 0
  const savingsPercent = totalABC > 0 && savings > 0 ? (savings / totalABC) * 100 : 0

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `Submitted_RFQ_${rfqNumber}_${supplierName.replace(/[^a-z0-9]/gi, '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 print:m-0 print:p-0 print:max-w-none print:shadow-none print:border-none">
        {/* Modal Top Bar */}
        <div className="flex-none flex items-center justify-between border-b bg-muted/80 backdrop-blur-xs px-6 py-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Supplier RFQ Submission Preview
              </DialogTitle>
              <DialogDescription className="text-xs">
                Official quotation & submitted RFQ document for <b>{supplierName}</b>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'pdf' | 'summary')}
              className="mr-2"
            >
              <TabsList className="h-8">
                <TabsTrigger value="pdf" className="text-xs gap-1.5 px-3">
                  <FileText className="w-3.5 h-3.5" />
                  PDF Document
                </TabsTrigger>
                <TabsTrigger value="summary" className="text-xs gap-1.5 px-3">
                  <Building2 className="w-3.5 h-3.5" />
                  Quotation Details
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {pdfUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-1.5 text-xs h-8"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs h-8"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sealed Bids Banner */}
        {!isBidsOpened && (
          <div className="flex-none px-6 py-2 bg-blue-50 border-b border-blue-200 text-blue-900 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>
                <b>Sealed Bid Notice:</b> Line item quoted prices remain confidential until scheduled opening on{' '}
                {bidMatrix.openingDate ? new Date(bidMatrix.openingDate).toLocaleString() : 'opening date'}.
              </span>
            </div>
            <Badge variant="outline" className="border-blue-300 bg-blue-100 text-blue-800 text-[10px]">
              CONFIDENTIAL
            </Badge>
          </div>
        )}

        {/* Tab 1: PDF Viewer */}
        {activeTab === 'pdf' && (
          <div className="flex-1 min-h-[550px] max-h-[calc(92vh-75px)] w-full bg-slate-100 relative flex flex-col items-center justify-center">
            {isLoadingPdf ? (
              <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Generating submitted RFQ PDF preview...</span>
                <span className="text-xs text-muted-foreground">Rendering supplier quotation details</span>
              </div>
            ) : pdfError ? (
              <div className="p-8 max-w-md text-center space-y-4">
                <Alert variant="destructive">
                  <AlertTitle>Unable to generate PDF preview</AlertTitle>
                  <AlertDescription className="text-xs">{pdfError}</AlertDescription>
                </Alert>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('summary')}
                  className="gap-2 text-xs"
                >
                  <FileText className="w-4 h-4" />
                  Switch to Quotation Details Tab
                </Button>
              </div>
            ) : pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full min-h-[550px] border-0 flex-1"
                title={`Submitted RFQ - ${supplierName}`}
              />
            ) : (
              <div className="py-20 text-center text-muted-foreground text-sm">
                No PDF document available.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Structured Quotation Breakdown */}
        {activeTab === 'summary' && (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-background text-foreground print:p-4">
          {/* Header Banner */}
          <div className="text-center border-b pb-4 space-y-1">
            <div className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Republic of the Philippines
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              REQUEST FOR QUOTATION (RFQ) SUBMISSION
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground pt-1">
              <span>
                <b>RFQ No.:</b> {rfqNumber}
              </span>
              <span>•</span>
              <span>
                <b>AOB Reference:</b> {bidMatrix.aobNumber}
              </span>
              {bidMatrix.prNumber && (
                <>
                  <span>•</span>
                  <span>
                    <b>PR No.:</b> {bidMatrix.prNumber}
                  </span>
                </>
              )}
              {bidMatrix.papCode && (
                <>
                  <span>•</span>
                  <span>
                    <b>PAP Code:</b> {bidMatrix.papCode}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Sealed Bids Warning (if bids are still sealed) */}
          {!isBidsOpened && (
            <Alert className="border-blue-300 bg-blue-50 text-blue-900 print:hidden">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertTitle className="font-semibold text-blue-800">Sealed Bid Notice</AlertTitle>
              <AlertDescription className="text-xs text-blue-700">
                This quotation is sealed. Line item prices are hidden until the scheduled opening on{' '}
                {bidMatrix.openingDate ? new Date(bidMatrix.openingDate).toLocaleString() : 'scheduled date'}.
              </AlertDescription>
            </Alert>
          )}

          {/* Supplier Details & Commercial Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Information Card */}
            <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Supplier / Bidder Information
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Name:</span>
                  <span className="font-semibold text-right">{supplierName}</span>
                </div>
                {supplier.contactPerson && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact Person:</span>
                    <span className="font-medium text-right">{supplier.contactPerson}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-right">{supplier.email}</span>
                  </div>
                )}
                {supplier.contactNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact Number:</span>
                    <span className="font-medium text-right">{supplier.contactNumber}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Business Address:</span>
                    <span className="font-medium text-right max-w-[240px] truncate" title={supplier.address}>
                      {supplier.address}
                    </span>
                  </div>
                )}
                {supplier.tinNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TIN:</span>
                    <span className="font-medium text-right">{supplier.tinNumber}</span>
                  </div>
                )}
                {supplier.philGEPSNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PhilGEPS Reg. No.:</span>
                    <span className="font-medium text-right">{supplier.philGEPSNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Commercial Terms & Submission Details Card */}
            <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Submission & Commercial Terms
                </h3>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Submission Type:</span>
                  {supplier.submissionType ? (
                    <Badge variant="outline" className="text-[10px] py-0 px-2 font-semibold">
                      {supplier.submissionType}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date Submitted:</span>
                  <span className="font-medium text-right">
                    {supplier.submittedAt
                      ? new Date(supplier.submittedAt).toLocaleString()
                      : 'Not submitted'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Period:</span>
                  <span className="font-medium text-right">
                    {supplier.deliveryPeriod || 'Per RFQ requirements'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Validity:</span>
                  <span className="font-medium text-right">
                    {supplier.validityPeriodDays
                      ? `${supplier.validityPeriodDays} calendar days`
                      : 'Per standard validity'}
                  </span>
                </div>
                {supplier.paymentTerms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Terms:</span>
                    <span className="font-medium text-right">{supplier.paymentTerms}</span>
                  </div>
                )}
                {supplier.warrantyTerms && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Warranty Terms:</span>
                    <span className="font-medium text-right">{supplier.warrantyTerms}</span>
                  </div>
                )}
                {supplier.remarks && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remarks:</span>
                    <span className="font-medium text-right italic text-muted-foreground max-w-[200px]">
                      {supplier.remarks}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quotation Table */}
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quotation / Bid Line Items
              </span>
              <span className="text-xs text-muted-foreground">
                Total Items: {quotedItems.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-[11px] bg-muted/20">
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    <TableHead className="min-w-[180px]">Item Description</TableHead>
                    <TableHead className="w-[80px] text-center">Qty</TableHead>
                    <TableHead className="w-[110px] text-right">ABC (Unit)</TableHead>
                    <TableHead className="w-[120px] text-right">Quoted Unit</TableHead>
                    <TableHead className="w-[130px] text-right">Quoted Total</TableHead>
                    <TableHead className="w-[140px] text-center">Offered Specs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotedItems.map((item) => (
                    <TableRow key={item.index} className="text-xs">
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {item.index}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{item.description}</div>
                        <div className="text-[10px] text-muted-foreground">{item.itemCode}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatPHP(item.abcUnitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {!isBidsOpened ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground italic">
                            <Lock className="w-3 h-3" /> Sealed
                          </span>
                        ) : item.unitBid != null ? (
                          <div className="flex flex-col items-end">
                            <span className={item.isOverABC ? 'text-destructive font-bold' : 'font-bold'}>
                              {formatPHP(item.unitBid)}
                            </span>
                            {item.isOverABC && (
                              <Badge
                                variant="outline"
                                className="text-[9px] py-0 px-1 border-destructive text-destructive"
                              >
                                Over ABC
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isBidsOpened ? (
                          <span className="text-[11px] text-muted-foreground italic">Sealed</span>
                        ) : item.totalBid != null ? (
                          <span className="font-bold text-foreground">
                            {formatPHP(item.totalBid)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {!isBidsOpened ? (
                          <span className="text-[11px] text-muted-foreground italic">Sealed</span>
                        ) : (item.brand || item.model || item.color) ? (
                          <div className="text-[11px] space-y-0.5">
                            {item.brand && <div><b>Brand:</b> {item.brand}</div>}
                            {item.model && <div><b>Model:</b> {item.model}</div>}
                            {item.color && <div><b>Color:</b> {item.color}</div>}
                            {item.brochureFileUrl && (
                              <a
                                href={item.brochureFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-primary hover:underline inline-flex items-center gap-0.5 mt-0.5"
                              >
                                <Download className="w-3 h-3" /> View Brochure
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">As specified</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total Quotation Summary */}
            <div className="border-t p-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-muted-foreground">
                Approved Budget for the Contract (Total ABC):{' '}
                <span className="font-semibold text-foreground">{formatPHP(totalABC)}</span>
              </div>
              <div className="flex items-center gap-4">
                {isBidsOpened && savings > 0 && (
                  <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                    Savings: +{formatPHP(savings)} ({savingsPercent.toFixed(1)}%)
                  </div>
                )}
                <div className="text-right">
                  <span className="text-muted-foreground mr-2">Total Quoted Amount:</span>
                  <span className="text-base font-bold text-primary">
                    {!isBidsOpened ? 'Sealed' : formatPHP(totalQuoted)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Certification Clause */}
          <div className="border rounded-lg p-4 bg-muted/10 text-xs text-muted-foreground space-y-3">
            <p className="italic leading-relaxed">
              "After having carefully read and accepted the General Conditions and Technical Specifications,
              I/We quote you on the item(s) at prices noted above. I/We certify that the prices quoted above are
              valid and binding upon us for the period specified."
            </p>
            <div className="pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                {supplier.signatureUrl && (
                  <img
                    src={supplier.signatureUrl}
                    alt="Authorized Signature"
                    className="h-10 max-w-[160px] object-contain mb-1"
                  />
                )}
                <span className="font-semibold text-foreground">
                  {supplier.signatoryName || supplier.contactPerson || supplierName}
                </span>
                <div className="text-[10px] text-muted-foreground">
                  Authorized Signatory / Bidder Representative
                </div>
              </div>
              <div className="text-right text-[11px]">
                <div>
                  <b>Date Signed:</b>{' '}
                  {supplier.dateSigned
                    ? new Date(supplier.dateSigned).toLocaleDateString()
                    : supplier.submittedAt
                    ? new Date(supplier.submittedAt).toLocaleDateString()
                    : 'N/A'}
                </div>
                {supplier.submissionType && (
                  <div className="text-[10px] text-muted-foreground">
                    Mode: {supplier.submissionType}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
