import { CheckCircle2, Download, Eye, FolderOpen, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type {
  MasterDoc,
  Profile,
  Project,
  ProjectChecklistItem,
} from '../types'
import { getSortedChecklist } from '../utils'

interface ProjectChecklistTabProps {
  projects: Project[]
  currentProject: Project
  selectedProjectId: string
  profiles: Profile[]
  masterDocs: MasterDoc[]
  onSelectedProjectChange: (projectId: string) => void
  onAddCustomRequirement: () => void
  onFinalizeChecklist: (projectId: string) => void
  onResetChecklist: (projectId: string) => void
  onToggleChecklistDoc: (projectId: string, docId: string) => void
  onViewTemplate: (doc: MasterDoc) => void
}

function ChecklistItemRow({
  item,
  isDraft,
  projectId,
  templateDoc,
  onToggleChecklistDoc,
  onViewTemplate,
}: {
  item: ProjectChecklistItem
  isDraft: boolean
  projectId: string
  templateDoc: MasterDoc | null
  onToggleChecklistDoc: (projectId: string, docId: string) => void
  onViewTemplate: (doc: MasterDoc) => void
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
        item.enabled
          ? 'bg-background border-default-200'
          : 'bg-muted/40 border-dashed border-default-100 opacity-60'
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{item.name}</span>
          {item.isCustom && (
            <Badge className="bg-purple-500/25 text-purple-600 border-transparent text-[10px] py-0 px-1.5 font-semibold">
              Custom End-User Requirement
            </Badge>
          )}
        </div>
        {item.templateFile && (
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-primary">
            <span className="flex min-w-0 items-center gap-1.5">
              <Download className="h-3 w-3 shrink-0" />
              Attached template:{' '}
              <span className="truncate">{item.templateFile}</span>
            </span>
            {templateDoc && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 text-[10px] font-semibold text-primary hover:bg-primary/10"
                onClick={() => onViewTemplate(templateDoc)}
              >
                <Eye className="h-3 w-3" />
                View Template
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {isDraft ? (
          <Switch
            checked={item.enabled}
            onCheckedChange={() => onToggleChecklistDoc(projectId, item.id)}
          />
        ) : (
          <Badge
            variant="outline"
            color={item.enabled ? 'success' : 'secondary'}
            className={
              item.enabled
                ? 'border-success/30 text-success bg-success/5'
                : 'bg-muted'
            }
          >
            {item.enabled ? 'Active' : 'Disabled'}
          </Badge>
        )}
      </div>
    </div>
  )
}

export function ProjectChecklistTab({
  projects,
  currentProject,
  selectedProjectId,
  profiles,
  masterDocs,
  onSelectedProjectChange,
  onAddCustomRequirement,
  onFinalizeChecklist,
  onResetChecklist,
  onToggleChecklistDoc,
  onViewTemplate,
}: ProjectChecklistTabProps) {
  const sortedChecklist = getSortedChecklist(
    currentProject.checklist,
    masterDocs,
  )
  const isDraft = currentProject.status === 'Draft Checklist'
  const activeProfile = profiles.find((p) => p.id === currentProject.profileId)
  const getTemplateDoc = (item: ProjectChecklistItem): MasterDoc | null => {
    if (!item.templateFile) return null

    const masterDoc = masterDocs.find((doc) => doc.id === item.id)
    if (masterDoc) return masterDoc

    return {
      id: item.id,
      name: item.name,
      description: item.isCustom
        ? 'Custom project requirement template.'
        : 'Standard blank template for supplier completion.',
      envelope: item.envelope,
      templateFile: item.templateFile,
      templatePreviewUrl: item.templatePreviewUrl,
      templateFileType: item.templateFileType,
      order: 999,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-muted/40 border gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <Label className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">
              Active Pre-Procurement Project
            </Label>
            <div className="flex items-center gap-2">
              <Select
                value={selectedProjectId}
                onValueChange={onSelectedProjectChange}
              >
                <SelectTrigger className="w-[300px] h-9 mt-0.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className="bg-background">
                {currentProject.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isDraft ? (
            <>
              <Button
                variant="outline"
                onClick={onAddCustomRequirement}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Custom Requirement
              </Button>
              <Button
                onClick={() => onFinalizeChecklist(currentProject.id)}
                className="gap-1.5 bg-success hover:bg-success/90"
              >
                <CheckCircle2 className="h-4 w-4" /> Confirm & Lock Checklist
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Checklist Confirmed & Locked
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResetChecklist(currentProject.id)}
              >
                Unlock for Editing
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xs text-muted-foreground font-mono">
          REFERENCE ID: {currentProject.refNumber}
        </div>
        <h3 className="text-xl font-bold text-foreground">
          Project-Specific Requirements Checklist
        </h3>
        <p className="text-sm text-muted-foreground">
          Baseline checklist auto-loaded from{' '}
          <span className="font-semibold text-primary">
            "{activeProfile?.name}"
          </span>
          . Toggle templates or insert end-user requirements as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <Card className="border border-info/20 shadow-sm">
          <CardHeader className="bg-info/5 border-b border-info/15 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base text-info font-bold">
                  Envelope 1: Technical & Eligibility Documents
                </CardTitle>
                <CardDescription className="text-2xs text-info/80">
                  Required to pass preliminary legal and competency criteria
                </CardDescription>
              </div>
              <Badge className="bg-info text-info-foreground border-transparent">
                {
                  currentProject.checklist.filter(
                    (item) => item.envelope === 1 && item.enabled,
                  ).length
                }{' '}
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {sortedChecklist
              .filter((item) => item.envelope === 1)
              .map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  isDraft={isDraft}
                  projectId={currentProject.id}
                  templateDoc={getTemplateDoc(item)}
                  onToggleChecklistDoc={onToggleChecklistDoc}
                  onViewTemplate={onViewTemplate}
                />
              ))}
          </CardContent>
        </Card>

        <Card className="border border-warning/20 shadow-sm">
          <CardHeader className="bg-warning/5 border-b border-warning/15 py-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base text-warning font-bold">
                  Envelope 2: Financial Proposal Documents
                </CardTitle>
                <CardDescription className="text-2xs text-warning/80">
                  Bid tender calculations, quantities, and cost estimate
                  templates
                </CardDescription>
              </div>
              <Badge className="bg-warning text-warning-foreground border-transparent">
                {
                  currentProject.checklist.filter(
                    (item) => item.envelope === 2 && item.enabled,
                  ).length
                }{' '}
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {sortedChecklist
              .filter((item) => item.envelope === 2)
              .map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  isDraft={isDraft}
                  projectId={currentProject.id}
                  templateDoc={getTemplateDoc(item)}
                  onToggleChecklistDoc={onToggleChecklistDoc}
                  onViewTemplate={onViewTemplate}
                />
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
