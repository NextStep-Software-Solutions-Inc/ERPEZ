import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  Eye,
  FileCheck,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
} from 'lucide-react'
import { getSortedChecklist } from '../utils'
import type {
  MasterDoc,
  Profile,
  Project,
  ProjectChecklistItem,
} from '../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { cn } from '@/lib/utils'

interface ProjectChecklistTabProps {
  projects: Array<Project>
  currentProject: Project | null
  selectedProjectId: string
  profiles: Array<Profile>
  masterDocs: Array<MasterDoc>
  isLoading?: boolean
  isApplyingProfile?: boolean
  existingChecklistCount?: number
  onSelectedProjectChange: (projectId: string) => void
  onApplyProfile: (projectId: string, profileId: string) => Promise<void>
  onAddCustomRequirement: () => void
  onFinalizeChecklist: (projectId: string) => void
  onResetChecklist: (projectId: string) => void
  onToggleChecklistDoc: (projectId: string, docId: string) => void
  onViewTemplate: (doc: MasterDoc) => void
}

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

function getTemplateDisplayName(url?: string): string {
  if (!url) return ''
  try {
    const decoded = decodeURIComponent(url)
    const lastSegment = decoded.split('/').pop() ?? url
    if (UUID_REGEX.test(lastSegment)) return 'Uploaded Template'
    const underscoreIndex = lastSegment.indexOf('_')
    if (underscoreIndex !== -1) return lastSegment.slice(underscoreIndex + 1)
    return lastSegment
  } catch {
    return url
  }
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
  const displayName = getTemplateDisplayName(item.templateFile)

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3.5 rounded-xl border transition-all duration-150 gap-4',
        item.enabled
          ? 'bg-card border-border shadow-2xs hover:shadow-xs hover:border-primary/30'
          : 'bg-muted/30 border-dashed border-border/80 opacity-60',
      )}
    >
      <div className="space-y-1.5 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              'font-semibold text-sm leading-tight text-foreground',
              !item.enabled &&
                'text-muted-foreground line-through decoration-muted-foreground/40',
            )}
          >
            {item.name}
          </span>
          {item.isCustom && (
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] py-0 px-1.5 font-medium"
            >
              Custom Requirement
            </Badge>
          )}
        </div>

        {item.templateFile && (
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            {templateDoc ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 gap-1.5 rounded-md border-primary/25 bg-primary/5 px-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                onClick={() => onViewTemplate(templateDoc)}
              >
                <Eye className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[220px]">{displayName}</span>
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <span className="truncate max-w-[220px] font-mono">
                  {displayName}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isDraft ? (
          <div className="flex items-center gap-2">
            <span className="text-2xs font-medium text-muted-foreground hidden sm:inline select-none">
              {item.enabled ? 'Included' : 'Excluded'}
            </span>
            <Switch
              checked={item.enabled}
              onCheckedChange={() => onToggleChecklistDoc(projectId, item.id)}
              aria-label={`Toggle ${item.name}`}
            />
          </div>
        ) : (
          <Badge
            variant="outline"
            className={
              item.enabled
                ? 'border-success/30 text-success bg-success/5 font-semibold text-xs'
                : 'bg-muted text-muted-foreground text-xs'
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
  isLoading,
  isApplyingProfile,
  existingChecklistCount,
  onSelectedProjectChange,
  onApplyProfile,
  onAddCustomRequirement,
  onFinalizeChecklist,
  onResetChecklist,
  onToggleChecklistDoc,
  onViewTemplate,
}: ProjectChecklistTabProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false)

  const projectCategory = currentProject?.category

  // Filter profiles matching the project's procurement category (UX filtering)
  const compatibleProfiles = useMemo(() => {
    if (!projectCategory) return profiles
    const matched = profiles.filter(
      (p) =>
        !p.procurementCategory ||
        p.procurementCategory.toLowerCase() === projectCategory.toLowerCase(),
    )
    return matched.length > 0 ? matched : profiles
  }, [profiles, projectCategory])

  // Automatically select the first compatible profile
  useEffect(() => {
    if (compatibleProfiles.length > 0) {
      if (
        !selectedProfileId ||
        !compatibleProfiles.some((p) => p.id === selectedProfileId)
      ) {
        setSelectedProfileId(compatibleProfiles[0].id)
      }
    }
  }, [compatibleProfiles, selectedProfileId])

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Loading pre-procurement projects...</span>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No projects found. Projects must be created before configuring checklists.
      </div>
    )
  }

  const sortedChecklist = getSortedChecklist(
    currentProject.checklist,
    masterDocs,
  )
  const isDraft = currentProject.status === 'Draft Checklist'
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

  const handleApplyClick = () => {
    if (!selectedProfileId) return
    if ((existingChecklistCount ?? 0) > 0) {
      setShowConfirmDialog(true)
    } else {
      void onApplyProfile(currentProject.id, selectedProfileId)
    }
  }

  const handleConfirmApply = async () => {
    if (!selectedProfileId) return
    await onApplyProfile(currentProject.id, selectedProfileId)
    setShowConfirmDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg bg-muted/40 border gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-8 w-8 text-primary" />
          <div>
            <Label className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">
              Active Procurement Project — Bidding Preparation
            </Label>
            <div className="flex items-center gap-2">
              <Select
                value={selectedProjectId || currentProject.id}
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

      {/* Checklist Profile Blueprint Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between p-4 rounded-lg bg-card border shadow-xs gap-4">
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2">
            <Label className="text-2xs uppercase tracking-wider text-muted-foreground font-semibold">
              Checklist Profile
            </Label>
            {projectCategory && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal bg-muted/40">
                Matching Category: {projectCategory}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedProfileId}
              onValueChange={setSelectedProfileId}
              disabled={!isDraft || isApplyingProfile}
            >
              <SelectTrigger className="w-full max-w-md h-9 bg-background">
                <SelectValue placeholder="Select a reusable profile blueprint..." />
              </SelectTrigger>
              <SelectContent>
                {compatibleProfiles.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    <span className="font-medium">{prof.name}</span>
                    {prof.procurementCategory && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({prof.procurementCategory})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Button
            type="button"
            variant="outline"
            disabled={!selectedProfileId || !isDraft || isApplyingProfile}
            onClick={handleApplyClick}
            className="gap-1.5 h-9 font-semibold"
          >
            {isApplyingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Apply Profile
          </Button>
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
          Baseline document requirements for this procurement project. Apply a reusable profile blueprint above or add custom end-user requirements as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Envelope 1 */}
        <Card className="border border-info/25 shadow-xs overflow-hidden bg-card">
          <CardHeader className="bg-info/5 border-b border-info/15 py-3.5 px-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold text-info flex items-center gap-1.5">
                  Envelope 1: Technical & Eligibility Documents
                </CardTitle>
                <CardDescription className="text-2xs text-info/80">
                  Required to pass preliminary legal and competency criteria
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-info/10 text-info border-info/30 font-semibold text-xs">
                {
                  currentProject.checklist.filter(
                    (item) => item.envelope === 1 && item.enabled,
                  ).length
                }{' '}
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 bg-card min-h-[160px]">
            {sortedChecklist.filter((item) => item.envelope === 1).length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
                <FileCheck className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="font-semibold text-foreground/80">No technical requirements added</p>
                <p className="text-2xs text-muted-foreground mt-0.5">Apply a checklist profile or add a custom requirement above.</p>
              </div>
            ) : (
              sortedChecklist
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
                ))
            )}
          </CardContent>
        </Card>

        {/* Envelope 2 */}
        <Card className="border border-warning/25 shadow-xs overflow-hidden bg-card">
          <CardHeader className="bg-warning/5 border-b border-warning/15 py-3.5 px-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-bold text-warning flex items-center gap-1.5">
                  Envelope 2: Financial Proposal Documents
                </CardTitle>
                <CardDescription className="text-2xs text-warning/80">
                  Bid tender calculations, quantities, and cost estimate templates
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 font-semibold text-xs">
                {
                  currentProject.checklist.filter(
                    (item) => item.envelope === 2 && item.enabled,
                  ).length
                }{' '}
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 bg-card min-h-[160px]">
            {sortedChecklist.filter((item) => item.envelope === 2).length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
                <FileCheck className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="font-semibold text-foreground/80">No financial requirements added</p>
                <p className="text-2xs text-muted-foreground mt-0.5">Apply a checklist profile or add a custom requirement above.</p>
              </div>
            ) : (
              sortedChecklist
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
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Explicit Replace Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Draft Checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              This project already has {existingChecklistCount ?? 0} item(s) in its draft checklist.
              Applying &quot;{selectedProfile?.name}&quot; will replace the current draft checklist with the specifications from this profile blueprint.
              Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApplyingProfile}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isApplyingProfile}
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmApply()
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isApplyingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : null}
              Apply Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
