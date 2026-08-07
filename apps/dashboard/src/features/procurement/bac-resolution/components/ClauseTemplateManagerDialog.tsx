import { useEffect, useState } from 'react'
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
  const [draft, setDraft] = useState<{ id: string; name: string; body: string }>(
    emptyDraft,
  )
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  )
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)

  const { data: templates = [], isLoading: isTemplatesLoading } = useWhereasClauseTemplates({
    enabled: open,
  })
  const createTemplate = useCreateWhereasClauseTemplate()
  const updateTemplate = useUpdateWhereasClauseTemplate()
  const deleteTemplate = useDeleteWhereasClauseTemplate()

  useEffect(() => {
    if (!open) {
      setSelectedTemplateId(null)
      setDraft(emptyDraft)
      setDeleteTargetId(null)
      setShowUpdateConfirm(false)
    }
  }, [open])

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  )

  useEffect(() => {
    if (selectedTemplate) {
      setDraft({
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        body: selectedTemplate.body,
      })
    }
  }, [selectedTemplate])

  const saveTemplate = async () => {
    if (!draft.name.trim() || !draft.body.trim()) {
      toast.error('Template name and body are required.')
      return
    }

    if (draft.id) {
      setShowUpdateConfirm(true)
      return
    }

    try {
      const created = await createTemplate.mutateAsync({
        pathParams: {},
        payload: {
          name: draft.name,
          body: draft.body,
        },
      })
      setSelectedTemplateId(created.id)
      toast.success('Clause template created.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create clause template.',
      )
    }
  }

  const confirmUpdateTemplate = async () => {
    if (!draft.id) {
      setShowUpdateConfirm(false)
      return
    }

    try {
      const updated = await updateTemplate.mutateAsync({
        pathParams: { id: draft.id },
        payload: {
          name: draft.name,
          body: draft.body,
        },
      })
      setSelectedTemplateId(updated.id)
      toast.success('Clause template updated.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update clause template.',
      )
    } finally {
      setShowUpdateConfirm(false)
    }
  }

  const removeTemplate = async (templateId: string) => {
    try {
      await deleteTemplate.mutateAsync({
        pathParams: { id: templateId },
      })
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null)
        setDraft(emptyDraft)
      }
      toast.success('Clause template deleted.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete clause template.',
      )
    } finally {
      setDeleteTargetId(null)
    }
  }

  const handleCancel = () => {
    setSelectedTemplateId(null)
    setDraft(emptyDraft)
    setDeleteTargetId(null)
    setShowUpdateConfirm(false)
    onOpenChange(false)
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
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createTemplate.isPending || updateTemplate.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={saveTemplate}
            disabled={createTemplate.isPending || updateTemplate.isPending}
          >
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
              disabled={createTemplate.isPending || updateTemplate.isPending}
            >
              <Plus className="h-4 w-4" />
              New clause
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isTemplatesLoading ? (
              <p className="text-sm text-muted-foreground">Loading templates…</p>
            ) : templates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved WHEREAS clause templates yet.
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedTemplateId === template.id
                      ? 'border-primary/70 bg-primary/5'
                      : 'border-default-200 bg-white hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{template.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.body}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedTemplateId(template.id)
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          setDeleteTargetId(template.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-default-200 shadow-sm">
            <CardHeader>
              <CardTitle>
                {draft.id ? 'Edit Clause Template' : 'Create New Clause Template'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="clause-template-name">Template name</Label>
                <Input
                  id="clause-template-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clause-template-body">Template body</Label>
                <Textarea
                  id="clause-template-body"
                  value={draft.body}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, body: event.target.value }))
                  }
                  className="min-h-[220px]"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="rounded-lg border border-dashed border-default-300 bg-default-50 p-4 text-sm text-muted-foreground">
            Templates are reusable clause bodies. Edits do not change clauses already saved against existing BAC Resolutions.
          </div>
        </div>
      </div>
      <ConfirmAlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        title="Delete WHEREAS Clause"
        description="Are you sure you want to delete this clause template? This action cannot be undone."
        confirmLabel="Delete clause"
        cancelLabel="Cancel"
        loading={deleteTemplate.isPending}
        onConfirm={() => deleteTargetId && removeTemplate(deleteTargetId)}
        onCancel={() => setDeleteTargetId(null)}
      />
      <ConfirmAlertDialog
        open={showUpdateConfirm}
        onOpenChange={(open) => {
          if (!open) setShowUpdateConfirm(false)
        }}
        title="Update WHEREAS Clause"
        description="Are you sure you want to update this clause? Existing saved text will be replaced."
        confirmLabel="Update clause"
        cancelLabel="Cancel"
        loading={updateTemplate.isPending}
        onConfirm={confirmUpdateTemplate}
        onCancel={() => setShowUpdateConfirm(false)}
      />
    </ResponsiveDialogDashtail>
  )
}
