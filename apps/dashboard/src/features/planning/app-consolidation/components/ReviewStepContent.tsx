import type { PPMPItem, BACWorkspace, SignatoryBlock } from '../types'

interface ReviewStepContentProps {
  selectedItems: PPMPItem[]
  bacWorkspace: BACWorkspace | null | undefined
  signatoryBlock: SignatoryBlock | null | undefined
}

export function ReviewStepContent({
  selectedItems,
  bacWorkspace,
  signatoryBlock,
}: ReviewStepContentProps) {
  return (
    <div className="space-y-6">
      {/* Selected PPMP Items */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3 text-lg">Selected PPMP Items</h3>
        {selectedItems.length > 0 ? (
          <div className="space-y-2">
            {selectedItems.map((item, idx) => (
              <div key={item.id} className="flex justify-between text-sm border-b pb-2 last:border-b-0">
                <div>
                  <p className="font-medium">{idx + 1}. {item.code}</p>
                  <p className="text-gray-600 text-xs">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ₱{item.totalAmount.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-600">{item.quantity} {item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No items selected</p>
        )}
      </div>

      {/* Budget Summary */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold mb-3 text-blue-900">Budget Summary</h3>
        <div className="space-y-2 text-sm">
          <p className="text-blue-800">
            <span className="font-medium">Total Items:</span> {selectedItems.length}
          </p>
          <p className="text-blue-800">
            <span className="font-medium">Total Budget:</span> ₱
            {selectedItems
              .reduce((sum, item) => sum + item.totalAmount, 0)
              .toLocaleString('en-PH', { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* BAC Workspace Details */}
      {bacWorkspace && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-lg">Budget Alignment Checklist</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-700">Line Items:</p>
              <p className="text-gray-600">{bacWorkspace.lineItems?.length || 0} items configured</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Source Funds:</p>
              <p className="text-gray-600">{bacWorkspace.sourceFunds?.length || 0} fund sources</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Mode of Procurements:</p>
              <p className="text-gray-600">
                {bacWorkspace.modeOfProcurements?.length || 0} procurement methods
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Total Budget (BAC):</p>
              <p className="font-semibold text-green-700">
                ₱{(bacWorkspace.totalBudget || 0).toLocaleString('en-PH', { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approval Routing Workflow */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="font-semibold mb-4 text-lg text-gray-900">Approval Routing Workflow</h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-700 mb-4">
            After creation, this APP will follow this approval workflow:
          </p>
          
          <div className="space-y-2">
            {/* Draft Status */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white font-semibold text-sm">
                  ✓
                </div>
              </div>
              <div className="pt-1">
                <p className="font-medium text-gray-900">Draft APP (Created)</p>
                <p className="text-xs text-gray-600">Initial state - Ready for review</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-1">
              <div className="border-l-2 border-gray-400 h-6" />
            </div>

            {/* Pending Review */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white font-semibold text-sm">
                  →
                </div>
              </div>
              <div className="pt-1">
                <p className="font-medium text-gray-900">Pending Review</p>
                <p className="text-xs text-gray-600">Awaiting HoPE (Head of Procuring Entity) approval</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-1">
              <div className="border-l-2 border-gray-400 h-6" />
            </div>

            {/* Approved */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold text-sm">
                  ✓
                </div>
              </div>
              <div className="pt-1">
                <p className="font-medium text-gray-900">Approved APP</p>
                <p className="text-xs text-gray-600">Ready for publication and implementation</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded text-sm text-blue-900">
            <p className="font-medium">ℹ️ Note:</p>
            <p className="text-xs mt-1">
              The APP will be saved in Draft status. You can submit it for approval through the APP details page.
            </p>
          </div>
        </div>
      </div>

      {/* Signatories */}
      {signatoryBlock && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-lg">Signatories</h3>
          <div className="space-y-3 text-sm">
            {signatoryBlock.preparedBy && (
              <div>
                <p className="font-medium text-gray-700">Prepared By:</p>
                <p className="text-gray-600">{signatoryBlock.preparedBy.name || 'Not assigned'}</p>
                {signatoryBlock.preparedBy.position && (
                  <p className="text-xs text-gray-500">{signatoryBlock.preparedBy.position}</p>
                )}
              </div>
            )}
            {signatoryBlock.reviewedBy && (
              <div>
                <p className="font-medium text-gray-700">Reviewed By:</p>
                <p className="text-gray-600">{signatoryBlock.reviewedBy.name || 'Not assigned'}</p>
                {signatoryBlock.reviewedBy.position && (
                  <p className="text-xs text-gray-500">{signatoryBlock.reviewedBy.position}</p>
                )}
              </div>
            )}
            {signatoryBlock.approvedBy && (
              <div>
                <p className="font-medium text-gray-700">Approved By:</p>
                <p className="text-gray-600">{signatoryBlock.approvedBy.name || 'Not assigned'}</p>
                {signatoryBlock.approvedBy.position && (
                  <p className="text-xs text-gray-500">{signatoryBlock.approvedBy.position}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Warning */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <p className="text-sm text-amber-800">
          ⚠️ Please review all details carefully. You cannot modify the APP after creation.
        </p>
      </div>
    </div>
  )
}
