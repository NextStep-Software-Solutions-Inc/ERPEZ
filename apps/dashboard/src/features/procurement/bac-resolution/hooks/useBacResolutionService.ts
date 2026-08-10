import {
  CircleCheckBig,
  Clock3,
  FileClock,
  LayoutList,
  RotateCcw,
} from 'lucide-react'
import { useBacResolutionWorkspaceState } from './useBacResolutionWorkspaceState'
import type {
  BacResolutionInboxFilter,
  BacResolutionWorkspaceScope,
} from '../types'

export type MetricCard = {
  key: string
  label: string
  count: number
  icon: any
  containerClass: string
  iconClass: string
  valueClass: string
  summary?: boolean
  rows?: { label: string; count: number }[]
}

export function useBacResolutionService(
  defaultFilter: BacResolutionInboxFilter,
  initialSelectedResolutionId?: string,
  workspaceScope: BacResolutionWorkspaceScope = 'all',
) {
  const ws = useBacResolutionWorkspaceState(
    defaultFilter,
    initialSelectedResolutionId,
    workspaceScope,
  )

  const isLoading =
    ws.isBacResolutionsLoading || ws.isBacResolutionsFetching || ws.isMutating

  const countByStatus = (status: BacResolutionInboxFilter) =>
    ws.inboxCards.find((item) => item.status === status)?.count ?? 0

  const summaryCount = ws.inboxCards
    .filter((item) => item.status !== 'all')
    .reduce((total, item) => total + item.count, 0)

  const metricCards: MetricCard[] = [
    {
      key: 'draft',
      label: 'Draft',
      count: countByStatus('draft'),
      icon: FileClock,
      containerClass:
        'border-default-200 bg-slate-50/90 text-slate-700 shadow-sm hover:shadow-md',
      iconClass: 'text-slate-600',
      valueClass: 'text-slate-800',
    },
    {
      key: 'for-approval',
      label: 'For Approval',
      count: countByStatus('for-approval'),
      icon: Clock3,
      containerClass:
        'border-sky-200 bg-sky-50/90 text-sky-700 shadow-sm hover:shadow-md',
      iconClass: 'text-sky-600',
      valueClass: 'text-sky-700',
    },
    {
      key: 'returned',
      label: 'Returned',
      count: countByStatus('returned'),
      icon: RotateCcw,
      containerClass:
        'border-rose-200 bg-rose-50/90 text-rose-700 shadow-sm hover:shadow-md',
      iconClass: 'text-rose-600',
      valueClass: 'text-rose-700',
    },
    {
      key: 'approved',
      label: 'Approved',
      count: countByStatus('approved'),
      icon: CircleCheckBig,
      containerClass:
        'border-emerald-200 bg-emerald-50/90 text-emerald-700 shadow-sm hover:shadow-md',
      iconClass: 'text-emerald-600',
      valueClass: 'text-emerald-700',
    },
    {
      key: 'summary',
      label: 'Summary',
      count: summaryCount,
      icon: LayoutList,
      containerClass:
        'border-default-200 bg-default-50/90 text-default-800 shadow-sm hover:shadow-md',
      iconClass: 'text-primary',
      valueClass: 'text-default-900',
      summary: true,
      rows: [
        { label: 'Draft', count: countByStatus('draft') },
        { label: 'For Approval', count: countByStatus('for-approval') },
        { label: 'Returned', count: countByStatus('returned') },
        { label: 'Approved', count: countByStatus('approved') },
      ],
    },
  ]

  return {
    ws,
    isLoading,
    countByStatus,
    summaryCount,
    metricCards,
  }
}

export default useBacResolutionService
