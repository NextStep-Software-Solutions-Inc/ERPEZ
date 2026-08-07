import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Badge } from '../../../../components/ui/badge'
import { AppActions } from './AppActions'
import type { AppMaster, UserRole } from '../types'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  'pending-review': 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-blue-100 text-blue-800',
  Draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Locked: 'bg-blue-100 text-blue-800',
}

const columnHelper = createColumnHelper<AppMaster>()

/**
 * Create column definitions for APP table with role-based actions
 * @param userRole - Current user's role for RBAC
 */
export function createColumns(userRole: UserRole = 'BAC_MEMBER'): ColumnDef<AppMaster>[] {
  return [
    columnHelper.accessor('appNumber', {
      header: 'APP Number',
      cell: (info) => (
        <span className="font-semibold">{info.getValue()}</span>
      ),
      size: 150,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <Badge className={statusColors[info.getValue()]}>
          {info.getValue()}
        </Badge>
      ),
      size: 120,
    }),
    columnHelper.accessor('aggregationResults.totalAmount', {
      header: 'Total Budget',
      cell: (info) =>
        `₱${info
          .getValue()
          .toLocaleString('en-PH', { maximumFractionDigits: 2 })}`,
      size: 150,
    }),
    columnHelper.accessor('fiscalYear', {
      header: 'Fiscal Year',
      cell: (info) => `FY ${info.getValue()}`,
      size: 120,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) =>
        new Date(info.getValue()).toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      size: 120,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <AppActions app={row.original} userRole={userRole} />,
      size: 80,
    }),
  ] as ColumnDef<AppMaster>[]
}

// Default export for backward compatibility
export const Column = createColumns()
