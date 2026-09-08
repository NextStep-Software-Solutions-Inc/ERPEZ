import { useState, useRef, useCallback } from 'react'
import {
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  FileText,
  AlertCircle,
  Send,
  CloudUpload,
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Loader2,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PublicProject, SubmissionResult, RequiredDocument } from '../types/portalTypes'
import { printDocument } from '../utils/printDocument'
import api from '@/services/api'

// Local BACSubmissionSuccess component is defined later in this file to avoid external module resolution errors.

interface BACApplicationFormProps {
  project: PublicProject
  onBack: () => void
  selectedBidNotices?: RequiredDocument[]
}

interface UploadedFile {
  documentId: string
  documentName: string
  file: File
}

interface ContactInfo {
  supplierName: string
  email: string
  contactNumber: string
  address: string
  tinNumber: string
}

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png'
const MAX_SIZE_MB = 10

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function generateRefNo() {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `APP-${ts}-${rand}`
}

export function BACApplicationForm({ project, onBack, selectedBidNotices = [] }: BACApplicationFormProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    supplierName: '',
    email: '',
    contactNumber: '',
    address: '',
    tinNumber: '',
  })
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const requiredUploads = project.requiredDocuments

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleFileDrop = useCallback(
    (documentId: string, documentName: string, files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]

      // Validate file type (extensions + common MIME fallbacks) because drag-and-drop bypasses input accept
      const acceptedExtensions = ACCEPTED_TYPES.split(',').map((s) => s.trim().replace(/^\./, '').toLowerCase())
      const fileExt = (file.name.split('.').pop() || '').toLowerCase()
      const mime = file.type || ''

      const mimeAllowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]

      const isAccepted =
        (fileExt && acceptedExtensions.includes(fileExt)) ||
        mimeAllowed.includes(mime) ||
        mime.startsWith('image/')

      if (!isAccepted) {
        setErrors((prev) => ({
          ...prev,
          [documentId]: `Unsupported file type. Accepted: ${ACCEPTED_TYPES.replace(/\./g, '')}`,
        }))
        return
      }

      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [documentId]: `File exceeds ${MAX_SIZE_MB}MB limit` }))
        return
      }

      setErrors((prev) => ({ ...prev, [documentId]: '' }))
      setUploadedFiles((prev) => {
        const filtered = prev.filter((f) => f.documentId !== documentId)
        return [...filtered, { documentId, documentName, file }]
      })
    },
    [],
  )

  const removeFile = (documentId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.documentId !== documentId))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!contactInfo.supplierName.trim()) newErrors.supplierName = 'Supplier name is required'
    if (!contactInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email))
      newErrors.email = 'Valid email is required'
    if (!contactInfo.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required'
    if (!contactInfo.address.trim()) newErrors.address = 'Address is required'
    if (!contactInfo.tinNumber.trim()) newErrors.tinNumber = 'TIN number is required'
    requiredUploads.forEach((doc) => {
      if (!uploadedFiles.find((f) => f.documentId === doc.id)) {
        newErrors[doc.id] = 'This document is required'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<{ succeeded: boolean; data: string }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (!response.data.succeeded || !response.data.data) {
      throw new Error('File upload failed')
    }
    return response.data.data
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      // Upload each required document
      const uploadPromises = uploadedFiles.map(async (uf) => {
        const fileId = await uploadFile(uf.file)
        return { checklistItemId: uf.documentId, fileId }
      })

      const uploadedDocs = await Promise.all(uploadPromises)

      // Submit application
      const payload = {
        companyName: contactInfo.supplierName,
        contactPerson: contactInfo.supplierName,
        emailAddress: contactInfo.email,
        contactNumber: contactInfo.contactNumber,
        tinNumber: contactInfo.tinNumber,
        businessAddress: contactInfo.address,
        documents: uploadedDocs,
      }

      const response = await api.post<{ succeeded: boolean; data: string }>(
        `/api/public/projects/${project.id}/apply`,
        payload,
      )

      if (response.data && response.data.succeeded) {
        setResult({
          referenceNumber: response.data.data,
          submittedAt: new Date().toISOString(),
          projectTitle: project.title,
        })
      }
    } catch (err: any) {
      console.error(err)
      // Note: error toast is already shown by axios response interceptor
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Success screen */}
      {result ? (
        <BACSubmissionSuccess result={result} project={project} onDone={onBack} />
      ) : (
        <>
          <div className="bg-gradient-to-r from-[#1a2a5e] via-[#1e3a8a] to-[#1a2a5e] text-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button onClick={onBack} className="flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Project Details
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2.5">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Submit Application</h1>
              <p className="text-blue-200 text-sm truncate max-w-lg">{project.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-600" />
            <h2 className="font-semibold text-slate-800">Supplier Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { field: 'supplierName' as const, label: 'Company / Supplier Name', placeholder: 'Enter company name', icon: User },
              { field: 'email' as const, label: 'Email Address', placeholder: 'contact@company.com', icon: Mail },
              { field: 'contactNumber' as const, label: 'Contact Number', placeholder: '+63 9XX XXX XXXX', icon: Phone },
              { field: 'tinNumber' as const, label: 'TIN Number', placeholder: '000-000-000-000', icon: Hash },
            ].map(({ field, label, placeholder, icon: Icon }) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={field} className="text-sm font-medium text-slate-700">
                  {label} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id={field}
                    placeholder={placeholder}
                    value={contactInfo[field]}
                    onChange={(e) => handleContactChange(field, e.target.value)}
                    className={`pl-9 ${errors[field] ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                </div>
                {errors[field] && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors[field]}
                  </p>
                )}
              </div>
            ))}

            {/* Address spans full width */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                Business Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="address"
                  placeholder="Full business address"
                  value={contactInfo.address}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                  className={`pl-9 ${errors.address ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Required Documents Uploads */}
        {requiredUploads.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Upload className="h-4 w-4 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Required Documents</h2>
              <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                {uploadedFiles.length}/{requiredUploads.length} uploaded
              </span>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Accepted: PDF, Word, Excel, or image files. Max {MAX_SIZE_MB}MB per file.
              </p>
              {requiredUploads.map((doc) => {
                const uploaded = uploadedFiles.find((f) => f.documentId === doc.id)
                const isDragOver = dragOverId === doc.id
                return (
                  <div key={doc.id} className="space-y-2 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {uploaded ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{doc.name}</span>
                            {project.mop === 'public-bidding' && (
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                doc.envelopeType === 2
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {doc.envelopeType === 2 ? 'Second Envelope — Financial' : 'First Envelope — Eligibility & Technical'}
                              </span>
                            )}
                          </div>
                          {doc.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Download Template button if template is attached */}
                      {(doc.downloadUrl || doc.viewerDocId) && (
                        doc.viewerDocId ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); printDocument(doc.viewerDocId!) }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shrink-0"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download Template
                          </button>
                        ) : (
                          <a
                            href={doc.downloadUrl ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download Template
                          </a>
                        )
                      )}
                    </div>

                    {/* Single Upload slot */}
                    {uploaded ? (
                      <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="text-sm text-emerald-700 font-medium truncate">{uploaded.file.name}</span>
                          <span className="text-xs text-emerald-500 shrink-0">({formatFileSize(uploaded.file.size)})</span>
                        </div>
                        <button
                          onClick={() => removeFile(doc.id)}
                          className="text-emerald-400 hover:text-red-500 transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOverId(doc.id) }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragOverId(null)
                          handleFileDrop(doc.id, doc.name, e.dataTransfer.files)
                        }}
                        onClick={() => fileInputRefs.current[doc.id]?.click()}
                        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                          isDragOver
                            ? 'border-blue-400 bg-blue-50'
                            : errors[doc.id]
                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <CloudUpload className={`h-7 w-7 mx-auto mb-2 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                        <p className="text-sm font-medium text-slate-600">
                          {isDragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">PDF, Word, Excel, Images up to {MAX_SIZE_MB}MB</p>
                        <input
                          ref={(el) => { fileInputRefs.current[doc.id] = el }}
                          type="file"
                          accept={ACCEPTED_TYPES}
                          className="hidden"
                          onChange={(e) => handleFileDrop(doc.id, doc.name, e.target.files)}
                        />
                      </div>
                    )}

                    {errors[doc.id] && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors[doc.id]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-slate-800">Ready to submit?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure all required documents are uploaded. Submissions cannot be modified after sending.
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-semibold gap-2 min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Application
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} University of Science and Technology of Southern Philippines — BAC Secretariat</p>
      </div>
        </>
      )}
    </div>
  )
}

/* Local BACSubmissionSuccess component added to avoid external module resolution errors */
function BACSubmissionSuccess({
  result,
  project,
  onDone,
}: {
  result: SubmissionResult
  project: PublicProject
  onDone: () => void
}) {
  const submittedAt = result.submittedAt ? new Date(result.submittedAt).toLocaleString() : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Application Submitted</h3>
        <p className="text-sm text-slate-500 mb-4">Your application has been received by the BAC Secretariat.</p>

        <div className="text-left bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
          <p className="text-xs text-slate-500">Reference Number</p>
          <p className="font-medium text-slate-800 truncate">{result.referenceNumber}</p>

          <div className="mt-3">
            <p className="text-xs text-slate-500">Project</p>
            <p className="text-sm text-slate-700 truncate">{project.title}</p>
          </div>

          <div className="mt-3">
            <p className="text-xs text-slate-500">Submitted At</p>
            <p className="text-sm text-slate-700">{submittedAt}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={onDone} className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
