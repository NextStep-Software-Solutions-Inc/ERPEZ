import { useAtom } from 'jotai'
import {
  editEconomicIndicatorDialogOpenAtom,
  deleteEconomicIndicatorDialogOpenAtom,
  selectedEconomicIndicatorForEditAtom,
  selectedEconomicIndicatorForDeleteAtom,
} from '../atoms'
import { EconomicIndicator } from './table/data/economicIndicatorTypes'
import { Edit2, Trash2, TrendingUp } from 'lucide-react'
import { TemplateCardDashtail } from '@/components/TemplateCardDashtail'

interface EconomicIndicatorCardProps {
  indicator: EconomicIndicator
  index?: number
}

export function EconomicIndicatorCard({
  indicator,
  index = 0,
}: EconomicIndicatorCardProps) {
  const [, setEditDialogOpen] = useAtom(editEconomicIndicatorDialogOpenAtom)
  const [, setDeleteDialogOpen] = useAtom(deleteEconomicIndicatorDialogOpenAtom)
  const [, setSelectedForEdit] = useAtom(selectedEconomicIndicatorForEditAtom)
  const [, setSelectedForDelete] = useAtom(
    selectedEconomicIndicatorForDeleteAtom,
  )

  const handleEdit = () => {
    setSelectedForEdit(indicator)
    setEditDialogOpen(true)
  }

  const handleDelete = () => {
    setSelectedForDelete(indicator)
    setDeleteDialogOpen(true)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const actions = [
    {
      label: `Edit Economic Indicator for FY ${indicator.fiscalYearYear}`,
      icon: <Edit2 className="h-4 w-4" />,
      onClick: handleEdit,
      variant: 'outline' as const,
      className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50/50',
    },
    {
      label: `Delete Economic Indicator for FY ${indicator.fiscalYearYear}`,
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: 'outline' as const,
      className:
        'text-destructive hover:text-destructive hover:bg-destructive/5',
    },
  ]

  return (
    <TemplateCardDashtail
      title={`FY ${indicator.fiscalYearYear}`}
      subtitle="Economic Indicators"
      icon={<TrendingUp className="h-5 w-5" />}
      colorScheme="emerald"
      actions={actions}
      index={index}
      className="h-full flex flex-col"
    >
      {/* Indicators Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg gap-4 justify-between flex flex-col bg-emerald-50 border border-emerald-200">
          <p className="text-xs text-emerald-700 font-semibold uppercase">
            VAT Rate
          </p>
          <p className="text-lg font-bold text-emerald-600 ">
            {indicator.vatRate.toFixed(2)}%
          </p>
        </div>
        <div className="p-3 rounded-lg gap-4 justify-between flex flex-col bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold uppercase">
            Inflation
          </p>
          <p className="text-lg font-bold text-blue-600 ">
            {indicator.inflationRate.toFixed(2)}%
          </p>
        </div>
        <div className="p-3 rounded-lg gap-4 justify-between flex flex-col bg-purple-50 border border-purple-200">
          <p className="text-xs text-purple-700 font-semibold uppercase">
            Income Tax
          </p>
          <p className="text-lg font-bold text-purple-600 ">
            {indicator.incomeTaxRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Audit Information */}
      <div className="pt-2 border-t border-slate-200 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">Created By:</span>
          <span className="text-slate-900 font-medium">
            {indicator.createdBy || 'System'}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-600">Created:</span>
          <span className="text-slate-900 font-medium">
            {formatDate(indicator.createdAt)}
          </span>
        </div>
        {indicator.updatedBy && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Updated By:</span>
              <span className="text-slate-900 font-medium">
                {indicator.updatedBy}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Updated:</span>
              <span className="text-slate-900 font-medium">
                {formatDate(indicator.updatedAt)}
              </span>
            </div>
          </>
        )}
      </div>
    </TemplateCardDashtail>
  )
}
