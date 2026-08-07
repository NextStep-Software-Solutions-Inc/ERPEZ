/**
 * APP Selection Field Component
 * 
 * Encapsulates the APP selection UI with scrollable list and checkbox handling
 * Extracted from SelectAPPForm to keep form <200 lines
 */

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AppMaster } from '../types'

interface APPSelectFieldProps {
  apps: AppMaster[]
  selectedAppId: string
  onAppSelect: (appId: string) => void
  fiscalYear: number
}

export function APPSelectField({
  apps,
  selectedAppId,
  onAppSelect,
  fiscalYear,
}: APPSelectFieldProps) {
  return (
    <div className="space-y-2 rounded-lg border border-purple-200 bg-purple-50 p-4">
      <label className="text-sm font-semibold text-purple-900">📋 Step 1: Select Approved APP</label>
      <ScrollArea className="h-48 rounded-md border bg-white">
        <div className="space-y-1 p-4">
          {apps.map((app) => (
            <div
              key={app.id}
              className={`rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                selectedAppId === app.id
                  ? 'border-purple-500 bg-purple-100'
                  : 'border-purple-200 hover:bg-purple-50'
              }`}
              onClick={() => onAppSelect(app.id)}
            >
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selectedAppId === app.id}
                  onCheckedChange={() => onAppSelect(app.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{app.appCode}</p>
                  <p className="text-xs text-muted-foreground">{app.appName}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Badge variant="outline">{app.status}</Badge>
                  <Badge>FY {app.fiscalYear}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
