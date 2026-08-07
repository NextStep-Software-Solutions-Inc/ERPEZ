import { useEffect, useMemo, useState } from 'react'
import {
  CircleCheckBig,
  Clock3,
  FileClock,
  LayoutList,
  RotateCcw,
  Award,
  AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageContainerDashtail } from '@/components/v2'
import {
  approveNoticeOfAwardRequest,
  createNoticeOfAwardRequest,
  getNoticeOfAwardsRequest,
  returnNoticeOfAwardRequest,
} from '../handlers'
import { getApprovedAwardBacResolutionSources } from '../data/mockNoticeOfAwardData'
import { useBidEvaluationStore } from '../../bid-evaluation/store/bidEvaluationStore'
import type {
  NoticeOfAward,
  NoticeOfAwardInboxFilter,
  NoticeOfAwardRole,
} from '../types'
import { NoticeOfAwardActionBar } from './NoticeOfAwardActionBar'
import { NoticeOfAwardSummaryCard } from './NoticeOfAwardSummaryCard'
import { NoticeOfAwardTable } from './NoticeOfAwardTable'
import {
  ApproveNoticeOfAwardDialog,
  CreateNoticeOfAwardDialog,
  ReturnNoticeOfAwardDialog,
} from '../dialogs'
import { toast } from 'sonner'
import { getNoaContractExecutionSlaState } from '../utils/noaContractExecutionSla'

type NoticeOfAwardWorkspaceProps = {
  title: string
  description: string
  role: NoticeOfAwardRole
  detailsTo: string
  defaultFilter?: NoticeOfAwardInboxFilter
}

const TAB_ITEMS: Array<{ id: NoticeOfAwardInboxFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'for-approval', label: 'For Approval' },
  { id: 'returned', label: 'Returned' },
  { id: 'approved', label: 'Approved' },
]

