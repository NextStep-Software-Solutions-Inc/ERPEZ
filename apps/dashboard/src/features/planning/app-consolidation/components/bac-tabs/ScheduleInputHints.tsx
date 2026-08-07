import { AlertCircle } from 'lucide-react'

/**
 * Reusable Schedule Input Hints Component
 * Displays formatting tips for date/schedule inputs
 * Shows once per tab to avoid repetition
 * Includes guidance for different procurement types
 */
export function ScheduleInputHints() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex gap-3">
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 space-y-3 flex-1">
          <div>
            <p className="font-semibold mb-1">Date Format:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Format: <code className="bg-white px-1 rounded">MM/YYYY</code> (e.g., "01/2024", "07/2024")</li>
              <li>Multiple dates: <code className="bg-white px-1 rounded">01/2024, 07/2024, 10/2024</code></li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold mb-1">By Procurement Type:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong>Competitive Bidding:</strong> Use specific dates</li>
              <li><strong>Recontracting/Maintenance:</strong> Use "As the need arises" or "Various dates"</li>
              <li><strong>Agency-to-Agency:</strong> Use "N/A" or "To be coordinated"</li>
              <li><strong>Direct Contracting:</strong> Use specific dates or "TBD"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
