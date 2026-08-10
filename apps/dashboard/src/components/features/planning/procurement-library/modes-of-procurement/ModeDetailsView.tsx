import {
  ArrowLeft,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Archive,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PermissionCheck from '@/components/PermissionCheck'
import type { ModeAuditLog, ModeOfProcurement } from '../types'
import { hasThresholdConfiguration as checkHasThresholdConfiguration } from '../utils'
import type { MetaActions } from '@/types/global'

interface ModeDetailsViewProps {
  mode: ModeOfProcurement
  auditLogs?: ModeAuditLog[]
  onBack: () => void
  onEdit?: () => void
  onViewAuditLog?: () => void
  actions: MetaActions
}

export function ModeDetailsView({
  mode,
  auditLogs,
  onBack,
  onEdit,
  onViewAuditLog,
  actions,
}: ModeDetailsViewProps) {
  const hasThresholdConfiguration = checkHasThresholdConfiguration(mode)

  const formatThreshold = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return 'Unlimited'
    }

    return `₱${value.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {mode.modeName || 'Unnamed Mode'}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Mode ID: {mode.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {mode.isActive ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mode.isArchived && (
                <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                  <Archive className="w-3 h-3 mr-1" />
                  Archived
                </Badge>
              )}
              <PermissionCheck action="write" actions={actions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Edit Details
                </Button>
              </PermissionCheck>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Mode Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mode Name */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Mode Name
                  </label>
                  <p className="text-base font-semibold text-slate-900 mt-2">
                    {mode.modeName || 'Unnamed Mode'}
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Category
                  </label>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-sm">
                      {mode.categoryName || 'No Category'}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">
                    Description
                  </label>
                  <div className="bg-slate-50 rounded border border-slate-200 p-3 mt-2 text-sm text-slate-700">
                    {mode.description || 'No description provided'}
                  </div>
                </div>
              </div>
            </div>

            {/* Threshold Information Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Threshold Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">
                    Configuration
                  </label>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={
                        hasThresholdConfiguration
                          ? 'text-green-700 border-green-200 bg-green-50'
                          : 'text-slate-600 border-slate-200 bg-slate-50'
                      }
                    >
                      {hasThresholdConfiguration
                        ? 'Configured'
                        : 'Not configured'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Minimum Threshold
                  </label>
                  <p className="text-lg font-semibold text-slate-900 mt-2">
                    {formatThreshold(mode.minThreshold)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Maximum Threshold
                  </label>
                  <p className="text-lg font-semibold text-slate-900 mt-2">
                    {formatThreshold(mode.maxThreshold)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Audit Logs & Metadata */}
          <div className="space-y-6">
            {/* Audit Logs */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Recent Activity
              </h2>

              <div className="space-y-3">
                {auditLogs?.slice(0, 2).map((log) => (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-sm font-medium text-slate-900 capitalize">
                        {log.action}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap"
                      >
                        {log.user}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
                {(!auditLogs || auditLogs.length === 0) && (
                  <p className="text-sm text-slate-500">
                    No audit logs available
                  </p>
                )}
              </div>

              {onViewAuditLog && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewAuditLog}
                  className="w-full mt-4 gap-2"
                >
                  <Settings className="w-4 h-4" />
                  View Full Audit Log
                </Button>
              )}
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Metadata
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="font-medium text-slate-600">
                    Created At
                  </label>
                  <p className="text-slate-700 mt-1">
                    {new Date(mode.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <label className="font-medium text-slate-600">
                    Last Updated
                  </label>
                  <p className="text-slate-700 mt-1">
                    {mode.updatedAt
                      ? new Date(mode.updatedAt).toLocaleString()
                      : 'Not updated yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
