import { useState, useRef, useCallback } from 'react'
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  CloudUpload,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RequiredDocument } from '../types/portalTypes'

interface BACBidSubmitModalProps {
  open: boolean
  onClose: () => void
  selectedBidNotices: RequiredDocument[]
  projectTitle: string
  onSubmitSuccess: (referenceNumber: string) => void
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
  return `BID-${ts}-${rand}`
}

export function BACBidSubmitModal({
  open,
  onClose,
  selectedBidNotices,
  projectTitle,
  onSubmitSuccess,
}: BACBidSubmitModalProps) {
  const [uploads, setUploads] = useState<Record<string, File>>({})
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleFileDrop = useCallback((docId: string, files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

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
      setErrors((prev) => ({ ...prev, [docId]: `Unsupported file type. Accepted: PDF, Word, Excel, Images` }))
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [docId]: `File exceeds ${MAX_SIZE_MB}MB limit` }))
      return
    }

    setErrors((prev) => ({ ...prev, [docId]: '' }))
    setUploads((prev) => ({ ...prev, [docId]: file }))
  }, [])

  const removeFile = (docId: string) => {
    setUploads((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    selectedBidNotices.forEach((doc) => {
      if (!uploads[doc.id]) {
        newErrors[doc.id] = 'Please upload the filled document'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 1800))
    setIsSubmitting(false)
    onSubmitSuccess(generateRefNo())
  }

  const uploadedCount = Object.keys(uploads).length

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2a5e] to-[#1e3a8a] text-white px-6 py-5 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Submit Bid Documents</h2>
              <p className="text-blue-200 text-xs mt-0.5 truncate max-w-xs">{projectTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors mt-0.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pt-4 pb-2 shrink-0 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Documents uploaded</span>
            <span className="font-semibold text-slate-700">
              {uploadedCount} / {selectedBidNotices.length}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${selectedBidNotices.length > 0 ? (uploadedCount / selectedBidNotices.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <p className="text-xs text-slate-500">
            Upload the filled-out versions of the selected bid notice documents below. Accepted formats: PDF, Word, Excel, Images (max {MAX_SIZE_MB}MB each).
          </p>

          {selectedBidNotices.map((doc) => {
            const uploaded = uploads[doc.id]
            const isDragOver = dragOverId === doc.id

            return (
              <div key={doc.id} className="space-y-2">
                {/* Document header */}
                <div className="flex items-start gap-2 p-3 rounded-xl border border-blue-100 bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{doc.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                  </div>
                  {doc.downloadUrl || doc.viewerDocId ? (
                    <a
                      href={doc.downloadUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="h-3 w-3" />
                      Template
                    </a>
                  ) : null}
                </div>

                {/* Upload area below the document */}
                {uploaded ? (
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-sm text-emerald-700 font-medium truncate">{uploaded.name}</span>
                      <span className="text-xs text-emerald-500 shrink-0">({formatFileSize(uploaded.size)})</span>
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
                      handleFileDrop(doc.id, e.dataTransfer.files)
                    }}
                    onClick={() => fileInputRefs.current[doc.id]?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : errors[doc.id]
                        ? 'border-red-300 bg-red-50 hover:border-red-400'
                        : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <CloudUpload className={`h-6 w-6 mx-auto mb-1.5 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className="text-sm font-medium text-slate-600">
                      {isDragOver ? 'Drop file here' : 'Drag & drop or click to upload filled document'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">PDF, Word, Excel, Images up to {MAX_SIZE_MB}MB</p>
                    <input
                      ref={(el) => { fileInputRefs.current[doc.id] = el }}
                      type="file"
                      accept={ACCEPTED_TYPES}
                      className="hidden"
                      onChange={(e) => handleFileDrop(doc.id, e.target.files)}
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

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4 bg-slate-50">
          <p className="text-xs text-slate-500 hidden sm:block">
            All selected documents must be uploaded before submitting.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#1e3a8a] hover:bg-[#1d4ed8] text-white font-semibold gap-2 min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Bid
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
