import { useState, useEffect, useMemo, type ComponentType } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ShoppingCart, Send, ArrowLeft,
  Calendar, Building2, Tag, Receipt, Download, FileText, UserCheck, FileCheck, CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { extractErrorMessage } from '@/services/utils/messages'
import { DirectContractingStatusEnum, type DirectContracting } from '../types'
import { useConsolidatedPRStore } from '@/features/procurement/consolidated-pr/store/consolidatedPRStore'
import { formatCurrencyPHP, formatDisplayDate } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import { useDirectContracting, useChangeDirectContractingStatus } from '../handlers'

import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: ComponentType<{ className?: string }> }> = {
  draft: { label: 'DRAFT', className: 'bg-gray-100 text-gray-700 border-gray-300', icon: ShoppingCart },
  submitted: { label: 'SUBMITTED', className: 'bg-blue-100 text-blue-700 border-blue-300', icon: Send },
  'for-review': { label: 'FOR REVIEW', className: 'bg-amber-100 text-amber-700 border-amber-300', icon: FileCheck },
  'submitted-to-supplier': { label: 'SUBMITTED TO SUPPLIER', className: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
}

interface Props {
  entry: DirectContracting
  onBack: () => void
  isManagementView?: boolean
}

export function DirectContractingDetailsPage({ entry: initialEntry, onBack, isManagementView = false }: Props) {
  const queryClient = useQueryClient()
  const consolidatedPRs = useConsolidatedPRStore((state) => state.consolidatedPRs)
  const [entry, setEntry] = useState<DirectContracting>(initialEntry)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showSendToSupplierConfirm, setShowSendToSupplierConfirm] = useState(false)

  const { data: item } = useDirectContracting(
    { pathParams: { id: initialEntry.id } }
  )

  useEffect(() => {
    if (item) {
      const statusMap: Record<string, DirectContracting['status']> = {
        'approved': 'approved',
        'draft': 'draft',
        'submitted': 'submitted',
        'for-review': 'for-review',
        'for_review': 'for-review',
        'submitted-to-supplier': 'submitted-to-supplier',
        'submitted_to_supplier': 'submitted-to-supplier',
        'pending_for_approval': 'for-review',
        'pending-for-approval': 'for-review',
        'returned': 'rejected',
        'rejected': 'rejected',
      }
      setEntry({
        ...initialEntry,
        id: item.id,
        dcNumber: item.dcNumber,
        dcName: item.name,
        bacResolutionId: item.bacProjectId,
        bacResolutionNumber: item.bacProjectTitle || '',
        prNumber: item.bacProjectTitle || '',
        office: item.exclusiveSupplierName || '',
        category: 'General',
        modeOfProcurement: 'Direct Contracting',
        totalABC: item.totalABC || 0,
        status: statusMap[(item.status || '').toLowerCase()] || 'draft',
        supplierId: item.exclusiveSupplierId,
        supplierName: item.exclusiveSupplierName,
        createdAt: item.createdAt || new Date().toISOString(),
        deadline: item.submissionDeadline || '',
        remarks: item.reviewRemarks || '',
      })
    }
  }, [item, initialEntry])

  // Find linked PR items across all consolidated PRs mentioned in entry.prNumber (comma separated)
  const linkedItems = useMemo(() => {
    const prNumbers = (entry.prNumber || '').split(',').map(s => s.trim())
    return consolidatedPRs
      .filter(cpr => prNumbers.includes(cpr.prNumber || ''))
      .flatMap(cpr => cpr.selectedPRItems)
  }, [entry.prNumber, consolidatedPRs])

  const statusMutation = useChangeDirectContractingStatus()

  const handleSendToSupplier = async () => {
    try {
      await toast.promise(
        statusMutation.mutateAsync(
          {
            pathParams: { id: entry.id },
            payload: { status: DirectContractingStatusEnum.SUBMITTED_TO_SUPPLIER },
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('direct-contracting'),
              })
              onBack()
            },
          },
        ),
        {
          loading: 'Submitting request to supplier...',
          success: `Direct Contracting request ${entry.dcNumber} has been submitted to ${entry.supplierName}.`,
          error: (err: unknown) => extractErrorMessage(err as any) || 'Failed to submit request status.',
        },
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleInitialSubmit = async () => {
    try {
      await toast.promise(
        statusMutation.mutateAsync(
          {
            pathParams: { id: entry.id },
            payload: { status: DirectContractingStatusEnum.FOR_REVIEW },
          },
          {
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  query.queryKey[0].includes('direct-contracting'),
              })
              onBack()
            },
          },
        ),
        {
          loading: 'Submitting request for review...',
          success: `Direct Contracting request ${entry.dcNumber} has been submitted for review.`,
          error: (err: unknown) => extractErrorMessage(err as any) || 'Failed to submit request status.',
        },
      )
    } catch (err) {
      console.error(err)
    }
  }

  const status = STATUS_CONFIG[entry.status] || STATUS_CONFIG.draft

  return (
    <>
      <div className="space-y-6 pb-20">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{entry.dcName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{entry.dcNumber}</Badge>
                <Badge className={cn("border", status.className)}>
                  <status.icon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isManagementView && entry.status === 'draft' && (
              <Button onClick={() => setShowSubmitConfirm(true)} className="bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 transition-all">
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            )}
            {isManagementView && entry.status === 'for-review' && (
              <Button onClick={() => setShowSendToSupplierConfirm(true)} className="bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90 transition-all">
                <Send className="mr-2 h-4 w-4" />
                Submit to Supplier
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                toast.info('Preparing your Direct Contracting request document for printing...')
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Print Direct Contracting Request
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info & Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Procurement Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">BAC Resolution</p>
                      <p className="font-semibold">{entry.bacResolutionNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requesting Office</p>
                      <p className="font-semibold">{entry.office}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Submission Deadline</p>
                      <p className="font-semibold">{formatDisplayDate(entry.deadline)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mode of Procurement</p>
                      <Badge color="secondary">Direct Contracting (RA 12009)</Badge>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Line Items (Consolidated from PRs)
                  </h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Item Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Unit Price (ABC)</TableHead>
                          <TableHead>Total ABC</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {linkedItems.length > 0 ? (
                          linkedItems.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{item.itemName}</TableCell>
                              <TableCell>{item.qty}</TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>{formatCurrencyPHP(item.unitPrice)}</TableCell>
                              <TableCell className="font-semibold">{formatCurrencyPHP(item.totalAmount)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground italic">
                              No items found for the linked PRs ({entry.prNumber})
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end p-2 bg-muted/20 rounded-lg">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Approved Budget (ABC)</p>
                      <p className="text-xl font-bold text-primary">{formatCurrencyPHP(entry.totalABC)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {entry.proposalAmount && entry.status !== 'draft' && entry.status !== 'for-review' && entry.status !== 'submitted' ? (
              <Card className="border-primary/20">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Supplier Proposal (Submitted by {entry.supplierName})
                  </CardTitle>
                  <CardDescription>
                    Review the prices and legal documents submitted for this proprietary acquisition.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 rounded-xl border bg-primary/5 border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-bold">Quoted Amount</p>
                      <p className="text-3xl font-black text-primary">{formatCurrencyPHP(entry.proposalAmount || 0)}</p>
                      {entry.proposalAmount && entry.proposalAmount > entry.totalABC && (
                        <Badge color="destructive" className="mt-2">EXCEEDS ABC</Badge>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Remarks/Notes</p>
                        <p className="text-sm italic p-3 bg-muted rounded-md">{entry.remarks || 'No remarks provided by supplier.'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase text-muted-foreground tracking-widest border-b pb-2">Verification Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 text-red-600 rounded">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[200px]">{entry.exclusivityProofFileName || 'Exclusivity_Proof.pdf'}</p>
                            <p className="text-[10px] text-muted-foreground">Sole Distributorship Proof</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="group-hover:text-primary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold truncate max-w-[200px]">{entry.soleDistCertFileName || 'Distributorship_Cert.pdf'}</p>
                            <p className="text-[10px] text-muted-foreground">Manufacturer Certification</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="group-hover:text-primary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                <Send className="h-10 w-10 mb-4 opacity-20" />
                <p className="text-lg font-medium">Proposal Pending</p>
                <p className="text-sm">Once the request is sent and reviewed, the supplier will upload their proprietary proof and pricing.</p>
              </div>
            )}
          </div>

          {/* Right Column: Timeline/Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Lifecycle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                    <p className="text-sm font-bold">Request Created</p>
                    <p className="text-xs text-muted-foreground">{formatDisplayDate(entry.createdAt) ? new Date(formatDisplayDate(entry.createdAt)).toLocaleString() : 'N/A'}</p>
                    <p className="text-xs mt-1 italic">Initialized by Procurement Office</p>
                  </div>

                  {entry.status !== 'draft' && (
                    <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                      <p className="text-sm font-bold">Submitted</p>
                      <p className="text-xs text-muted-foreground">Notification dispatched to BAC Secretariat</p>
                    </div>
                  )}

                  {(entry.status === 'submitted-to-supplier' || entry.status === 'approved' || entry.status === 'rejected') && (
                    <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                      <p className="text-sm font-bold">Submitted to Supplier</p>
                      <p className="text-xs text-muted-foreground">Request sent to {entry.supplierName}</p>
                    </div>
                  )}

                  {entry.proposalAmount && entry.status !== 'draft' && entry.status !== 'for-review' && entry.status !== 'submitted' && (
                    <div className="relative pl-6 pb-6 border-l-2 border-primary/30 last:pb-0 last:border-l-transparent">
                      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
                      <p className="text-sm font-bold">Proposal Submitted</p>
                      <p className="text-xs text-muted-foreground">Supplier proposal and exclusivity proof uploaded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">System Audit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">UUID</p>
                  <p className="text-[10px] break-all opacity-60">{entry.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Workflow Version</p>
                  <p className="text-xs font-bold">NGP-RA12009-Direct-Contracting</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <ConfirmAlertDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Direct Contracting Request?"
        description={`Are you sure you want to submit the Direct Contracting request ${entry.dcNumber} for review?`}
        confirmLabel="Submit"
        onConfirm={async () => {
          setShowSubmitConfirm(false)
          await handleInitialSubmit()
        }}
      />
      <ConfirmAlertDialog
        open={showSendToSupplierConfirm}
        onOpenChange={setShowSendToSupplierConfirm}
        title="Submit Request to Supplier?"
        description={`Are you sure you want to submit this request to supplier ${entry.supplierName}?`}
        confirmLabel="Submit to Supplier"
        onConfirm={async () => {
          setShowSendToSupplierConfirm(false)
          await handleSendToSupplier()
        }}
      />
    </>
  )
}
