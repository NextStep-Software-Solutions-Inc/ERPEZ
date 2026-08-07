import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useAtom } from 'jotai'
import {
  editEconomicIndicatorDialogOpenAtom,
  deleteEconomicIndicatorDialogOpenAtom,
  selectedEconomicIndicatorForEditAtom,
  selectedEconomicIndicatorForDeleteAtom,
} from '../atoms'
import { TemplateTable } from '@/components/TemplateTable'
import type { MetaActions } from '@/types/global'
import { EconomicIndicator } from './table/data/economicIndicatorTypes'

interface EconomicIndicatorsTableProps {
  indicators: EconomicIndicator[]
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (dateString: string | null): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EconomicIndicatorsTable({
  indicators,
}: EconomicIndicatorsTableProps) {
  const [, setEditDialogOpen] = useAtom(editEconomicIndicatorDialogOpenAtom)
  const [, setDeleteDialogOpen] = useAtom(deleteEconomicIndicatorDialogOpenAtom)
  const [, setSelectedForEdit] = useAtom(selectedEconomicIndicatorForEditAtom)
  const [, setSelectedForDelete] = useAtom(
    selectedEconomicIndicatorForDeleteAtom,
  )

  const columns = useMemo<ColumnDef<EconomicIndicator>[]>(
    () => [
      {
        accessorKey: 'fiscalYearYear',
        header: 'Fiscal Year',
        cell: (info) => `FY ${info.getValue()}`,
      },
      {
        accessorKey: 'vatRate',
        header: 'VAT Rate (%)',
        cell: (info) => {
          const value = info.getValue() as number
          return (
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="font-semibold">{value.toFixed(2)}</span>
            </span>
          )
        },
      },
      {
        accessorKey: 'inflationRate',
        header: 'Inflation Rate (%)',
        cell: (info) => {
          const value = info.getValue() as number
          return (
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <span className="font-semibold">{value.toFixed(2)}</span>
            </span>
          )
        },
      },
      {
        accessorKey: 'incomeTaxRate',
        header: 'Income Tax Rate (%)',
        cell: (info) => {
          const value = info.getValue() as number
          return (
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <span className="font-semibold">{value.toFixed(2)}</span>
            </span>
          )
        },
      },
      {
        accessorKey: 'createdBy',
        header: 'Created By',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {(info.getValue() as string | null) || 'System'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created Date',
        cell: (info) => {
          const dateStr = info.getValue() as string | null
          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">{formatDate(dateStr)}</span>
              {dateStr && (
                <span className="text-xs text-muted-foreground">
                  {formatTime(dateStr)}
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'updatedBy',
        header: 'Updated By',
        cell: (info) => (
          <span className="text-sm text-muted-foreground">
            {(info.getValue() as string | null) || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated Date',
        cell: (info) => {
          const dateStr = info.getValue() as string | null
          if (!dateStr)
            return <span className="text-sm text-muted-foreground">-</span>
          return (
            <div className="flex flex-col text-sm">
              <span className="font-medium">{formatDate(dateStr)}</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(dateStr)}
              </span>
            </div>
          )
        },
      },
    ],
    [],
  )

  const tableActions: MetaActions = ['read', 'write', 'delete']

  const handleEdit = (indicator: EconomicIndicator) => {
    setSelectedForEdit(indicator)
    setEditDialogOpen(true)
  }

  const handleDelete = (id: string | number) => {
    const indicator = indicators.find((i) => i.id === id)
    if (indicator) {
      setSelectedForDelete(indicator)
      setDeleteDialogOpen(true)
    }
  }

  return (
    <TemplateTable
      columns={columns}
      data={indicators}
      actions={tableActions}
      fixedPageSize={15}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
