/**
 * NTP List Page
 * Main page for viewing and managing Notice to Proceed (NTP) records under RA 12009.
 */

import { useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { FileText, Send, CheckCircle2, Clock, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { NTPTable, NTPListToolbar } from '../tables'
import { CreateNTPDialog } from '../dialogs'
import { isCreateNTPDialogOpenAtom, selectedNTPAtom } from '../atoms/ntpAtoms'
import {
  useGetNoticeToProceeds,
  useGetNoticeToProceedSummary,
  useDeleteNoticeToProceed,
} from '../handlers/hooks'
import { getNoticeToProceedPdfRequest } from '../handlers/getNoticeToProceedPdfRequest'
import type { NoticeToProceedListItem } from '../types/ntpTypes'

export function NTPListPage() {
  const navigate = useNavigate()
  const [, setIsCreateDialogOpen] = useAtom(isCreateNTPDialogOpenAtom)
  const [, setSelectedNTP] = useAtom(selectedNTPAtom)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Real backend queries
  const { data: ntpResponse, isLoading, isFetching } = useGetNoticeToProceeds({
    search: searchQuery || undefined,
    status: selectedStatus === 'All' ? undefined : selectedStatus,
    pageNumber: 1,
    pageSize: 50,
  })

  const { data: summary } = useGetNoticeToProceedSummary()
  const deleteMutation = useDeleteNoticeToProceed()

  const ntpList = ntpResponse?.data?.items || []

  const handleCreateClick = () => {
    setIsCreateDialogOpen(true)
  }

  const handleViewDetails = (ntp: NoticeToProceedListItem) => {
    navigate({
      to: `/v2/notice-to-proceed-ntp/${ntp.id}`,
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
      <Card className="bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-slate-900 dark:to-slate-800/80 border-blue-200/60 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold tracking-tight">Notice to Proceed</CardTitle>
                <Badge variant="outline" className="text-xs bg-blue-100/60 text-blue-800 border-blue-300">
                  RA 12009 Sec. 66
                </Badge>
              </div>
              <CardDescription className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                Official commencement notice authorizing winning suppliers and contractors to begin contract implementation.
              </CardDescription>
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
              <span className="text-xs font-medium">Issued (Active)</span>
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

      {/* Main Table Container */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <NTPListToolbar
          onSearch={setSearchQuery}
          onStatusFilter={setSelectedStatus}
          onCreateClick={handleCreateClick}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
        />

        <NTPTable
          data={ntpList}
          isLoading={isLoading}
          isFetching={isFetching}
          onView={handleViewDetails}
          onPrint={handlePrintNTP}
          onDelete={handleDeleteNTP}
          searchQuery={searchQuery}
          selectedStatus={selectedStatus}
          variant="user"
        />
      </Card>

      {/* Create Dialog */}
      <CreateNTPDialog />
    </div>
  )
}
