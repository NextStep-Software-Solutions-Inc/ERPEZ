import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  approveNoticeOfAwardRequest,
  createNoticeOfAwardRequest,
  getAvailableAwardBacResolutionsRequest,
  getNoticeOfAwardsRequest,
  printNoticeOfAwardRequest,
  returnNoticeOfAwardRequest,
} from '../handlers'
import type {
  AwardBacResolutionSource,
  NoticeOfAward,
  NoticeOfAwardInboxFilter,
  NoticeOfAwardRole,
} from '../types'
import { NoticeOfAwardActionBar } from './NoticeOfAwardActionBar'
import { NoticeOfAwardTable } from './NoticeOfAwardTable'
import {
  ApproveNoticeOfAwardDialog,
  CreateNoticeOfAwardDialog,
  ReturnNoticeOfAwardDialog,
} from '../dialogs'
import { toast } from 'sonner'
import { downloadNoticeOfAwardBlob } from '../utils/downloadNoticeOfAwardBlob'
import { getNoaContractExecutionSlaState } from '../utils/noaContractExecutionSla'

type NoticeOfAwardWorkspaceProps = {
  title: string
  description: string
  role: NoticeOfAwardRole
  detailsTo: string
  defaultFilter?: NoticeOfAwardInboxFilter
}

