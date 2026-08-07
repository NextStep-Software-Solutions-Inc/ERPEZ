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

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '₱0.00'
  return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Salary Grade Column Definitions
 * Reference: documentations/feature-structure-pattern.md
 */
export const createSalaryGradeColumns = (options: ColumnFactoryOptions = {}): Array<ColumnDef<SalaryGradeSetting>> => [
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
    accessorKey: 'code',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Salary Grade
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono text-sm font-medium">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'gradeNumber',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        SG #
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-right">{row.getValue('gradeNumber')}</div>,
  },
  {
    accessorKey: 'stepIncrementAmount',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Step Increment
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCurrency(row.getValue('stepIncrementAmount')),
  },
  {
    accessorKey: 'numberOfSteps',
    header: 'Steps',
    cell: ({ row }) => <div className="text-center">{row.getValue('numberOfSteps')}</div>,
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

export const SalaryGradeColumn = createSalaryGradeColumns()
