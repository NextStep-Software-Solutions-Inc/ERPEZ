import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Download,
  Upload,
  CheckCircle2,
  FileText,
  CalendarDays,
  Banknote,
  Clock,
  Users,
  Building2,
  ChevronRight,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PublicProject, ProjectStatus, ModeOfProcurement } from '../types/portalTypes'
import { printDocument } from '../utils/printDocument'
import { BACApplicationForm } from './BACApplicationForm'
import api from '@/services/api'
import { mapBackendProjectToFrontend } from '../utils/projectMapper'

// Use the full BACApplicationForm component from the sibling file.
// See documentations/bac-application-form.md for implementation details.

interface BACProjectDetailProps {
  project: PublicProject
  onBack: () => void
}

const MOP_LABELS: Record<ModeOfProcurement, string> = {
  'public-bidding': 'Public Bidding',
  svp: 'Small Value Procurement',
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'closing-soon': { label: 'Closing Soon', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  closed: { label: 'Closed', className: 'bg-slate-100 text-slate-500 border-slate-200' },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(amount)
}

function formatDatetime(dateStr?: string) {
  if (!dateStr || isNaN(Date.parse(dateStr))) return '—'
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(dateStr?: string) {
  if (!dateStr || isNaN(Date.parse(dateStr))) return '—'
  return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function BACProjectDetail({ project: initialProject, onBack }: BACProjectDetailProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [selectedBidIds, setSelectedBidIds] = useState<Set<string>>(new Set())
  const [project, setProject] = useState<PublicProject>(initialProject)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get(`/api/public/projects/${initialProject.id}`)
        if (res.data && res.data.data) {
          const mapped = mapBackendProjectToFrontend(res.data.data)
          setProject(mapped)
        } else {
          setError(res.data?.message || 'Failed to load project details.')
        }
      } catch (err: any) {
        console.error('Failed to fetch project details:', err)
        setError(err?.response?.data?.message || err?.message || 'This project is not currently available.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjectDetails()
  }, [initialProject.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 text-sm font-medium">Loading project details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Project Unavailable</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <Button onClick={onBack} className="w-full bg-[#1e3a8a] hover:bg-[#1a2a5e]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Opportunities
          </Button>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[project.status]
  const templates = project.requiredDocuments.filter((d) => Boolean(d.downloadUrl || d.viewerDocId))
  const uploads = project.requiredDocuments

  const toggleBidSelection = (id: string) => {
    setSelectedBidIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedBidNotices = templates.filter((d) => selectedBidIds.has(d.id))

  if (showApplicationForm) {
    return (
      <BACApplicationForm
        project={project}
        selectedBidNotices={selectedBidNotices}
        onBack={() => setShowApplicationForm(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2a5e] via-[#1e3a8a] to-[#1a2a5e] text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white bg-white/20 hover:bg-white/30 border border-white/40 hover:border-white/60 px-4 py-2 rounded-lg text-sm font-semibold mb-4 transition-all shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Procurement Opportunities
          </button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.className}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${project.status === 'open' ? 'bg-emerald-500' : 'bg-amber-500'} inline-block`} />
                  {statusCfg.label}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium border-white/30 text-white bg-white/10`}
                >
                  {MOP_LABELS[project.mop]}
                </Badge>
              </div>
              <h1 className="text-xl md:text-2xl font-bold leading-snug">{project.title}</h1>
              <p className="text-blue-200 text-sm font-mono">{project.referenceNo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Project Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-4 border-b ${project.mop === 'public-bidding' ? 'bg-violet-50 border-violet-100' : 'bg-teal-50 border-teal-100'}`}>
            <div className="flex items-center gap-2">
              <Info className={`h-4 w-4 ${project.mop === 'public-bidding' ? 'text-violet-600' : 'text-teal-600'}`} />
              <h2 className="font-semibold text-slate-800">Project Details</h2>
            </div>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Contract No.', value: project.referenceNo, icon: FileText },
                { label: 'Mode of Procurement', value: MOP_LABELS[project.mop], icon: Users },
                { label: 'Approved Budget for the Contract (ABC)', value: formatCurrency(project.approvedBudget), icon: Banknote },
                { label: 'Delivery Period', value: project.deliveryPeriod, icon: Clock },
                ...(project.nonRefundableFee ? [{ label: 'Non-Refundable Bidder Fee', value: formatCurrency(project.nonRefundableFee), icon: Banknote }] : []),
                ...(project.preBidConference ? [{ label: 'Pre-Bid Conference', value: formatDatetime(project.preBidConference), icon: CalendarDays }] : []),
                ...(project.bidOpening ? [{ label: 'Bid Opening', value: formatDatetime(project.bidOpening), icon: CalendarDays }] : []),
                { label: 'Submission Deadline', value: formatDate(project.deadline), icon: CalendarDays },
                { label: 'Date Posted', value: formatDate(project.postedOn), icon: CalendarDays },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="text-sm font-semibold text-slate-800 mt-0.5">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {project.scope && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Scope of Work</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{project.scope}</p>
              </div>
            )}
          </div>
        </div>

        {/* Schedule of Requirements / Items to be Quoted */}
        {project.items && project.items.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <h2 className="font-semibold text-slate-800">
                  {project.mop === 'svp' ? 'Items for Price Quotation' : 'Schedule of Requirements / Bill of Quantities'}
                </h2>
              </div>
              <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                {project.items.length} {project.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                {project.mop === 'svp'
                  ? 'Suppliers will submit unit price quotations for each of the following line items in the online quotation form.'
                  : 'The following items comprise the scope of requirements. Detailed line-item pricing must be provided via the official Price Schedule / BOQ uploaded under the Second Envelope (Financial Component).'}
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5 w-12 text-center">#</th>
                      <th className="px-4 py-2.5">Item Description & Specifications</th>
                      <th className="px-4 py-2.5 w-28 text-center">Quantity</th>
                      <th className="px-4 py-2.5 w-36 text-right">ABC Unit Price</th>
                      <th className="px-4 py-2.5 w-36 text-right">ABC Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{item.itemName}</p>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-700">
                          {item.quantity} {item.uom || 'Unit'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-600">
                          {formatCurrency(item.abcUnitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.abcTotalPrice || item.quantity * item.abcUnitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Required Submissions — full width, same size as Project Details */}
        {uploads.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Upload className="h-4 w-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Required Submissions</h2>
              <span className="ml-auto text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                {uploads.length} document{uploads.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-6 space-y-2">
              <p className="text-xs text-slate-500 pb-2">
                Prepare the following documents. You will upload them in the application form.
              </p>
              {uploads.map((doc) => (
                <div key={doc.id} className="flex items-start gap-2 p-3 rounded-xl border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{doc.name}</p>
                    <p className="text-xs text-slate-400">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bid Notices — full width, same size as Project Details */}
        {templates.length > 0 && (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-slate-800">Bid Notices</h2>
              <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                {templates.length} file{templates.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-6 space-y-2">
              <p className="text-xs text-slate-500 pb-2">
                Download, fill out, and prepare the following bid documents before submitting your application.
                <span className="font-medium text-blue-600 ml-1">Select the documents you need to submit.</span>
              </p>
              {templates.map((doc) => {
                const isSelected = selectedBidIds.has(doc.id)
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleBidSelection(doc.id)}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-colors group ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-100 hover:border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Checkbox */}
                      <div
                        className={`mt-0.5 h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <FileText className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{doc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {doc.postedOn && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400 leading-none">Posted On</p>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5">{formatDate(doc.postedOn)}</p>
                        </div>
                      )}
                      {doc.viewerDocId ? (
                        <button
                          type="button"
                          onClick={() => printDocument(doc.viewerDocId!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-3 w-3" /> Download
                        </button>
                      ) : (
                        <a
                          href={doc.downloadUrl ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}

              {selectedBidIds.size > 0 && (
                <p className="text-xs text-blue-600 font-medium pt-1">
                  {selectedBidIds.size} document{selectedBidIds.size > 1 ? 's' : ''} selected — click "Submit Now" below to upload and submit.
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTA */}
        {project.status !== 'closed' && (
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1d4ed8] rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-white font-semibold text-lg">Ready to submit your bid?</h3>
              <p className="text-blue-200 text-sm mt-1">
                Click Submit Now to fill out your application and upload the {uploads.length} required documents.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setShowApplicationForm(true)}
              className="bg-white text-[#1e3a8a] hover:bg-blue-50 font-semibold gap-2 shrink-0 shadow-sm"
            >
              Submit Now <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} University of Science and Technology of Southern Philippines — BAC Secretariat</p>
      </div>
    </div>
  )
}
