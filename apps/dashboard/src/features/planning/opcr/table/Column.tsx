import { ArrowUpDown } from 'lucide-react'
import { Actions } from './Actions'
import type { ColumnDef } from '@tanstack/react-table'
import type { OPCR } from '@/features/planning/opcr/types/type.opcr'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

export const Column: Array<ColumnDef<OPCR>> = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          OPCRs
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.original.name.trim() || ''
      return (
        <div>
          {name || `OPCR-${row.original.officeName}-${row.original.fiscalYear}`}
        </div>
      )
    },
  },
  {
    accessorKey: 'fiscalYear',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Fiscal Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return row.original.fiscalYear
    },
  },
  {
    accessorKey: 'totalBudget',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Budget
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return row.original.totalBudget.toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
      })
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.status
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
        'default'
      let bgColor = ''
      switch (status) {
        case 'Draft':
          variant = 'secondary'
          bgColor = '#AEAEB2'
          break
        case 'Submitted':
          variant = 'outline'
          bgColor = '#0088FF'
          break
        case 'Approved':
          variant = 'default'
          bgColor = '#34C759'
          break
        case 'Returned':
          variant = 'destructive'
          bgColor = '#FF3B30'
          break
      }
      return (
        <Badge
          variant={variant}
          style={{ backgroundColor: bgColor }}
          className="whitespace-nowrap w-24 px-2 py-1 rounded-sm text-white"
        >
          {status}
        </Badge>
      )
    },
  },
  {
    id: 'kpiCount',
    accessorFn: (row) =>
      row.kpiAssignmentCount ?? row.dukpiTargetAssignments?.length ?? 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          KPI Count
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count =
        row.original.kpiAssignmentCount ??
        row.original.dukpiTargetAssignments?.length ??
        0
      return <span className="font-medium">{count}</span>
    },
  },
  {
    id: 'activityCount',
    accessorFn: (row) => row.activityCount ?? row.opcrActivities?.length ?? 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Activity Count
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count =
        row.original.activityCount ??
        row.original.opcrActivities?.length ??
        0
      return <span className="font-medium">{count}</span>
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const readonly = table.options.meta?.readonly
      const actions = table.options.meta?.actions
      const role = table.options.meta?.role
      const data = row.original
      return (
        <Actions
          data={data}
          readonly={readonly}
          actions={actions}
          role={role}
        />
      )
    },
  },
]
