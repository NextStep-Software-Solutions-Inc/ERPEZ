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
  getAvailableAwardBacResolutionsRequest,
  getNoticeOfAwardsRequest,
  returnNoticeOfAwardRequest,
} from '../handlers'
import type {
  AwardBacResolutionSource,
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

  const filterCards = useMemo(() => {
    if (role === 'hope') {
      return [
        {
          id: 'all' as NoticeOfAwardInboxFilter,
          title: 'All',
          count: countAll,
          icon: LayoutList,
          colorTheme: 'indigo' as const,
        },
        {
          id: 'for-approval' as NoticeOfAwardInboxFilter,
          title: 'For Approval',
          count: countForApproval,
          icon: Clock3,
          colorTheme: 'sky' as const,
        },
        {
          id: 'approved' as NoticeOfAwardInboxFilter,
          title: 'Approved / Issued',
          count: countApproved,
          icon: CircleCheckBig,
          colorTheme: 'emerald' as const,
        },
      ]
    }

    return [
      {
        id: 'all' as NoticeOfAwardInboxFilter,
        title: 'All',
        count: countAll,
        icon: LayoutList,
        colorTheme: 'indigo' as const,
      },
      {
        id: 'draft' as NoticeOfAwardInboxFilter,
        title: 'Draft',
        count: countDraft,
        icon: FileClock,
        colorTheme: 'slate' as const,
      },
      {
        id: 'for-approval' as NoticeOfAwardInboxFilter,
        title: 'For Approval',
        count: countForApproval,
        icon: Clock3,
        colorTheme: 'sky' as const,
      },
      {
        id: 'returned' as NoticeOfAwardInboxFilter,
        title: 'Returned',
        count: countReturned,
        icon: RotateCcw,
        colorTheme: 'rose' as const,
      },
      {
        id: 'approved' as NoticeOfAwardInboxFilter,
        title: 'Approved / Issued',
        count: countApproved,
        icon: CircleCheckBig,
        colorTheme: 'emerald' as const,
      },
    ]
  }, [
    role,
    countAll,
    countDraft,
    countForApproval,
    countReturned,
    countApproved,
  ])

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

  const handleOpenCreate = async () => {
    try {
      const resolutions = await getAvailableAwardBacResolutionsRequest.fetcher()
      setAvailableAwardBacResolutions(resolutions)
    } catch {
      // Keep existing
    }
    setCreateOpen(true)
  }

  return (
    <PageContainerDashtail
      title={title}
      description={description}
      headerVariant="branded"
      headerSize="large"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {totalAwardedValue > 0 && (
            <Badge
              variant="outline"
              className="h-8 px-3 py-1 font-semibold text-xs border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-xs"
            >
              Total Awarded: ₱{totalAwardedValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Badge>
          )}
          {role === 'procurement-staff' ? (
            <Badge variant="outline" className="h-8 px-3 py-1 font-semibold text-xs border-primary/30 text-primary-700 bg-primary/5 shadow-xs">
              <Award className="h-3.5 w-3.5 mr-1.5 text-primary" /> Notice of Award
            </Badge>
          ) : (
            <Badge variant="outline" className="h-8 px-3 py-1 font-semibold text-xs border-primary/30 text-primary-700 bg-primary/5 shadow-xs">
              <Award className="h-3.5 w-3.5 mr-1.5 text-primary" /> Approver Queue
            </Badge>
          )}
        </div>
      }
      contentClassName="space-y-4 pt-4"
    >
      {/* Interactive Compact Status Filter Cards */}
      <div
        className={`grid gap-3 grid-cols-2 sm:grid-cols-3 ${
          role === 'hope' ? 'lg:grid-cols-3' : 'lg:grid-cols-5'
        }`}
      >
        {filterCards.map((card) => (
          <NoticeOfAwardSummaryCard
            key={card.id}
            id={card.id}
            title={card.title}
            count={card.count}
            icon={card.icon}
            isSelected={activeFilter === card.id}
            onClick={() => setActiveFilter(card.id)}
            colorTheme={card.colorTheme}
          />
        ))}
      </div>

      {role !== 'hope' && overdueSlaCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 px-4 py-2.5 text-xs text-rose-800 dark:text-rose-300 shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>
              <strong className="font-bold">{overdueSlaCount}</strong> NOA contract execution SLA
              {overdueSlaCount === 1 ? ' is' : 's are'} overdue.
            </span>
          </div>
          <div className="text-rose-700 dark:text-rose-400">
            Review the record and log a justification or trigger the next-ranked bidder cascade.
          </div>
        </div>
      ) : null}

      <NoticeOfAwardActionBar
        search={search}
        onSearchChange={setSearch}
        primaryActionLabel={
          role === 'procurement-staff' ? 'Create NOA' : undefined
        }
        onPrimaryAction={handleOpenCreate}
      />

      <NoticeOfAwardTable
        rows={filteredNoticesOfAward}
        detailsTo={detailsTo}
        onCreateClick={role === 'procurement-staff' ? handleOpenCreate : undefined}
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
    </PageContainerDashtail>
  )
}
