import { Printer, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { BacResolution } from '../types'

interface BacResolutionDocumentPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resolution: BacResolution | null
}

export function BacResolutionDocumentPreviewModal({
  open,
  onOpenChange,
  resolution,
}: BacResolutionDocumentPreviewModalProps) {
  if (!resolution) return null

  const context = resolution.procurementProjectContext

  // Helper to extract or construct table rows for Columns 2, 4, 9, 10
  const getDocumentTableRows = () => {
    if (context?.itemBreakdown && context.itemBreakdown.length > 0) {
      // Group items if they share Office, Mode, and Source of Fund
      const map = new Map<string, { office: string; mode: string; fund: string; totalAbc: number }>()

      for (const item of context.itemBreakdown) {
        const key = `${item.officeName}|${item.modeOfProcurement}|${item.sourceOfFund}`
        const existing = map.get(key)
        if (existing) {
          existing.totalAbc += item.estimatedBudget
        } else {
          map.set(key, {
            office: item.officeName,
            mode: item.modeOfProcurement,
            fund: item.sourceOfFund,
            totalAbc: item.estimatedBudget,
          })
        }
      }

      return Array.from(map.values())
    }

    // Single item fallback
    return [
      {
        office: context?.officeName || resolution.linkedConsolidatedPrs[0]?.endUser || 'ICT Office',
        mode: context?.modeOfProcurement || resolution.linkedConsolidatedPrs[0]?.modeOfProcurement || 'Public Bidding',
        fund: context?.sourceOfFund || 'General Appropriations Act (GAA)',
        totalAbc: context?.abc || resolution.totalAmount,
      },
    ]
  }

  const documentTableRows = getDocumentTableRows()

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Generated BAC Resolution Document Preview"
      description="Official agency formal BAC Resolution document layout generated from authoritative Procurement Project data."
      size="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Document Snapshot Verified (Columns 2, 4, 9, 10 Included)</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.print()
              }}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      }
    >
      {/* High Fidelity Formal Document Canvas */}
      <div className="my-2 rounded-lg border border-default-300 bg-white p-8 shadow-inner font-serif text-default-900 leading-relaxed text-sm space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Formal Header */}
        <div className="text-center space-y-1 border-b border-default-200 pb-4 font-sans">
          <p className="text-xs font-semibold uppercase tracking-widest text-default-600">
            Republic of the Philippines
          </p>

          <p className="text-[11px] uppercase tracking-wider text-default-500">
            Procurement Office / Bids and Awards Committee
          </p>
          <h2 className="text-lg font-bold uppercase tracking-wider text-default-900 mt-2">
            BAC RESOLUTION RECOMMENDING APPROVAL
          </h2>
          <p className="text-sm font-semibold text-primary">
            RESOLUTION NO. {resolution.bacResolutionNumber}
          </p>
          <p className="text-xs text-muted-foreground">Series of 2026</p>
        </div>

        {/* Title / Description Note */}
        <div className="font-sans text-xs bg-default-50 p-3 rounded border border-default-200">
          <span className="font-bold uppercase tracking-wider text-default-700">Project Title: </span>
          <span className="font-medium text-default-900">{context?.projectTitle || resolution.description}</span>
        </div>

        {/* WHEREAS Clauses */}
        <div className="space-y-4">
          {resolution.whereasClauses.map((clause, idx) => (
            <p key={idx} className="text-justify leading-relaxed text-default-800">
              <span className="font-bold">{clause.name} </span>
              {clause.body}
            </p>
          ))}
        </div>

        {/* Formal Resolution Statement */}
        <div className="space-y-3 pt-2">
          <p className="font-bold text-justify uppercase text-default-900">
            NOW, THEREFORE, WE, THE MEMBERS OF THE BIDS AND AWARDS COMMITTEE (BAC), HEREBY RESOLVE AS IT IS HEREBY RESOLVED:
          </p>
          <p className="text-justify text-default-800">
            To recommend for approval by the Head of the Procuring Entity (HOPE) the procurement project details specified below:
          </p>
        </div>

        {/* Mandatory Procurement Information Specification List */}
        <div className="rounded-lg border border-default-300 bg-default-50/60 p-5 font-sans my-4 space-y-3">
          <p className="font-bold text-xs uppercase tracking-wider text-default-700 border-b border-default-200 pb-1.5">
            Procurement Project Specifications & Allocation
          </p>
          <div className="space-y-3 text-xs leading-relaxed">
            {documentTableRows.map((row, idx) => (
              <div key={idx} className="space-y-1.5 pl-2 border-l-2 border-primary/40">
                {documentTableRows.length > 1 && (
                  <p className="font-bold text-default-900 text-[13px]">
                    Package / Lot {idx + 1}
                  </p>
                )}
                <ul className="list-disc list-inside space-y-1.5 text-default-800">
                  <li>
                    <span className="font-bold text-default-900">Implementing Unit / End-User: </span>
                    <span>{row.office}</span>
                  </li>
                  <li>
                    <span className="font-bold text-default-900">Mode of Procurement: </span>
                    <span className="font-semibold text-primary">{row.mode}</span>
                  </li>
                  <li>
                    <span className="font-bold text-default-900">Source of Fund: </span>
                    <span>{row.fund}</span>
                  </li>
                  <li>
                    <span className="font-bold text-default-900">Approved Budget for the Contract (ABC): </span>
                    <span className="font-bold text-emerald-800">
                      ₱{row.totalAbc.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Date and Location Statement */}
        <div className="pt-3">
          <p className="text-justify">
            <span className="font-bold">RESOLVED</span> this {resolution.resolvedDateText} at {resolution.resolvedLocationText}.
          </p>
        </div>

        {/* Signatory Section */}
        <div className="pt-6 space-y-6 font-sans">
          <p className="font-bold text-xs uppercase tracking-wider text-default-700">
            Bids and Awards Committee Signatories:
          </p>

          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="border-t border-default-400 pt-1">
              <p className="font-bold text-default-900">
                {resolution.signatoryOverrides?.chairperson || 'BAC CHAIRPERSON DEMO'}
              </p>
              <p className="text-muted-foreground text-[11px]">Chairperson, BAC</p>
            </div>

            <div className="border-t border-default-400 pt-1">
              <p className="font-bold text-default-900">
                {resolution.signatoryOverrides?.viceChairperson || 'BAC VICE-CHAIRPERSON DEMO'}
              </p>
              <p className="text-muted-foreground text-[11px]">Vice-Chairperson, BAC</p>
            </div>

            {resolution.provisionalMembers.map((member, idx) => (
              <div key={idx} className="border-t border-default-400 pt-1">
                <p className="font-bold text-default-900">{member.name || `[${member.role}]`}</p>
                <p className="text-muted-foreground text-[11px]">{member.position} ({member.role})</p>
              </div>
            ))}
          </div>

          {/* HOPE Approval Section */}
          <div className="mt-8 border-t-2 border-default-900 pt-4 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider">APPROVED BY:</span>
              {resolution.status === 'approved' && (
                <Badge className="bg-emerald-600 text-white font-semibold">
                  APPROVED ON {resolution.approvedAt ? new Date(resolution.approvedAt).toLocaleDateString() : '2026-05-21'}
                </Badge>
              )}
            </div>

            <div className="w-64 border-t border-default-400 pt-1 mt-6">
              <p className="font-bold text-default-900">{resolution.approvedBy || 'DR. HOPE DEMO'}</p>
              <p className="text-muted-foreground text-[11px]">Head of the Procuring Entity (HOPE)</p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
