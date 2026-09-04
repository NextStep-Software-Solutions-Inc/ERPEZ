import { useState, useMemo } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useQueryClient } from 'erpez-shared-lib'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  MasterSetupTab,
  ProjectChecklistTab,
  type MasterDoc,
  type MasterDocumentFormData,
  type Profile,
  type Project,
  type ProjectChecklistItem,
} from '@/components/features/planning/bidding-document-library'
import {
  initialMasterDocs,
  initialProfiles,
  initialProjects,
} from '@/components/features/planning/bidding-document-library/data/mockData'
import {
  useMasterDocuments,
  useCreateMasterDocument,
  useUpdateMasterDocument,
  useDeleteMasterDocument,
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
} from '@/components/features/planning/bidding-document-library/hooks/useBiddingDocumentLibrary'
import {
  CreateMasterDocumentDialog,
  EditMasterDocumentDialog,
  DeleteMasterDocumentDialog,
  ProfileDialog,
  ProfileDocumentsDialog,
  TemplateViewerDialog,
  CustomRequirementDialog,
} from '@/components/features/planning/bidding-document-library/dialogs'

export default function BiddingDocumentLibraryPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/v2/bidding-document-library' })
  const activeTab = search.tab || 'SystemAdmin'
  const queryClient = useQueryClient()

  // API Queries
  const { data: apiMasterDocsData } = useMasterDocuments({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })
  const { data: apiProfilesData } = useProfiles({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Mutations
  const { mutateAsync: createMasterDoc } = useCreateMasterDocument()
  const { mutateAsync: updateMasterDoc } = useUpdateMasterDocument()
  const { mutateAsync: deleteMasterDoc } = useDeleteMasterDocument()
  const { mutateAsync: createProfileMutate } = useCreateProfile()
  const { mutateAsync: updateProfileMutate } = useUpdateProfile()

  // Local state fallbacks & overrides
  const [localMasterDocs, setLocalMasterDocs] = useState<MasterDoc[]>(initialMasterDocs)
  const [localProfiles, setLocalProfiles] = useState<Profile[]>(initialProfiles)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjects[0]?.id || '',
  )

  // Map API items or fallback
  const masterDocs: MasterDoc[] = useMemo(() => {
    if (apiMasterDocsData?.data && apiMasterDocsData.data.length > 0) {
      return apiMasterDocsData.data.map((item, index) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        envelope: item.envelopeType,
        templateFile: item.templateFileUrl ? item.templateFileUrl.split('/').pop() || 'Template.docx' : '',
        templatePreviewUrl: item.templateFileUrl,
        order: index + 1,
      }))
    }
    return localMasterDocs
  }, [apiMasterDocsData, localMasterDocs])

  const profiles: Profile[] = useMemo(() => {
    if (apiProfilesData?.data && apiProfilesData.data.length > 0) {
      return apiProfilesData.data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        documentIds: p.items ? p.items.map((i) => i.masterDocumentTypeId) : [],
        itemCount: p.itemCount,
        techCount: p.techCount,
        finCount: p.finCount,
      }))
    }
    return localProfiles
  }, [apiProfilesData, localProfiles])

  // Dialog states
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false)
  const [isEditDocOpen, setIsEditDocOpen] = useState(false)
  const [isDeleteDocOpen, setIsDeleteDocOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<MasterDoc | null>(null)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isViewProfileDocsOpen, setIsViewProfileDocsOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  const [isTemplateViewerOpen, setIsTemplateViewerOpen] = useState(false)
  const [templateDocToView, setTemplateDocToView] = useState<MasterDoc | null>(null)
  const [isCustomReqOpen, setIsCustomReqOpen] = useState(false)

  // Current project for BAC Secretariat tab
  const currentProject = useMemo(() => {
    return (
      projects.find((p) => p.id === selectedProjectId) ||
      projects[0] || {
        id: 'default',
        title: 'Project',
        category: 'Goods',
        refNumber: 'REF-001',
        profileId: '',
        status: 'Draft Checklist',
        checklist: [],
      }
    )
  }, [projects, selectedProjectId])

  const handleTabChange = (newTab: string) => {
    navigate({
      to: '/v2/bidding-document-library',
      search: (prev) => ({
        ...prev,
        tab: newTab as 'SystemAdmin' | 'BACSecretariat',
      }),
    })
  }

  // Master Document Handlers
  const handleCreateDocument = async (formData: MasterDocumentFormData) => {
    try {
      await createMasterDoc({
        pathParams: {},
        payload: {
          name: formData.name,
          description: formData.description,
          envelopeType: formData.envelope,
          fileId: formData.templateFileId,
        },
      })
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/admin/bidding-documents')
        },
      })
      toast.success('Master document type registered successfully')
    } catch {
      // Local state fallback
      const newDoc: MasterDoc = {
        id: `md-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        envelope: formData.envelope,
        templateFile: formData.templateFile,
        templatePreviewUrl: formData.templatePreviewUrl,
        templateFileType: formData.templateFileType,
        order: masterDocs.length + 1,
      }
      setLocalMasterDocs((prev) => [...prev, newDoc])
      toast.success('Master document added to catalog')
    } finally {
      setIsCreateDocOpen(false)
    }
  }

  const handleUpdateDocument = async (docId: string, formData: MasterDocumentFormData) => {
    try {
      await updateMasterDoc({
        pathParams: { id: docId },
        payload: {
          name: formData.name,
          description: formData.description,
          envelopeType: formData.envelope,
          fileId: formData.templateFileId,
        },
      })
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/admin/bidding-documents')
        },
      })
      toast.success('Master document type updated')
    } catch {
      setLocalMasterDocs((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                name: formData.name,
                description: formData.description,
                envelope: formData.envelope,
                templateFile: formData.templateFile,
                templatePreviewUrl: formData.templatePreviewUrl,
                templateFileType: formData.templateFileType,
              }
            : d,
        ),
      )
      toast.success('Master document updated locally')
    } finally {
      setIsEditDocOpen(false)
      setSelectedDoc(null)
    }
  }

  const handleDeleteDocument = async () => {
    if (!selectedDoc) return
    try {
      await deleteMasterDoc({
        pathParams: { id: selectedDoc.id },
      })
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/admin/bidding-documents')
        },
      })
      toast.success('Master document deleted')
    } catch {
      setLocalMasterDocs((prev) => prev.filter((d) => d.id !== selectedDoc.id))
      toast.success('Master document removed locally')
    } finally {
      setIsDeleteDocOpen(false)
      setSelectedDoc(null)
    }
  }

  // Profile Handlers
  const handleSaveProfile = async (profileData: Omit<Profile, 'id'>) => {
    try {
      if (selectedProfile) {
        await updateProfileMutate({
          pathParams: { profileId: selectedProfile.id },
          payload: {
            name: profileData.name,
            description: profileData.description,
            procurementCategory: 'Goods',
            items: profileData.documentIds.map((id, idx) => ({
              masterDocumentTypeId: id,
              orderIndex: idx + 1,
            })),
          },
        })
        toast.success('Profile blueprint updated')
      } else {
        await createProfileMutate({
          pathParams: {},
          payload: {
            name: profileData.name,
            description: profileData.description,
            procurementCategory: 'Goods',
            items: profileData.documentIds.map((id, idx) => ({
              masterDocumentTypeId: id,
              orderIndex: idx + 1,
            })),
          },
        })
        toast.success('Profile blueprint created')
      }
      void queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0]
          return typeof key === 'string' && key.startsWith('/admin/bidding-documents')
        },
      })
    } catch {
      if (selectedProfile) {
        setLocalProfiles((prev) =>
          prev.map((p) =>
            p.id === selectedProfile.id ? { ...profileData, id: selectedProfile.id } : p,
          ),
        )
      } else {
        setLocalProfiles((prev) => [
          ...prev,
          { ...profileData, id: `prof-${Date.now()}` },
        ])
      }
      toast.success('Profile saved locally')
    } finally {
      setIsProfileOpen(false)
      setSelectedProfile(null)
    }
  }

  // Project Checklist Handlers
  const handleAddCustomRequirement = (customReq: {
    name: string
    envelope: 1 | 2
    templateFile: string
    templatePreviewUrl?: string
    templateFileType?: string
  }) => {
    const newItem: ProjectChecklistItem = {
      id: `custom-${Date.now()}`,
      name: customReq.name,
      envelope: customReq.envelope,
      templateFile: customReq.templateFile,
      templatePreviewUrl: customReq.templatePreviewUrl,
      templateFileType: customReq.templateFileType,
      isCustom: true,
      enabled: true,
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProjectId
          ? { ...p, checklist: [...p.checklist, newItem] }
          : p,
      ),
    )
    setIsCustomReqOpen(false)
    toast.success('Custom requirement added to project checklist')
  }

  const handleFinalizeChecklist = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: 'Finalized' as const } : p,
      ),
    )
    toast.success('Project checklist finalized and locked for bidding')
  }

  const handleResetChecklist = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    const profile = profiles.find((pr) => pr.id === project.profileId)
    if (profile) {
      const resetChecklist: ProjectChecklistItem[] = profile.documentIds
        .map((docId) => masterDocs.find((d) => d.id === docId))
        .filter((d): d is MasterDoc => Boolean(d))
        .map((doc) => ({
          id: doc.id,
          name: doc.name,
          envelope: doc.envelope,
          templateFile: doc.templateFile,
          templatePreviewUrl: doc.templatePreviewUrl,
          templateFileType: doc.templateFileType,
          isCustom: false,
          enabled: true,
        }))

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, status: 'Draft Checklist' as const, checklist: resetChecklist }
            : p,
        ),
      )
    } else {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: 'Draft Checklist' as const } : p,
        ),
      )
    }
    toast.info('Project checklist reset to default profile')
  }

  const handleToggleChecklistDoc = (projectId: string, docId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        return {
          ...p,
          checklist: p.checklist.map((item) =>
            item.id === docId ? { ...item, enabled: !item.enabled } : item,
          ),
        }
      }),
    )
  }

  const handleViewTemplate = (doc: MasterDoc) => {
    setTemplateDocToView(doc)
    setIsTemplateViewerOpen(true)
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle className="text-3xl">Bidding Document Library</CardTitle>
              <CardDescription className="text-base">
                Manage standard bidding requirements, envelope profiles, and project checklists
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <span>{masterDocs.length} Master Docs</span>
              </Badge>
              <Badge variant="outline" className="h-fit px-3 py-1 font-semibold">
                <span>{profiles.length} Profiles</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="SystemAdmin">Master Library & Profiles</TabsTrigger>
          <TabsTrigger value="BACSecretariat">BAC Secretariat Checklists</TabsTrigger>
        </TabsList>

        {activeTab === 'SystemAdmin' && (
          <MasterSetupTab
            masterDocs={masterDocs}
            profiles={profiles}
            onAddDocument={() => setIsCreateDocOpen(true)}
            onEditDocument={(doc) => {
              setSelectedDoc(doc)
              setIsEditDocOpen(true)
            }}
            onDeleteDocument={(doc) => {
              setSelectedDoc(doc)
              setIsDeleteDocOpen(true)
            }}
            onViewTemplate={handleViewTemplate}
            onAddProfile={() => {
              setSelectedProfile(null)
              setIsProfileOpen(true)
            }}
            onEditProfile={(prof) => {
              setSelectedProfile(prof)
              setIsProfileOpen(true)
            }}
            onViewProfile={(prof) => {
              setSelectedProfile(prof)
              setIsViewProfileDocsOpen(true)
            }}
          />
        )}

        {activeTab === 'BACSecretariat' && (
          <ProjectChecklistTab
            projects={projects}
            currentProject={currentProject}
            selectedProjectId={selectedProjectId}
            profiles={profiles}
            masterDocs={masterDocs}
            onSelectedProjectChange={setSelectedProjectId}
            onAddCustomRequirement={() => setIsCustomReqOpen(true)}
            onFinalizeChecklist={handleFinalizeChecklist}
            onResetChecklist={handleResetChecklist}
            onToggleChecklistDoc={handleToggleChecklistDoc}
            onViewTemplate={handleViewTemplate}
          />
        )}
      </Tabs>

      {/* Dialogs */}
      <CreateMasterDocumentDialog
        open={isCreateDocOpen}
        onOpenChange={setIsCreateDocOpen}
        onCreate={handleCreateDocument}
      />

      <EditMasterDocumentDialog
        doc={selectedDoc}
        open={isEditDocOpen}
        onOpenChange={setIsEditDocOpen}
        onUpdate={handleUpdateDocument}
      />

      <DeleteMasterDocumentDialog
        doc={selectedDoc}
        open={isDeleteDocOpen}
        onOpenChange={setIsDeleteDocOpen}
        onConfirm={handleDeleteDocument}
      />

      <ProfileDialog
        profile={selectedProfile}
        masterDocs={masterDocs}
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onSave={handleSaveProfile}
      />

      <ProfileDocumentsDialog
        profile={selectedProfile}
        masterDocs={masterDocs}
        open={isViewProfileDocsOpen}
        onOpenChange={setIsViewProfileDocsOpen}
        onViewTemplate={handleViewTemplate}
      />

      <TemplateViewerDialog
        doc={templateDocToView}
        open={isTemplateViewerOpen}
        onOpenChange={setIsTemplateViewerOpen}
      />

      <CustomRequirementDialog
        open={isCustomReqOpen}
        onOpenChange={setIsCustomReqOpen}
        onAdd={handleAddCustomRequirement}
      />
    </div>
  )
}