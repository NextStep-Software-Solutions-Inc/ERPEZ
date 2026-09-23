"use client"

import * as React from 'react'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Download,
  Edit,
  ExternalLink,
  FileCheck,
  FileText,
  Mail,
  Phone,
  Printer,
  Receipt,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingCart,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { UpdateDirectContractingDialog } from '../components/UpdateDirectContractingDialog'

import {
  useDirectContracting,
  useChangeDirectContractingStatus,
} from '../handlers'
import { DirectContractingStatusEnum } from '../types'
import { formatCurrencyPHP, formatDateV2 } from '@/utils/formatters'
import { extractErrorMessage } from '@/services/utils/messages'
import type { AxiosError } from 'erpez-shared-lib'
import { cn } from '@/lib/utils'

export interface DirectContractingDetailPageProps {
  id: string
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  [DirectContractingStatusEnum.DRAFT]: {
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    icon: ShoppingCart,
  },
  [DirectContractingStatusEnum.FOR_REVIEW]: {
    label: 'For Review',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    icon: FileCheck,
  },
  [DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER]: {
    label: 'Sent to Supplier',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    icon: Send,
  },
  [DirectContractingStatusEnum.PENDING_FOR_APPROVAL]: {
    label: 'Pending Approval',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    icon: Clock,
  },
  [DirectContractingStatusEnum.APPROVED]: {
    label: 'Approved',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    icon: ShieldCheck,
  },
  [DirectContractingStatusEnum.RETURNED]: {
    label: 'Returned',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    icon: AlertCircle,
  },
}

export function DirectContractingDetailPage({ id }: DirectContractingDetailPageProps) {
  const navigate = useNavigate()

  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useDirectContracting({
    pathParams: { id },
  })

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false)

  const statusMutation = useChangeDirectContractingStatus()

  const handleSubmitForReview = async () => {
    try {
      await statusMutation.mutateAsync({
        pathParams: { id },
        payload: { status: DirectContractingStatusEnum.FOR_REVIEW },
      })
      toast.success('Direct Contracting request submitted for review successfully.')
      setShowSubmitConfirm(false)
      refetch()
    } catch (err) {
      toast.error(extractErrorMessage(err as AxiosError) || 'Failed to submit request for review.')
    }
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl animate-pulse">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-2/3 max-w-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Error State
  if (isError || !item) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-2xl py-16">
        <Card className="border-destructive/40 shadow-sm text-center p-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl">Request Not Found</CardTitle>
          <CardDescription>
            {error
              ? extractErrorMessage(error as AxiosError)
              : 'The requested Direct Contracting record could not be retrieved. It may have been removed or you do not have permission to view it.'}
          </CardDescription>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/v2/direct-contracting-request' })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Requests
            </Button>
            <Button onClick={() => refetch()}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const statusConfig =
    STATUS_CONFIG[item.status] || {
      label: item.status,
      badgeClass: 'bg-muted text-muted-foreground border-border',
      icon: HelpCircle,
    }
  const StatusIcon = statusConfig.icon

  const isDraft = item.status === DirectContractingStatusEnum.DRAFT
  const hasProposal = !!item.proposal && item.proposal.proposalItems && item.proposal.proposalItems.length > 0
  const isDeadlinePast = item.submissionDeadline ? new Date(item.submissionDeadline) < new Date() : false

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Top Header / Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
          onClick={() => navigate({ to: '/v2/direct-contracting-request' })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Direct Contracting Requests
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {isDraft && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="gap-1.5"
              >
                <Edit className="h-4 w-4" /> Edit Request
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSubmitConfirm(true)}
                className="gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Send className="h-4 w-4" /> Submit for Review
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" /> Print / Export
          </Button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant="outline"
            className="font-mono text-sm px-2.5 py-0.5 font-bold text-primary bg-primary/10 border-primary/20"
          >
            {item.dcNumber}
          </Badge>
          <Badge
            variant="outline"
            className={cn('text-xs px-2.5 py-0.5 font-semibold gap-1.5', statusConfig.badgeClass)}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusConfig.label}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground border-dashed">
            Direct Contracting (RA 12009 Rule XVI)
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {item.name || item.dcName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Procurement through single proprietary supplier pursuant to Republic Act No. 12009.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
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
                <p className="font-bold text-base text-foreground font-mono">
                  {formatCurrencyPHP(item.totalABC || item.bacProjectABC || 0)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Submission Deadline
                </span>
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className={cn('h-4 w-4', isDeadlinePast ? 'text-rose-500' : 'text-muted-foreground')} />
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
                      <span className="font-bold text-base font-mono text-foreground">
                        {formatCurrencyPHP(item.proposal!.totalProposalAmount || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Variance vs. ABC</span>
                      <span
                        className={cn(
                          'font-semibold font-mono text-sm',
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

                  {/* Proposal Items Table */}
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="font-semibold text-xs">Item Description</TableHead>
                          <TableHead className="font-semibold text-xs">Brand / Model / Specs</TableHead>
                          <TableHead className="font-semibold text-xs text-right">Unit ABC</TableHead>
                          <TableHead className="font-semibold text-xs text-right">Unit Bid</TableHead>
                          <TableHead className="font-semibold text-xs text-right">Total Bid</TableHead>
                          <TableHead className="font-semibold text-xs text-center">Brochure</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.proposal!.proposalItems.map((pItem) => (
                          <TableRow key={pItem.id || pItem.cprItemId}>
                            <TableCell className="font-medium text-sm">
                              {pItem.cprItemName || 'Consolidated PR Item'}
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
                            <TableCell className="text-right text-xs font-mono text-muted-foreground">
                              {formatCurrencyPHP(pItem.unitABC || 0)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-mono font-medium text-foreground">
                              {formatCurrencyPHP(pItem.unitBid || 0)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-mono font-bold text-foreground">
                              {formatCurrencyPHP(pItem.totalBid || 0)}
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
                        ))}
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
                /* Pending Proposal Submission Empty State */
                <div className="py-8 px-4 text-center space-y-3 bg-muted/10 rounded-lg border border-dashed">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base text-foreground">
                      Awaiting Supplier Quotation & Exclusivity Submission
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      The exclusive supplier has been designated. Once their official quotation,
                      itemized bid prices, and Exclusivity Certificate are received and logged,
                      the comparative analysis will be displayed here.
                    </p>
                  </div>
                  {item.submissionDeadline && (
                    <Badge variant="outline" className="text-xs bg-background">
                      Submission Deadline: {formatDateV2(item.submissionDeadline)}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (lg:col-span-1): Supplier & Audit Information */}
        <div className="space-y-6">
          {/* Exclusive Supplier Card */}
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
                  <Badge variant="outline" className="font-mono text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800">
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

      {/* Edit Request Dialog */}
      {isDraft && (
        <UpdateDirectContractingDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              refetch()
            }
          }}
          editEntryId={id}
        />
      )}

      {/* Submit for Review Confirmation */}
      <ConfirmAlertDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Request for Review"
        description="Are you sure you want to submit this Direct Contracting request for review? Once submitted, the procurement team will review the justification and BAC resolution before dispatching to the supplier."
        confirmLabel="Submit for Review"
        cancelLabel="Cancel"
        loading={statusMutation.isPending}
        onConfirm={handleSubmitForReview}
      />
    </div>
  )
}