export function NoticeOfAwardWorkspace({
  title,
  description,
  role,
  detailsTo,
  defaultFilter = 'all',
}: NoticeOfAwardWorkspaceProps) {
  const [noticesOfAward, setNoticesOfAward] = useState<NoticeOfAward[]>([])
  const [availableAwardBacResolutions, setAvailableAwardBacResolutions] = useState<AwardBacResolutionSource[]>([])
  const [activeFilter, setActiveFilter] =
    useState<NoticeOfAwardInboxFilter>(defaultFilter)
  const [search, setSearch] = useState('')
  const [selectedNoaId, setSelectedNoaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)

  const loadNoticesOfAward = async () => {
    setIsLoading(true)
    try {
      const [noas, resolutions] = await Promise.all([
        getNoticeOfAwardsRequest.fetcher(),
        getAvailableAwardBacResolutionsRequest.fetcher().catch(() => []),
      ])
      setNoticesOfAward(noas)
      setAvailableAwardBacResolutions(resolutions)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load NOAs.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadNoticesOfAward()
  }, [])

  const filteredNoticesOfAward = useMemo(() => {
    return noticesOfAward
      .filter((item) => {
        if (role === 'hope') {
          if (activeFilter === 'all') {
            return item.status === 'for-approval' || item.status === 'approved'
          }
          if (activeFilter === 'for-approval') {
            return item.status === 'for-approval' || item.status === 'approved'
          }
          return item.status === activeFilter
        }
        if (activeFilter === 'all') return true
        return item.status === activeFilter
      })
      .filter((item) => {
        if (!search.trim()) return true

        const haystack = [
          item.noaNumber,
          item.description,
          item.supplierName,
          item.linkedBacResolution.bacResolutionNumber,
          item.linkedConsolidatedPr.prNumber,
          item.linkedConsolidatedPr.projectName,
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(search.toLowerCase())
      })
  }, [activeFilter, noticesOfAward, role, search])

  useEffect(() => {
    if (!filteredNoticesOfAward.length) {
      setSelectedNoaId(null)
      return
    }

    if (
      !selectedNoaId ||
      !filteredNoticesOfAward.some((item) => item.id === selectedNoaId)
    ) {
      setSelectedNoaId(filteredNoticesOfAward[0].id)
    }
  }, [filteredNoticesOfAward, selectedNoaId])

  const selectedNoticeOfAward = useMemo(
    () => noticesOfAward.find((item) => item.id === selectedNoaId) ?? null,
    [noticesOfAward, selectedNoaId],
  )

  const countByStatus = (status: NoticeOfAward['status']) =>
    noticesOfAward.filter((item) => item.status === status).length

  const countDraft = countByStatus('draft')
  const countForApproval = countByStatus('for-approval')
  const countReturned = countByStatus('returned')
  const countApproved = countByStatus('approved')
  const countAll = role === 'hope'
    ? countForApproval + countApproved
    : noticesOfAward.length

  const totalAwardedValue = useMemo(() => {
    return noticesOfAward
      .filter((item) => {
        if (role === 'hope') {
          return item.status === 'for-approval' || item.status === 'approved'
        }
        return item.status === 'approved'
      })
      .reduce((sum, item) => sum + item.totalAmount, 0)
  }, [noticesOfAward, role])

  const slaStates = useMemo(() => {
    return noticesOfAward
      .filter((item) => {
        if (role === 'hope') {
          return item.status === 'for-approval' || item.status === 'approved'
        }
        return true
      })
      .map((item) => getNoaContractExecutionSlaState(item))
  }, [noticesOfAward, role])

  const overdueSlaCount = slaStates.filter((state) => state.isOverdue).length

  const handleOpenCreate = async () => {
    try {
      const resolutions = await getAvailableAwardBacResolutionsRequest.fetcher()
      setAvailableAwardBacResolutions(resolutions)
    } catch {
      // Keep existing
    }
    setCreateOpen(true)
  }

  const handleGenerateNoa = async (noa: NoticeOfAward) => {
    try {
      const result = await printNoticeOfAwardRequest.fetcher({ noaId: noa.id })
      downloadNoticeOfAwardBlob(result.blob, result.fileName)
      toast.success('NOA document generated successfully.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to generate the NOA document.',
      )
    }
  }

  if (isLoading && noticesOfAward.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading Notice of Award records...</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. HEADER CARD (No purple feature name header; clean gradient display design) */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-sm overflow-hidden relative">
        <CardHeader className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-extrabold tracking-tight text-default-900">
                {title}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground max-w-3xl">
                {description}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {totalAwardedValue > 0 && (
                <Badge
                  variant="outline"
                  className="h-fit px-3 py-1 font-semibold border-emerald-300 text-emerald-800 bg-emerald-50/90 shadow-sm"
                >
                  Total Awarded: ₱{totalAwardedValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Badge>
              )}
              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold border-primary/30 text-primary-700 bg-primary/5 shadow-sm"
              >
                <Award className="h-3.5 w-3.5 mr-1.5 text-primary" />
                {role === 'hope' ? 'Approver Queue' : 'BAC Public Bidding Workspace'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 2. WORKSPACE CONTROLS & SEARCH */}
      <NoticeOfAwardActionBar
        search={search}
        onSearchChange={setSearch}
        primaryActionLabel={
          role === 'procurement-staff' ? 'Create NOA' : undefined
        }
        onPrimaryAction={handleOpenCreate}
        onRefresh={() => void loadNoticesOfAward()}
        isLoading={isLoading}
      />

      {/* 3. NON-DISMISSABLE COMPLIANCE WARNING BANNER */}
      {role !== 'hope' && overdueSlaCount > 0 ? (
        <Alert variant="outline" color="destructive" className="border-destructive/30 bg-destructive/5 text-destructive animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="h-5 w-5 text-destructive animate-bounce" />
          <div>
            <AlertTitle className="font-bold text-sm text-destructive-900">🚨 COMPLIANCE ALERT: Contract Execution SLA Overdue</AlertTitle>
            <AlertDescription className="text-xs text-destructive-800 mt-1 space-y-1">
              <p>
                There {overdueSlaCount === 1 ? 'is' : 'are'} <strong>{overdueSlaCount} Notice of Award record{overdueSlaCount === 1 ? '' : 's'}</strong> exceeding the statutory 10-calendar-day contract execution window.
                Review the records immediately to log legal justifications or initiate next-ranked bidder forfeiture procedures under RA 12009.
              </p>
            </AlertDescription>
          </div>
        </Alert>
      ) : null}

      {/* 4. 4-COLUMN KPI METRIC BRIEF */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Governing Law */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-blue-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              RA 12009
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Execution SLA: <span className="font-semibold text-blue-600">10 Calendar Days</span>
            </p>
          </CardContent>
        </Card>

        {/* Award Basis */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-purple-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Award Basis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              LCRB / MEARB
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Approved BAC Resolution Award
            </p>
          </CardContent>
        </Card>

        {/* Total Awarded Value */}
        <Card className="border border-default-200 shadow-sm bg-white border-l-4 border-l-amber-500 hover:translate-y-[-2px] transition-all duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Awarded Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-extrabold text-default-900">
              ₱{totalAwardedValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Across {countApproved} approved contract award{countApproved === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        {/* Statutory Compliance */}
        <Card className={`border border-default-200 shadow-sm bg-white border-l-4 hover:translate-y-[-2px] transition-all duration-200 ${
          overdueSlaCount === 0 ? 'border-l-emerald-500' : 'border-l-rose-500'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Statutory Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant="outline"
                className={`font-bold ${
                  overdueSlaCount === 0
                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                    : 'border-rose-300 text-rose-700 bg-rose-50'
                }`}
              >
                {overdueSlaCount === 0 ? 'All Compliant' : `${overdueSlaCount} SLA Overdue`}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {overdueSlaCount === 0 ? 'All active NOAs within 10-day window' : 'SLA exception logged for audit review'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 5. DATA TABLE (WITH INTEGRATED STATUS FILTERS) */}
      <NoticeOfAwardTable
        rows={filteredNoticesOfAward}
        detailsTo={detailsTo}
        onCreateClick={role === 'procurement-staff' ? handleOpenCreate : undefined}
        onGenerateNoa={handleGenerateNoa}
        activeStatus={activeFilter}
        onStatusChange={setActiveFilter}
        statusCounts={{
          all: countAll,
          draft: countDraft,
          forApproval: countForApproval,
          returned: countReturned,
          approved: countApproved,
        }}
        role={role}
      />

      <CreateNoticeOfAwardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        availableAwardBacResolutions={availableAwardBacResolutions}
        onCreate={async (payload) => {
          try {
            await createNoticeOfAwardRequest.fetcher({
              data: payload,
            })
            setCreateOpen(false)
            toast.success('NOA draft created.')
            await loadNoticesOfAward()
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : 'Failed to create NOA.',
            )
          }
        }}
      />

      {selectedNoticeOfAward ? (
        <ReturnNoticeOfAwardDialog
          open={returnOpen}
          onOpenChange={setReturnOpen}
          noaId={selectedNoticeOfAward.id}
          noaNumber={selectedNoticeOfAward.noaNumber}
          supplierName={selectedNoticeOfAward.supplierName}
          totalAmount={selectedNoticeOfAward.totalAmount}
          onReturn={async (payload) => {
            try {
              await returnNoticeOfAwardRequest.fetcher({
                data: payload,
              })
              setReturnOpen(false)
              toast.success('NOA returned for revision.')
              await loadNoticesOfAward()
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to return the NOA.',
              )
            }
          }}
        />
      ) : null}

      {selectedNoticeOfAward ? (
        <ApproveNoticeOfAwardDialog
          open={approveOpen}
          onOpenChange={setApproveOpen}
          noaId={selectedNoticeOfAward.id}
          noaNumber={selectedNoticeOfAward.noaNumber}
          supplierName={selectedNoticeOfAward.supplierName}
          totalAmount={selectedNoticeOfAward.totalAmount}
          onApprove={async (payload) => {
            try {
              await approveNoticeOfAwardRequest.fetcher({
                data: payload,
              })
              setApproveOpen(false)
              toast.success('NOA approved.')
              await loadNoticesOfAward()
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Failed to approve the NOA.',
              )
            }
          }}
        />
      ) : null}
    </div>
  )
}

