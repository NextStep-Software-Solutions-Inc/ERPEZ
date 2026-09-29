import { useState } from 'react'
import { ResponsiveDialog } from '@/components/ResponsiveDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  ShieldCheck, 
  FileText, 
  Paperclip, 
  AlertCircle, 
  CheckCircle2, 
  Hash,
  User,
  Eye
} from 'lucide-react'
import { formatCurrencyPHP } from '@/utils/formatters'
import type { DirectContracting } from '../types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: DirectContracting | null
}

export function ViewProposalDetailsModal({ open, onOpenChange, entry }: Props) {
  const [activePreview, setActivePreview] = useState<{ url: string; title: string } | null>(null)

  if (!entry) return null

  // Use values from entry if available, otherwise fallback to defaults
  const exclusivityProof = {
    fileName: entry.exclusivityProofFileName || 'Exclusivity_Proof.pdf',
    url: entry.exclusivityProofUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
  const distCert = {
    fileName: entry.soleDistCertFileName || 'Sole_Distributorship_Certificate.pdf',
    url: entry.soleDistCertUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={`Proposal Details - ${entry.dcNumber}`}
        description={`Submitted by ${entry.supplierName}`}
        size="4xl"
      >
        <div className="space-y-6">
          {/* Header Status */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900 uppercase tracking-tight">Proposal & Exclusivity Verified</p>
                <p className="text-xs text-emerald-700">All mandatory documents under RA 12009 Rule XVI are present.</p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">RECEIVED</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: General Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <FileText className="h-4 w-4" /> Procurement Context
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">BAC Resolution</p>
                  <p className="font-semibold flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-primary" /> {entry.bacResolutionNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Purchase Request</p>
                  <p className="font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-primary" /> {entry.prNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Office</p>
                  <p className="font-semibold">{entry.office}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="font-semibold">{entry.deadline}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                  <User className="h-4 w-4" /> Supplier Information
                </h3>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-lg font-bold text-slate-900">{entry.supplierName}</p>
                    <p className="text-xs text-slate-500">Verified Exclusive Supplier</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-slate-600">Offered Amount:</span>
                      <span className="text-lg font-bold text-primary">{formatCurrencyPHP(entry.totalABC)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Proposals & Proof */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Proof of Exclusivity
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white group hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px]">{exclusivityProof.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">MANDATORY DOCUMENT</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary"
                    onClick={() => setActivePreview({ url: exclusivityProof.url, title: 'Proof of Exclusivity' })}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-white group hover:border-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px]">{distCert.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">SUPPORTING CERTIFICATE</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary"
                    onClick={() => setActivePreview({ url: distCert.url, title: 'Sole Distributorship Certificate' })}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2 mb-2">
                  <Paperclip className="h-4 w-4" /> Supplier Notes
                </h3>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-900 italic">
                  {entry.proposalNotes || "No additional notes provided by the supplier."}
                </div>
              </div>
              
              <div className="pt-2">
                <div className="p-4 bg-slate-900 text-white rounded-lg">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Proposed Amount</p>
                  <p className="text-2xl font-bold">{formatCurrencyPHP(entry.proposalAmount || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveDialog>

      {/* Document Preview Dialog */}
      <ResponsiveDialog
        open={!!activePreview}
        onOpenChange={(v) => !v && setActivePreview(null)}
        title={activePreview?.title || 'Preview'}
        size="5xl"
      >
        <div className="h-[70vh] flex flex-col">
          {activePreview?.url ? (
            <iframe 
              src={activePreview.url} 
              className="w-full h-full border rounded-md" 
              title={activePreview.title}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
              <p>Document preview not available</p>
            </div>
          )}
        </div>
      </ResponsiveDialog>
    </>
  )
}
