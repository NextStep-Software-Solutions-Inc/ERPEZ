import { ArrowUpDown } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Actions } from './Actions'
import type { OfficeTypeSetting, PositionTypeSetting, SalaryGradeSetting, PlantillaTypeSetting, PMTMaximumSeatsSetting } from '../types'

type SettingData = OfficeTypeSetting | PositionTypeSetting | SalaryGradeSetting | PlantillaTypeSetting | PMTMaximumSeatsSetting

interface ColumnFactoryOptions {
  onEdit?: (data: SettingData) => void
  onDelete?: (data: SettingData) => void
}

/**
 * PMT Maximum Seats Column Definitions
 * Reference: documentations/feature-structure-pattern.md
 */
export const createPMTMaximumSeatsColumns = (options: ColumnFactoryOptions = {}): Array<ColumnDef<PMTMaximumSeatsSetting>> => [
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
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'maxSeats',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Max Seats
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center font-semibold">{row.getValue('maxSeats')}</div>,
  },
  {
    accessorKey: 'reportingLevel',
    header: 'Reporting Level',
    cell: ({ row }) => {
      const level = row.getValue('reportingLevel') as string | undefined
      return level ? <Badge variant="outline">{level}</Badge> : <span>—</span>
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return <Badge color={isActive ? 'success' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions data={row.original} onEdit={options.onEdit} onDelete={options.onDelete} />,
    enableHiding: false,
  },
]

export const PMTMaximumSeatsColumn = createPMTMaximumSeatsColumns()
