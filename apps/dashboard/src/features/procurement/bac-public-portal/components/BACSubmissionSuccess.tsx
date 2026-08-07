import { CheckCircle2, Copy, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SubmissionResult, PublicProject } from '../types/portalTypes'
import { useState } from 'react'

interface BACSubmissionSuccessProps {
  result: SubmissionResult
  project: PublicProject
  onDone: () => void
}

function formatDatetime(isoStr: string) {
  return new Date(isoStr).toLocaleString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function BACSubmissionSuccess({ result, project, onDone }: BACSubmissionSuccessProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(result.referenceNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2a5e] via-[#1e3a8a] to-[#1a2a5e] text-white">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-400/20 border-2 border-emerald-400/40 mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold">Application Submitted!</h1>
          <p className="text-blue-200 mt-2 text-sm">
            Your bid application has been received successfully.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 w-full flex-1 space-y-6">
        {/* Reference Number Card */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h2 className="font-semibold text-emerald-800 text-sm">Your Tracking Reference Number</h2>
          </div>
          <div className="p-6 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-2xl font-bold font-mono text-emerald-700 tracking-wider">
                {result.referenceNumber}
              </span>
              <button
                onClick={handleCopy}
                className="text-emerald-400 hover:text-emerald-600 transition-colors"
                title="Copy reference number"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && <p className="text-xs text-emerald-600 mt-2">Copied to clipboard!</p>}
            <p className="text-sm text-slate-500 mt-3">
              Please save this reference number to track your application status.
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Submission Summary</h2>
          </div>
          <dl className="divide-y divide-slate-100">
            {[
              { label: 'Project', value: result.projectTitle },
              { label: 'Reference No.', value: project.referenceNo },
              { label: 'Submitted On', value: formatDatetime(result.submittedAt) },
              { label: 'Status', value: 'Under Review' },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-3 flex items-start justify-between gap-4">
                <dt className="text-xs text-slate-500 w-32 shrink-0">{label}</dt>
                <dd className={`text-sm font-medium text-right flex-1 ${label === 'Status' ? 'text-amber-600' : 'text-slate-800'}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* What happens next */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-blue-800">What happens next?</h3>
          <ol className="space-y-2">
            {[
              'The BAC Secretariat will review your submitted documents.',
              'You may be contacted via email for additional requirements.',
              'Results will be announced after the bid evaluation process.',
              'Keep your reference number for tracking and correspondence.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-blue-700">
                <span className="shrink-0 h-5 w-5 rounded-full bg-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={onDone} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Project
          </Button>
            <Button
            onClick={() => {
              // Use an explicit navigation target instead of calling onDone() twice.
              // This avoids brittle parent-dependent behavior.
              window.location.assign('/v2/bac')
            }}
            className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white gap-2"
            >
            <Home className="h-4 w-4" /> View All Opportunities
            </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} University of Science and Technology of Southern Philippines — BAC Secretariat</p>
      </div>
    </div>
  )
}
