import { Printer, Download, CheckCircle, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { BacResolutionDraft } from '../types';

interface BacResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft?: BacResolutionDraft;
}

export function BacResolutionModal({ isOpen, onClose, draft }: BacResolutionModalProps) {
  const { toast } = useToast();

  if (!draft) return null;

  const formatDate = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'MMMM dd, yyyy');
    } catch {
      return isoString;
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('bac-resolution-document');
    if (!printContent) return;

    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (!winPrint) return;

    winPrint.document.write(`
      <html>
        <head>
          <title>Print BAC Resolution</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.5; color: #000; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-weight: bold; font-size: 16px; text-transform: uppercase; margin-bottom: 20px; text-align: center; }
            .content { text-align: justify; margin-bottom: 20px; font-size: 14px; }
            .table-container { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 13px; }
            th { background-color: #f2f2f2; }
            .signatures { margin-top: 50px; display: flex; justify-content: space-between; }
            .sig-block { text-align: center; width: 45%; }
            .line { border-top: 1px solid black; margin-top: 40px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    winPrint.document.close();
    winPrint.focus();

    toast({
      title: 'Sent to print queue',
      description: 'Opening browser print dialogue for BAC Resolution.',
    });
  };

  const handleDownload = () => {
    // FE Mock download
    const documentText = `
BIDS AND AWARDS COMMITTEE (BAC)
RESOLUTION NO. ${draft.resolutionNumber}

RESOLUTION RECOMMENDING AWARD OF CONTRACT FOR:
"${draft.projectName}"

WHEREAS, the Approved Budget for the Contract (ABC) is PHP ${draft.abc.toLocaleString('en-US', { minimumFractionDigits: 2 })};
WHEREAS, after eligibility check, technical, and financial evaluation, the supplier ${draft.winningSupplier} was declared as the Lowest Calculated Responsive Bid (LCRB) with a bid amount of PHP ${draft.lcrbAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })};
WHEREAS, the BAC Secretariat and TWG successfully completed the dual post-qualification verification timeline checking all original statutory documents;
WHEREAS, the bidder has successfully passed all post-qualification metrics without disqualification;

NOW, THEREFORE, We, the members of the Bids and Awards Committee, hereby RESOLVE, as it is hereby RESOLVED:
a) To declare ${draft.winningSupplier} as the winning bidder for ${draft.projectName};
b) To recommend to the Head of the Procuring Entity (HoPE) the award of the contract to ${draft.winningSupplier} at its calculated responsive bid price of PHP ${draft.lcrbAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}.

RESOLVED, at the BAC Secretariat Office on ${formatDate(draft.draftedAt)}.
    `;

    const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BAC_Resolution_${draft.resolutionNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Draft Downloaded',
      description: 'The BAC Resolution text draft was downloaded successfully.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-6 w-6 text-success" />
            <DialogTitle className="text-xl font-bold">Recommend for Award & Draft BAC Resolution</DialogTitle>
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
              <h4 className="font-extrabold text-base uppercase text-gray-900">BAC RESOLUTION NO. {draft.resolutionNumber}</h4>
              <p className="text-xs text-gray-600 font-medium italic">Series of 2026</p>
            </div>

            {/* Title Header text */}
            <div className="text-center font-bold text-sm tracking-normal uppercase max-w-[550px] mx-auto px-4 py-2 border-y border-dashed border-gray-300">
              RESOLUTION RECOMMENDING AWARD OF CONTRACT TO "{draft.winningSupplier}" FOR "${draft.projectName}"
            </div>

            {/* Whereas clauses */}
            <div className="space-y-4 text-justify font-serif text-[13px] indent-8">
              <p>
                <strong>WHEREAS</strong>, the Bids and Awards Committee (BAC) advertised the Invitation to Bid for the project 
                <em> "{draft.projectName}"</em> with an Approved Budget for the Contract (ABC) of 
                <strong> PHP {draft.abc.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>, and posted the same in PhilGEPS, the agency website, and conspicuous places;
              </p>
              <p>
                <strong>WHEREAS</strong>, in response to the said advertisements, eligible suppliers submitted bids which were subsequently opened and calculated;
              </p>
              <p>
                <strong>WHEREAS</strong>, upon evaluation and sorting of eligibility, 
                <strong> {draft.winningSupplier}</strong> was identified as having the Lowest Calculated Bid (LCB) with a bid amount of 
                <strong> PHP {draft.lcrbAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>;
              </p>
              <p>
                <strong>WHEREAS</strong>, the BAC Technical Working Group (TWG) conducted a meticulous post-qualification review and validated all submitted licenses, tax clearance certificates, and performance records;
              </p>
              <p>
                <strong>WHEREAS</strong>, the bidder passed all verification criteria, meeting all requirements and conditions prescribed in the bidding documents, thereby establishing the bid as the 
                <strong> Lowest Calculated Responsive Bid (LCRB)</strong>;
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
                  To declare <strong>{draft.winningSupplier}</strong> as the winning supplier for the contract 
                  <em> "{draft.projectName}"</em>; and
                </li>
                <li>
                  To recommend to the Head of the Procuring Entity (HoPE) the approval of award of the contract to 
                  <strong> {draft.winningSupplier}</strong> at its calculated contract price of 
                  <strong> PHP {draft.lcrbAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>.
                </li>
              </ol>
            </div>

            {/* Date and Location */}
            <p className="text-right text-[12px] font-sans italic pt-4">
              RESOLVED, at the BAC Secretariat Office, {formatDate(draft.draftedAt)}.
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
            <FileText className="h-4 w-4" /> Finalize Resolution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
