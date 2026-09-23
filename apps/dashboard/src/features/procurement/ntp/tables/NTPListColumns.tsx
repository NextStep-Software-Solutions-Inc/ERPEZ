/**
 * NTP List Table Columns Definition
 * Defines columns for the NTP data table
 */

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CheckCircle2, Clock, XCircle, Send, Globe } from 'lucide-react'
import type { NoticeToProceedListItem, NoticeToProceedStatus } from '../types/ntpTypes'

const statusConfig: Record<
  NoticeToProceedStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  Draft: {
    label: 'Draft',
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    icon: <Clock className="w-3 h-3 mr-1 text-slate-500" />,
  },
  Issued: {
    label: 'Issued',
    className: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    icon: <Send className="w-3 h-3 mr-1 text-blue-600" />,
  },
  Received: {
    label: 'Received (Conforme)',
    className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    icon: <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />,
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700',
    icon: <XCircle className="w-3 h-3 mr-1 text-rose-600" />,
  },
}

export const NTPListColumns: ColumnDef<NoticeToProceedListItem>[] = [
  {
    accessorKey: 'ntpNumber',
    header: 'NTP Number',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
          {row.getValue('ntpNumber')}
        </span>
        <span className="text-[11px] text-muted-foreground">
          Contract: {row.original.contractNumber || '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier / Contractor',
    cell: ({ row }) => (
      <div className="flex flex-col max-w-xs">
        <span className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate">
          {row.getValue('supplierName') || '—'}
        </span>
        <span className="text-[11px] text-muted-foreground truncate">
          {row.original.projectTitle || '—'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'ntpDate',
    header: 'NTP Date',
    cell: ({ row }) => {
      const dateVal = row.getValue('ntpDate') as string
      if (!dateVal) return <span className="text-xs text-muted-foreground">—</span>
      try {
        return (
          <span className="text-xs text-slate-700 dark:text-slate-300">
            {format(new Date(dateVal), 'MMM d, yyyy')}
          </span>
        )
      } catch {
        return <span className="text-xs">{dateVal}</span>
      }
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as NoticeToProceedStatus
      const config = statusConfig[status] || {
        label: status,
        className: 'bg-slate-100 text-slate-700',
        icon: null,
      }
      return (
        <Badge variant="outline" className={`text-xs px-2 py-0.5 font-medium ${config.className}`}>
          {config.icon}
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'receivedDate',
    header: 'Conforme Date',
    cell: ({ row }) => {
      const dateVal = row.original.receivedDate || row.original.receivedAt || row.original.conformeDate
      const receiver = row.original.receivedByName || row.original.receivedBy || row.original.conformeName
      if (!dateVal) {
        return (
          <span className="text-[11px] text-muted-foreground italic">
            {row.original.status === 'Draft' ? 'Not Issued' : 'Pending Receipt'}
          </span>
        )
      }
      try {
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {format(new Date(dateVal), 'MMM d, yyyy')}
            </span>
            {receiver && (
              <span className="text-[11px] text-muted-foreground truncate max-w-[140px]" title={receiver}>
                By: {receiver}
              </span>
            )}
          </div>
        )
      } catch {
        return <span className="text-xs">{dateVal}</span>
      }
    },
  },
  {
    accessorKey: 'isPhilGepsPosted',
    header: 'PhilGEPS',
    cell: ({ row }) => {
      const isPosted = row.original.isPhilGepsPosted
      return isPosted ? (
        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
          <Globe className="w-2.5 h-2.5 mr-1 text-blue-500" /> Posted
        </Badge>
      ) : (
        <span className="text-[11px] text-muted-foreground">Pending</span>
      )
    },
  },
]
