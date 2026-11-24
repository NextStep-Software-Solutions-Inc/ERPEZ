/**
 * Manage NTP List Page (Admin / Approver View)
 * Administrative overview for managing and tracking Notice to Proceed documents.
 */

import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlayCircle, FileText, Send, CheckCircle2, Clock, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { NTPTable, ManageNTPListToolbar } from '../tables'
import {
  IssueNoticeToProceedDialog,
  RecordNoticeToProceedReceiptDialog,
} from '../dialogs'
import {
  useGetNoticeToProceeds,
  useGetNoticeToProceedSummary,
  useIssueNoticeToProceed,
  useRecordNoticeToProceedReceipt,
  useDeleteNoticeToProceed,
  useGetNoticeToProceedById,
} from '../handlers/hooks'
import { getNoticeToProceedPdfRequest } from '../handlers/getNoticeToProceedPdfRequest'
import type { NoticeToProceedListItem, NoticeToProceedDetail } from '../types/ntpTypes'

export function ManageNTPListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Selected item for modals
  const [activeNtpId, setActiveNtpId] = useState<string | null>(null)
  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [isRecordOpen, setIsRecordOpen] = useState(false)

  // Real backend queries
  const { data: ntpResponse, isLoading, isFetching } = useGetNoticeToProceeds({
    search: searchQuery || undefined,
    status: selectedStatus === 'All' ? undefined : selectedStatus,
    pageNumber: 1,
    pageSize: 50,
  })

  const { data: summary } = useGetNoticeToProceedSummary()
  const { data: activeNtp } = useGetNoticeToProceedById(activeNtpId)

  const issueMutation = useIssueNoticeToProceed()
  const recordMutation = useRecordNoticeToProceedReceipt()
  const deleteMutation = useDeleteNoticeToProceed()

  const ntpList = ntpResponse?.data?.items || []

  const handleViewDetails = (ntp: NoticeToProceedListItem) => {
    navigate({
      to: `/v2/manage-ntp/${ntp.id}`,
    })
  }

  const handlePrintNTP = async (ntp: NoticeToProceedListItem) => {
    try {
      toast.info('Generating PDF document preview...')
      const result = await getNoticeToProceedPdfRequest.fetcher({
        ntpId: ntp.id,
        ntpNumber: ntp.ntpNumber,
      })
      const blobUrl = URL.createObjectURL(result.blob)
      window.open(blobUrl, '_blank')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Could not download or preview NTP PDF.')
    }
  }

  const handleOpenIssue = (ntp: NoticeToProceedListItem) => {
    setActiveNtpId(ntp.id)
    setIsIssueOpen(true)
  }

  const handleOpenRecordReceipt = (ntp: NoticeToProceedListItem) => {
    setActiveNtpId(ntp.id)
    setIsRecordOpen(true)
  }

  const handleConfirmIssue = async (payload: { issuedDate?: string; remarks?: string }) => {
    if (!activeNtpId) return
    try {
      await issueMutation.mutateAsync({ id: activeNtpId, payload })
      toast.success('Notice to Proceed officially issued.')
      setIsIssueOpen(false)
      setActiveNtpId(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to issue Notice to Proceed.')
    }
  }

  const handleConfirmRecordReceipt = async (payload: {
    receivedAt: string
    receivedByName: string
    receivedDate?: string
    conformeName?: string
    conformeDesignation?: string
    conformeDate?: string
    remarks?: string
  }) => {
    if (!activeNtpId) return
    try {
      await recordMutation.mutateAsync({ id: activeNtpId, payload })
      toast.success('Supplier conforme and receipt recorded.')
      setIsRecordOpen(false)
      setActiveNtpId(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to record supplier receipt.')
    }
  }

  const handleDeleteNTP = async (ntp: NoticeToProceedListItem) => {
    try {
      await deleteMutation.mutateAsync(ntp.id)
      toast.success(`Draft Notice to Proceed ${ntp.ntpNumber} deleted.`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined
      toast.error(message || 'Failed to delete Notice to Proceed.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight text-white">
                  Manage Notice to Proceed
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-indigo-950 text-indigo-200 border-indigo-700">
                  RA 12009 Administration
                </Badge>
              </div>
              <CardDescription className="text-xs md:text-sm text-slate-300">
                Administrative management, issuance verification, and contractor receipt tracking for all Notice to Proceed issuances.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-xs">
                <PlayCircle className="h-3.5 w-3.5 text-blue-400" />
                <span>NTP Management</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total NTPs</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold tracking-tight">{summary.totalCount}</p>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-medium">Drafts</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <p className="text-xl font-bold tracking-tight text-slate-700 dark:text-slate-300">{summary.draftCount}</p>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-blue-600">
              <span className="text-xs font-medium">Issued</span>
              <Send className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold tracking-tight text-blue-600">{summary.issuedCount}</p>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-medium">Received (Conforme)</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold tracking-tight text-emerald-600">{summary.receivedCount}</p>
          </Card>

          <Card className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-indigo-600">
              <span className="text-xs font-medium">PhilGEPS Posted</span>
              <Globe className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-bold tracking-tight text-indigo-600">{summary.philGepsPostedCount}</p>
          </Card>
        </div>
      )}

      {/* Main Table */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <ManageNTPListToolbar
          onSearch={setSearchQuery}
          onStatusFilter={setSelectedStatus}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
        />

        <NTPTable
          data={ntpList}
          isLoading={isLoading}
          isFetching={isFetching}
          onView={handleViewDetails}
          onPrint={handlePrintNTP}
          onIssue={handleOpenIssue}
          onRecordReceipt={handleOpenRecordReceipt}
          onDelete={handleDeleteNTP}
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          variant="manager"
        />
      </Card>

      {/* Issue Modal */}
      {activeNtp && (
        <IssueNoticeToProceedDialog
          open={isIssueOpen}
          onOpenChange={(isOpen) => {
            setIsIssueOpen(isOpen)
            if (!isOpen) setActiveNtpId(null)
          }}
          ntp={activeNtp}
          onConfirm={handleConfirmIssue}
          isSubmitting={issueMutation.isPending}
        />
      )}

      {/* Record Conforme Modal */}
      {activeNtp && (
        <RecordNoticeToProceedReceiptDialog
          open={isRecordOpen}
          onOpenChange={(isOpen) => {
            setIsRecordOpen(isOpen)
            if (!isOpen) setActiveNtpId(null)
          }}
          ntp={activeNtp}
          onConfirm={handleConfirmRecordReceipt}
          isSubmitting={recordMutation.isPending}
        />
      )}
    </div>
  )
}
