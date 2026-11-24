import { format, parseISO } from 'date-fns'
import { CheckCircle, Download, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'
import type { BiddingAwardRecommendationResponse } from '../types/bidEvaluationApi.types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BacResolutionModalProps {
  isOpen: boolean
  onClose: () => void
  projectName?: string
  abc?: number
  awardRecommendation?: BiddingAwardRecommendationResponse | null
  draft?: {
    resolutionNumber: string
    projectName: string
    abc: number
    winningSupplier: string
    lcrbAmount: number
    draftedAt: string
  }
}

export function BacResolutionModal({
  isOpen,
  onClose,
  projectName = 'Procurement Project',
  abc = 0,
  awardRecommendation,
  draft,
}: BacResolutionModalProps) {
  const resolutionNumber =
    awardRecommendation?.resolutionNumber ||
    draft?.resolutionNumber ||
    'BAC-RES-2026-002'

  const winningSupplier =
    awardRecommendation?.winningSupplierName ||
    draft?.winningSupplier ||
    'Techstart Inc.'

  const awardedAmount = awardRecommendation?.awardedAmount ?? draft?.lcrbAmount ?? 0
  const effectiveProjectName = projectName || draft?.projectName || 'Procurement Project'
  const effectiveAbc = abc || draft?.abc || 0
  const dateResolved = awardRecommendation?.recommendedAt || draft?.draftedAt || new Date().toISOString()
  const awardCriterion =
    awardRecommendation?.awardCriterion === 'MEARB'
      ? 'Most Economically Advantageous Responsive Bid (MEARB)'
      : 'Lowest Calculated Responsive Bid (LCRB)'

  const formatDate = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'MMMM dd, yyyy')
    } catch {
      return isoString
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(val)
  }

  const handlePrint = () => {
    const winPrint = window.open('', '', 'left=0,top=0,width=850,height=950,toolbar=0,scrollbars=0,status=0')
    if (!winPrint) return

    const formattedAbc = formatCurrency(effectiveAbc)
    const formattedAmount = formatCurrency(awardedAmount)
    const formattedDate = formatDate(dateResolved)

    winPrint.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BAC Resolution No. ${resolutionNumber}</title>
          <style>
            @page {
              size: letter portrait;
              margin: 20mm 18mm 20mm 18mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              line-height: 1.55;
              color: #000;
              margin: 0;
              padding: 10px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .rep-title {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10pt;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0 0 3px 0;
              color: #333;
            }
            .bac-heading {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin: 0 0 3px 0;
              color: #0f4c81;
            }
            .office-sub {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 9pt;
              color: #555;
              margin: 0;
            }
            .res-num-box {
              text-align: center;
              margin: 18px 0 12px 0;
              font-family: Arial, Helvetica, sans-serif;
            }
            .res-no {
              font-size: 12pt;
              font-weight: 800;
              text-transform: uppercase;
              margin: 0;
            }
            .series-no {
              font-size: 9.5pt;
              font-style: italic;
              color: #555;
              margin: 2px 0 0 0;
            }
            .subject-box {
              text-align: center;
              font-family: Arial, Helvetica, sans-serif;
              font-weight: bold;
              font-size: 10.5pt;
              text-transform: uppercase;
              margin: 16px auto 20px auto;
              padding: 8px 14px;
              border-top: 1px dashed #666;
              border-bottom: 1px dashed #666;
              max-width: 90%;
              line-height: 1.4;
            }
            .clauses {
              text-align: justify;
              text-justify: inter-word;
            }
            .whereas-clause {
              text-indent: 2.5em;
              margin-bottom: 12px;
              line-height: 1.6;
            }
            .resolved-section {
              margin-top: 16px;
              margin-bottom: 14px;
            }
            .resolved-lead {
              text-indent: 2.5em;
              margin-bottom: 8px;
            }
            .resolved-list {
              margin: 6px 0 12px 0;
              padding-left: 3em;
            }
            .resolved-list li {
              margin-bottom: 8px;
              line-height: 1.5;
            }
            .resolved-date {
              text-align: right;
              font-style: italic;
              font-size: 10pt;
              margin: 20px 0 30px 0;
            }
            .signatories-container {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-top: 25px;
            }
            .sig-label {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 9.5pt;
              font-weight: bold;
              text-transform: uppercase;
              color: #444;
              margin-bottom: 15px;
            }
            .sig-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 30px 25px;
              margin: 0 auto;
            }
            .sig-cell {
              width: 50%;
              text-align: center;
              vertical-align: top;
            }
            .sig-name {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10pt;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1.5px solid #000;
              padding-bottom: 4px;
              margin: 0 auto;
              display: inline-block;
              min-width: 220px;
            }
            .sig-title {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 8.5pt;
              color: #555;
              margin-top: 3px;
            }
            .hope-container {
              page-break-inside: avoid;
              break-inside: avoid;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
            }
            .hope-box {
              margin-top: 25px;
              text-align: left;
              max-width: 260px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="rep-title">Republic of the Philippines</div>
            <div class="bac-heading">BIDS AND AWARDS COMMITTEE</div>
            <div class="office-sub">Procurement & Secretariat Services Office</div>
          </div>

          <div class="res-num-box">
            <div class="res-no">BAC RESOLUTION NO. ${resolutionNumber}</div>
            <div class="series-no">Series of 2026</div>
          </div>

          <div class="subject-box">
            RESOLUTION RECOMMENDING AWARD OF CONTRACT TO "${winningSupplier}" FOR "${effectiveProjectName}"
          </div>

          <div class="clauses">
            <p class="whereas-clause">
              <strong>WHEREAS</strong>, the Bids and Awards Committee (BAC) advertised the Invitation to Bid for the project
              <em>"${effectiveProjectName}"</em> with an Approved Budget for the Contract (ABC) of
              <strong>${formattedAbc}</strong>, and posted the same in PhilGEPS, the agency website, and conspicuous places within the agency premises;
            </p>
            <p class="whereas-clause">
              <strong>WHEREAS</strong>, in response to the said advertisements, eligible suppliers submitted technical and financial bids which were subsequently opened and evaluated in accordance with the prescribed procurement guidelines;
            </p>
            <p class="whereas-clause">
              <strong>WHEREAS</strong>, upon detailed arithmetic evaluation and ranking of bids,
              <strong>${winningSupplier}</strong> was determined to have submitted the calculated responsive bid with an evaluated contract amount of
              <strong>${formattedAmount}</strong>;
            </p>
            <p class="whereas-clause">
              <strong>WHEREAS</strong>, the BAC Technical Working Group (TWG) conducted a comprehensive post-qualification review, thoroughly verifying all original statutory eligibility documents, technical specifications, and past project performance;
            </p>
            <p class="whereas-clause">
              <strong>WHEREAS</strong>, <strong>${winningSupplier}</strong> passed all verification criteria and satisfied all requirements set forth in the Bidding Documents, thereby establishing its bid as the
              <strong>${awardCriterion}</strong>;
            </p>
          </div>

          <div class="resolved-section">
            <p class="resolved-lead">
              <strong>NOW, THEREFORE</strong>, We, the Members of the Bids and Awards Committee, hereby
              <strong>RESOLVE</strong> as it is hereby <strong>RESOLVED</strong>:
            </p>
            <ol type="a" class="resolved-list">
              <li>
                To declare <strong>${winningSupplier}</strong> as the winning supplier for the contract
                <em>"${effectiveProjectName}"</em>; and
              </li>
              <li>
                To recommend to the Head of the Procuring Entity (HoPE) the approval of the award of contract to
                <strong>${winningSupplier}</strong> at its calculated responsive contract price of
                <strong>${formattedAmount}</strong>.
              </li>
            </ol>
          </div>

          <div class="resolved-date">
            RESOLVED, at the BAC Secretariat Office, this ${formattedDate}.
          </div>

          <div class="signatories-container">
            <div class="sig-label">THE BIDS AND AWARDS COMMITTEE:</div>
            <table class="sig-table">
              <tr>
                <td class="sig-cell">
                  <div class="sig-name">ATTY. CARLOS J. VILLAROMAN</div>
                  <div class="sig-title">BAC Chairperson</div>
                </td>
                <td class="sig-cell">
                  <div class="sig-name">ENGRI. MARIA ELENA L. CRUZ</div>
                  <div class="sig-title">BAC Vice-Chairperson</div>
                </td>
              </tr>
              <tr>
                <td class="sig-cell">
                  <div class="sig-name">MR. DOMINADOR A. SANTOS</div>
                  <div class="sig-title">BAC Regular Member</div>
                </td>
                <td class="sig-cell">
                  <div class="sig-name">MS. LOURDES M. REYES</div>
                  <div class="sig-title">BAC Provisional Member</div>
                </td>
              </tr>
            </table>
          </div>

          <div class="hope-container">
            <div class="sig-label">APPROVED BY:</div>
            <div class="hope-box">
              <div class="sig-name">HON. GREGORIO F. ALCANTARA</div>
              <div class="sig-title">Head of the Procuring Entity (HoPE)</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `)
    winPrint.document.close()
    winPrint.focus()

    toast.info('Opening browser print dialogue for BAC Resolution.')
  }

  const handleDownload = () => {
    const documentText = `
BIDS AND AWARDS COMMITTEE (BAC)
RESOLUTION NO. ${resolutionNumber}

RESOLUTION RECOMMENDING AWARD OF CONTRACT FOR:
"${effectiveProjectName}"

WHEREAS, the Approved Budget for the Contract (ABC) is PHP ${effectiveAbc.toLocaleString('en-US', { minimumFractionDigits: 2 })};
WHEREAS, after eligibility check, technical, and financial evaluation, the supplier ${winningSupplier} was declared as the ${awardCriterion} with an evaluated bid amount of PHP ${awardedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })};
WHEREAS, the BAC Secretariat and TWG successfully completed the post-qualification verification checking all original statutory documents;
WHEREAS, the bidder has successfully passed all post-qualification metrics without disqualification;

