import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import type { PPMPItem } from '../types'
import { PPMPActionCell } from '../components/PPMPActionCell'
import { PPMPFieldMetadata } from './PPMPFieldMetadata'

const columnHelper = createColumnHelper<PPMPItem>()

interface PPMPColumnsProps {
  canDelete: boolean
  onViewDetails: (item: PPMPItem) => void
  onDelete: (itemId: string) => void
}

export const createPPMPColumns = ({
  canDelete,
  onViewDetails,
  onDelete,
}: PPMPColumnsProps): ColumnDef<PPMPItem>[] => [
  columnHelper.accessor('code', {
    header: PPMPFieldMetadata.code.header,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">{row.getValue('code')}</span>
    ),
    size: 120,
  }),
  columnHelper.accessor('description', {
    header: PPMPFieldMetadata.description.header,
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.getValue('description')}</span>
    ),
  }),
  columnHelper.accessor('office', {
    header: PPMPFieldMetadata.office.header,
    cell: ({ row }) => <span className="text-sm">{(row.getValue('office') as string) || '—'}</span>,
    size: 120,
  }),
  columnHelper.accessor('fundSource', {
    header: PPMPFieldMetadata.fundSource.header,
    cell: ({ row }) => <span className="text-sm">{(row.getValue('fundSource') as string) || '—'}</span>,
    size: 120,
  }),
  columnHelper.accessor('itemCategory', {
    header: PPMPFieldMetadata.itemCategory.header,
    cell: ({ row }) => <span className="text-sm">{(row.getValue('itemCategory') as string) || '—'}</span>,
    size: 120,
  }),
  columnHelper.accessor('quantity', {
    header: PPMPFieldMetadata.quantity.header,
    cell: ({ row }) => (
      <div className="text-center text-sm font-medium">
        {(row.getValue('quantity') as number).toLocaleString('en-PH')}
      </div>
    ),
    size: 100,
  }),
  columnHelper.accessor('unitCost', {
    header: PPMPFieldMetadata.unitCost.header,
    cell: ({ row }) => (
      <div className="text-right text-sm font-medium">
        ₱{((row.getValue('unitCost') as number) ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}
      </div>
    ),
    size: 130,
  }),
  columnHelper.accessor('totalAmount', {
    header: PPMPFieldMetadata.totalAmount.header,
    cell: ({ row }) => (
      <div className="text-right text-sm font-semibold text-blue-600">
        ₱{((row.getValue('totalAmount') as number) ?? 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}
      </div>
    ),
    size: 150,
  }),
  ...(canDelete
    ? [
        columnHelper.display({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <PPMPActionCell
              item={row.original}
              onViewDetails={onViewDetails}
              onDelete={onDelete}
            />
          ),
          size: 100,
        }),
      ]
    : []),
] as ColumnDef<PPMPItem>[]
