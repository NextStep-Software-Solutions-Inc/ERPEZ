import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Search,
  ScrollText,
  FileText,
  Plus,
  Scale,
  Loader2,
  X,
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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import { toast } from 'sonner'
import {
  useCreateWhereasClauseTemplate,
  useDeleteWhereasClauseTemplate,
  useUpdateWhereasClauseTemplate,
  useWhereasClauseTemplates,
} from '../handlers/hooks'
import { CreateEditWhereasClauseDialog } from '../dialogs/CreateEditWhereasClauseDialog'
import type { WhereasClauseTemplate } from '../types'

export function ManageWhereasClausesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhereasClauseTemplate | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const { data: bacResolutionWhereasClauses, isPending } = useWhereasClauseTemplates({
    pathParams: {},
    queryParams: {},
  })
  const createTemplate = useCreateWhereasClauseTemplate()
  const updateTemplate = useUpdateWhereasClauseTemplate()
  const deleteTemplate = useDeleteWhereasClauseTemplate()

  const templates = useMemo<WhereasClauseTemplate[]>(() => {
    if (!bacResolutionWhereasClauses) return []
    if (Array.isArray(bacResolutionWhereasClauses.data)) {
      return bacResolutionWhereasClauses.data
    }
    if (Array.isArray(bacResolutionWhereasClauses)) {
      return bacResolutionWhereasClauses
    }
    return []
  }, [bacResolutionWhereasClauses])

  const filteredTemplates = useMemo(() => {
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.body.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [templates, searchTerm])

  const handleOpenCreateModal = () => {
    setEditingTemplate(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (template: WhereasClauseTemplate) => {
    setEditingTemplate(template)
    setIsModalOpen(true)
  }


  const handleSaveTemplate = async (name: string, body: string, id?: string) => {
    if (id) {
      // Update existing template
      await updateTemplate.mutateAsync({
        pathParams: { id },
        payload: { name, body },
      })
      toast.success('WHEREAS Clause template updated successfully.')
    } else {
      // Create new template
      await createTemplate.mutateAsync({
        pathParams: {},
        payload: { name, body },
      })
      toast.success('WHEREAS Clause template created successfully.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTargetId) return
    try {
      await deleteTemplate.mutateAsync({
        pathParams: { id: deleteTargetId },
      })
      if (editingTemplate?.id === deleteTargetId) {
        setEditingTemplate(null)
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
    <PageContainerDashtail mode="simple" contentType="default">
      <div className="w-full space-y-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-default-200 pb-4">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigate({ to: '/v2/bac-resolutions' })}
              className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1.5 -ml-2 mb-1 text-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to BAC Resolutions
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  WHEREAS Clause Repository
                </h1>
                <p className="text-xs text-muted-foreground">
                  Standard legal clause repository and template manager for BAC Resolutions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Badge variant="outline" className="h-8 px-3 py-1 font-semibold text-xs gap-1.5">
              <ScrollText className="h-3.5 w-3.5" />
              {templates.length} Active Templates
            </Badge>
            <Button onClick={handleOpenCreateModal} size="sm" className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Clause Template
            </Button>
          </div>
        </div>

        {/* Full-Width Table Card */}
        <Card className="border border-default-200 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                All WHEREAS Clauses
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Browse, search, and manage standard legal clauses available for BAC Resolutions.
              </CardDescription>
            </div>

            {/* Search Filter */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clause by title or text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground space-y-3">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                <span>Loading clause repository...</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-sm text-muted-foreground space-y-3">
                <ScrollText className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="font-semibold text-foreground">
                    {searchTerm ? 'No matching clause templates' : 'No clause templates found'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {searchTerm
                      ? `No clauses match "${searchTerm}". Try a different keyword.`
                      : 'Create your first standard legal clause to populate the repository.'}
                  </p>
                </div>
                {searchTerm ? (
                  <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={handleOpenCreateModal} size="sm" className="gap-1.5">
                    <Plus className="h-4 w-4" /> Create First Clause
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-default-50/80">
                    <TableRow>
                      <TableHead className="w-[280px]">Clause Title / Reference</TableHead>
                      <TableHead>Clause Legal Body</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id} className="hover:bg-default-50/60 transition-colors">
                        <TableCell className="align-top font-bold text-sm text-default-900">
                          <div className="space-y-1">
                            <span>{template.name}</span>
                            <div className="text-[11px] font-normal text-muted-foreground font-mono">
                              ID: {template.id.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <p className="font-serif text-xs text-default-700 leading-relaxed line-clamp-3 max-w-3xl">
                            {template.body}
                          </p>
                        </TableCell>
                        <TableCell className="align-top text-right">
                          <div className="flex items-center justify-end gap-1">

                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit clause"
                              onClick={() => handleOpenEditModal(template)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete clause"
                              onClick={() => setDeleteTargetId(template.id)}
                              className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create / Edit Dialog Modal */}
        <CreateEditWhereasClauseDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          template={editingTemplate}
          onSave={handleSaveTemplate}
          isSubmitting={createTemplate.isPending || updateTemplate.isPending}
        />

        {/* Delete Confirmation Alert Dialog */}
        <ConfirmAlertDialog
          open={Boolean(deleteTargetId)}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
          title="Delete WHEREAS Clause Template?"
          description="Are you sure you want to delete this clause template from the repository? This action cannot be undone."
          confirmLabel="Delete Template"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>
    </PageContainerDashtail>
  )
}

