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
 * Plantilla Type Column Definitions
 * Reference: documentations/feature-structure-pattern.md
 */
export const createPlantillaTypeColumns = (options: ColumnFactoryOptions = {}): Array<ColumnDef<PlantillaTypeSetting>> => [
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
        Plantilla Type
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
    accessorKey: 'duration',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Duration
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const duration = row.getValue('duration') as number | null
      return duration ? <div>{duration} months</div> : <Badge variant="outline">Permanent</Badge>
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

export const PlantillaTypeColumn = createPlantillaTypeColumns()
