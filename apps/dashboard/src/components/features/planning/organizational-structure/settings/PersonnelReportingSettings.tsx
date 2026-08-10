import { Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export function PersonnelReportingSettings() {

  return (
    <div className="space-y-6">
      {/* PMT Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Performance Management Team (PMT)</p>
            <p className="mt-1">The PMT is configured with <span className="font-bold">4 authorized seats</span> as per CSC MC No. 6, s. 2012 regulation. This is a fixed requirement and applies organization-wide.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
