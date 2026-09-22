import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building } from 'lucide-react'
import { CreateDirectContractingModal } from '../components/CreateDirectContractingModal'
import { UpdateDirectContractingModal } from '../components/UpdateDirectContractingModal'
import { ViewProposalDetailsModal } from '../components/ViewProposalDetailsModal'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getDirectContractingsRequest } from '../handlers/getDirectContractingsRequest'

const useDirectContractings = createQueryHookFromTemplate(getDirectContractingsRequest)

export function DirectContractingRequestPage() {

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editEntryId, setEditEntryId] = useState<string | null>(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmSubmitId, setConfirmSubmitId] = useState<string | null>(null)


  return (
    <div className="space-y-6 pb-10">
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Direct Contracting</CardTitle>
              <CardDescription className="text-base">
                Single-source procurement for proprietary items. Strictly requires Proof of Exclusivity.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <Building className="h-3.5 w-3.5 mr-1.5" /> RA 12009 / Rule XVI
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Direct Contracting Dashboard</CardTitle>
              <CardDescription>List of Direct Contracting Requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
        </CardContent>
      </Card>

      <CreateDirectContractingModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
      {editEntryId && (
        <UpdateDirectContractingModal
          open={!!editEntryId}
          onOpenChange={(v) => {
            if (!v) setEditEntryId(null)
          }}
          editEntryId={editEntryId}
        />
      )}


      <ConfirmAlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(v) => !v && setConfirmDeleteId(null)}
        title="Delete Request?"
        description="Are you sure you want to delete this Direct Contracting request? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => setConfirmDeleteId(null)}
      />
      <ConfirmAlertDialog
        open={!!confirmSubmitId}
        onOpenChange={(v) => !v && setConfirmSubmitId(null)}
        title="Submit Request for Review?"
        description="Are you sure you want to submit this Direct Contracting request for review?"
        confirmLabel="Submit"
        onConfirm={() => setConfirmSubmitId(null)}
      />
    </div>
  )
}
