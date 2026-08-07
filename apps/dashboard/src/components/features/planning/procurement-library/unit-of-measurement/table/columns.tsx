import { ColumnDef } from '@tanstack/react-table'
import type { UnitOfMeasurement } from '../../types'

export const Column: ColumnDef<UnitOfMeasurement>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
  },
  {
    accessorKey: 'abbreviation',
    header: 'Abbreviation',
    cell: ({ row }) => <code className="text-sm bg-muted px-2 py-1 rounded">{row.getValue('abbreviation')}</code>,
  },
  {
    accessorKey: 'parentUnitName',
    header: 'Parent Unit',
    cell: ({ row }) => <span className="text-sm">{row.getValue('parentUnitName') || '-'}</span>,
  },
  {
    accessorKey: 'conversionFactor',
    header: 'Conversion Factor',
    cell: ({ row }) => <span className="font-mono">{row.getValue('conversionFactor')}</span>,
  },
]
