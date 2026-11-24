import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import type { AppMaster } from '../types'

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-yellow-100 text-yellow-800',
  'pending-review': 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  Locked: 'bg-blue-100 text-blue-800',
  published: 'bg-blue-100 text-blue-800',
  Rejected: 'bg-red-100 text-red-800',
}

interface AppInfoSectionProps {
  app: AppMaster
  isDraft?: boolean
  onEdit?: () => void
}

export function AppInfoSection({ app, isDraft: _isDraft, onEdit: _onEdit }: AppInfoSectionProps) {
  const statusLabel = app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('-', ' ')

  return (
    <div className="border-0 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-green-50/80 to-green-100/40 border-t-4 border-t-green-500">
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <CardHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-black text-sm shadow-lg">
              4
            </div>
            <CardTitle className="flex items-center gap-2 text-xl font-black">
              <Info className="w-6 h-6 text-green-600" />
              APP Information
            </CardTitle>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-12 h-12 bg-green-200/30 rounded-lg flex items-center justify-center">ℹ️</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
              <Badge className={statusColors[app.status]}>{statusLabel}</Badge>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Created By</p>
              <p className="text-base font-medium">{app.createdBy}</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Created Date</p>
              <p className="text-base">
                {new Date(app.createdAt).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Updated</p>
              <p className="text-base">
                {new Date(app.updatedAt).toLocaleDateString('en-PH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="md:col-span-2 p-5 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Consolidated PPMPs</p>
              <div className="flex flex-wrap gap-2">
                {app.ppmpIds.map((ppmpId) => (
                  <Badge key={ppmpId} variant="outline">
                    {ppmpId}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
