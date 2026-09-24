import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Mail, Phone, User, Building, Download, Loader2, Hash, Award, ShieldCheck, Tag, FolderOpen, Info } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { SupplierBid } from '../types'
import { previewDocument } from '../utils'

interface ReviewWorkspaceProps {
  selectedBid: SupplierBid | undefined
  projectId?: string
  isCompetitiveBidding?: boolean
  evalStatus: string
  evalRemarks?: string
  onEvalStatusChange: (status: string) => void
  onEvalRemarksChange?: (remarks: string) => void
  onSaveEvaluation: () => void
  onBulkDownload?: () => void
  isDownloading?: boolean
}

export function ReviewWorkspace({
  selectedBid,
  projectId,
  isCompetitiveBidding = false,
  evalStatus,
  evalRemarks = '',
  onEvalStatusChange,
  onEvalRemarksChange,
  onSaveEvaluation,
  onBulkDownload,
  isDownloading = false,
}: ReviewWorkspaceProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [previewingDocId, setPreviewingDocId] = useState<string | null>(null)

  const handlePreviewDocument = async (doc: { id: string; name: string; url: string; type?: string }) => {
    if (!doc.url) return
    setPreviewingDocId(doc.id)
    try {
      await previewDocument(doc.url, doc.name, doc.type)
    } catch (error) {
      console.error('Failed to preview document:', error)
      toast({
        title: 'Document Unavailable',
        description: 'The requested document could not be retrieved from storage. Please verify that the file exists.',
        variant: 'destructive',
      })
    } finally {
      setPreviewingDocId(null)
    }
  }

  if (!selectedBid) {
    return (
      <Card className="md:col-span-8 h-full flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
          <FileText className="h-12 w-12 opacity-20 mb-4" />
          <p>Select an applicant or bidder from the left to review their submission.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="md:col-span-8 h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-4 border-b bg-muted/20 flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle>{selectedBid.supplierName}</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase">
              {selectedBid.source === 'rfq' ? 'RFQ Bid' : 'Public Application'}
            </Badge>
          </div>
          <CardDescription>Submitted on {new Date(selectedBid.submittedAt).toLocaleString()}</CardDescription>
        </div>
        {selectedBid.totalBidAmount > 0 && (
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground font-medium">Total Quoted Bid</div>
            <div className="text-xl font-bold text-primary">₱{selectedBid.totalBidAmount.toLocaleString()}</div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Supplier Details Section */}
        <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
          <h3 className="text-sm font-semibold">Supplier Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedBid.supplierCategory && (
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{selectedBid.supplierCategory}</p>
                </div>
              </div>
            )}
            {selectedBid.contactPerson && (
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Contact Person</p>
                  <p className="text-sm font-medium">{selectedBid.contactPerson}</p>
                </div>
              </div>
            )}
            {selectedBid.contactNumber && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{selectedBid.contactNumber}</p>
                </div>
              </div>
            )}
            {selectedBid.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-medium break-all">{selectedBid.email}</p>
                </div>
              </div>
            )}
            {selectedBid.registrationNumber && (
              <div className="flex items-start gap-3">
                <Hash className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Business Permit / Reg No.</p>
                  <p className="text-sm font-medium">{selectedBid.registrationNumber}</p>
                </div>
              </div>
            )}
            {selectedBid.tinNumber && (
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">TIN Number</p>
                  <p className="text-sm font-medium">{selectedBid.tinNumber}</p>
                </div>
              </div>
            )}
          </div>
          {selectedBid.businessAddress && (
            <div className="flex items-start gap-3">
              <Building className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Address</p>
                <p className="text-sm font-medium">{selectedBid.businessAddress}</p>
              </div>
            </div>
          )}
          {selectedBid.philGepsStatus && (
            <div className="flex items-start gap-3">
              <Award className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">PhilGEPS Status</p>
                <Badge variant="outline" className="text-xs font-medium uppercase">
                  {selectedBid.philGepsStatus}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Commercial Terms Section */}
        {(selectedBid.deliveryPeriod || selectedBid.paymentTerms || selectedBid.warrantyTerms || selectedBid.validityPeriodDays) && (
          <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
            <h3 className="text-sm font-semibold">Commercial & Delivery Terms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {selectedBid.deliveryPeriod && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Delivery Period</p>
                  <p className="text-sm font-medium">{selectedBid.deliveryPeriod}</p>
                </div>
              )}
              {selectedBid.paymentTerms && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Payment Terms</p>
                  <p className="text-sm font-medium">{selectedBid.paymentTerms}</p>
                </div>
              )}
              {selectedBid.warrantyTerms && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Warranty Terms</p>
                  <p className="text-sm font-medium">{selectedBid.warrantyTerms}</p>
                </div>
              )}
              {selectedBid.validityPeriodDays && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Price Validity</p>
                  <p className="text-sm font-medium">{selectedBid.validityPeriodDays} Calendar Days</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quoted Line Items Section (For RFQ Submissions) */}
        {selectedBid.items && selectedBid.items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quotation Line Items ({selectedBid.items.length})</h3>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">ABC Unit Price</TableHead>
                    <TableHead className="text-right">Quoted Price</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                    <TableHead>Brand / Spec</TableHead>
                    <TableHead className="text-center">Brochure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBid.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-xs">{item.itemName}</TableCell>
                      <TableCell className="text-center text-xs">{item.quantity}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        ₱{item.abcUnitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-primary">
                        ₱{item.unitPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold">
                        ₱{item.totalPrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {[item.brand, item.model, item.color].filter(Boolean).join(' / ') || '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.brochureFileUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() =>
                              handlePreviewDocument({
                                id: item.id,
                                name: `${item.itemName} Specification Sheet`,
                                url: item.brochureFileUrl!,
                                type: 'PDF',
                              })
                            }
                          >
                            <FileText className="h-3 w-3" />
                            View
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {selectedBid.documents && selectedBid.documents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {isCompetitiveBidding
                  ? `Submitted Bid Envelopes (${selectedBid.documents.length} Requirements)`
                  : `Submitted Documents / Brochures (${selectedBid.documents.length})`}
              </h3>
              {onBulkDownload && selectedBid.documents.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onBulkDownload}
                  disabled={isDownloading}
                  className="gap-1 text-xs"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Downloading
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Download All (ZIP)
                    </>
                  )}
                </Button>
              )}
            </div>

            {isCompetitiveBidding ? (
              <div className="space-y-4">
                {/* FIRST ENVELOPE: Technical & Eligibility */}
                <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                        <span className="flex items-center justify-center h-4 w-4 rounded-full bg-blue-600 text-white text-[10px]">1</span>
                        First Envelope — Eligibility & Technical
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedBid.documents.filter((d) => (d.envelopeType ?? 1) === 1).length} active documents submitted
                      </p>
                    </div>
                    <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-[10px] font-semibold">
                      Envelope 1
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {selectedBid.documents
                      .filter((d) => (d.envelopeType ?? 1) === 1)
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="border border-slate-200 bg-white rounded-md p-2.5 flex items-center justify-between hover:border-blue-400 transition-colors group shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="h-7 w-7 bg-blue-50 text-blue-600 rounded flex items-center justify-center shrink-0">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium truncate text-slate-800" title={doc.name}>
                              {doc.name}
                            </span>
                          </div>
                          {doc.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={previewingDocId === doc.id}
                              className="opacity-0 group-hover:opacity-100 h-7 text-[11px] gap-1 px-2"
                              onClick={() => handlePreviewDocument(doc)}
                            >
                              {previewingDocId === doc.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                'Preview'
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* SECOND ENVELOPE: Financial */}
                <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                        <span className="flex items-center justify-center h-4 w-4 rounded-full bg-purple-600 text-white text-[10px]">2</span>
                        Second Envelope — Financial
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedBid.documents.filter((d) => d.envelopeType === 2).length} active documents submitted
                      </p>
                    </div>
                    <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50 text-[10px] font-semibold">
                      Envelope 2
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {selectedBid.documents
                      .filter((d) => d.envelopeType === 2)
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className="border border-slate-200 bg-white rounded-md p-2.5 flex items-center justify-between hover:border-purple-400 transition-colors group shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="h-7 w-7 bg-purple-50 text-purple-600 rounded flex items-center justify-center shrink-0">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium truncate text-slate-800" title={doc.name}>
                              {doc.name}
                            </span>
                          </div>
                          {doc.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={previewingDocId === doc.id}
                              className="opacity-0 group-hover:opacity-100 h-7 text-[11px] gap-1 px-2"
                              onClick={() => handlePreviewDocument(doc)}
                            >
                              {previewingDocId === doc.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                'Preview'
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Non-bidding modes (SVP / RFQ): flat list */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedBid.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border rounded-md p-3 flex items-center justify-between hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-8 w-8 bg-primary/10 text-primary rounded flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium truncate" title={doc.name}>
                        {doc.name}
                      </span>
                    </div>
                    {doc.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={previewingDocId === doc.id}
                        className="opacity-0 group-hover:opacity-100 h-8 text-xs gap-1.5"
                        onClick={() => handlePreviewDocument(doc)}
                      >
                        {previewingDocId === doc.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : (
                          'Preview'
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evaluation Controls Section */}
        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
          <div>
            <h3 className="text-sm font-semibold">
              {isCompetitiveBidding ? 'Administrative Submission Review' : 'Evaluation & Compliance'}
            </h3>
            {isCompetitiveBidding && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Administrative receipt and completeness check. Formal Envelope unsealing and bid examination occur in the BAC Bid Opening session.
              </p>
            )}
          </div>

          {isCompetitiveBidding && (
            <div className="rounded-md bg-blue-50/80 border border-blue-200 p-3 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-blue-900">BAC Bid Opening Stage</p>
                  <p className="text-blue-700 leading-relaxed text-[11px]">
                    To conduct the formal opening session (unsealing Envelope 1, recording non-discretionary pass/fail results, and unsealing Envelope 2), proceed to the dedicated BAC Public Bidding Workspace.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs font-semibold bg-white text-blue-700 border-blue-300 hover:bg-blue-50 gap-1.5"
                onClick={() => navigate({ to: '/v2/bid-evaluation', search: { projectId: projectId || undefined } })}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Proceed to BAC Bid Opening & Evaluation &rarr;
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="eval-status" className="text-sm font-medium">
              {isCompetitiveBidding ? 'Submission Receipt Status *' : 'Evaluation Status *'}
            </Label>
            <Select value={evalStatus} onValueChange={onEvalStatusChange}>
              <SelectTrigger id="eval-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending Review</SelectItem>
                <SelectItem value="Passed">
                  {isCompetitiveBidding ? 'Documents Complete / Verified' : 'Passed / Responsive'}
                </SelectItem>
                <SelectItem value="Failed">
                  {isCompetitiveBidding ? 'Incomplete / Non-Compliant' : 'Failed / Disqualified'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="eval-remarks" className="text-sm font-medium">
                Remarks {evalStatus === 'Failed' && <span className="text-red-500">*</span>}
              </Label>
              <span className="text-xs text-muted-foreground">{evalRemarks.length}/500</span>
            </div>
            <Textarea
              id="eval-remarks"
              placeholder={
                evalStatus === 'Failed'
                  ? 'Please provide reason for disqualification / failure...'
                  : 'Add evaluation notes or remarks (optional)...'
              }
              value={evalRemarks}
              onChange={(e) => onEvalRemarksChange?.(e.target.value.slice(0, 500))}
              className="min-h-24 resize-none text-sm"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={onSaveEvaluation}
              className={cn(
                'flex-1',
                evalStatus === 'Passed' && 'bg-emerald-600 hover:bg-emerald-700 text-white',
                evalStatus === 'Failed' && 'bg-red-600 hover:bg-red-700 text-white',
              )}
            >
              Save Evaluation
            </Button>
          </div>
        </div>

        {/* Previous Evaluation Info */}
        {selectedBid.evaluatedAt && (
          <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded border border-slate-200">
            <p>Last evaluated on {new Date(selectedBid.evaluatedAt).toLocaleString()}</p>
            {selectedBid.evaluatedBy && <p>Evaluated by: {selectedBid.evaluatedBy}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
