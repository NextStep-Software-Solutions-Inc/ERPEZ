/**
 * Step 4: Review & Submit Form
 * Final review before submission with summary and action buttons
 * Location: src/features/planning/market-scoping/forms/
 */

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useAtom } from 'jotai'
import { draftMarketScopingAtom, currentFormStepAtom } from '../atoms/marketScopingStateAtom'
import { formatCurrency } from '../utils/transformers'
import { AlertCircle, FileText, CheckCircle } from 'lucide-react'

interface ReviewSubmitFormProps {
  onPrevious: () => void
  onSubmit: (comments?: string) => void
  onSaveDraft?: () => void
  isSubmitting?: boolean
}

export function ReviewSubmitForm({
  onPrevious,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
}: ReviewSubmitFormProps) {
  const [draft] = useAtom(draftMarketScopingAtom)
  const [, setCurrentStep] = useAtom(currentFormStepAtom)

  useEffect(() => {
    setCurrentStep(4)
  }, [setCurrentStep])

  if (!draft) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-gray-600">No form data found. Please start from the beginning.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Validate that all required fields are present
  if (!draft.userId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">Representative ID is missing. Please go back to Step 1 and select a representative.</p>
            <Button variant="outline" onClick={onPrevious}>
              Go Back to Step 1
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const checkedActivitiesCount = (draft.activities || []).filter((a) => a.checked).length
  const totalAttachments = (draft.activities || []).reduce(
    (sum, a) => sum + (a.attachments?.length || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-medium">Project Name</p>
                <p className="text-lg font-semibold">{draft.projectName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Estimated Budget</p>
                <p className="text-lg font-semibold text-primary">
                  {formatCurrency(draft.estimatedBudget || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-600 font-medium">Scoping Period</p>
                <p className="text-sm">
                  {draft.periodFrom} - {draft.periodTo}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Expected Delivery</p>
                <p className="text-sm">{draft.expectedDeliveryDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Representative</p>
                <p className="text-sm">{draft.representativeName || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {draft.userId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Market Research Activities</CardTitle>
          <CardDescription>
            {checkedActivitiesCount} activit{checkedActivitiesCount !== 1 ? 'ies' : 'y'} conducted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(draft.activities || [])
              .filter((a) => a.checked)
              .map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.label || activity.activityType}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                    )}
                    {activity.attachments && activity.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {activity.attachments.map((att) => (
                          <Badge key={att.id} variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {att.fileName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Parameters Summary */}
      <Card>
        <CardHeader>
          <CardTitle>NGPA Parameters</CardTitle>
          <CardDescription>Evaluation results for all parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(draft.parameters || []).map((param) => (
              <div key={param.parameterId} className="border-l-4 border-l-primary pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{param.displayName}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {param.recommendations}
                    </p>
                  </div>
                  <Badge
                    variant={
                      param.considered === 'Yes'
                        ? 'outline'
                        : param.considered === 'No'
                          ? 'soft'
                          : 'outline'
                    }
                    className="ml-2 flex-shrink-0"
                  >
                    {param.considered === 'NotApplicable' ? 'N/A' : param.considered}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Submission Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ChecklistItem
              completed={!!draft.projectName}
              label="Project name provided"
            />
            <ChecklistItem
              completed={!!draft.estimatedBudget && draft.estimatedBudget > 0}
              label="Estimated budget entered"
            />
            <ChecklistItem
              completed={!!draft.periodFrom && !!draft.periodTo}
              label="Scoping period defined"
            />
            <ChecklistItem
              completed={checkedActivitiesCount > 0}
              label="At least one activity conducted"
            />
            <ChecklistItem
              completed={totalAttachments > 0}
              label="Supporting documents attached"
            />
            <ChecklistItem
              completed={(draft.parameters || []).every(
                (p) => p.considered && p.recommendations.trim().length > 0
              )}
              label="All parameters evaluated"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submission Comments (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Comments</CardTitle>
          <CardDescription>Add any additional notes or comments (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="E.g., 'Based on latest market data from PhilGEPS and supplier consultations...'"
            className="min-h-20"
            id="submission-comments"
          />
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-orange-900">
          <p className="font-medium">Important</p>
          <p className="mt-1">
            Once submitted, this form will be locked and routed to your Department Head for
            approval. You will receive a notification when your form is approved or requires
            revisions.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onPrevious} disabled={isSubmitting}>
          Previous
        </Button>
        <div className="space-x-3">
          <Button
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSubmitting || !onSaveDraft}
          >
            Save as Draft
          </Button>
          <Button onClick={() => onSubmit()} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <div className="animate-spin">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                  </svg>
                </div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Submit for Approval
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ChecklistItem({ completed, label }: { completed: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          completed
            ? 'bg-green-100 border-green-600'
            : 'bg-white border-gray-300'
        }`}
      >
        {completed && (
          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  )
}
