import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { printAOB, exportAOBCSV } from '../utils/printAOB'
import { generateAndDownloadAobDocument } from '../handlers/generateAOBDocumentRequest'
import {
  fetchAgencyLetterhead,
  fetchAgencyLogoBlob,
  formatLogoUrl,
  type AgencyLetterheadDto,
} from '@/services/api/agencyLetterhead'
import { toast } from 'sonner'
import type { AOB, BidMatrix } from '../types/aobTypes'

interface ExportAOBDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aob: AOB
  bidMatrix: BidMatrix | null | undefined
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '—'
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function ExportAOBDialog({
  open,
  onOpenChange,
  aob,
  bidMatrix,
}: ExportAOBDialogProps) {
  const lineItems = bidMatrix?.lineItems || []
  const suppliers = bidMatrix?.suppliers || []

  const projectName =
    aob.projectName ||
    aob.description ||
    (bidMatrix?.rfqNumber ? `Procurement for ${bidMatrix.rfqNumber}` : '[PROJECT NAME]')
  const modeOfProcurement =
    aob.modeOfProcurement ||
    aob.procurementMode ||
    'Negotiated Procurement - Small Value Procurement - Section 53.9'
  const deliveryLocation = aob.deliveryLocation || '[DELIVERY LOCATION]'
  const implementingOffice =
    aob.implementingOffice || aob.department || aob.endUser || '[IMPLEMENTING OFFICE]'

  const totalABC = lineItems.reduce((sum, item) => {
    const unitABC = item.abcUnitPrice || item.approvedBudgetForContract || 0
    const qty = item.quantity || 1
    return sum + (item.totalABC || unitABC * qty)
  }, 0)

  const supplierTotals: Record<string, number> = {}
  suppliers.forEach((s) => {
    let total = 0
    lineItems.forEach((item) => {
      const bid = item.lineItems?.find((b) => b.supplierId === s.id)
      if (bid) {
        const qty = item.quantity || 1
        const bidTotal = bid.totalBid ?? (bid.unitBid ? bid.unitBid * qty : 0)
        total += bidTotal
      }
    })
    supplierTotals[s.id] = total
  })

  const [agencyLetterhead, setAgencyLetterhead] = useState<AgencyLetterheadDto | null>(null)
  const [logoBlobUrl, setLogoBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetchAgencyLetterhead()
      .then((data) => {
        if (!active) return
        setAgencyLetterhead(data)
        if (data?.hasLogo) {
          fetchAgencyLogoBlob().then((blob) => {
            if (active && blob) {
              setLogoBlobUrl(blob)
            }
          })
        }
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const entityName = agencyLetterhead?.name?.trim() || 'CENTRAL MINDANAO UNIVERSITY'
  const entityAddress =
    agencyLetterhead?.address?.trim() ||
    'University Town, Musuan, Maramag, Bukidnon, Philippines'
  const logoUrl = logoBlobUrl || formatLogoUrl(agencyLetterhead)

  const [isGeneratingBackendDoc, setIsGeneratingBackendDoc] = useState(false)

  const handlePrint = () => {
    printAOB(aob, bidMatrix, {
      name: entityName,
      address: entityAddress,
      logoUrl,
    })
  }

  const handleDownloadCSV = () => {
    exportAOBCSV(aob, bidMatrix)
  }

  const handleGenerateBackendPDF = async () => {
    try {
      setIsGeneratingBackendDoc(true)
      await generateAndDownloadAobDocument({
        aobId: aob.id,
        format: 'Pdf',
        filename: `Abstract_of_Quotation_${aob.aobNumber || 'AOB'}.pdf`,
      })
      toast.success('Official Abstract of Quotation PDF generated and downloaded successfully')
    } catch (err) {
      console.error('Backend document generation error:', err)
      const msg = err instanceof Error ? err.message : 'Failed to generate official document'
      toast.error(msg)
    } finally {
      setIsGeneratingBackendDoc(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl" className="max-h-[92vh] flex flex-col p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">
                Export Abstract of Quotation
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Official Philippine Government template (RA 9184) for bid tabulation and committee award recommendation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Paper Document Preview Container */}
        <div className="flex-1 overflow-auto my-3 border rounded-lg bg-slate-50 dark:bg-slate-950 p-4">
          <div className="bg-white text-black p-6 rounded shadow-sm border border-slate-300 font-sans text-[11px] leading-snug max-w-[1000px] mx-auto">
            {/* Agency Letterhead */}
            <div className="flex items-center gap-3.5 mb-4 border-b border-gray-200 pb-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Official Agency Seal"
                  className="w-12 h-12 object-contain shrink-0"
                  onError={() => setLogoBlobUrl(null)}
                />
              ) : (
                <div className="w-12 h-12 rounded border border-dashed flex items-center justify-center shrink-0 text-gray-400 bg-gray-50">
                  <span className="text-[10px] font-bold">SEAL</span>
                </div>
              )}
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  Republic of the Philippines
                </div>
                <div className="text-xs font-bold uppercase tracking-tight text-gray-900">
                  {entityName}
                </div>
                {entityAddress && (
                  <div className="text-[9.5px] text-gray-600 leading-tight mt-0.5">
                    {entityAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Title Header */}
            <div className="text-center mb-4">
              <h1 className="text-sm font-bold tracking-wide uppercase">
                ABSTRACT OF QUOTATION
              </h1>
              <h2 className="text-xs font-semibold text-gray-800">
                ({modeOfProcurement})
              </h2>
              <div className="mx-auto mt-1.5 h-[1.5px] max-w-[220px] bg-black" />
            </div>

            {/* Metadata Block */}
            <div className="mb-3 text-[10px] space-y-0.5 text-gray-900">
              <div className="flex">
                <span className="w-36 font-bold uppercase shrink-0">PROJECT NAME:</span>
                <span className="font-bold flex-1">{projectName}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-bold uppercase shrink-0">DELIVERY LOCATION:</span>
                <span className="font-bold flex-1">{deliveryLocation}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-bold uppercase shrink-0">IMPLEMENTING OFFICE:</span>
                <span className="font-bold flex-1">{implementingOffice}</span>
              </div>
              <div className="flex">
                <span className="w-36 font-bold uppercase shrink-0">APPROVED TOTAL COST:</span>
                <span className="font-bold flex-1">{formatCurrency(totalABC)}</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-black">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-black">
                    <th rowSpan={2} className="border-r border-black p-1.5 text-center font-bold text-[9px] w-8">
                      ITEM #
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 text-center font-bold text-[9px] w-10">
                      QTY
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 text-center font-bold text-[9px] w-12">
                      UNIT
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 text-center font-bold text-[9px] min-w-[180px]">
                      DESCRIPTIONS AND SPECIFICATIONS
                    </th>
                    <th rowSpan={2} className="border-r border-black p-1.5 text-center font-bold text-[9px] w-20">
                      UNIT COST
                    </th>
                    {suppliers.map((s) => (
                      <th
                        key={s.id}
                        colSpan={2}
                        className="border-r last:border-r-0 border-black p-1.5 text-center bg-gray-50"
                      >
                        <div className="font-bold text-[9px] leading-tight">
                          {s.supplierName || s.name || 'SUPPLIER'}
                        </div>
                        <div className="font-normal text-[8px] text-gray-600 mt-0.5">
                          {s.address || s.contactNumber || '[ADDRESS / CONTACT]'}
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr className="border-b border-black bg-gray-50">
                    {suppliers.map((s) => (
                      <React.Fragment key={`${s.id}-cols`}>
                        <th className="border-r border-black p-1 text-center font-bold text-[8.5px] w-28">
                          OFFER
                        </th>
                        <th className="border-r last:border-r-0 border-black p-1 text-center font-bold text-[8.5px] w-20">
                          UNIT PRICE
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, idx) => {
                    const abcUnit = item.abcUnitPrice || item.approvedBudgetForContract || 0
                    const displayName = item.itemName || item.description || item.name || `Item #${idx + 1}`
                    const itemCode = item.itemCode || `${idx + 1}`

                    return (
                      <tr key={item.id} className="border-b border-black">
                        <td className="border-r border-black p-1.5 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="border-r border-black p-1.5 text-center">
                          {item.quantity}
                        </td>
                        <td className="border-r border-black p-1.5 text-center">
                          {item.unit || '[UNIT]'}
                        </td>
                        <td className="border-r border-black p-1.5 align-top">
                          <div className="font-bold">{displayName}</div>
                          {item.description && item.description !== displayName && (
                            <div className="text-[9px] text-gray-700 mt-0.5 line-clamp-3">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="border-r border-black p-1.5 text-right font-bold align-top">
                          {formatCurrency(abcUnit)}
                        </td>
                        {suppliers.map((s) => {
                          const bid = item.lineItems?.find((b) => b.supplierId === s.id)
                          if (!bid || (!bid.unitBid && !bid.totalBid)) {
                            return (
                              <React.Fragment key={`${s.id}-${item.id}`}>
                                <td className="border-r border-black p-1 text-center text-gray-400">
                                  —
                                </td>
                                <td className="border-r last:border-r-0 border-black p-1 text-center font-bold text-[8.5px]">
                                  DID NOT SUBMIT
                                </td>
                              </React.Fragment>
                            )
                          }

                          const unitPrice = bid.unitBid ?? (bid.totalBid ? bid.totalBid / (item.quantity || 1) : 0)
                          const isWinner = Boolean(bid.isWinner)

                          return (
                            <React.Fragment key={`${s.id}-${item.id}`}>
                              <td className="border-r border-black p-1 text-[9px] leading-tight align-top">
                                <div>{bid.remarks || bid.brand || 'As per specifications'}</div>
                                {bid.deliveryPeriod && (
                                  <div className="text-[8px] text-gray-600 mt-0.5">
                                    Delivery: {bid.deliveryPeriod}
                                  </div>
                                )}
                                <div className="text-[8px] text-gray-600">Qty: {item.quantity}</div>
                                {bid.totalBid && (
                                  <div className="text-[8px] font-semibold text-gray-800">
                                    Subtotal: {formatCurrency(bid.totalBid)}
                                  </div>
                                )}
                              </td>
                              <td className="border-r last:border-r-0 border-black p-1 text-right align-middle">
                                {isWinner ? (
                                  <div className="border-2 border-black px-1.5 py-0.5 font-bold inline-block text-right">
                                    {formatCurrency(unitPrice)}
                                  </div>
                                ) : (
                                  <span className="font-semibold">{formatCurrency(unitPrice)}</span>
                                )}
                              </td>
                            </React.Fragment>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold border-t border-black">
                    <td colSpan={4} className="border-r border-black p-1.5 text-right pr-3">
                      Total
                    </td>
                    <td className="border-r border-black p-1.5 text-right">
                      {formatCurrency(totalABC)}
                    </td>
                    {suppliers.map((s) => {
                      const total = supplierTotals[s.id] || 0
                      const hasWon = lineItems.some((i) => i.lineItems?.find((b) => b.supplierId === s.id)?.isWinner)
                      if (total === 0) {
                        return (
                          <React.Fragment key={`${s.id}-total`}>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r last:border-r-0 border-black p-1 text-center text-gray-400">
                              —
                            </td>
                          </React.Fragment>
                        )
                      }
                      return (
                        <React.Fragment key={`${s.id}-total`}>
                          <td className="border-r border-black p-1"></td>
                          <td className="border-r last:border-r-0 border-black p-1 text-right align-middle">
                            {hasWon ? (
                              <div className="border-2 border-black px-1.5 py-0.5 font-bold inline-block text-right">
                                {formatCurrency(total)}
                              </div>
                            ) : (
                              <span>{formatCurrency(total)}</span>
                            )}
                          </td>
                        </React.Fragment>
                      )
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Recommendation Note */}
            <div className="mt-2 text-[9px] italic font-bold">
              The Bids and Awards Committee recommends the award to the supplier with the lowest complying proposal that is boxed
            </div>

            {/* Signatories Grid */}
            <div className="grid grid-cols-6 gap-2 mt-8 text-center text-[9px]">
              <div>
                <div className="font-bold underline text-[9.5px]">
                  {aob.signatories?.[0]?.name || '[BAC CHAIRPERSON]'}
                </div>
                <div className="text-[8.5px] text-gray-800">
                  {aob.signatories?.[0]?.title || 'BAC Chairperson'}
                </div>
              </div>
              <div>
                <div className="font-bold underline text-[9.5px]">
                  {aob.signatories?.[1]?.name || '[BAC VICE CHAIRPERSON]'}
                </div>
                <div className="text-[8.5px] text-gray-800">
                  {aob.signatories?.[1]?.title || 'BAC Vice Chairperson'}
                </div>
              </div>
              <div>
                <div className="font-bold underline text-[9.5px]">
                  {aob.signatories?.[2]?.name || '[BAC REGULAR MEMBER]'}
                </div>
                <div className="text-[8.5px] text-gray-800">
                  {aob.signatories?.[2]?.title || 'BAC Regular Member'}
                </div>
              </div>
              <div>
                <div className="font-bold underline text-[9.5px]">
                  {aob.signatories?.[3]?.name || '[BAC REGULAR MEMBER]'}
                </div>
                <div className="text-[8.5px] text-gray-800">
                  {aob.signatories?.[3]?.title || 'BAC Regular Member'}
                </div>
              </div>
              <div>
                <div className="font-bold underline text-[9.5px]">
                  {aob.signatories?.[4]?.name || '[PROVISIONAL MEMBER]'}
                </div>
                <div className="text-[8.5px] text-gray-800">
                  {aob.signatories?.[4]?.title || 'Provisional Member, End-user Rep'}
                </div>
              </div>
              <div>
                <div className="font-bold underline text-[9.5px]">
                  {aob.signatories?.[5]?.name || '[PROVISIONAL MEMBER]'}
                </div>
                <div className="text-[8.5px] text-gray-800">
                  {aob.signatories?.[5]?.title || 'Provisional Member, Tech Rep'}
                </div>
              </div>
            </div>

            {/* Approval Section */}
            <div className="mt-6 ml-6">
              <div className="text-[9.5px] font-bold mb-4">APPROVED BY:</div>
              <div className="font-bold underline text-[10.5px]">
                {aob.approverName || (aob.approvedBy && typeof aob.approvedBy === 'string' ? aob.approvedBy : null) || bidMatrix?.approverName || '[HEAD OF PROCURING ENTITY / APPROVING AUTHORITY]'}
              </div>
              <div className="text-[9px] text-gray-800">
                {aob.approverTitle || bidMatrix?.approverTitle || '[POSITION / DESIGNATION]'}
              </div>
            </div>

            {/* Reference Codes (Bottom Left) */}
            <div className="mt-6 text-[8px] leading-normal text-gray-800 space-y-0.5">
              <div>
                <span className="font-bold">RFQ No.:</span> {aob.rfqNumber || (bidMatrix as any)?.rfqNumber || aob.rfqs?.[0]?.rfqNumber || '[RFQ NUMBER]'}
              </div>
              <div>
                <span className="font-bold">BAC RES. NO.:</span> {aob.bacResolutionNumber || bidMatrix?.bacResolutionNumber || '[BAC RES. NO.]'}
              </div>
              <div>
                <span className="font-bold">PR No.:</span> {aob.prNumber || bidMatrix?.prNumber || '[PR NUMBER]'}
              </div>
              <div>
                <span className="font-bold">Code (PAP):</span> {aob.papCode || bidMatrix?.papCode || '[PAP CODE]'}
              </div>
            </div>

            {/* Document Footer */}
            <div className="mt-4 pt-2 border-t border-gray-300 flex justify-between text-[8px] text-gray-500">
              <div>ERP-EZ · Procurement Management System</div>
              <div>1 of 1</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="gap-2 sm:justify-between border-t pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-1.5 text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Download CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateBackendPDF}
              disabled={isGeneratingBackendDoc}
              className="gap-1.5 text-xs text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              {isGeneratingBackendDoc ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isGeneratingBackendDoc ? 'Generating PDF...' : 'Download Official PDF (Server)'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
              Close
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs bg-primary text-primary-foreground">
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
