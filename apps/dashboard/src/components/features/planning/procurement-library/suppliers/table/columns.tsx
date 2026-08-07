import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { SupplierActions } from '../dialog/SupplierActions'
import type { SupplierListItem } from '../types'

export const Column: ColumnDef<SupplierListItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Supplier Name',
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue('name') || 'Unnamed supplier'}
      </span>
    ),
  },
  {
    accessorKey: 'philGEPSNumber',
    header: 'PhilGEPS Number',
    cell: ({ row }) => (
      <code className="text-sm">{row.getValue('philGEPSNumber') || '—'}</code>
    ),
  },
  {
    accessorKey: 'supplierCategoryName',
    header: 'Supplier Category',
    cell: ({ row }) => (
      <span>{row.getValue('supplierCategoryName') || '—'}</span>
    ),
  },
  {
    accessorKey: 'contactPerson',
    header: 'Contact Person',
    cell: ({ row }) => <span>{row.getValue('contactPerson') || '—'}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const raw = (row.getValue('status') as string | null) ?? ''
      const status = String(raw).toLowerCase()
      const supplier = row.original as SupplierListItem
      const isBlacklisted = !!supplier.isBlacklisted

      // default: Pending
      let label = 'Pending'
      let className = 'bg-yellow-100 text-yellow-800'

      if (isBlacklisted || status === 'blocked') {
        label = 'Blocked'
        className = 'bg-orange-100 text-orange-800'
      } else if (status === 'approved') {
        label = 'Approved'
        className = 'bg-green-100 text-green-800'
      } else if (status === 'declined') {
        label = 'Declined'
        className = 'bg-red-100 text-red-800'
      } else if (status === 'pending' || status === '') {
        label = 'Pending'
        className = 'bg-yellow-100 text-yellow-800'
      } else {
        // unknown status: show as neutral
        label = raw as string
        className = 'bg-gray-100 text-gray-800'
      }

      return <Badge className={className}>{label}</Badge>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const supplier = row.original as SupplierListItem
      const meta = table.options.meta as any
      return (
        <div className="flex justify-center">
          <SupplierActions
            row={supplier}
            onView={meta?.onView}
            onEdit={meta?.onEdit}
            onApprove={meta?.onApprove}
            onDecline={meta?.onDecline}
            onToggleBlacklist={meta?.onToggleBlacklist}
            onDelete={meta?.onDelete}
          />
        </div>
      )
    },
  },
]
