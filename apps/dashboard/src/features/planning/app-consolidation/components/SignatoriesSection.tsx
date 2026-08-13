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

interface SignatoryCardProps {
  signatory: Signatory
  accentBorderClass: string
}

function SignatoryCard({ signatory, accentBorderClass }: SignatoryCardProps) {
  return (
    <Card className={`border border-slate-200 border-l-4 ${accentBorderClass} bg-white shadow-2xs hover:shadow-xs transition-shadow duration-205 overflow-hidden`}>
      <CardContent className="p-5 space-y-3">
        {/* Name - Strongest Text Element (Comfortable scale for readability) */}
        <div>
          <p className="text-base font-bold text-slate-900 leading-snug tracking-tight">
            {signatory.name}
          </p>
        </div>

        {/* Position & Department - Secondary and Muted with good spacing */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-700 leading-normal">
            {signatory.position}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {signatory.department}
          </p>
        </div>

        {/* Optional signature date */}
        {signatory.signatureDate && (
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Signed Date</span>
            <span className="text-slate-700">
              {new Date(signatory.signatureDate).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function SignatoriesSection({ app, isDraft, onEdit, itemCount = 0 }: SignatoriesSectionProps) {
  const roles = [
    {
      key: 'preparedBy' as const,
      label: 'Prepared By',
      accentBorderClass: 'border-l-blue-500',
      tagBgClass: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      key: 'reviewedBy' as const,
      label: 'Reviewed By',
      accentBorderClass: 'border-l-teal-500',
      tagBgClass: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      key: 'certifiedBy' as const,
      label: 'Certified By',
      accentBorderClass: 'border-l-amber-500',
      tagBgClass: 'bg-amber-50 text-amber-900 border-amber-200',
    },
    {
      key: 'approvedBy' as const,
      label: 'Approved By',
      accentBorderClass: 'border-l-emerald-600',
      tagBgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ]

  const hasSignatories =
    app.signatories &&
    (app.signatories.preparedBy?.length ||
      app.signatories.reviewedBy?.length ||
      app.signatories.approvedBy?.length ||
      app.signatories.certifiedBy?.length)

  return (
    <Card className="border border-slate-200 shadow-xs bg-white rounded-xl overflow-hidden mt-2" id="signatories-section">
      {/* Header */}
      <div className="bg-slate-50/80 border-b border-slate-200 py-4 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Signature className="w-5 h-5 text-purple-750" />
          <h2 className="text-lg font-semibold text-slate-900 leading-tight">
            Signatories & Approvals
          </h2>
        </div>
        <div>
          {isDraft && itemCount > 0 && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="pointer-events-auto cursor-pointer border-slate-200 hover:bg-slate-55 text-slate-700 font-semibold transition-colors"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Signatories
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6">
        {hasSignatories ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, idx) => {
              const list = app.signatories?.[role.key] || []
              return (
                <div key={role.key} className="space-y-4 flex flex-col h-full">
                  {/* Step Header with larger labels and clear visual space */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                      Step {idx + 1}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${role.tagBgClass}`}>
                      {role.label}
                    </span>
                  </div>

                  {/* Signatories List */}
                  <div className="space-y-4 flex-1">
                    {list.length > 0 ? (
                      list.map((sig, sIdx) => (
                        <SignatoryCard
                          key={sIdx}
                          signatory={sig}
                          accentBorderClass={role.accentBorderClass}
                        />
                      ))
                    ) : (
                      <div className="h-full min-h-[110px] flex items-center justify-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                        <p className="text-xs text-slate-400 font-medium italic text-center px-4">
                          No signatories assigned
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50/20 rounded-xl border border-dashed border-slate-200">
            <Signature className="w-8 h-8 mx-auto text-slate-350 mb-2" />
            <p className="text-slate-700 font-semibold text-sm">No signatories assigned to this plan</p>
            <p className="text-xs text-slate-550 mt-1 font-medium">Assign signatories to proceed with review and approvals.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
