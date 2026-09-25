import {
  Building2,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Receipt,
  ShieldCheck,
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { DirectContracting } from '../../types'
import { formatCurrencyPHP, formatDateV2 } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export interface ProposalQuotationTabProps {
  item: DirectContracting
  onSwitchToSupplierTab: () => void
}

export function ProposalQuotationTab({ item, onSwitchToSupplierTab }: ProposalQuotationTabProps) {
  const hasProposal =
    !!item.proposal && item.proposal.proposalItems && item.proposal.proposalItems.length > 0
  const isDeadlinePast = item.submissionDeadline
    ? new Date(item.submissionDeadline) < new Date()
    : false

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column (lg:col-span-2): Procurement & Proposal Breakdown */}
      <div className="lg:col-span-2 space-y-6">
        {/* Procurement & BAC Resolution Information Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Procurement Information</CardTitle>
                <CardDescription className="text-xs">
                  Approved budget, BAC resolution link, and project details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Linked BAC Project
              </span>
              <p className="font-semibold text-foreground">
                {item.bacProjectTitle || 'BAC Project Ref'}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Approved Budget for Contract (ABC)
              </span>
              <p className="font-bold text-base text-foreground">
                {formatCurrencyPHP(item.totalABC || item.bacProjectABC || 0)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Submission Deadline
              </span>
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar
                  className={cn(
                    'h-4 w-4',
                    isDeadlinePast ? 'text-rose-500' : 'text-muted-foreground'
                  )}
                />
                <span className={cn(isDeadlinePast && 'text-rose-600 font-semibold')}>
                  {item.submissionDeadline ? formatDateV2(item.submissionDeadline) : '—'}
                </span>
                {isDeadlinePast && (
                  <Badge color="destructive" variant="soft" className="text-[10px] py-0 px-1.5 ml-1">
                    Expired
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Legal Procurement Mode
              </span>
              <p className="font-medium text-foreground">
                Direct Contracting (Single Proprietary Source)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Proposal & Quoted Items Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base font-semibold">
                    Supplier Proposal & Price Quotation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Official price breakdown and itemized proposal from exclusive supplier
                  </CardDescription>
                </div>
              </div>

              {hasProposal && item.proposal?.exclusivityDocumentUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  asChild
                >
                  <a
                    href={item.proposal.exclusivityDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-3.5 w-3.5" /> Exclusivity Certificate
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {hasProposal ? (
              <div className="space-y-5">
                {/* Proposal Summary Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Total Proposal Quoted</span>
                    <span className="font-bold text-base text-foreground">
                      {formatCurrencyPHP(item.proposal!.totalProposalAmount || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Variance vs. ABC</span>
                    <span
                      className={cn(
                        'font-semibold text-sm',
                        (item.totalABC || 0) >= (item.proposal!.totalProposalAmount || 0)
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      )}
                    >
                      {(item.totalABC || 0) >= (item.proposal!.totalProposalAmount || 0) ? '-' : '+'}
                      {formatCurrencyPHP(
                        Math.abs((item.totalABC || 0) - (item.proposal!.totalProposalAmount || 0))
                      )}
                      {(item.totalABC || 0) >= (item.proposal!.totalProposalAmount || 0)
                        ? ' (Within Budget)'
                        : ' (Exceeds ABC)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Submitted Date</span>
                    <span className="font-medium text-foreground">
                      {item.proposal!.submittedAt ? formatDateV2(item.proposal!.submittedAt) : '—'}
                    </span>
                  </div>
                </div>

                {/* Proposal Items Comparative Table */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="font-semibold text-xs">Item Description</TableHead>
                        <TableHead className="font-semibold text-xs">Brand / Model / Specs</TableHead>
                        <TableHead className="font-semibold text-xs text-center">Qty</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Unit ABC</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Total ABC</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Unit Bid</TableHead>
                        <TableHead className="font-semibold text-xs text-right">Total Bid</TableHead>
                        <TableHead className="font-semibold text-xs text-center">Brochure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.proposal!.proposalItems.map((pItem) => {
                        const matchedReq = (item.items || []).find(
                          (r) => r.cprItemId === pItem.cprItemId || r.id === pItem.cprItemId
                        )
                        return (
                          <TableRow key={pItem.id || pItem.cprItemId}>
                            <TableCell className="font-medium text-sm">
                              <div className="font-semibold text-foreground">
                                {matchedReq?.itemName || pItem.cprItemName || 'Consolidated PR Item'}
                              </div>
                              {matchedReq?.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                  {matchedReq.description}
                                </div>
                              )}
                              {(matchedReq?.office || matchedReq?.prNumber || matchedReq?.papCode) && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                                  {matchedReq.office && (
                                    <span className="font-medium text-foreground/80">{matchedReq.office}</span>
                                  )}
                                  {matchedReq.prNumber && <span>• PR: {matchedReq.prNumber}</span>}
                                  {matchedReq.papCode && <span>• PAP: {matchedReq.papCode}</span>}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {pItem.brand || pItem.model || pItem.color ? (
                                <div className="space-y-0.5">
                                  {pItem.brand && <span>Brand: {pItem.brand} </span>}
                                  {pItem.model && <span>• Model: {pItem.model} </span>}
                                  {pItem.color && <span>• Color: {pItem.color}</span>}
                                </div>
                              ) : (
                                <span>Standard / Proprietary Specification</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center text-xs font-semibold text-foreground">
                              {pItem.quantity ?? matchedReq?.quantity ?? 1} {matchedReq?.unit || ''}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {formatCurrencyPHP(pItem.unitABC || matchedReq?.unitABC || 0)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-muted-foreground">
                              {formatCurrencyPHP(
                                pItem.totalABC ||
                                  matchedReq?.totalABC ||
                                  (pItem.unitABC || 0) * (pItem.quantity || 1)
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium text-foreground">
                              {formatCurrencyPHP(pItem.unitBid || 0)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-bold text-foreground">
                              {formatCurrencyPHP(
                                pItem.totalBid || (pItem.unitBid || 0) * (pItem.quantity || 1)
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {pItem.brochureFileUrl ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-primary gap-1"
                                  asChild
                                >
                                  <a
                                    href={pItem.brochureFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> View
                                  </a>
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Proposal Remarks if any */}
                {item.proposal?.proposalRemarks && (
                  <div className="p-3 bg-muted/20 border rounded-lg text-xs space-y-1">
                    <span className="font-semibold text-foreground">Supplier Remarks:</span>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {item.proposal.proposalRemarks}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Pending Proposal Submission: Show Requested Line Items Table */
              <div className="space-y-4">
                <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Awaiting Supplier Quotation & Submission</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        The exclusive supplier has been invited. They must submit their itemized unit bids, specifications, and exclusivity certificate for the line items below.
                      </p>
                    </div>
                  </div>
                  {item.submissionDeadline && (
                    <Badge variant="outline" className="text-xs bg-background shrink-0 font-medium">
                      Submission Deadline: {formatDateV2(item.submissionDeadline)}
                    </Badge>
                  )}
                </div>

                {item.items && item.items.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="font-semibold text-xs">Item Description & Specifications</TableHead>
                          <TableHead className="font-semibold text-xs">Office / Source</TableHead>
                          <TableHead className="font-semibold text-xs text-center">Qty / Unit</TableHead>
                          <TableHead className="font-semibold text-xs text-right">Unit ABC</TableHead>
                          <TableHead className="font-semibold text-xs text-right">Total ABC</TableHead>
                          <TableHead className="font-semibold text-xs text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.items.map((reqItem, idx) => (
                          <TableRow key={reqItem.id || reqItem.cprItemId || idx}>
                            <TableCell className="max-w-[280px]">
                              <div className="font-semibold text-sm text-foreground">{reqItem.itemName}</div>
                              {reqItem.description && (
                                <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                  {reqItem.description}
                                </div>
                              )}
                              {reqItem.category && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 mt-1 font-normal">
                                  {reqItem.category}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              <div className="font-medium text-foreground">{reqItem.office || 'Procuring Entity'}</div>
                              {reqItem.prNumber && <div className="text-[11px] text-muted-foreground">PR: {reqItem.prNumber}</div>}
                              {reqItem.papCode && <div className="text-[11px] text-muted-foreground">PAP: {reqItem.papCode}</div>}
                            </TableCell>
                            <TableCell className="text-center text-xs font-semibold text-foreground">
                              {reqItem.quantity} {reqItem.unit || 'unit'}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {formatCurrencyPHP(reqItem.unitABC || 0)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-semibold text-foreground">
                              {formatCurrencyPHP(reqItem.totalABC || 0)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-400"
                              >
                                Awaiting Bid
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="bg-muted/20 px-4 py-2.5 border-t flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                      <span>Total Line Items: <strong className="text-foreground">{item.items.length}</strong></span>
                      <span>
                        Total Approved Budget (ABC):{' '}
                        <strong className="text-foreground font-semibold text-sm">
                          {formatCurrencyPHP(item.totalABC || item.bacProjectABC || 0)}
                        </strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center space-y-2 border border-dashed rounded-lg bg-muted/10">
                    <p className="text-sm font-medium text-foreground">No line items loaded from BAC Project</p>
                    <p className="text-xs text-muted-foreground">
                      Ensure the linked BAC project has items configured in its Consolidated PR or APP links.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column (lg:col-span-1): Supplier & Audit Information */}
      <div className="space-y-6">
        {/* Exclusive Supplier Summary Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Exclusive Supplier</CardTitle>
                <CardDescription className="text-xs">
                  Designated sole source vendor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Supplier Name
              </span>
              <p className="font-semibold text-foreground">
                {item.exclusiveSupplierName || item.supplierName || 'Sole Source Vendor'}
              </p>
            </div>

            <Separator />

            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                PhilGEPS Registration
              </span>
              <div className="flex items-center gap-1.5 pt-0.5">
                <Badge
                  variant="outline"
                  className="text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                >
                  {item.exclusiveSupplierPhilGEPS || 'PhilGEPS Verified'}
                </Badge>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contact Number
              </span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span className="text-foreground font-medium">
                  {item.exclusiveSupplierContact || '—'}
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email Address
              </span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="text-foreground font-medium truncate">
                  {item.exclusiveSupplierEmail || '—'}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs text-primary"
              onClick={onSwitchToSupplierTab}
            >
              View Full Compliance Profile →
            </Button>
          </CardContent>
        </Card>

        {/* Workflow & Audit Information Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-base font-semibold">Audit & Timeline</CardTitle>
                <CardDescription className="text-xs">
                  Creation history and review notes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-sm">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created By
              </span>
              <p className="font-medium text-foreground">
                {item.createdBy || 'Procurement Officer'}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created Date
              </span>
              <p className="text-muted-foreground">
                {item.createdAt ? formatDateV2(item.createdAt) : '—'}
              </p>
            </div>

            {item.reviewRemarks && (
              <div className="space-y-1 pt-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Review Remarks
                </span>
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-xs text-amber-900 dark:text-amber-200">
                  {item.reviewRemarks}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
