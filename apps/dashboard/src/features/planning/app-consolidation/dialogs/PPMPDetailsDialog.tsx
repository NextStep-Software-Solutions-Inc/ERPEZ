import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PPMPItem, APPItemDetail } from '../types'
import api from '@/services/api'
import { Loader2 } from 'lucide-react'

interface PPMPDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: PPMPItem | null
  appItemId?: string | null
}

export function PPMPDetailsDialog({ open, onOpenChange, selectedItem, appItemId }: PPMPDetailsDialogProps) {
  const [details, setDetails] = useState<APPItemDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && appItemId) {
      setLoading(true)
      api.get(`/app-items/${appItemId}`)
        .then((res) => {
          if (res.data?.succeeded) {
            setDetails(res.data.data)
          }
        })
        .catch((err) => {
          console.error('Error fetching APP Item details:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setDetails(null)
    }
  }, [open, appItemId])

  // Get active item to display (details if available, else selectedItem)
  const itemToDisplay = details || selectedItem

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[999] pointer-events-auto max-h-[85vh] overflow-y-auto bg-white rounded-lg shadow-xl" size='lg'>
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900">APP Item Detailed View</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Complete schedule, metadata, and procurement strategies for this item.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 font-medium">Fetching detailed item metrics...</p>
          </div>
        ) : itemToDisplay ? (
          <div className="space-y-6 pt-4">
            {/* Item Name and Code Header */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Code / PAP Code</p>
                <p className="text-sm font-bold text-slate-800 font-mono bg-white px-2.5 py-1.5 rounded border border-slate-200 inline-block">
                  {details?.papCode || selectedItem?.code || '—'}
                </p>
              </div>
              {details && (
                <div className="flex items-center gap-2">
                  {details.isNew && (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      NEW ITEM
                    </span>
                  )}
                  {details.isRevised && (
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      REVISED ITEM
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Item Name & Description</p>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {details?.ppmpItemName || selectedItem?.description}
                </p>
                {details?.PPMPItem?.description && (
                  <p className="text-xs text-slate-500 mt-2 border-t border-slate-200/60 pt-2 italic">
                    {details.PPMPItem.description}
                  </p>
                )}
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-gray-100 p-4 rounded-lg shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Implementing Office</p>
                <p className="text-sm font-semibold text-slate-700">
                  {details?.officeName || details?.Office?.name || selectedItem?.office || '—'}
                </p>
                {details?.Office?.code && (
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Code: {details.Office.code}</span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fund Source</p>
                <p className="text-sm font-semibold text-slate-700">
                  {details?.fundSourceName || details?.FundSource?.name || selectedItem?.fundSource || '—'}
                </p>
                {details?.FundSource?.code && (
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Code: {details.FundSource.code}</span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Procurement Method</p>
                <p className="text-sm font-semibold text-slate-700">
                  {details?.procurementModeName || details?.ProcurementMode?.name || selectedItem?.modeOfProcurement || '—'}
                </p>
                {details?.ProcurementMode?.description && (
                  <p className="text-[10px] text-slate-400 mt-0.5 max-w-[280px]">
                    {details.ProcurementMode.description}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Allotment Class & Category</p>
                <p className="text-sm font-semibold text-slate-700">
                  {selectedItem?.allotmentClass || '—'}
                </p>
                {selectedItem?.itemCategory && (
                  <span className="text-[10px] text-slate-400 uppercase">{selectedItem.itemCategory}</span>
                )}
              </div>
            </div>

            {/* APP Procurement Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-lg">
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Start of Procurement</p>
                <p className="text-sm font-bold text-emerald-950">
                  {details?.effectiveStartOfProcurement ? new Date(details.effectiveStartOfProcurement).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (details?.startOfProcurementOverride || 'Not set')}
                </p>
                {details?.isStartProcurementOverridden && (
                  <span className="text-[10px] text-amber-700 font-medium block">APP Override</span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">End of Procurement</p>
                <p className="text-sm font-bold text-emerald-950">
                  {details?.effectiveEndOfProcurement ? new Date(details.effectiveEndOfProcurement).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : (details?.endOfProcurementOverride || 'Not set')}
                </p>
                {details?.isEndProcurementOverridden && (
                  <span className="text-[10px] text-amber-700 font-medium block">APP Override</span>
                )}
              </div>
            </div>

            {/* EPA and Outsourced badges */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">EPA Eligible</span>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    details?.isEarlyProcurementActivity 
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {details?.isEarlyProcurementActivity ? 'Yes (Early Procurement)' : 'No'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Outsourced</span>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    details?.isOutsourced 
                      ? 'bg-orange-50 text-orange-700 border-orange-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {details?.isOutsourced ? 'Yes (Outsourced Services)' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bid Evaluation & Strategies */}
            {details && (
              <div className="space-y-4 border border-gray-100 p-4 rounded-lg bg-white shadow-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bid Evaluation Criteria</p>
                  <p className="text-sm font-bold text-gray-800">
                    {details.bidEvaluationCriteria === 'LCRB' && 'LCRB - Lowest Calculated Responsive Bid'}
                    {details.bidEvaluationCriteria === 'MEARB' && 'MEARB - Most Advantageous Economic and Responsive Bid'}
                    {details.bidEvaluationCriteria === 'MARB_HRRB_SRRB' && 'MARB/HRRB/SRRB - Highest Rated Responsive Bid'}
                    {details.bidEvaluationCriteria === 'LCCRB' && 'LCCRB - Lowest Calculated and Complying Responsive Bid'}
                    {!['LCRB', 'MEARB', 'MARB_HRRB_SRRB', 'LCCRB'].includes(details.bidEvaluationCriteria || '') && (details.bidEvaluationCriteria || '—')}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Procurement Strategies</p>
                  {details.procurementStrategies && details.procurementStrategies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {details.procurementStrategies.map((strat) => {
                        const stratLabels: Record<string, string> = {
                          LCA: 'Least Cost Analysis (LCA)',
                          Subcontracting: 'Subcontracting',
                          MultiYearContracting: 'Multi-Year Contracting',
                          DesignAndBuild: 'Design and Build',
                          ProcurementAgent: 'Procurement Agent',
                          FrameworkAgreement: 'Framework Agreement',
                          PooledProcurement: 'Pooled Procurement',
                          RenewalOfServices: 'Renewal of Services',
                          WarehousingInventory: 'Warehousing & Inventory',
                        }
                        return (
                          <span 
                            key={strat} 
                            className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200"
                          >
                            {stratLabels[strat] || strat}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No specific strategy selected.</p>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-5">
              <div className="grid grid-cols-3 gap-4 mb-4 border-b border-slate-200/60 pb-4">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Quantity</p>
                  <p className="text-base font-bold text-slate-800">
                    {(() => {
                      const q = details?.quantity || details?.PPMPItem?.quantity || selectedItem?.quantity
                      if (q && q > 0) return q.toLocaleString('en-PH')
                      const cost = details?.PPMPItem?.unitPrice ?? details?.unitCost ?? selectedItem?.unitCost ?? 0
                      const total = details?.effectiveABC ?? details?.totalAmount ?? details?.PPMPItem?.totalAmount ?? selectedItem?.totalAmount ?? 0
                      if (cost > 0 && total > 0) return Math.round(total / cost).toLocaleString('en-PH')
                      return '1'
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit of Measure</p>
                  <p className="text-base font-semibold text-slate-600">
                    {details?.PPMPItem?.unit || details?.unit || selectedItem?.unit || 'unit'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit Cost</p>
                  <p className="text-base font-bold text-slate-800">
                    ₱{(details?.PPMPItem?.unitPrice ?? details?.unitCost ?? selectedItem?.unitCost ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Estimated Budget</p>
                <p className="text-2xl font-black text-emerald-600">
                  ₱{(
                    (details?.effectiveABC && details.effectiveABC > 0)
                      ? details.effectiveABC
                      : (details?.PPMPItem?.totalAmount && details.PPMPItem.totalAmount > 0)
                      ? details.PPMPItem.totalAmount
                      : (selectedItem?.totalAmount && selectedItem.totalAmount > 0)
                      ? selectedItem.totalAmount
                      : (((details?.quantity || details?.PPMPItem?.quantity || selectedItem?.quantity || 1)) * (details?.PPMPItem?.unitPrice || details?.unitCost || selectedItem?.unitCost || 0))
                  ).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Remarks */}
            {details?.remarks && (
              <div className="border border-slate-100 p-4 rounded-lg bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Remarks / Procurement Notes</p>
                <p className="text-xs text-slate-600 whitespace-pre-line italic">
                  {details.remarks}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm italic">
            No item data could be loaded.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
