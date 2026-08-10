import { Signature, Edit2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AppMaster, Signatory } from '../types'

interface SignatoriesSectionProps {
  app: AppMaster
  isDraft?: boolean
  onEdit?: () => void
  itemCount?: number
}

export function SignatoriesSection({ app, isDraft, onEdit, itemCount = 0 }: SignatoriesSectionProps) {
  const getTotalSignatories = () => {
    if (!app.signatories) return 0
    return Object.values(app.signatories).reduce((acc, arr) => acc + (arr?.length || 0), 0)
  }

  const hasSignatories =
    app.signatories &&
    (app.signatories.preparedBy?.length ||
      app.signatories.reviewedBy?.length ||
      app.signatories.approvedBy?.length ||
      app.signatories.certifiedBy?.length)

  return (
    <div id="signatories-section" className="mt-3 border-0 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-red-50/80 to-red-100/40 border-t-4 border-t-red-500">
      <Card className="border-0 bg-transparent shadow-none rounded-none">
        <div className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-black text-sm shadow-lg">
              {getTotalSignatories()}
            </div>
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Signature className="w-6 h-6 text-red-600" />
              Signatories & Approvals
            </h2>
            <div className="ml-auto flex items-center gap-2">
              {isDraft && itemCount > 0 && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  size="sm"
                  className="pointer-events-auto cursor-pointer hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Add
                </Button>
              )}
              <div className="w-12 h-12 bg-red-200/30 rounded-lg flex items-center justify-center">✏️</div>
            </div>
          </div>
        </div>
        <CardContent className="px-6 pb-6">
          {hasSignatories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Prepared By - Multiple */}
              {app.signatories?.preparedBy && app.signatories.preparedBy.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Prepared By ({app.signatories.preparedBy.length})
                  </h3>
                  {app.signatories.preparedBy.map((signatory, idx) => (
                    <SignatoryCard
                      key={idx}
                      signatory={signatory}
                    />
                  ))}
                </div>
              )}

              {/* Reviewed By - Multiple */}
              {app.signatories?.reviewedBy && app.signatories.reviewedBy.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Reviewed By ({app.signatories.reviewedBy.length})
                  </h3>
                  {app.signatories.reviewedBy.map((signatory, idx) => (
                    <SignatoryCard
                      key={idx}
                      signatory={signatory}
                    />
                  ))}
                </div>
              )}

              {/* Approved By - Multiple */}
              {app.signatories?.approvedBy && app.signatories.approvedBy.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Approved By ({app.signatories.approvedBy.length})
                  </h3>
                  {app.signatories.approvedBy.map((signatory, idx) => (
                    <SignatoryCard
                      key={idx}
                      signatory={signatory}
                    />
                  ))}
                </div>
              )}

              {/* Certified By - Multiple */}
              {app.signatories?.certifiedBy && app.signatories.certifiedBy.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Certified By ({app.signatories.certifiedBy.length})
                  </h3>
                  {app.signatories.certifiedBy.map((signatory, idx) => (
                    <SignatoryCard
                      key={idx}
                      signatory={signatory}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No signatories recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface SignatoryCardProps {
  signatory: Signatory
}

function SignatoryCard({ signatory }: SignatoryCardProps) {
  return (
    <div className="border-l-4 border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</p>
          <p className="font-semibold text-gray-900">{signatory.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Position
          </p>
          <p className="text-sm text-gray-700">{signatory.position}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Department
          </p>
          <p className="text-sm text-gray-700">{signatory.department}</p>
        </div>
        {signatory.signatureDate && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Signature Date
            </p>
            <p className="text-sm text-gray-700 font-medium">
              {new Date(signatory.signatureDate).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
