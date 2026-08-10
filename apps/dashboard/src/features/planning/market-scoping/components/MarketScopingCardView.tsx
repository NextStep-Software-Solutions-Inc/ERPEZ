/**
 * Market Scoping Card View Grid
 * Location: src/features/planning/market-scoping/components/
 *
 * Premium dashboard grid presentation matching shadcn/ui and Tailwind CSS design system.
 * Features top status badges, visual budget highlights, human-readable date formatting,
 * compact metadata chips, and zero hook calls inside array mappings.
 */

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  Paperclip,
  Activity,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'
import { getStatusByValue } from '../utils/constants'
import { formatCurrency } from '../utils/transformers'
import type { MarketScopingForm } from '../types/marketScopingTypes'

interface MarketScopingCardViewProps {
  data: MarketScopingForm[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

/**
 * Pure helper function to get refined status styling and badge colors
 */
function getStatusTheme(status: string) {
  switch (status) {
    case 'Approved':
      return {
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
        dotClass: 'bg-emerald-500',
      }
    case 'PendingApproval':
      return {
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
        dotClass: 'bg-amber-500 animate-pulse',
      }
    case 'Rejected':
      return {
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
        dotClass: 'bg-rose-500',
      }
    case 'Draft':
    default:
      return {
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
        dotClass: 'bg-slate-400',
      }
  }
}

/**
 * Format raw date strings into clean, human-readable date ranges (e.g., "Sep 1, 2024 – Oct 1, 2024")
 */
function formatPeriodRange(from?: string, to?: string): string {
  if (!from && !to) return 'N/A'

  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr === 'N/A') return null

    // MM/YYYY format (e.g. 08/2024 or 8/2024)
    if (/^\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, year] = dateStr.split('/')
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1)
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }

    // ISO date format (e.g. 2024-09-01T00:00:00Z or 2024-09-01)
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return dateStr
  }

  const formattedFrom = formatDate(from)
  const formattedTo = formatDate(to)

  if (formattedFrom && formattedTo) {
    if (formattedFrom === formattedTo) return formattedFrom
    return `${formattedFrom} – ${formattedTo}`
  }

  return formattedFrom || formattedTo || 'N/A'
}

/**
 * Pure helper function to compute attachment and evidence metadata counts
 */
function getFormMetadata(form: MarketScopingForm) {
  const activitiesCount = (form.activities || []).filter(
    (a) => a.checked || (a.attachments && a.attachments.length > 0)
  ).length

  const parametersCount = (form.parameters || []).filter(
    (p) => Boolean(p.considered) || Boolean(p.recommendations) || (p.attachments && p.attachments.length > 0)
  ).length

  const totalAttachments =
    (form.activities || []).reduce((sum, a) => sum + (a.attachments?.length || 0), 0) +
    (form.parameters || []).reduce((sum, p) => sum + (p.attachments?.length || 0), 0)

  return { activitiesCount, parametersCount, totalAttachments }
}

export function MarketScopingCardView({
  data,
  onViewDetails,
  onEdit,
  onDelete,
}: MarketScopingCardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.map((form) => {
        const statusObj = getStatusByValue(form.status)
        const theme = getStatusTheme(form.status)
        const periodDisplay = formatPeriodRange(form.periodFrom, form.periodTo)
        const { activitiesCount, parametersCount, totalAttachments } = getFormMetadata(form)

        return (
          <Card
            key={form.id}
            className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => onViewDetails(form.id)}
          >
            <div className="space-y-4">
              {/* Header Row: Status Badge at the Top Left & Action Menu at the Top Right */}
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${theme.badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${theme.dotClass}`} />
                  {statusObj?.label || form.status}
                </Badge>

                {/* Dropdown Menu */}
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
                      <DropdownMenuItem onClick={() => onViewDetails(form.id)} className="text-xs font-semibold py-2">
                        <Eye className="h-3.5 w-3.5 mr-2 text-slate-450" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(form.id)} className="text-xs font-semibold py-2">
                        <Edit className="h-3.5 w-3.5 mr-2 text-slate-450" /> Edit Form
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(form.id)}
                        className="text-xs font-semibold text-rose-600 focus:text-rose-700 py-2"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2 text-rose-500" /> Delete Form
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Primary Focal Point: Project Title & Department */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-650 transition-colors">
                  {form.projectName}
                </h3>
                {form.departmentUnit && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{form.departmentUnit}</span>
                  </div>
                )}
              </div>

              {/* Primary Focal Point: Budget Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                  Estimated Budget
                </div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(form.estimatedBudget)}
                </div>
              </div>
            </div>

            {/* Footer Metadata Chips Section */}
            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Period Chip */}
              <div className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{periodDisplay}</span>
              </div>

              {/* Metadata Badges Group */}
              <div className="flex items-center gap-1.5 shrink-0">
                {activitiesCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    title={`${activitiesCount} activities conducted`}
                  >
                    <Activity className="h-3 w-3 text-slate-500" />
                    {activitiesCount}
                  </span>
                )}

                {parametersCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    title={`${parametersCount} parameters evaluated`}
                  >
                    <SlidersHorizontal className="h-3 w-3 text-slate-500" />
                    {parametersCount}
                  </span>
                )}

                {totalAttachments > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50"
                    title={`${totalAttachments} attachments`}
                  >
                    <Paperclip className="h-3 w-3 text-indigo-500" />
                    {totalAttachments}
                  </span>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
