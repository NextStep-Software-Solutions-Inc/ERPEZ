/**
 * Market Scoping - Approval Routing Timeline Section
 * Displays workflow status and approval history
 * Location: src/features/planning/market-scoping/components/
 */

import { useState } from 'react'
import { Check, X, Clock, FileText, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { FileAttachment, MarketScopingForm } from '../types/marketScopingTypes'
import { DocumentPreviewModal } from '../dialogs/DocumentPreviewModal'

interface ApprovalRoutingSectionProps {
  form: MarketScopingForm
  onApprovalAction: (action: 'approve' | 'reject') => void
  isLoading: boolean
}

export function ApprovalRoutingSection({
  form,
  onApprovalAction,
  isLoading,
}: ApprovalRoutingSectionProps) {
  const [signedDocPreview, setSignedDocPreview] = useState<FileAttachment | null>(null)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Approval Routing</CardTitle>
          <CardDescription>Workflow status and timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {form.approvalRouting && form.approvalRouting.length > 0 ? (
              form.approvalRouting.map((step, index) => (
                <div key={index} className="relative pb-6">
                  {/* Timeline line */}
                  {index < form.approvalRouting.length - 1 && (
                    <div className="absolute left-4 top-12 w-0.5 h-12 bg-gray-300"></div>
                  )}

                  {/* Timeline node */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'Approved'
                          ? 'bg-green-100'
                          : step.status === 'Rejected'
                            ? 'bg-red-100'
                            : 'bg-blue-100'
                      }`}
                    >
                      {step.status === 'Approved' && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                      {step.status === 'Rejected' && (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      {step.status === 'Pending' && (
                        <Clock className="w-4 h-4 text-blue-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{step.actorName}</p>
                      <p className="text-xs text-gray-600">{step.role}</p>
                      {step.actionDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          {step.actionDate instanceof Date
                            ? step.actionDate.toLocaleDateString()
                            : new Date(step.actionDate).toLocaleDateString()}
                        </p>
                      )}
                      {step.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          Reason: {step.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm text-center py-6">No approval history</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons for Approvers */}
      {form.status === 'PendingApproval' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base">Your Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                onClick={() => onApprovalAction('approve')}
                disabled={isLoading}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Approve
              </Button>
              <Button
                onClick={() => onApprovalAction('reject')}
                disabled={isLoading}
                variant="outline"
                className="w-full gap-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signed Document Section - Shown when signedDocumentFileId or pdfUrl is present */}
      {(form.signedDocumentFileId || form.pdfUrl) && (
        <Card className="border-indigo-100 bg-indigo-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-900">
              <FileText className="w-4 h-4 text-indigo-600" />
              Signed Document
            </CardTitle>
            <CardDescription className="text-xs">
              Official signed Market Scoping Form
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-indigo-100">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate">
                  {`${form.projectName.replace(/\s+/g, '_')}_Signed.pdf`}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  onClick={() => {
                    setSignedDocPreview({
                      id: form.signedDocumentFileId || '',
                      fileName: `${form.projectName.replace(/\s+/g, '_')}_Signed.pdf`,
                      fileUrl: form.signedDocumentFileId || form.pdfUrl || '',
                    })
                  }}
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DocumentPreviewModal
        isOpen={!!signedDocPreview}
        onClose={() => setSignedDocPreview(null)}
        attachment={signedDocPreview}
      />
    </div>
  )
}
