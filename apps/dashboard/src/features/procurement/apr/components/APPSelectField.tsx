/**
 * APP Selection Field Component
 * 
 * Encapsulates the multi-APP selection UI with scrollable list and checkbox handling
 */

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

interface APPSelectFieldProps {
  apps: any[]
  selectedAppIds: string[]
  onToggleApp: (appId: string) => void
  onSelectAllApps?: () => void
  fiscalYear: number
}

export function APPSelectField({
  apps,
  selectedAppIds,
  onToggleApp,
  onSelectAllApps,
  fiscalYear: _fiscalYear,
}: APPSelectFieldProps) {
  const allAppsSelected = apps.length > 0 && selectedAppIds.length === apps.length

  return (
    <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="text-sm font-semibold text-purple-900">
          📋 Step 1: Select Approved APPs ({selectedAppIds.length} of {apps.length} selected)
        </label>
        {onSelectAllApps && apps.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all-apps"
              checked={allAppsSelected}
              onCheckedChange={onSelectAllApps}
            />
            <label
              htmlFor="select-all-apps"
              className="text-xs font-medium text-purple-900 cursor-pointer"
            >
              Select All APPs
            </label>
          </div>
        )}
      </div>

      <ScrollArea className="h-52 rounded-md border bg-white">
        <div className="space-y-2 p-3">
          {apps.map((app) => {
            const appCode = app.appNumber || app.appCode || `APP-${app.id.substring(0, 8)}`
            const appName = app.name || app.appName || 'Annual Procurement Plan'
            const fy = app.FiscalYear?.year || app.fiscalYear?.year || app.fiscalYear || app.fiscalYearName || '2026'
            const isSelected = selectedAppIds.includes(app.id)
            const appType = app.appType || (app.isFinal === 'true' || app.isFinal === true ? 'Final' : null)
            const itemCount = (app.APPItems || app.appItems || app.items || []).length

            return (
              <div
                key={app.id}
                className={`rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-purple-500 bg-purple-100/70 shadow-sm'
                    : 'border-purple-200 hover:bg-purple-50/60'
                }`}
                onClick={() => onToggleApp(app.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`app-check-${app.id}`}
                    checked={isSelected}
                    onCheckedChange={() => onToggleApp(app.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate text-gray-900">{appCode}</p>
                      <div className="flex gap-1.5 flex-shrink-0 items-center">
                        {appType && (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 bg-purple-50 text-purple-700 border-purple-300">
                            {appType}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] py-0 h-5 bg-green-50 text-green-700 border-green-300">
                          {app.status}
                        </Badge>
                        <Badge className="text-[10px] py-0 h-5 bg-purple-600 text-white">
                          FY {fy}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{appName}</p>
                    <p className="text-[11px] text-purple-700 mt-1 font-medium">
                      {itemCount} line item{itemCount !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
