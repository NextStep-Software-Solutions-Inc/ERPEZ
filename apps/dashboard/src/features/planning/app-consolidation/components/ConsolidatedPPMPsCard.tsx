import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import { TemplateTable } from '@/components/TemplateTable'
import type { APPPPMPRelationFromAPI } from '../handlers/getAPPDetailRequest'
import type { MetaActions } from '@/types/global'
import { createColumnHelper } from '@tanstack/react-table'

interface ConsolidatedPPMPsCardProps {
  appPpmps: APPPPMPRelationFromAPI[]
  isCurrentlyDraft: boolean
  canDelete: boolean
  ppmpSearchTerm: string
  setPpmpSearchTerm: (term: string) => void
  onAddPPMP: () => void
  onRemovePPMP: (itemId: string) => void
}

export function ConsolidatedPPMPsCard({
  appPpmps,
  isCurrentlyDraft,
  canDelete,
  ppmpSearchTerm,
  setPpmpSearchTerm,
  onAddPPMP,
  onRemovePPMP,
}: ConsolidatedPPMPsCardProps) {
  // Filter PPMPs locally
  const filteredPPMPs = useMemo(() => {
    return appPpmps.filter((relation) => {
      const ppmp = relation.PPMP || relation
      const num = (ppmp.ppmpNumber || relation.ppmpNumber || '').toLowerCase()
      const office = (ppmp.officeName || relation.officeName || '').toLowerCase()
      const fund = (ppmp.fundSourceName || relation.fundSourceName || '').toLowerCase()
      const statusVal = (ppmp.status || relation.status || '').toLowerCase()

      return num.includes(ppmpSearchTerm.toLowerCase()) ||
             office.includes(ppmpSearchTerm.toLowerCase()) ||
             fund.includes(ppmpSearchTerm.toLowerCase()) ||
             statusVal.includes(ppmpSearchTerm.toLowerCase())
    })
  }, [appPpmps, ppmpSearchTerm])

  // Column helpers for TanStack Table
  const ppmpColumnHelper = createColumnHelper<APPPPMPRelationFromAPI>()
  const ppmpColumns = useMemo(() => [
    ppmpColumnHelper.accessor((row) => row.PPMP?.ppmpNumber || row.ppmpNumber || '', {
      id: 'ppmpNumber',
      header: 'PPMP Number',
      cell: ({ getValue }) => <span className="font-mono text-sm font-bold text-gray-900">{getValue() || '—'}</span>,
      size: 180,
    }),
    ppmpColumnHelper.accessor((row) => row.PPMP?.officeName || row.officeName || '', {
      id: 'officeName',
      header: 'Office / Implementing Unit',
      cell: ({ getValue }) => <span className="text-sm font-medium text-gray-700">{getValue() || '—'}</span>,
    }),
    ppmpColumnHelper.accessor((row) => row.PPMP?.fundSourceName || row.fundSourceName || '', {
      id: 'fundSourceName',
      header: 'Fund Source',
      cell: ({ getValue }) => <span className="text-sm text-gray-600">{getValue() || '—'}</span>,
    }),
    ppmpColumnHelper.accessor((row) => row.PPMP?.totalEstimatedBudget ?? 0, {
      id: 'totalEstimatedBudget',
      header: () => <div className="text-right w-full">Estimated Budget</div>,
      cell: ({ getValue }) => (
        <div className="text-right text-sm font-semibold text-emerald-600 w-full">
          ₱{(getValue() ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ),
      size: 150,
    }),
    ppmpColumnHelper.accessor((row) => row.PPMP?.status || row.status || 'Consolidated', {
      id: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const val = getValue()
        const statusMap: Record<string, string> = {
          Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          Draft: 'bg-gray-50 text-gray-700 border-gray-200',
          Consolidated: 'bg-blue-50 text-blue-700 border-blue-200',
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusMap[val] || 'bg-blue-50 text-blue-700 border-blue-200'}`}>
            {val}
          </span>
        )
      },
      size: 120,
    }),
    ppmpColumnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const ppmpId = row.original.ppmpId || row.original.id
        return (
          <div className="flex items-center gap-1">
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemovePPMP(ppmpId)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 cursor-pointer"
                title="Remove PPMP"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      },
      size: 80,
    })
  ], [canDelete, onRemovePPMP])

  const metaActions: MetaActions = canDelete ? ['write', 'delete', 'read'] : ['read']

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden transition-all hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900">Consolidated PPMP Sources</CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">List of project plans consolidated into this annual program</p>
        </div>
        {isCurrentlyDraft && (
          <Button
            type="button"
            onClick={onAddPPMP}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Manage PPMPs
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <TemplateTable
          columns={ppmpColumns}
          data={filteredPPMPs}
          actions={metaActions}
          readonly={!canDelete}
          fixedPageSize={5}
          toolbar={() => (
            <div className="flex items-center gap-2 w-full max-w-sm pointer-events-auto">
              <Input
                placeholder="Search PPMPs by number, office..."
                value={ppmpSearchTerm}
                onChange={(e) => setPpmpSearchTerm(e.target.value)}
                className="h-9"
              />
              {ppmpSearchTerm && (
                <Button variant="ghost" size="sm" onClick={() => setPpmpSearchTerm('')} className="h-9 px-2">
                  Clear
                  </Button>
              )}
            </div>
          )}
        />
      </CardContent>
    </Card>
  )
}
