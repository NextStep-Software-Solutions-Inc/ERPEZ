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
import type { BACLineItem, BidEvaluationCriteria } from '../../types'
import { BID_EVALUATION_CRITERIA_LABELS } from '../../types'

interface BidEvaluationTabItemProps {
  item: BACLineItem
  onUpdate?: (item: Partial<BACLineItem>) => void
  readOnly?: boolean
}

export function BidEvaluationTabItem({
  item,
  onUpdate,
  readOnly,
}: BidEvaluationTabItemProps) {
  const handleCriteriaChange = (criteria: BidEvaluationCriteria) => {
    if (readOnly) return
    onUpdate?.({
      ...item,
      bidEvaluationCriteria: criteria,
      mearbSustainabilityIndicators:
        criteria === 'MEARB' ? item.mearbSustainabilityIndicators : undefined,
    })
  }
  const handleSustainabilityChange = (indicators: string) => {
    if (readOnly) return
    onUpdate?.({ ...item, mearbSustainabilityIndicators: indicators })
  }

  const showSustainabilityInput = item.bidEvaluationCriteria === 'MEARB'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Criteria for Bid Evaluation</CardTitle>
          <p className="text-xs text-gray-600 mt-2">
            Select the bid evaluation criteria for this procurement item. This determines how bids will be evaluated and compared.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <label className="text-sm font-medium text-gray-700">Evaluation Criteria:</label>
            <Select
              value={item.bidEvaluationCriteria || ''}
              onValueChange={(value) => handleCriteriaChange(value as BidEvaluationCriteria)}
              disabled={readOnly}
            >
              <SelectTrigger className="w-96 relative z-50">
                <SelectValue placeholder="Select bid evaluation criteria..." />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" sideOffset={8} className="z-[99999] w-96">
                {Object.entries(BID_EVALUATION_CRITERIA_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex flex-col">
                      <span className="font-medium">{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {item.bidEvaluationCriteria && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Selected:</span> {BID_EVALUATION_CRITERIA_LABELS[item.bidEvaluationCriteria]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showSustainabilityInput && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base text-green-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              MEARB Sustainability Requirements
            </CardTitle>
            <p className="text-xs text-green-800 mt-2">
              For MEARB evaluation, you must specify sustainability indicators that will be included in the technical specifications.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="text-sm font-medium block text-gray-700">
                Sustainability Indicators (Technical Specifications)
              </label>
              <Textarea
                value={item.mearbSustainabilityIndicators || ''}
                onChange={(e) => handleSustainabilityChange(e.target.value)}
                placeholder="Specify sustainability and environmental/social factors to be included in technical specifications...

Examples:
- Energy efficiency ratings (e.g., ENERGY STAR certified)
- Environmental impact (reduced carbon footprint, recyclable materials)
- Social responsibility (fair labor practices, local sourcing)
- Product durability and lifecycle considerations
- Waste reduction and circular economy principles"
                disabled={readOnly}
                className="min-h-32 bg-white"
              />
              {item.mearbSustainabilityIndicators && (
                <p className="text-xs text-gray-500">
                  {item.mearbSustainabilityIndicators.length} characters
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm text-blue-800 ml-2">
          <strong>Bid Evaluation Criteria Guide:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-xs">
            <li><strong>LCRB:</strong> Selection based solely on lowest bid price</li>
            <li><strong>MEARB:</strong> Selection based on quality-cost combination, including environmental and social factors (requires sustainability specifications)</li>
            <li><strong>MARB/HRRB/SRRB:</strong> Selection based on comprehensive evaluation criteria beyond price</li>
            <li><strong>LCCRB:</strong> Selection based on competitive comparison of responsive bids</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