const HOPE_TAB_ITEMS: Array<{ id: NoticeOfAwardInboxFilter; label: string }> = [
  { id: 'for-approval', label: 'For Approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'all', label: 'All (Manage)' },
]

export function NoticeOfAwardWorkspace({
  title,
  description,
  role,
  detailsTo,
  defaultFilter = 'all',
}: NoticeOfAwardWorkspaceProps) {
  const [noticesOfAward, setNoticesOfAward] = useState<NoticeOfAward[]>([])
  const [activeFilter, setActiveFilter] =
    useState<NoticeOfAwardInboxFilter>(defaultFilter)
  const [search, setSearch] = useState('')
  const [selectedNoaId, setSelectedNoaId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const bidEvaluationProjects = useBidEvaluationStore((state) => state.projects)

  const loadNoticesOfAward = async () => {
    setIsLoading(true)
    try {
      const response = await getNoticeOfAwardsRequest.fetcher()
      setNoticesOfAward(response)
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

  const availableAwardBacResolutions = useMemo(
    () => {
      const usedBacResolutionIds = new Set(
        noticesOfAward.map((noa) => noa.linkedBacResolution.id)
      )
      return getApprovedAwardBacResolutionSources().filter(
        (source) =>
          source.sourceModule === 'bid-evaluation' &&
          !usedBacResolutionIds.has(source.id),
      )
    },
    [bidEvaluationProjects, noticesOfAward],
  )

  const selectedNoticeOfAward = useMemo(
    () => noticesOfAward.find((item) => item.id === selectedNoaId) ?? null,
    [noticesOfAward, selectedNoaId],
  )

  const countByStatus = (status: NoticeOfAward['status']) =>
    noticesOfAward.filter((item) => item.status === status).length

  const summaryCount = role === 'hope'
    ? countByStatus('for-approval') + countByStatus('approved')
    : noticesOfAward.length

  const runningTotal = noticesOfAward
    .filter((item) => {
      if (role === 'hope') {
        return item.status === 'for-approval' || item.status === 'approved'
      }
      return true
    })
    .reduce((sum, item) => sum + item.totalAmount, 0)

  const slaStates = noticesOfAward
    .filter((item) => {
      if (role === 'hope') {
        return item.status === 'for-approval' || item.status === 'approved'
      }
      return true
    })
    .map((item) => getNoaContractExecutionSlaState(item))

  const openSlaCount = slaStates.filter((state) => state.isOpen).length
  const overdueSlaCount = slaStates.filter((state) => state.isOverdue).length

  const metricCards = useMemo(() => {
    if (role === 'hope') {
      return [
        {
          key: 'for-approval',
          title: 'For Approval',
          value: countByStatus('for-approval'),
          icon: Clock3,
          containerClassName:
            'border-default-200 bg-sky-50/90 text-sky-700 shadow-sm hover:shadow-md border-l-4 border-l-sky-500 hover:translate-y-[-2px] transition-all duration-200',
          iconClassName: 'text-sky-600',
          valueClassName: 'text-sky-700',
          status: 'for-approval' as const,
        },
        {
          key: 'approved',
          title: 'Approved / Issued',
          value: countByStatus('approved'),
          icon: CircleCheckBig,
          containerClassName:
            'border-default-200 bg-emerald-50/90 text-emerald-700 shadow-sm hover:shadow-md border-l-4 border-l-emerald-500 hover:translate-y-[-2px] transition-all duration-200',
          iconClassName: 'text-emerald-600',
          valueClassName: 'text-emerald-700',
          status: 'approved' as const,
        },
        {
          key: 'summary',
          title: 'Summary',
          value: summaryCount,
          icon: LayoutList,
          containerClassName:
            'border-default-200 bg-default-50/90 text-default-850 shadow-sm hover:shadow-md border-l-4 border-l-primary hover:translate-y-[-2px] transition-all duration-200',
          iconClassName: 'text-primary',
          valueClassName: 'text-default-900',
          summary: true,
          rows: [
            { label: 'For Approval', value: countByStatus('for-approval') },
            { label: 'Approved', value: countByStatus('approved') },
            {
              label: 'Running Total',
              value: runningTotal.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            },
          ],
        },
      ]
    }

    return [
      {
        key: 'draft',
        title: 'Draft',
        value: countByStatus('draft'),
        icon: FileClock,
        containerClassName:
          'border-default-200 bg-slate-50/90 text-slate-700 shadow-sm hover:shadow-md border-l-4 border-l-slate-400 hover:translate-y-[-2px] transition-all duration-200',
        iconClassName: 'text-slate-600',
        valueClassName: 'text-slate-850',
        status: 'draft' as const,
      },
      {
        key: 'for-approval',
        title: 'For Approval',
        value: countByStatus('for-approval'),
        icon: Clock3,
        containerClassName:
          'border-default-200 bg-sky-50/90 text-sky-700 shadow-sm hover:shadow-md border-l-4 border-l-sky-500 hover:translate-y-[-2px] transition-all duration-200',
        iconClassName: 'text-sky-600',
        valueClassName: 'text-sky-700',
        status: 'for-approval' as const,
      },
      {
        key: 'returned',
        title: 'Returned',
        value: countByStatus('returned'),
        icon: RotateCcw,
        containerClassName:
          'border-default-200 bg-rose-50/90 text-rose-700 shadow-sm hover:shadow-md border-l-4 border-l-rose-500 hover:translate-y-[-2px] transition-all duration-200',
        iconClassName: 'text-rose-600',
        valueClassName: 'text-rose-700',
        status: 'returned' as const,
      },
      {
        key: 'approved',
        title: 'Approved',
        value: countByStatus('approved'),
        icon: CircleCheckBig,
        containerClassName:
          'border-default-200 bg-emerald-50/90 text-emerald-700 shadow-sm hover:shadow-md border-l-4 border-l-emerald-500 hover:translate-y-[-2px] transition-all duration-200',
        iconClassName: 'text-emerald-600',
        valueClassName: 'text-emerald-700',
        status: 'approved' as const,
      },
      {
        key: 'summary',
        title: 'Summary',
        value: summaryCount,
        icon: LayoutList,
        containerClassName:
          'border-default-200 bg-default-50/90 text-default-850 shadow-sm hover:shadow-md border-l-4 border-l-primary hover:translate-y-[-2px] transition-all duration-200',
        iconClassName: 'text-primary',
        valueClassName: 'text-default-900',
        summary: true,
        rows: [
          { label: 'Draft', value: countByStatus('draft') },
          { label: 'For Approval', value: countByStatus('for-approval') },
          { label: 'Returned', value: countByStatus('returned') },
          { label: 'Approved', value: countByStatus('approved') },
          { label: 'Open SLA', value: openSlaCount },
          { label: 'Overdue SLA', value: overdueSlaCount },
          {
            label: 'Running Total',
            value: runningTotal.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          },
        ],
      },
    ]
  }, [role, noticesOfAward, openSlaCount, overdueSlaCount, runningTotal])

  const handleRefreshSelected = (updated: NoticeOfAward) => {
    setNoticesOfAward((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
    setSelectedNoaId(updated.id)
  }

  if (isLoading) {
    return (
      <PageContainerDashtail
        title={title}
        description={description}
        headerVariant="branded"
        headerSize="large"
      >
        <Card className="border-default-200/70 shadow-sm">
          <CardContent className="p-6 text-sm text-default-600">
            Loading NOA records...
          </CardContent>
        </Card>
      </PageContainerDashtail>
    )
  }

  return (
    <PageContainerDashtail
      title={title}
      description={description}
      headerVariant="branded"
      headerSize="large"
      mode="tabbed"
      tabs={role === 'hope' ? HOPE_TAB_ITEMS : TAB_ITEMS}
      activeTab={activeFilter}
      onTabChange={(tabId: string) => setActiveFilter(tabId as NoticeOfAwardInboxFilter)}
      actions={
        <div className="flex items-center gap-2">
          {role === 'procurement-staff' ? (
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-primary/30 text-primary-700 bg-primary/5 shadow-sm">
              <Award className="h-3.5 w-3.5 mr-1.5 text-primary" /> Notice of Award
            </Badge>
          ) : (
            <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-primary/30 text-primary-700 bg-primary/5 shadow-sm">
              <Award className="h-3.5 w-3.5 mr-1.5 text-primary" /> Approver Queue
            </Badge>
          )}
        </div>
      }
      contentClassName="space-y-4 pt-4"
    >
      <div
        className={`grid gap-3 md:grid-cols-2 ${role === 'hope' ? 'xl:grid-cols-3' : 'xl:grid-cols-5'
          }`}
      >
        {metricCards.map((item) => (
          <NoticeOfAwardSummaryCard
            key={item.key}
            title={item.title}
            value={String(item.value)}
            icon={item.icon}
            containerClassName={item.containerClassName}
            iconClassName={item.iconClassName}
            valueClassName={item.valueClassName}
            status={item.status}
            summary={item.summary}
            rows={item.rows}
          />
        ))}
      </div>

      {role !== 'hope' && overdueSlaCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            {overdueSlaCount} NOA contract execution SLA
            {overdueSlaCount === 1 ? ' is' : 's are'} overdue.
          </div>
          <div className="text-xs text-rose-700">
            Review the record and log a justification or trigger the next-ranked
            bidder cascade.
          </div>
        </div>
      ) : null}

      <NoticeOfAwardActionBar
        search={search}
        onSearchChange={setSearch}
        primaryActionLabel={
          role === 'procurement-staff' ? 'Create NOA' : undefined
        }
        onPrimaryAction={() => setCreateOpen(true)}
      />

      <NoticeOfAwardTable rows={filteredNoticesOfAward} detailsTo={detailsTo} />

      <CreateNoticeOfAwardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        availableAwardBacResolutions={availableAwardBacResolutions}
        onCreate={async (payload) => {
          try {
            const created = await createNoticeOfAwardRequest.fetcher({
              data: payload,
            })
            setNoticesOfAward((current) => [created, ...current])
            setSelectedNoaId(created.id)
            setCreateOpen(false)
            toast.success('NOA draft created.')
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
          onReturn={async (payload) => {
            try {
              const updated = await returnNoticeOfAwardRequest.fetcher({
                data: payload,
              })
              handleRefreshSelected(updated)
              setReturnOpen(false)
              toast.success('NOA returned for revision.')
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
          onApprove={async (payload) => {
            try {
              const updated = await approveNoticeOfAwardRequest.fetcher({
                data: payload,
              })
              handleRefreshSelected(updated)
              setApproveOpen(false)
              toast.success('NOA approved.')
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
    </PageContainerDashtail>
  )
}
