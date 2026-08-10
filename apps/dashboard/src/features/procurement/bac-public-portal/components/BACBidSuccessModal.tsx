import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BACBidSuccessModalProps {
  open: boolean
  referenceNumber: string
  projectTitle: string
  submittedDocuments: string[]
  onClose: () => void
}

export function BACBidSuccessModal({
  open,
  referenceNumber,
  projectTitle,
  submittedDocuments,
  onClose,
}: BACBidSuccessModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Bid Submitted Successfully</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your bid documents have been received by the BAC Secretariat.
          </p>

          <div className="text-left bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3 mb-6">
            <div>
              <p className="text-xs text-slate-400">Reference Number</p>
              <p className="text-sm font-bold text-slate-800 font-mono">{referenceNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Project</p>
              <p className="text-sm text-slate-700">{projectTitle}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Submitted On</p>
              <p className="text-sm text-slate-700">{new Date().toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })}</p>
            </div>
            {submittedDocuments.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Documents Submitted</p>
                <ul className="space-y-1">
                  {submittedDocuments.map((name) => (
                    <li key={name} className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mb-5">
            Please keep your reference number for tracking purposes. The BAC Secretariat will contact you for further instructions.
          </p>

          <Button
            onClick={onClose}
            className="w-full bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
