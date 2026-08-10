import { Input } from '@/components/ui/input'

type PurchaseOrderApprovalFormProps = {
  signedDocument: File | null
  onSignedDocumentChange: (file: File | null) => void
}

export function PurchaseOrderApprovalForm({
  signedDocument,
  onSignedDocumentChange,
}: PurchaseOrderApprovalFormProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-default-700">
        Signed PO document
      </label>
      <Input
        type="file"
        accept=".pdf"
        onChange={(event) =>
          onSignedDocumentChange(event.target.files?.[0] ?? null)
        }
      />
      <p className="text-xs text-default-500">
        {signedDocument
          ? `Selected file: ${signedDocument.name}`
          : 'Upload the physically signed PO PDF before approval.'}
      </p>
    </div>
  )
}
