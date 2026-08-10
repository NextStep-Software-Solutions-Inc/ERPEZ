/**
 * NTP Details Page
 * Displays full details of a Notice to Proceed including items and status
 * 
 * User/Creator View (isAdmin=false):
 *   - Can submit Draft NTPs for approval
 *   - Cannot approve/return
 *   
 * Manager/Approver View (isAdmin=true):
 *   - Cannot submit
 *   - Can approve/return For Approval NTPs
 */

import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, MoreHorizontal, Printer, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NTPDetailsTable } from '../tables/NTPDetailsTable'
import { ApproveNTPDialog, ReturnNTPDialog, SubmitNTPDialog, ViewSourceDocumentDialog } from '../dialogs'
import { selectedNTPAtom, isApproveNTPDialogOpenAtom, isReturnNTPDialogOpenAtom, isSubmitNTPDialogOpenAtom, targetNTPIdAtom } from '../atoms/ntpAtoms'
import { mockNTPStore, printNTP } from '../utils'
import type { NTP, NTPStatus } from '../types/ntpTypes'

const statusConfig: Record<NTPStatus, { label: string; variant?: 'outline' | 'soft'; icon: ReactNode }> = {
  Draft: { label: 'Draft', variant: 'soft', icon: null },
  'For Approval': { label: 'For Approval', variant: 'outline', icon: null },
  Approved: { label: 'Approved', variant: 'soft', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
  Returned: { label: 'Returned', variant: 'outline', icon: <XCircle className="h-3 w-3 mr-1" /> },
}

export interface NTPDetailsPageProps {
  ntpId?: string
  ntp?: NTP
  isAdmin?: boolean
}

export function NTPDetailsPage({ ntpId, ntp: initialNtp, isAdmin = false }: NTPDetailsPageProps) {
  const navigate = useNavigate()
  const [selectedNTP] = useAtom(selectedNTPAtom)
  const [, setIsSubmitDialogOpen] = useAtom(isSubmitNTPDialogOpenAtom)
  const [, setIsApproveDialogOpen] = useAtom(isApproveNTPDialogOpenAtom)
  const [, setIsReturnDialogOpen] = useAtom(isReturnNTPDialogOpenAtom)
  const [, setTargetNTPId] = useAtom(targetNTPIdAtom)
  const [isLoading] = useState(false)
  const [isViewSourceDocumentOpen, setIsViewSourceDocumentOpen] = useState(false)

  // Get NTP data - priority: prop > atom > fetch from store by ntpId
  const ntp = useMemo(() => {
    // First priority: initialNtp from props (passed from route or navigation)
    if (initialNtp) {
      return initialNtp
    }
    
    // Second priority: selectedNTP from Jotai atom (set before navigation)
    if (selectedNTP) {
      return selectedNTP
    }
    
    // Third priority: fetch from store using ntpId from route params
    if (ntpId) {
      const found = mockNTPStore.findById(ntpId)
      if (found) {
        return found
      } else {
      }
    }
    return null
  }, [initialNtp, selectedNTP, ntpId])

  if (!ntp) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: isAdmin ? '/v2/manage-ntp' : '/v2/notice-to-proceed-ntp' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {isAdmin ? 'Manage NTPs' : 'NTPs'}
        </Button>
        <Card className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">NTP Not Found</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>The NTP you're looking for could not be loaded.</p>
              <p className="text-xs">
                {ntpId ? `Requested ID: ${ntpId}` : 'No ID provided'}
              </p>
            </div>
            <Button 
              onClick={() => navigate({ to: isAdmin ? '/v2/manage-ntp' : '/v2/notice-to-proceed-ntp' })}
              className="mt-4"
            >
              Return to NTP List
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const statusInfo = statusConfig[ntp.status]
  const sourceType = ntp.sourceType
  const isFinalStatus = ntp.status === 'Approved' || ntp.status === 'Returned'

  const handleApprove = useCallback(() => {
    setTargetNTPId(ntp.id)
    setIsApproveDialogOpen(true)
  }, [ntp.id, setTargetNTPId, setIsApproveDialogOpen])

  const handleReturn = useCallback(() => {
    setTargetNTPId(ntp.id)
    setIsReturnDialogOpen(true)
  }, [ntp.id, setTargetNTPId, setIsReturnDialogOpen])

  const handlePrint = useCallback(() => {
    printNTP(ntp)
  }, [ntp])

  const handleSubmit = useCallback(() => {
    setTargetNTPId(ntp.id)
    setIsSubmitDialogOpen(true)
  }, [ntp.id, setTargetNTPId, setIsSubmitDialogOpen])

  const handleViewSourceDocument = useCallback(() => {
    setIsViewSourceDocumentOpen(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: isAdmin ? '/v2/manage-ntp' : '/v2/notice-to-proceed-ntp' })}
          className="gap-2 -ml-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {isAdmin ? 'Manage NTPs' : 'NTPs'}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              <span>Print</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{ntp.ntpNumber}</h1>
          <Badge variant={statusInfo.variant} className="gap-1">
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
        {ntp.description && <p className="text-muted-foreground">{ntp.description}</p>}
      </div>

      <Separator />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Supplier</p>
          <p className="text-lg font-semibold">{ntp.supplierName}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
          <p className="text-lg font-semibold">
            {new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(ntp.totalAmount)}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Date</p>
          <p className="text-lg font-semibold">
            {new Intl.DateTimeFormat('en-PH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(new Date(ntp.date))}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Source Document</p>
          <p className="text-lg font-semibold">
            {sourceType === 'PO' ? 'PO' : 'Contract'}
          </p>
        </Card>
      </div>

      {/* Source Document Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Source Document Reference</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewSourceDocument}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            View Details
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium">{sourceType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Document ID</p>
            <p className="font-medium">{ntp.sourceDocumentId}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Items Count</p>
            <p className="font-medium">{ntp.itemsCount}</p>
          </div>
          {ntp.status === 'Approved' && ntp.approvedAt && (
            <div>
              <p className="text-muted-foreground">Approved Date</p>
              <p className="font-medium">
                {new Intl.DateTimeFormat('en-PH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }).format(new Date(ntp.approvedAt))}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Line Items Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Line Items</h2>
        <NTPDetailsTable lineItems={ntp.lineItems} isLoading={isLoading} />
      </Card>

      {/* Return Details (if applicable) */}
      {ntp.status === 'Returned' && ntp.returnReason && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <h3 className="font-semibold text-yellow-900 mb-2">Return Reason</h3>
          <p className="text-yellow-800 text-sm mb-3">{ntp.returnReason}</p>
          {ntp.returnRemarks && (
            <>
              <p className="text-xs font-medium text-yellow-700 mb-1">Remarks:</p>
              <p className="text-sm text-yellow-800">{ntp.returnRemarks}</p>
            </>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      {!isFinalStatus && (
        <div className="flex gap-2 justify-end pt-4">
          {ntp.status === 'Draft' && !isAdmin && (
            <Button onClick={handleSubmit}>Submit for Approval</Button>
          )}
          {ntp.status === 'For Approval' && isAdmin && (
            <>
              <Button variant="outline" onClick={handleReturn}>
                Return
              </Button>
              <Button onClick={handleApprove}>Approve</Button>
            </>
          )}
        </div>
      )}

      {/* Dialogs */}
      <SubmitNTPDialog />
      <ApproveNTPDialog />
      <ReturnNTPDialog />
      <ViewSourceDocumentDialog
        open={isViewSourceDocumentOpen}
        onOpenChange={setIsViewSourceDocumentOpen}
        ntp={ntp}
      />
    </div>
  )
}
