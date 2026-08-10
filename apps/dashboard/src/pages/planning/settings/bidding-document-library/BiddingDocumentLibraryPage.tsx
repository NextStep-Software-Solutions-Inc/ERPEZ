import { useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Briefcase, FileText, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { CreateMasterDocumentDialog } from '@/components/features/planning/bidding-document-library/dialogs/CreateMasterDocumentDialog'
import { CustomRequirementDialog } from '@/components/features/planning/bidding-document-library/dialogs/CustomRequirementDialog'
import { DeleteMasterDocumentDialog } from '@/components/features/planning/bidding-document-library/dialogs/DeleteMasterDocumentDialog'
import { EditMasterDocumentDialog } from '@/components/features/planning/bidding-document-library/dialogs/EditMasterDocumentDialog'
import { ProfileDialog } from '@/components/features/planning/bidding-document-library/dialogs/ProfileDialog'
import { ProfileDocumentsDialog } from '@/components/features/planning/bidding-document-library/dialogs/ProfileDocumentsDialog'
import { TemplateViewerDialog } from '@/components/features/planning/bidding-document-library/dialogs/TemplateViewerDialog'
import { MasterSetupTab } from '@/components/features/planning/bidding-document-library/tabs/MasterSetupTab'
import { ProjectChecklistTab } from '@/components/features/planning/bidding-document-library/tabs/ProjectChecklistTab'
import type {
  BiddingDocumentTab,
  MasterDoc,
  MasterDocumentFormData,
  Profile,
  Project,
  ProjectChecklistItem,
} from '@/components/features/planning/bidding-document-library/types'
import {
  useMasterDocuments,
  useProfiles,
  useProfileById,
  useCreateMasterDocument,
  useUpdateMasterDocument,
  useDeleteMasterDocument,
  useCreateProfile,
  useUpdateProfile,
  useProjectChecklist,
  useAddCustomRequirement,
  useConfirmChecklist,
  useResetChecklist,
  useBACProjects,
} from '@/components/features/planning/bidding-document-library/hooks/useBiddingDocumentLibrary'

export default function BiddingDocumentLibraryPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v2/bidding-document-library' })
  const { toast } = useToast()

  const activeTab = (search.tab || 'SystemAdmin') as BiddingDocumentTab

  // ── BAC Projects (real API) ───────────────────────────────────────────────
  const { data: bacProjectsResponse } = useBACProjects({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const projects = useMemo<Project[]>(() => {
    return (bacProjectsResponse?.data || []).map((p) => ({
      id: p.id,
      title: p.title,
      category: 'Goods' as const,
      refNumber: p.consolidatedPR?.cprNumber || '',
      profileId: '',
      status: p.status as Project['status'],
      checklist: [],
    }))
  }, [bacProjectsResponse])

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const firstProjectId = projects[0]?.id
  useMemo(() => {
    if (firstProjectId && !selectedProjectId) {
      setSelectedProjectId(firstProjectId)
    }
  }, [firstProjectId])

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0]

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: masterDocsResponse, refetch: refetchMasterDocs } = useMasterDocuments({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const { data: profilesResponse, refetch: refetchProfiles } = useProfiles({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const isValidGuid = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  const { data: checklistResponse, refetch: refetchChecklist } = useProjectChecklist({
    pathParams: { projectId: selectedProjectId },
    queryParams: { projectId: selectedProjectId },
    enabled: activeTab === 'BACSecretariat' && isValidGuid(selectedProjectId),
  })

  // ── Profile by ID (for view dialog) ──────────────────────────────────────
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null)

  const { data: profileByIdResponse } = useProfileById({
    pathParams: { profileId: viewingProfileId ?? '' },
    queryParams: { profileId: viewingProfileId ?? '' },
    enabled: !!viewingProfileId,
  })

  const viewingProfileFull = useMemo<Profile | null>(() => {
  if (!profileByIdResponse?.data) return null
  const p = profileByIdResponse.data
  const items = p.items ?? []
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    documentIds: items.map((item) => item.masterDocumentTypeId),
    itemCount: items.length,
    techCount: items.filter((i) => i.envelopeType === 1).length,
    finCount: items.filter((i) => i.envelopeType === 2).length,
  }
}, [profileByIdResponse])

  // ── Mutations ─────────────────────────────────────────────────────────────
  const { mutateAsync: createMasterDoc } = useCreateMasterDocument()
  const { mutateAsync: updateMasterDoc } = useUpdateMasterDocument()
  const { mutateAsync: deleteMasterDoc } = useDeleteMasterDocument()
  const { mutateAsync: createProfile } = useCreateProfile()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const { mutateAsync: addCustomReq } = useAddCustomRequirement()
  const { mutateAsync: confirmChecklist } = useConfirmChecklist()
  const { mutateAsync: resetChecklist } = useResetChecklist()

  // ── State mapping ─────────────────────────────────────────────────────────
  const masterDocs = useMemo<MasterDoc[]>(() => {
    return (masterDocsResponse?.data || []).map((doc, idx) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description || '',
      envelope: doc.envelopeType as 1 | 2,
      templateFile: doc.templateFileUrl || '',
      order: idx + 1,
    }))
  }, [masterDocsResponse])

  const profiles = useMemo<Profile[]>(() => {
  return (profilesResponse?.data || []).map((prof) => {
    const items = prof.items ?? []
    return {
      id: prof.id,
      name: prof.name,
      description: prof.description || '',
      documentIds: items.map((item) => item.masterDocumentTypeId),
      itemCount: prof.itemCount ?? 0,
      techCount: prof.techCount ?? 0,   // ← from DTO now
      finCount: prof.finCount ?? 0,     // ← from DTO now
    }
  })
}, [profilesResponse])

  // ── Dialog states ─────────────────────────────────────────────────────────
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<MasterDoc | null>(null)
  const [deletingDoc, setDeletingDoc] = useState<MasterDoc | null>(null)
  const [viewingTemplateDoc, setViewingTemplateDoc] = useState<MasterDoc | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [isCustomReqOpen, setIsCustomReqOpen] = useState(false)

  const setActiveTab = (newTab: string) => {
    navigate({
      to: `/v2/bidding-document-library`,
      search: { tab: newTab as BiddingDocumentTab },
      replace: true,
    })
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreateDoc = async (data: MasterDocumentFormData) => {
    try {
      await createMasterDoc({
        pathParams: {},
        payload: {
          name: data.name,
          description: data.description,
          envelopeType: data.envelope,
          fileId: data.templateFileId,
        },
      })
      toast({ title: 'Document Created', description: `"${data.name}" has been registered.` })
      refetchMasterDocs()
      setIsCreateDocOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to create document', variant: 'destructive' })
    }
  }

  const handleUpdateDoc = async (docId: string, data: MasterDocumentFormData) => {
    try {
      await updateMasterDoc({
        pathParams: { id: docId },
        queryParams: { id: docId },
        payload: {
          name: data.name,
          description: data.description,
          envelopeType: data.envelope,
          fileId: data.templateFileId,
        },
      })
      toast({ title: 'Document Updated', description: `"${data.name}" details modified.` })
      refetchMasterDocs()
      setEditingDoc(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to update document', variant: 'destructive' })
    }
  }

  const handleDeleteDoc = async () => {
    if (!deletingDoc) return
    try {
      await deleteMasterDoc({ pathParams: { id: deletingDoc.id }, queryParams: { id: deletingDoc.id } })
      toast({ title: 'Document Removed', description: 'Document deleted from the Master Library.' })
      refetchMasterDocs()
      setDeletingDoc(null)
    } catch {
      toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' })
    }
  }

  const handleSaveProfile = async (data: Omit<Profile, 'id'>) => {
    try {
      if (editingProfile) {
        await updateProfile({
          pathParams: { profileId: editingProfile.id },
          queryParams: { profileId: editingProfile.id },
          payload: {
            name: data.name,
            description: data.description,
            procurementCategory: 'Goods',
            items: data.documentIds.map((id, idx) => ({
              masterDocumentTypeId: id,
              orderIndex: idx,
            })),
          },
        })
      } else {
        await createProfile({
          pathParams: {},
          payload: {
            name: data.name,
            description: data.description,
            procurementCategory: 'Goods',
            items: data.documentIds.map((id, idx) => ({
              masterDocumentTypeId: id,
              orderIndex: idx,
            })),
          },
        })
      }
      toast({ title: 'Profile Saved', description: `"${data.name}" profile guidelines updated.` })
      refetchProfiles()
      setIsProfileOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to save profile', variant: 'destructive' })
    }
  }

  const mappedCurrentProject = useMemo<Project>(() => {
    if (!currentProject) return null as any
    if (!checklistResponse?.data) return currentProject

    const items: ProjectChecklistItem[] = [
      ...checklistResponse.data.envelope1Items.map((item) => ({
        id: item.id,
        name: item.documentName,
        envelope: item.envelopeType as 1 | 2,
        templateFile: item.templateFileUrl || '',
        isCustom: item.isCustom,
        enabled: item.isRequired,
      })),
      ...checklistResponse.data.envelope2Items.map((item) => ({
        id: item.id,
        name: item.documentName,
        envelope: item.envelopeType as 1 | 2,
        templateFile: item.templateFileUrl || '',
        isCustom: item.isCustom,
        enabled: item.isRequired,
      })),
    ]

    return {
      ...currentProject,
      checklist: items,
      status: checklistResponse.data.isLocked ? 'Finalized' : 'Draft Checklist',
    }
  }, [currentProject, checklistResponse])

  const activeProjects = projects.map((p) =>
    p.id === mappedCurrentProject?.id ? mappedCurrentProject : p
  )

  const handleToggleChecklistDoc = async (_projectId: string, docId: string) => {
    const item = mappedCurrentProject?.checklist.find((c) => c.id === docId)
    if (item) {
      toast({ title: 'Info', description: 'Toggle connected (stub)' })
    }
  }

  const handleAddCustomRequirement = async (data: {
    name: string
    envelope: 1 | 2
    templateFile: string
    templatePreviewUrl?: string
    templateFileType?: string
  }) => {
    try {
      await addCustomReq({
        pathParams: { projectId: selectedProjectId },
        queryParams: { projectId: selectedProjectId },
        payload: {
          customDocumentName: data.name,
          envelopeType: data.envelope,
          orderIndex: 0,
        },
      })
      toast({ title: 'Custom Requirement Added', description: `"${data.name}" appended to Envelope ${data.envelope} requirements.` })
      refetchChecklist()
      setIsCustomReqOpen(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to add custom requirement', variant: 'destructive' })
    }
  }

  const handleFinalizeChecklist = async (projectId: string) => {
    try {
      await confirmChecklist({ pathParams: { projectId }, queryParams: { projectId } })
      toast({ title: 'Checklist Finalized', description: 'BAC requirements locked for the project checklist.' })
      refetchChecklist()
    } catch {
      toast({ title: 'Error', description: 'Failed to finalize checklist', variant: 'destructive' })
    }
  }

  const handleResetChecklist = async (projectId: string) => {
    try {
      await resetChecklist({ pathParams: { projectId }, queryParams: { projectId } })
      toast({ title: 'Checklist Reset', description: 'Checklist reverted to Draft state for editing.' })
      refetchChecklist()
    } catch {
      toast({ title: 'Error', description: 'Failed to reset checklist', variant: 'destructive' })
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-6">
      <Card className="bg-gradient-to-r from-primary/15 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <CardTitle className="text-3xl flex items-center gap-2">
                <FileText className="h-8 w-8 text-primary" /> Bidding Document Library
              </CardTitle>
              <CardDescription className="text-base max-w-3xl">
                Define the global legal checklist database, set standardized templates, and
                automatically construct customized requirements lists for bidding applications.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold border-primary/30 text-primary">
                Pre-Procurement Engine
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="p-0 border-b">
          <div className="px-6 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 mb-0 border-b rounded-none">
                <TabsTrigger value="SystemAdmin" className="gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <Settings className="h-4.5 w-4.5" /> Master Setup (Admin)
                </TabsTrigger>
                <TabsTrigger value="BACSecretariat" className="gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  <Briefcase className="h-4.5 w-4.5" /> Project Checklist (BAC)
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {activeTab === 'SystemAdmin' && (
            <MasterSetupTab
              masterDocs={masterDocs}
              profiles={profiles}
              onAddDocument={() => setIsCreateDocOpen(true)}
              onEditDocument={setEditingDoc}
              onDeleteDocument={setDeletingDoc}
              onViewTemplate={setViewingTemplateDoc}
              onAddProfile={() => { setEditingProfile(null); setIsProfileOpen(true) }}
              onEditProfile={(p) => { setEditingProfile(p); setIsProfileOpen(true) }}
              onViewProfile={(p) => setViewingProfileId(p.id)}
            />
          )}
          {activeTab === 'BACSecretariat' && mappedCurrentProject != null && (
            <ProjectChecklistTab
              projects={activeProjects}
              currentProject={mappedCurrentProject}
              selectedProjectId={selectedProjectId}
              profiles={profiles}
              masterDocs={masterDocs}
              onSelectedProjectChange={setSelectedProjectId}
              onAddCustomRequirement={() => setIsCustomReqOpen(true)}
              onFinalizeChecklist={handleFinalizeChecklist}
              onResetChecklist={handleResetChecklist}
              onToggleChecklistDoc={handleToggleChecklistDoc}
              onViewTemplate={setViewingTemplateDoc}
            />
          )}
        </CardContent>
      </Card>

      <CreateMasterDocumentDialog open={isCreateDocOpen} onOpenChange={setIsCreateDocOpen} onCreate={handleCreateDoc} />
      <EditMasterDocumentDialog doc={editingDoc} open={Boolean(editingDoc)} onOpenChange={(open) => { if (!open) setEditingDoc(null) }} onUpdate={handleUpdateDoc} />
      <DeleteMasterDocumentDialog doc={deletingDoc} open={Boolean(deletingDoc)} onOpenChange={(open) => { if (!open) setDeletingDoc(null) }} onConfirm={handleDeleteDoc} />
      <TemplateViewerDialog doc={viewingTemplateDoc} open={Boolean(viewingTemplateDoc)} onOpenChange={(open) => { if (!open) setViewingTemplateDoc(null) }} />
      <ProfileDialog profile={editingProfile} masterDocs={masterDocs} open={isProfileOpen} onOpenChange={(open) => { setIsProfileOpen(open); if (!open) setEditingProfile(null) }} onSave={handleSaveProfile} />
      <ProfileDocumentsDialog
        profile={viewingProfileFull}
        masterDocs={masterDocs}
        open={!!viewingProfileId}
        onOpenChange={(open) => { if (!open) setViewingProfileId(null) }}
        onViewTemplate={setViewingTemplateDoc}
      />
      <CustomRequirementDialog open={isCustomReqOpen} onOpenChange={setIsCustomReqOpen} onAdd={handleAddCustomRequirement} />
    </div>
  )
}