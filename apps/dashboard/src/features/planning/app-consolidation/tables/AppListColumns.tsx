import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '../../../../components/ui/badge'
import { ProgressBadge } from '../components'
import type { AppListResponse } from '../handlers/getAPPListRequest'
import type { UserRole } from '../types'
import { AppActions } from './AppActions'

const statusColors: Record<string, string> = {
  'draft': 'bg-gray-100 text-gray-800',
  'Draft': 'bg-gray-100 text-gray-800',
  'pending-review': 'bg-yellow-100 text-yellow-800',
  'For Review': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'Approved': 'bg-green-100 text-green-800',
  'published': 'bg-blue-100 text-blue-800',
  'Published': 'bg-blue-100 text-blue-800',
  'Submitted': 'bg-yellow-100 text-yellow-800',
  'Locked': 'bg-purple-100 text-purple-800',
}

const columnHelper = createColumnHelper<AppListResponse>()

/**
 * Create column definitions for APP list table with role-based actions
 * @param userRole - Current user's role for RBAC
 */
export function createAppListColumns(userRole: UserRole = 'BAC_MEMBER'): ColumnDef<AppListResponse>[] {
  return [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 50,
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor('appNumber', {
      header: 'APP Number',
      cell: (info) => (
        <span className="font-semibold">{info.getValue()}</span>
      ),
      size: 150,
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => (
        <span className="text-sm">{info.getValue()}</span>
      ),
      size: 250,
    }),
    columnHelper.accessor('fiscalYearName', {
      header: 'Fiscal Year',
      cell: (info) => `FY ${info.getValue()}`,
      size: 120,
    }),
    columnHelper.accessor('officeName', {
      header: 'Office',
      cell: (info) => (
        <span className="text-sm">{info.getValue()}</span>
      ),
      size: 150,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        return (
          <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
            {status}
          </Badge>
        )
      },
      size: 120,
    }),
    columnHelper.display({
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        // Estimate progress from available data
        // Note: Full progress calculation would need BAC and signatory data
        const appItems = row.original.APPItems || []
        const itemsAddedCount = appItems.length
        
        return (
          <ProgressBadge
            itemsAdded={itemsAddedCount}
            bacConfigured={itemsAddedCount > 0}
            signatoriesAdded={false}
          />
        )
      },
      size: 120,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => {
        const date = info.getValue()
        return date
          ? new Date(date).toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '-'
      },
      size: 120,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        // Transform AppListResponse to minimal app object for AppActions
        const app = {
          id: row.original.id,
          appNumber: row.original.appNumber,
          appCode: row.original.appNumber,
          appName: row.original.name,
          status: row.original.status as any,
          fiscalYear: parseInt(row.original.fiscalYearName),
        }
        return <AppActions app={app as any} userRole={userRole} />
      },
      size: 80,
    }),
  ] as ColumnDef<AppListResponse>[]
}

// Default export for backward compatibility
export const AppListColumns = createAppListColumns()
