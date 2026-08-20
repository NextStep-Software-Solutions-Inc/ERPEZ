import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Search,
  ScrollText,
  FileText,
  Sparkles,
} from 'lucide-react'
import { PageContainerDashtail } from '@/components/v2'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { toast } from 'sonner'
import {
  useCreateWhereasClauseTemplate,
  useDeleteWhereasClauseTemplate,
  useUpdateWhereasClauseTemplate,
  useWhereasClauseTemplates,
} from '../handlers/hooks'

const emptyDraft = {
  id: '',
  name: '',
  body: '',
}

export function ManageWhereasClausesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [draft, setDraft] = useState<{
    id: string
    name: string
    body: string
  }>(emptyDraft)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  )
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [showUpdateConfirm, setShowUpdateConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const { data: apiTemplates, isLoading: isTemplatesLoading } =
    useWhereasClauseTemplates({})
  const templates = [] as any[]
  const createTemplate = useCreateWhereasClauseTemplate()
  const updateTemplate = useUpdateWhereasClauseTemplate()
  const deleteTemplate = useDeleteWhereasClauseTemplate()

  const filteredTemplates = [] as any[]

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || null
  }, [templates, selectedTemplateId])

  useEffect(() => {
    if (selectedTemplate) {
      setDraft({
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        body: selectedTemplate.body,
      })
    }
  }, [selectedTemplate])

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.body.trim()) {
      toast.error('Template name and clause body are required.')
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
      toast.success('WHEREAS Clause template created.')
      setIsEditing(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create clause template.',
      )
    }
  }

  const confirmUpdate = async () => {
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
      setShowUpdateConfirm(false)
      toast.success('WHEREAS Clause template updated.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update clause template.',
      )
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await deleteTemplate.mutateAsync({
        pathParams: { id: deleteTargetId },
      })
      if (selectedTemplateId === deleteTargetId) {
        setSelectedTemplateId(null)
        setDraft(emptyDraft)
        setIsEditing(false)
      }
      setDeleteTargetId(null)
      toast.success('WHEREAS Clause template deleted.')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to delete clause template.',
      )
    }
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Top Header Card */}
      <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void navigate({ to: '/v2/bac-resolutions' })}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to BAC Resolutions
                </Button>
              </div>
              <CardTitle className="text-3xl">Manage WHEREAS Clauses</CardTitle>
              <CardDescription className="text-base">
                Standard legal clause repository and template manager for BAC
                Resolutions.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-fit px-3 py-1 font-semibold"
              >
                <ScrollText className="h-3.5 w-3.5 mr-1.5" /> Clause Repository
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <PageContainerDashtail mode="simple" contentType="default">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Clause Library List */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border border-default-200 shadow-sm">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Clause Templates ({filteredTemplates.length})
                  </CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clause by title or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {isTemplatesLoading ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Loading templates...
                  </p>
                ) : filteredTemplates.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-6 text-center text-sm text-muted-foreground">
                    No clause templates match your search query.
                  </div>
                ) : (
                  filteredTemplates.map((template) => {
                    const isSelected = selectedTemplateId === template.id
                    return (
                      <div
                        key={template.id}
                        onClick={() => handleSelectTemplate(template.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30'
                            : 'border-default-200 bg-white hover:border-primary/40 hover:bg-default-50/70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {template.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSelectTemplate(template.id)
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTargetId(template.id)
                              }}
                              className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-3 font-serif leading-relaxed">
                          {template.body}
                        </p>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Template Editor / Preview */}
          <div className="lg:col-span-7">
            <Card className="border border-default-200 shadow-sm sticky top-6">
              <CardHeader className="border-b border-default-100 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base font-semibold">
                      {draft.id
                        ? 'Edit WHEREAS Clause Template'
                        : 'Create New WHEREAS Clause'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {draft.id
                        ? 'Modify the title and body of this template across future BAC resolutions.'
                        : 'Define a reusable standard legal clause for BAC resolution documents.'}
                    </CardDescription>
                  </div>
                  {draft.id && (
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 text-xs"
                    >
                      Template ID: {draft.id}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="clause-title"
                    className="text-xs font-bold uppercase tracking-wider text-default-700"
                  >
                    Clause Title / Reference Name{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="clause-title"
                    placeholder="e.g., WHEREAS, Public Bidding Requirement (RA 9184)"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="text-sm font-medium"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Descriptive label used when selecting clauses during
                    resolution creation.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="clause-body"
                    className="text-xs font-bold uppercase tracking-wider text-default-700"
                  >
                    Clause Body Text <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="clause-body"
                    placeholder="Enter the formal legal clause body text here..."
                    value={draft.body}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, body: e.target.value }))
                    }
                    rows={8}
                    className="font-serif text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This exact text will be inserted into the formal printed BAC
                    Resolution document.
                  </p>
                </div>

                {/* Live Preview Box */}
                {draft.body.trim() && (
                  <div className="rounded-xl border border-default-200 bg-default-50/50 p-4 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Document Rendering Preview
                    </p>
                    <p className="text-xs font-serif leading-relaxed text-default-800 text-justify">
                      <span className="font-bold">
                        {draft.name || 'WHEREAS,'}{' '}
                      </span>
                      {draft.body}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-default-100">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDraft(emptyDraft)
                      setSelectedTemplateId(null)
                    }}
                    disabled={!draft.name && !draft.body}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!draft.name.trim() || !draft.body.trim()}
                    className="gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    {draft.id ? 'Save Template Changes' : 'Create Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainerDashtail>

      <ConfirmAlertDialog
        open={showUpdateConfirm}
        onOpenChange={setShowUpdateConfirm}
        title="Update WHEREAS Clause Template?"
        description="Are you sure you want to update this clause template? Changes will take effect for new resolution drafts."
        confirmLabel="Update Template"
        cancelLabel="Cancel"
        onConfirm={confirmUpdate}
      />

      <ConfirmAlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete WHEREAS Clause Template?"
        description="Are you sure you want to delete this template from the clause repository? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
