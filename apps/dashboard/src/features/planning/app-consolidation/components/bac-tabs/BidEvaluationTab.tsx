import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { BACWorkspace, BidEvaluationCriteria } from '../../types'
import { BID_EVALUATION_CRITERIA_LABELS } from '../../types'
import { BACItemHeader } from './BACItemHeader'

interface BidEvaluationTabProps {
  workspace: BACWorkspace
  onUpdate?: (workspace: Partial<BACWorkspace>) => void
  readOnly?: boolean
}

export function BidEvaluationTab({ workspace, onUpdate, readOnly }: BidEvaluationTabProps) {
  const handleCriteriaChange = (lineItemId: string, criteria: BidEvaluationCriteria) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) =>
      item.id === lineItemId
        ? {
            ...item,
            bidEvaluationCriteria: criteria,
            mearbSustainabilityIndicators:
              criteria === 'MEARB' ? item.mearbSustainabilityIndicators : undefined,
          }
        : item,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  const handleSustainabilityChange = (lineItemId: string, indicators: string) => {
    if (readOnly) return

    const updated = workspace.lineItems.map((item) =>
      item.id === lineItemId
        ? { ...item, mearbSustainabilityIndicators: indicators }
        : item,
    )
    onUpdate?.({ ...workspace, lineItems: updated })
  }

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800 ml-2">
          <strong>Bid Evaluation Criteria Guide:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-xs">
            <li><strong>LCRB:</strong> Lowest Calculated Responsive Bid - Selection based solely on lowest bid price</li>
            <li><strong>MEARB:</strong> Most Economically Advantageous Responsive Bid - Selection based on quality-cost combination, including environmental and social factors (requires sustainability specifications)</li>
            <li><strong>MARB/HRRB/SRRB:</strong> Most Advantageous Responsive Bid / Highest Rated / Single Rated - Selection based on comprehensive evaluation criteria beyond price</li>
            <li><strong>LCCRB:</strong> Lowest Comparative or Competitive Responsive Bid - Selection based on competitive comparison of responsive bids</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {workspace.lineItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <BACItemHeader item={item} badgeColor="purple" />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bid Evaluation Criteria Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Criteria for Bid Evaluation:</label>
                <Select
                  value={item.bidEvaluationCriteria || ''}
                  onValueChange={(value) => handleCriteriaChange(item.id, value as BidEvaluationCriteria)}
                  disabled={readOnly}
                >
                  <SelectTrigger className="relative z-40">
                    <SelectValue placeholder="Select bid evaluation criteria..." />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={8} className="z-[9999] w-96">
                    {Object.entries(BID_EVALUATION_CRITERIA_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {item.bidEvaluationCriteria && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Selected:</span> {BID_EVALUATION_CRITERIA_LABELS[item.bidEvaluationCriteria]}
                  </p>
                </div>
              )}

              {/* MEARB Sustainability Indicators */}
              {item.bidEvaluationCriteria === 'MEARB' && (
                <div className="space-y-3 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-green-600" />
                    <label className="text-sm font-semibold text-green-900">
                      MEARB Sustainability Indicators (Required)
                    </label>
                  </div>
                  <p className="text-xs text-green-800">
                    For MEARB evaluation, you must specify sustainability indicators that will be included in the technical specifications.
                  </p>
                  <Textarea
                    value={item.mearbSustainabilityIndicators || ''}
                    onChange={(e) => handleSustainabilityChange(item.id, e.target.value)}
                    placeholder="Specify sustainability and environmental/social factors to be included in technical specifications...

Examples:
- Energy efficiency ratings (e.g., ENERGY STAR certified)
- Environmental impact (reduced carbon footprint, recyclable materials)
- Social responsibility (fair labor practices, local sourcing)
- Product durability and lifecycle considerations
- Waste reduction and circular economy principles"
                    disabled={readOnly}
                    className="min-h-28 bg-white"
                  />
                  {item.mearbSustainabilityIndicators && (
                    <p className="text-xs text-gray-500">
                      {item.mearbSustainabilityIndicators.length} characters
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
