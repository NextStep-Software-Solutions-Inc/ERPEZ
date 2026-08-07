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
 * Position Type Column Definitions
 * Reference: documentations/feature-structure-pattern.md
 */
export const createPositionTypeColumns = (options: ColumnFactoryOptions = {}): Array<ColumnDef<PositionTypeSetting>> => [
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
        Position Type
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
    accessorKey: 'isCareerEligibilityRequired',
    header: 'Career Eligibility',
    cell: ({ row }) => {
      const required = row.getValue('isCareerEligibilityRequired') as boolean
      return required ? <Badge>Required</Badge> : <Badge>Not Required</Badge>
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

export const PositionTypeColumn = createPositionTypeColumns()
