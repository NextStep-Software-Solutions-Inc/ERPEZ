/**
 * AppDocumentTemplate - Task 2.2
 * Reusable document template for GPPB format preview
 * Used by: Export dialog preview, PDF generation, Excel reference
 */

import type { AppMaster } from '../types'
import { GPPB_COLUMNS, formatBACLineItemsForExport, calculateGrandTotals, formatCurrency } from '../utils/appExportFormatter'
import { formatAPPHeader, formatSignatories, formatExportDate } from '../utils/appExportEngine'

interface AppDocumentTemplateProps {
  app: AppMaster
  showSignatories?: boolean
  className?: string
}

export function AppDocumentTemplate({
  app,
  showSignatories = true,
  className = '',
}: AppDocumentTemplateProps) {
  const rows = formatBACLineItemsForExport(app.bac?.lineItems || [])
  const totals = calculateGrandTotals(rows)
  const signatories = formatSignatories(app)

  const headerTitle = formatAPPHeader(app)
  const createdDate = formatExportDate(app.createdAt)

  return (
    <div className={`bg-white p-8 text-gray-900 ${className}`}>
      {/* Header Section */}
      <div className="text-center mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-xl font-bold">{headerTitle}</h1>
        <p className="text-sm text-gray-600 mt-2">Code: {app.appCode}</p>
        <p className="text-sm text-gray-600">Fiscal Year: {app.fiscalYear}</p>
        <p className="text-sm text-gray-600">Status: {app.status}</p>
      </div>

      {/* Metadata Section */}
      <div className="mb-4 text-sm text-gray-700">
        <p>
          <strong>Prepared by:</strong> {app.createdBy}
        </p>
        <p>
          <strong>Date Prepared:</strong> {createdDate}
        </p>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-200">
              {GPPB_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="border border-gray-400 px-2 py-2 text-left font-bold text-xs"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-400 px-2 py-2 font-medium">{row.projectTitle}</td>
                <td className="border border-gray-400 px-2 py-2">{row.implementingUnit}</td>
                <td className="border border-gray-400 px-2 py-2 text-xs">{row.description}</td>
                <td className="border border-gray-400 px-2 py-2">{row.modeOfProcurement}</td>
                <td className="border border-gray-400 px-2 py-2 text-center text-xs font-semibold">{row.isEPA}</td>
                <td className="border border-gray-400 px-2 py-2 text-xs">{row.bidEvaluationCriteria}</td>
                <td className="border border-gray-400 px-2 py-2 text-center text-xs">{row.startOfProcurement}</td>
                <td className="border border-gray-400 px-2 py-2 text-center text-xs">{row.endOfProcurement}</td>
                <td className="border border-gray-400 px-2 py-2">{row.sourceOfFund}</td>
                <td className="border border-gray-400 px-2 py-2 text-right font-semibold">
                  {formatCurrency(row.estimatedBudget)}
                </td>
                <td className="border border-gray-400 px-2 py-2 text-xs">{row.procurementStrategy}</td>
                <td className="border border-gray-400 px-2 py-2 text-xs">{row.remarks}</td>
              </tr>
            ))}

            {/* Grand Totals Row */}
            <tr className="bg-gray-200 font-bold">
              <td colSpan={9} className="border border-gray-400 px-2 py-2 text-right">
                GRAND TOTAL:
              </td>
              <td className="border border-gray-400 px-2 py-2 text-right">
                {formatCurrency(totals.totalBudget)}
              </td>
              <td colSpan={2} className="border border-gray-400 px-2 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatories Section - Multiple Signatories Support */}
      {showSignatories && (
        <div className="mt-12">
          <h3 className="text-sm font-bold mb-8">SIGNATORIES</h3>
          <div className="grid grid-cols-4 gap-4">
            {/* Prepared by - Multiple */}
            {signatories.preparedBy && signatories.preparedBy.length > 0 && signatories.preparedBy[0]?.name && (
              <div className="text-center text-xs space-y-3">
                {signatories.preparedBy.map((sig: any, idx: number) => (
                  sig.name && (
                    <div key={idx} className="pb-2 border-b border-gray-200 last:border-b-0">
                      <div className="border-b border-gray-400 mb-1" style={{ height: '30px' }}></div>
                      <p className="font-semibold text-gray-900">{sig.name}</p>
                      <p className="text-gray-600 text-xs">{sig.position}</p>
                      <p className="text-gray-500 text-xs">{sig.signatureDate ? new Date(sig.signatureDate).toLocaleDateString() : 'Date: _______'}</p>
                    </div>
                  )
                ))}
                <p className="text-gray-700 font-semibold text-xs pt-2">Prepared by BAC Secretariat</p>
              </div>
            )}

            {/* Reviewed by - Multiple */}
            {signatories.reviewedBy && signatories.reviewedBy.length > 0 && signatories.reviewedBy[0]?.name && (
              <div className="text-center text-xs space-y-3">
                {signatories.reviewedBy.map((sig: any, idx: number) => (
                  sig.name && (
                    <div key={idx} className="pb-2 border-b border-gray-200 last:border-b-0">
                      <div className="border-b border-gray-400 mb-1" style={{ height: '30px' }}></div>
                      <p className="font-semibold text-gray-900">{sig.name}</p>
                      <p className="text-gray-600 text-xs">{sig.position}</p>
                      <p className="text-gray-500 text-xs">{sig.signatureDate ? new Date(sig.signatureDate).toLocaleDateString() : 'Date: _______'}</p>
                    </div>
                  )
                ))}
                <p className="text-gray-700 font-semibold text-xs pt-2">Recommending Approval</p>
              </div>
            )}

            {/* Approved by - Multiple */}
            {signatories.approvedBy && signatories.approvedBy.length > 0 && signatories.approvedBy[0]?.name && (
              <div className="text-center text-xs space-y-3">
                {signatories.approvedBy.map((sig: any, idx: number) => (
                  sig.name && (
                    <div key={idx} className="pb-2 border-b border-gray-200 last:border-b-0">
                      <div className="border-b border-gray-400 mb-1" style={{ height: '30px' }}></div>
                      <p className="font-semibold text-gray-900">{sig.name}</p>
                      <p className="text-gray-600 text-xs">{sig.position}</p>
                      <p className="text-gray-500 text-xs">{sig.signatureDate ? new Date(sig.signatureDate).toLocaleDateString() : 'Date: _______'}</p>
                    </div>
                  )
                ))}
                <p className="text-gray-700 font-semibold text-xs pt-2">Approved by (HoPE)</p>
              </div>
            )}

            {/* Certified by - Multiple */}
            {signatories.certifiedBy && signatories.certifiedBy.length > 0 && signatories.certifiedBy[0]?.name && (
              <div className="text-center text-xs space-y-3">
                {signatories.certifiedBy.map((sig: any, idx: number) => (
                  sig.name && (
                    <div key={idx} className="pb-2 border-b border-gray-200 last:border-b-0">
                      <div className="border-b border-gray-400 mb-1" style={{ height: '30px' }}></div>
                      <p className="font-semibold text-gray-900">{sig.name}</p>
                      <p className="text-gray-600 text-xs">{sig.position}</p>
                      <p className="text-gray-500 text-xs">{sig.signatureDate ? new Date(sig.signatureDate).toLocaleDateString() : 'Date: _______'}</p>
                    </div>
                  )
                ))}
                <p className="text-gray-700 font-semibold text-xs pt-2">Certified by</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 text-center">
        <p>Generated on {new Date().toLocaleString('en-PH')}</p>
      </div>
    </div>
  )
}
