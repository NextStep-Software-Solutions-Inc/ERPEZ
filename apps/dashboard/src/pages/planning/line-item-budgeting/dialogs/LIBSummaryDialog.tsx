import { Button } from '@/components/ui/button'
import { useLIBSummary } from '@/features/planning/line-item-budgeting/line-item-budget/hooks/useLIBActions'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import {
  Loader2,
  LayoutDashboard,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react'

interface LIBSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  libId: string | null
}

export function LIBSummaryDialog({
  open,
  onOpenChange,
  libId,
}: LIBSummaryDialogProps) {
  const {
    data: summaryResponse,
    isLoading,
    error,
  } = useLIBSummary({
    pathParams: { id: libId || '' },
    queryParams: {},
    enabled: !!libId && open,
  })

  const summary = summaryResponse?.data

  const getPercent = (consumed: number, ceiling: number) => {
    if (!ceiling) return 0
    return Math.min((consumed / ceiling) * 100, 100)
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Budget Summary & Ceiling Dashboard"
      description="Consolidated totals and account classifications compared with target DBM ceilings."
      size="3xl"
      footer={
        <Button
          onClick={() => onOpenChange(false)}
          className="text-xs h-9 bg-slate-800 hover:bg-slate-900 text-white font-semibold"
        >
          Close Dashboard
        </Button>
      }
    >

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-500 font-semibold">
              Generating dashboard summary...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-red-650 p-6 bg-red-50 rounded-xl border border-red-200">
            <AlertCircle className="h-10 w-10 mb-3" />
            <h4 className="font-bold text-sm">Failed to load summary</h4>
            <p className="text-xs text-slate-500 mt-1">
              Please try again later.
            </p>
          </div>
        ) : summary ? (
          <div className="space-y-6 py-4">
            {/* Header info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-3 gap-4 text-xs font-semibold">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">
                  BUDGET TITLE
                </span>
                <span className="text-slate-700">{summary.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">
                  LIB NUMBER
                </span>
                <span className="text-slate-700">{summary.libNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">
                  VERSION
                </span>
                <span className="text-slate-700">v{summary.version}</span>
              </div>
            </div>

            {/* Ceiling Info Comparison */}
            {summary.ceilingInfo ? (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Office Ceiling Consumption
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Personnel Services (PS)',
                      consumed: summary.ceilingInfo.psConsumed,
                      ceiling: summary.ceilingInfo.psCeiling,
                    },
                    {
                      label: 'MOOE',
                      consumed: summary.ceilingInfo.mooeConsumed,
                      ceiling: summary.ceilingInfo.mooeCeiling,
                    },
                    {
                      label: 'Capital Outlay (CO)',
                      consumed: summary.ceilingInfo.coConsumed,
                      ceiling: summary.ceilingInfo.coCeiling,
                    },
                  ].map((c) => {
                    const percent = getPercent(c.consumed, c.ceiling)
                    const isOver = c.consumed > c.ceiling
                    const color = isOver
                      ? 'bg-red-650'
                      : percent >= 90
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'

                    return (
                      <div
                        key={c.label}
                        className={`p-3.5 rounded-xl border shadow-sm ${
                          isOver
                            ? 'border-red-200 bg-red-50/10'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1 mb-2">
                          <span className="text-[11px] font-bold text-slate-600 leading-tight">
                            {c.label}
                          </span>
                          {isOver && (
                            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 animate-bounce" />
                          )}
                        </div>
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span
                            className={`text-base font-bold ${isOver ? 'text-red-700' : 'text-slate-900'}`}
                          >
                            ₱{c.consumed.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            / ₱{c.ceiling.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${color}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                          <span>{percent.toFixed(1)}% used</span>
                          {isOver ? (
                            <span className="text-red-600">
                              ₱{(c.consumed - c.ceiling).toLocaleString()} Over
                            </span>
                          ) : (
                            <span>
                              ₱{(c.ceiling - c.consumed).toLocaleString()} Left
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed">
                Ceiling limits are not configured or this budget has not been
                linked to a ceiling.
              </div>
            )}

            {/* Activities summary table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Activities Roll-up
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-2.5 pl-4">Activity</th>
                      <th className="p-2.5 text-right">PS</th>
                      <th className="p-2.5 text-right">MOOE</th>
                      <th className="p-2.5 text-right">CO</th>
                      <th className="p-2.5 text-right pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                    {(summary.activities || []).map((a) => (
                      <tr key={a.activityId} className="hover:bg-slate-50/50">
                        <td className="p-2.5 pl-4 font-bold text-slate-900">
                          {a.activityName}
                        </td>
                        <td className="p-2.5 text-right">
                          ₱{a.personnelServices.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right">
                          ₱{a.mooe.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right">
                          ₱{a.capitalOutlay.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right pr-4 font-bold text-slate-900">
                          ₱{a.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {/* Grand Totals row */}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
                      <td className="p-3 pl-4 uppercase tracking-wide text-xs">
                        Grand Totals
                      </td>
                      <td className="p-3 text-right">
                        ₱
                        {summary.grandTotals.personnelServices.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        ₱{summary.grandTotals.mooe.toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        ₱{summary.grandTotals.capitalOutlay.toLocaleString()}
                      </td>
                      <td className="p-3 text-right pr-4 text-xs font-black text-indigo-700">
                        ₱{summary.grandTotals.grand.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* UACS Object breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                UACS Object Breakdown
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-[220px] overflow-y-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider sticky top-0">
                      <th className="p-2.5 pl-4 w-28">Object Code</th>
                      <th className="p-2.5">Object Name</th>
                      <th className="p-2.5 text-right pr-4 w-36">
                        Total Budget
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                    {(summary.uacsBreakdown || []).map((u) => (
                      <tr key={u.objectId} className="hover:bg-slate-50/50">
                        <td className="p-2.5 pl-4 font-mono font-bold text-slate-950">
                          {u.objectName}
                        </td>
                        <td className="p-2.5">{u.objectCode}</td>
                        <td className="p-2.5 text-right pr-4 font-bold text-slate-900">
                          ₱{u.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

    </ResponsiveDialogDashtail>
  )
}
