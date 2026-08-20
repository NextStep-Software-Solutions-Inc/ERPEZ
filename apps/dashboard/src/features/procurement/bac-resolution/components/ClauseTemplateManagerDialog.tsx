import { useEffect, useMemo, useState } from 'react'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import {
  useCreateWhereasClauseTemplate,
  useDeleteWhereasClauseTemplate,
  useUpdateWhereasClauseTemplate,
  useWhereasClauseTemplates,
} from '../handlers/hooks'

interface ClauseTemplateManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyDraft = {
  id: '',
  name: '',
  body: '',
}

export function ClauseTemplateManagerDialog({
  open,
  onOpenChange,
}: ClauseTemplateManagerDialogProps) {
  const [draft, setDraft] = useState<{
    id: string
    name: string
    body: string
  }>(emptyDraft)

  function handleCancel(): void {
    throw new Error('Function not implemented.')
  }

  function saveTemplate(): void {
    throw new Error('Function not implemented.')
  }

  function setSelectedTemplateId(arg0: null) {
    throw new Error('Function not implemented.')
  }

  function setDeleteTargetId(id: any) {
    throw new Error('Function not implemented.')
  }

  function removeTemplate(deleteTargetId: any): void {
    throw new Error('Function not implemented.')
  }

  function setShowUpdateConfirm(arg0: boolean) {
    throw new Error('Function not implemented.')
  }

  function confirmUpdateTemplate(): void {
    throw new Error('Function not implemented.')
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Manage WHEREAS Clause Templates"
      description="Create, edit, and reuse standard legal justification clauses for BAC Resolutions."
      size="xl"
      showCloseButton
      footer={
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={saveTemplate}>
            {draft.id ? 'Save clause' : 'Create clause'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="border-default-200 shadow-sm">
          <CardHeader className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="whitespace-nowrap">Clauses</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTemplateId(null)
                setDraft(emptyDraft)
              }}
            >
              <Plus className="h-4 w-4" />
              New clause
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <></>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-default-200 shadow-sm">
            <CardHeader>
              <CardTitle>
                {draft.id
                  ? 'Edit Clause Template'
                  : 'Create New Clause Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="clause-template-name">Template name</Label>
                <Input
                  id="clause-template-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clause-template-body">Template body</Label>
                <Textarea
                  id="clause-template-body"
                  value={draft.body}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      body: event.target.value,
                    }))
                  }
                  className="min-h-[220px]"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="rounded-lg border border-dashed border-default-300 bg-default-50 p-4 text-sm text-muted-foreground">
            Templates are reusable clause bodies. Edits do not change clauses
            already saved against existing BAC Resolutions.
          </div>
        </div>
      </div>
      <ConfirmAlertDialog
        open={false}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        title="Delete WHEREAS Clause"
        description="Are you sure you want to delete this clause template? This action cannot be undone."
        confirmLabel="Delete clause"
        cancelLabel="Cancel"
        onConfirm={() => {}}
        onCancel={() => setDeleteTargetId(null)}
      />
      <ConfirmAlertDialog
        open={false}
        onOpenChange={(open) => {
          if (!open) setShowUpdateConfirm(false)
        }}
        title="Update WHEREAS Clause"
        description="Are you sure you want to update this clause? Existing saved text will be replaced."
        confirmLabel="Update clause"
        cancelLabel="Cancel"
        onConfirm={confirmUpdateTemplate}
        onCancel={() => setShowUpdateConfirm(false)}
      />
    </ResponsiveDialogDashtail>
  )
}