NOW, THEREFORE, We, the members of the Bids and Awards Committee, hereby RESOLVE, as it is hereby RESOLVED:
a) To declare ${winningSupplier} as the winning bidder for ${effectiveProjectName};
b) To recommend to the Head of the Procuring Entity (HoPE) the award of the contract to ${winningSupplier} at its calculated responsive bid price of PHP ${awardedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.

RESOLVED, at the BAC Secretariat Office on ${formatDate(dateResolved)}.
    `

    const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `BAC_Resolution_${resolutionNumber}.txt`
    link.click()
    URL.revokeObjectURL(url)

    toast.success('The BAC Resolution text draft was downloaded successfully.')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-6 w-6 text-success" />
            <DialogTitle className="text-xl font-bold">Official BAC Award Resolution Preview</DialogTitle>
          </div>
        </DialogHeader>

        {/* Formal document preview */}
        <div className="flex-1 overflow-y-auto my-4 p-6 border rounded-lg bg-white text-black shadow-inner font-serif">
          <div id="bac-resolution-document" className="max-w-[700px] mx-auto text-sm leading-relaxed space-y-6">
            
            {/* Letterhead */}
            <div className="text-center font-sans space-y-1 pb-4 border-b border-gray-300">
              <h3 className="font-bold text-base tracking-wide uppercase text-gray-800">Republic of the Philippines</h3>
              <h2 className="font-bold text-lg text-primary-600">BIDS AND AWARDS COMMITTEE</h2>
              <p className="text-xs text-gray-500">Procurement & Secretariat Services Office</p>
            </div>

            {/* Title / Resolution Number */}
            <div className="text-center font-sans pt-2">
              <h4 className="font-extrabold text-base uppercase text-gray-900">BAC RESOLUTION NO. {resolutionNumber}</h4>
              <p className="text-xs text-gray-600 font-medium italic">Series of 2026</p>
            </div>

            {/* Title Header text */}
            <div className="text-center font-bold text-sm tracking-normal uppercase max-w-[550px] mx-auto px-4 py-2 border-y border-dashed border-gray-300">
              RESOLUTION RECOMMENDING AWARD OF CONTRACT TO "{winningSupplier}" FOR "{effectiveProjectName}"
            </div>

            {/* Whereas clauses */}
            <div className="space-y-4 text-justify font-serif text-[13px] indent-8">
              <p>
                <strong>WHEREAS</strong>, the Bids and Awards Committee (BAC) advertised the Invitation to Bid for the project 
                <em> "{effectiveProjectName}"</em> with an Approved Budget for the Contract (ABC) of 
                <strong> {formatCurrency(effectiveAbc)}</strong>, and posted the same in PhilGEPS, the agency website, and conspicuous places;
              </p>
              <p>
                <strong>WHEREAS</strong>, in response to the said advertisements, eligible suppliers submitted bids which were subsequently opened and calculated;
              </p>
              <p>
                <strong>WHEREAS</strong>, upon evaluation and sorting of eligibility, 
                <strong> {winningSupplier}</strong> was identified as having the calculated responsive bid with an evaluated amount of 
                <strong> {formatCurrency(awardedAmount)}</strong>;
              </p>
              <p>
                <strong>WHEREAS</strong>, the BAC Technical Working Group (TWG) conducted a meticulous post-qualification review and validated all submitted licenses, tax clearance certificates, and performance records;
              </p>
              <p>
                <strong>WHEREAS</strong>, the bidder passed all verification criteria, meeting all requirements and conditions prescribed in the bidding documents, thereby establishing the bid as the 
                <strong> {awardCriterion}</strong>;
              </p>
            </div>

            {/* Resolved Section */}
            <div className="space-y-4 text-justify font-serif text-[13px] indent-8">
              <p>
                <strong>NOW, THEREFORE</strong>, We, the Members of the Bids and Awards Committee, hereby 
                <strong> RESOLVE</strong> as it is hereby 
                <strong> RESOLVED</strong>:
              </p>
              <ol className="list-[lower-alpha] pl-8 space-y-2 indent-0 font-medium">
                <li>
                  To declare <strong>{winningSupplier}</strong> as the winning supplier for the contract 
                  <em> "{effectiveProjectName}"</em>; and
                </li>
                <li>
                  To recommend to the Head of the Procuring Entity (HoPE) the approval of award of the contract to 
                  <strong> {winningSupplier}</strong> at its calculated contract price of 
                  <strong> {formatCurrency(awardedAmount)}</strong>.
                </li>
              </ol>
            </div>

            {/* Date and Location */}
            <p className="text-right text-[12px] font-sans italic pt-4">
              RESOLVED, at the BAC Secretariat Office, {formatDate(dateResolved)}.
            </p>

            {/* Signature Block */}
            <div className="pt-6 font-sans space-y-6">
              <p className="font-bold text-xs uppercase text-gray-700">THE BIDS AND AWARDS COMMITTEE:</p>
              
              <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                <div className="text-center">
                  <div className="border-b border-gray-400 font-bold text-xs uppercase pt-2">ATTY. CARLOS J. VILLAROMAN</div>
                  <div className="text-[10px] text-gray-500">BAC Chairperson</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 font-bold text-xs uppercase pt-2">ENGRI. MARIA ELENA L. CRUZ</div>
                  <div className="text-[10px] text-gray-500">BAC Vice-Chairperson</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 font-bold text-xs uppercase pt-2">MR. DOMINADOR A. SANTOS</div>
                  <div className="text-[10px] text-gray-500">BAC Regular Member</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 font-bold text-xs uppercase pt-2">MS. LOURDES M. REYES</div>
                  <div className="text-[10px] text-gray-500">BAC Provisional Member</div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <p className="text-[11px] font-bold text-gray-500 uppercase">APPROVED BY:</p>
                <div className="mt-8 text-center max-w-[280px]">
                  <div className="border-b border-gray-400 font-bold text-xs uppercase pt-2">HON. GREGORIO F. ALCANTARA</div>
                  <div className="text-[10px] text-gray-500">Head of the Procuring Entity (HoPE)</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <DialogFooter className="border-t border-default-100 pt-4 flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download Draft
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print Resolution
          </Button>
          <Button className="gap-2" onClick={onClose}>
            <FileText className="h-4 w-4" /> Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
