/**
 * Market Scoping - Project Overview Section
 * Displays project details in grid layout with pleasing light theme colors
 * Location: src/features/planning/market-scoping/components/
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FolderKanban,
  Calendar,
  Building2,
  User2,
  DollarSign,
  Clock,
} from 'lucide-react'
import { formatCurrency, formatHumanDate } from '../utils/transformers'
import type { MarketScopingForm } from '../types/marketScopingTypes'

interface ProjectOverviewSectionProps {
  form: MarketScopingForm
}

export function ProjectOverviewSection({ form }: ProjectOverviewSectionProps) {
  return (
    <Card className="border-slate-200/80 border-t-4 border-t-indigo-600 shadow-xs rounded-xl">
      <CardHeader className="pb-4 border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-indigo-600" />
          <span>Project Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Project Name */}
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
              <span>Project Name</span>
            </div>
            <p
              className="text-sm font-semibold text-slate-900 truncate"
              title={form.projectName}
            >
              {form.projectName}
            </p>
          </div>

          {/* Estimated Budget */}
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>Estimated Budget</span>
            </div>
            <div className="pt-0.5">
              <span className="inline-block bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2.5 py-0.5 rounded-md text-sm">
                {formatCurrency(form.estimatedBudget)}
              </span>
            </div>
          </div>

          {/* Scoping Period */}
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Scoping Period</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {formatHumanDate(form.periodFrom)} –{' '}
              {formatHumanDate(form.periodTo)}
            </p>
          </div>

          {/* Expected Delivery */}
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Expected Delivery</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {formatHumanDate(form.expectedDeliveryDate)}
            </p>
          </div>

          {/* Agency */}
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Building2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Agency</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {form.agencyName || 'N/A'}
            </p>
          </div>

          {/* Department / Unit */}
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <User2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Department / Unit</span>
            </div>
            <p className="text-sm font-medium text-slate-800">
              {form.departmentUnit || 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
