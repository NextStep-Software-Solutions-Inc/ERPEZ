import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileText, Mail, Phone, User, Building, Download, Loader2, Hash, Award, ShieldCheck, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SupplierBid } from '../types'

interface ReviewWorkspaceProps {
  selectedBid: SupplierBid | undefined
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
  evalStatus,
  evalRemarks = '',
  onEvalStatusChange,
  onEvalRemarksChange,
  onSaveEvaluation,
  onBulkDownload,
  isDownloading = false,
}: ReviewWorkspaceProps) {
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {selectedBid.documents && selectedBid.documents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Submitted Documents / Brochures ({selectedBid.documents.length})</h3>
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
                      Download All
                    </>
                  )}
                </Button>
              )}
            </div>
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
                      className="opacity-0 group-hover:opacity-100 h-8 text-xs"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      Preview
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation Controls Section */}
        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
          <h3 className="text-sm font-semibold">Evaluation & Compliance</h3>

          <div className="space-y-2">
            <Label htmlFor="eval-status" className="text-sm font-medium">
              Evaluation Status *
            </Label>
            <Select value={evalStatus} onValueChange={onEvalStatusChange}>
              <SelectTrigger id="eval-status">
                <SelectValue placeholder="Select evaluation status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending Review</SelectItem>
                <SelectItem value="Passed">Passed / Responsive</SelectItem>
                <SelectItem value="Failed">Failed / Disqualified</SelectItem>
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
