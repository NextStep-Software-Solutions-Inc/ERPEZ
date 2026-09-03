

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { createQueryHookFromTemplate, useQueryClient } from 'erpez-shared-lib'
import { AlertCircle, Building2, Files, Globe, Layers, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type {
  MasterDoc,
  MasterDocumentFormData,
  Profile,
  Project,
  ProjectChecklistItem,
  UploadedFileAttachment,
} from '@/components/features/planning/bidding-document-library/types'
import type { ProfileFormData } from '@/components/features/planning/bidding-document-library/dialogs/ProfileDialog'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CreateMasterDocumentDialog } from '@/components/features/planning/bidding-document-library/dialogs/CreateMasterDocumentDialog'
import { CustomRequirementDialog } from '@/components/features/planning/bidding-document-library/dialogs/CustomRequirementDialog'
import { DeleteMasterDocumentDialog } from '@/components/features/planning/bidding-document-library/dialogs/DeleteMasterDocumentDialog'
import { EditMasterDocumentDialog } from '@/components/features/planning/bidding-document-library/dialogs/EditMasterDocumentDialog'
import { ProfileDialog } from '@/components/features/planning/bidding-document-library/dialogs/ProfileDialog'
import { ProfileDocumentsDialog } from '@/components/features/planning/bidding-document-library/dialogs/ProfileDocumentsDialog'
import { SupplierUploadDialog } from '@/components/features/planning/bidding-document-library/dialogs/SupplierUploadDialog'
import { TemplateViewerDialog } from '@/components/features/planning/bidding-document-library/dialogs/TemplateViewerDialog'
import { UploadedFileViewerDialog } from '@/components/features/planning/bidding-document-library/dialogs/UploadedFileViewerDialog'
import {
  useAddCustomRequirement,
  useConfirmChecklist,
  useCreateMasterDocument,
  useCreateProfile,
  useDeleteMasterDocument,
  useLoadProfile,
  useMasterDocuments,
  useProfiles,
  useProjectChecklist,
  useResetChecklist,
  useUpdateChecklistItem,
  useUpdateMasterDocument,
  useUpdateProfile,
} from '@/components/features/planning/bidding-document-library/hooks/useBiddingDocumentLibrary'
import { getProjectChecklistQueryKey } from '@/components/features/planning/bidding-document-library/handlers/projectChecklistHandlers'
import { MasterSetupTab } from '@/components/features/planning/bidding-document-library/tabs/MasterSetupTab'
import { ProjectChecklistTab } from '@/components/features/planning/bidding-document-library/tabs/ProjectChecklistTab'
import { PublicPortalTab } from '@/components/features/planning/bidding-document-library/tabs/PublicPortalTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProjectsRequest } from '@/features/procurement/manage-supplier-portal/handlers/getProjectsRequest'

type BiddingDocumentTabKey = 'SystemAdmin' | 'BACSecretariat' | 'PublicPortal'

const useBACProjects = createQueryHookFromTemplate(getProjectsRequest)

export default function BiddingDocumentLibraryPage() {
  const search = useSearch({ from: '/v2/bidding-document-library' })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const activeTab: BiddingDocumentTabKey =
    search.tab === 'BACSecretariat' || search.tab === 'PublicPortal'
      ? search.tab
      : 'SystemAdmin'

  // ── Live Backend Queries ─────────────────────────────────────────────────
  const {
    data: masterDocsApi,
    isLoading: isMasterDocsLoading,
    isError: isMasterDocsError,
    error: masterDocsError,
  } = useMasterDocuments({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const {
    data: profilesApi,
    isLoading: isProfilesLoading,
    isError: isProfilesError,
    error: profilesError,
  } = useProfiles({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 100 },
  })

  const {
    data: projectsApi,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError,
  } = useBACProjects({
    pathParams: {},
    queryParams: { pageSize: 100 },
  })

  // Selected project state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // Automatically select first project once loaded
  useEffect(() => {
    if (projectsApi?.data && projectsApi.data.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projectsApi.data[0].id)
    }
  }, [projectsApi, selectedProjectId])

  const {
    data: projectChecklistApi,
    isLoading: isChecklistLoading,
    isError: isChecklistError,
    error: checklistError,
  } = useProjectChecklist({
    pathParams: { projectId: selectedProjectId },
    enabled: Boolean(selectedProjectId),
  })

  // ── Live Backend Mutations ───────────────────────────────────────────────
  const createMasterDocMutation = useCreateMasterDocument()
  const updateMasterDocMutation = useUpdateMasterDocument()
  const deleteMasterDocMutation = useDeleteMasterDocument()

  const createProfileMutation = useCreateProfile()
  const updateProfileMutation = useUpdateProfile()

  const addCustomReqMutation = useAddCustomRequirement()
  const updateChecklistItemMutation = useUpdateChecklistItem()
  const confirmChecklistMutation = useConfirmChecklist()
  const resetChecklistMutation = useResetChecklist()
  const loadProfileMutation = useLoadProfile()

  const existingChecklistCount = useMemo(() => {
    if (!projectChecklistApi?.data) return 0
    return (
      projectChecklistApi.data.envelope1Items.length +
      projectChecklistApi.data.envelope2Items.length
    )
  }, [projectChecklistApi])

  // ── Derived Authoritative State (Pure live API data, no mock fallbacks) ──
  const masterDocs: Array<MasterDoc> = useMemo(() => {
    if (!masterDocsApi?.data) return []
    return masterDocsApi.data.map((item, index) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? '',
      envelope: item.envelopeType === 2 ? 2 : 1,
      templateFile: item.templateFileUrl ?? '',
      templatePreviewUrl: item.templateFileUrl,
      order: index + 1,
    }))
  }, [masterDocsApi])

  const profiles: Array<Profile> = useMemo(() => {
    if (!profilesApi?.data) return []
    return profilesApi.data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? '',
      procurementCategory: p.procurementCategory,
      documentIds: p.items.map((i) => i.masterDocumentTypeId),
      itemCount: p.itemCount,
      techCount: p.techCount,
      finCount: p.finCount,
    }))
  }, [profilesApi])

  const projects: Array<Project> = useMemo(() => {
    if (!projectsApi?.data) return []
    return projectsApi.data.map((p) => {
      const isCurrent = p.id === selectedProjectId
      const checklist: Array<ProjectChecklistItem> =
        isCurrent && projectChecklistApi?.data
          ? [
              ...projectChecklistApi.data.envelope1Items.map((item) => ({
                id: item.id,
                name: item.documentName,
                envelope: 1 as const,
                templateFile: item.templateFileUrl ?? '',
                templatePreviewUrl: item.templateFileUrl,
                isCustom: item.isCustom,
                enabled: item.isRequired,
              })),
              ...projectChecklistApi.data.envelope2Items.map((item) => ({
                id: item.id,
                name: item.documentName,
                envelope: 2 as const,
                templateFile: item.templateFileUrl ?? '',
                templatePreviewUrl: item.templateFileUrl,
                isCustom: item.isCustom,
                enabled: item.isRequired,
              })),
            ]
          : []

      return {
        id: p.id,
        title: p.title,
        category: 'Goods',
        refNumber: p.id.slice(0, 8).toUpperCase(),
        profileId: '',
        checklist,
        status:
          isCurrent && projectChecklistApi?.data.isLocked
            ? 'Finalized'
            : 'Draft Checklist',
      }
    })
  }, [projectsApi, projectChecklistApi, selectedProjectId])

  const currentProject = useMemo(() => {
    if (projects.length === 0) return null
    return (
      projects.find((p) => p.id === selectedProjectId) ??
      projects[0]
    )
  }, [projects, selectedProjectId])

  // ── Dialog States ────────────────────────────────────────────────────────
  const [createDocOpen, setCreateDocOpen] = useState(false)
  const [editDoc, setEditDoc] = useState<MasterDoc | null>(null)
  const [deleteDoc, setDeleteDoc] = useState<MasterDoc | null>(null)
  const [templateViewerDoc, setTemplateViewerDoc] = useState<MasterDoc | null>(null)

  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null)

  const [customReqOpen, setCustomReqOpen] = useState(false)
  const [supplierUploadItem, setSupplierUploadItem] = useState<ProjectChecklistItem | null>(null)
  const [uploadedFileItem, setUploadedFileItem] = useState<ProjectChecklistItem | null>(null)

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleTabChange = (value: string) => {
    navigate({
      to: '/v2/bidding-document-library',
      search: { tab: value as BiddingDocumentTabKey },
    })
  }

  // Master Document CRUD
  const handleCreateDocument = async (data: MasterDocumentFormData) => {
    try {
      await createMasterDocMutation.mutateAsync({
        pathParams: {},
        payload: {
          name: data.name,
          description: data.description,
          envelopeType: data.envelope,
          fileId: data.templateFileId,
        },
      })
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/admin/bidding-documents') &&
          !query.queryKey[0].startsWith('/admin/bidding-documents/profiles'),
      })
      setCreateDocOpen(false)
      toast.success(`Master document "${data.name}" registered successfully.`)
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to create master document on server.'
      toast.error(errorMsg)
    }
  }

  const handleUpdateDocument = async (docId: string, data: MasterDocumentFormData) => {
    try {
      const isRemovingFile = !data.templateFile && !data.templateFileId
      await updateMasterDocMutation.mutateAsync({
        pathParams: { id: docId },
        payload: {
          name: data.name,
          description: data.description,
          envelopeType: data.envelope,
          fileId: data.templateFileId,
          removeFile: isRemovingFile,
        },
      })
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/admin/bidding-documents') &&
          !query.queryKey[0].startsWith('/admin/bidding-documents/profiles'),
      })
      setEditDoc(null)
      toast.success('Master document updated successfully.')
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to update master document on server.'
      toast.error(errorMsg)
    }
  }

  const handleDeleteDocument = async () => {
    if (!deleteDoc) return
    const docToDelete = deleteDoc

    try {
      await deleteMasterDocMutation.mutateAsync({
        pathParams: { id: docToDelete.id },
      })
      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/admin/bidding-documents') &&
          !query.queryKey[0].startsWith('/admin/bidding-documents/profiles'),
      })
      setDeleteDoc(null)
      toast.success(`Master document "${docToDelete.name}" deleted.`)
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to delete master document from server.'
      toast.error(errorMsg)
    }
  }

  // Profile CRUD
  const handleSaveProfile = async (data: ProfileFormData) => {
    try {
      if (editingProfile) {
        await updateProfileMutation.mutateAsync({
          pathParams: { profileId: editingProfile.id },
          payload: {
            name: data.name,
            description: data.description,
            procurementCategory: data.procurementCategory,
            items: data.documentIds.map((id, index) => ({
              masterDocumentTypeId: id,
              orderIndex: index + 1,
            })),
          },
        })
        toast.success('Checklist profile updated.')
      } else {
        await createProfileMutation.mutateAsync({
          pathParams: {},
          payload: {
            name: data.name,
            description: data.description,
            procurementCategory: data.procurementCategory,
            items: data.documentIds.map((id, index) => ({
              masterDocumentTypeId: id,
              orderIndex: index + 1,
            })),
          },
        })
        toast.success(`Checklist profile "${data.name}" created.`)
      }

      await queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === 'string' &&
          query.queryKey[0].startsWith('/admin/bidding-documents/profiles'),
      })
      setProfileDialogOpen(false)
      setEditingProfile(null)
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to save checklist profile on server.'
      toast.error(errorMsg)
    }
  }

  // Project Checklist Handlers
  const handleAddCustomRequirement = async (data: {
    name: string
    envelope: 1 | 2
    templateFile: string
    templatePreviewUrl?: string
    templateFileType?: string
  }) => {
    if (!selectedProjectId) {
      toast.error('No project selected.')
      return
    }

    try {
      await addCustomReqMutation.mutateAsync({
        pathParams: { projectId: selectedProjectId },
        payload: {
          customDocumentName: data.name,
          envelopeType: data.envelope,
          orderIndex: (currentProject?.checklist.length ?? 0) + 1,
        },
      })
      await queryClient.invalidateQueries({
        queryKey: getProjectChecklistQueryKey(selectedProjectId),
      })
      setCustomReqOpen(false)
      toast.success(`Custom requirement "${data.name}" added to project checklist.`)
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to add custom requirement on server.'
      toast.error(errorMsg)
    }
  }

  const handleApplyProfile = async (projectId: string, profileId: string) => {
    try {
      await loadProfileMutation.mutateAsync({
        pathParams: { projectId },
        payload: { documentProfileId: profileId },
      })
      await queryClient.invalidateQueries({
        queryKey: getProjectChecklistQueryKey(projectId),
      })
      const appliedProfile = profiles.find((p) => p.id === profileId)
      toast.success(
        `Checklist profile "${appliedProfile?.name ?? 'Blueprint'}" applied to project.`,
      )
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to apply profile on server.'
      toast.error(errorMsg)
    }
  }

  const handleFinalizeChecklist = async (projectId: string) => {
    try {
      await confirmChecklistMutation.mutateAsync({
        pathParams: { projectId },
      })
      await queryClient.invalidateQueries({
        queryKey: getProjectChecklistQueryKey(projectId),
      })
      toast.success('Checklist finalized and locked for bidding.')
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to finalize checklist on server.'
      toast.error(errorMsg)
    }
  }

  const handleResetChecklist = async (projectId: string) => {
    try {
      await resetChecklistMutation.mutateAsync({
        pathParams: { projectId },
      })
      await queryClient.invalidateQueries({
        queryKey: getProjectChecklistQueryKey(projectId),
      })
      toast.info('Checklist reverted to draft mode.')
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to reset checklist on server.'
      toast.error(errorMsg)
    }
  }

  const handleToggleChecklistDoc = async (
    projectId: string,
    checklistItemId: string
  ) => {
    const item = currentProject?.checklist.find((i) => i.id === checklistItemId)
    if (!item) return

    try {
      await updateChecklistItemMutation.mutateAsync({
        pathParams: { projectId, checklistItemId },
        payload: {
          isRequired: !item.enabled,
          orderIndex: 0,
        },
      })
      await queryClient.invalidateQueries({
        queryKey: getProjectChecklistQueryKey(projectId),
      })
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to toggle checklist requirement on server.'
      toast.error(errorMsg)
    }
  }

  // Public Portal Handlers
  const handleUploadFile = (
    _itemId: string,
    upload: UploadedFileAttachment
  ) => {
    setSupplierUploadItem(null)
    toast.success(`Uploaded "${upload.fileName}"`)
  }

  const handleRemoveUploaded = (_itemId: string) => {
    toast.info('Uploaded file removed.')
  }

  // ── Global Error / Loading Banners ───────────────────────────────────────
  const hasError = isMasterDocsError || isProfilesError || isProjectsError || isChecklistError
  const activeError =
    masterDocsError || profilesError || projectsError || checklistError

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1.5">
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                Bidding Document Library
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Master checklist configuration, category profiles, and project-specific bidding document requirements.
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              {(isMasterDocsLoading || isProfilesLoading || isProjectsLoading || isChecklistLoading) && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/80 px-3 py-1.5 rounded-md border shadow-2xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Syncing with server...</span>
                </div>
              )}
              <Badge variant="outline" className="h-fit px-3 py-1.5 font-semibold bg-background/80 shadow-2xs">
                <Files className="h-3.5 w-3.5 mr-1.5 text-primary" /> Bidding Documents
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert Banner if an API request fails */}
      {hasError && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Backend API Communication Error</div>
            <div className="text-xs opacity-90">
              {activeError instanceof Error
                ? activeError.message
                : 'Unable to communicate with the procurement service. Please verify your backend server connection.'}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="SystemAdmin" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>System Admin</span>
          </TabsTrigger>
          <TabsTrigger value="BACSecretariat" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>BAC Secretariat</span>
          </TabsTrigger>
          <TabsTrigger value="PublicPortal" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Public Portal</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: System Admin */}
        <TabsContent value="SystemAdmin" className="space-y-6">
          <MasterSetupTab
            masterDocs={masterDocs}
            profiles={profiles}
            onAddDocument={() => setCreateDocOpen(true)}
            onEditDocument={(doc) => setEditDoc(doc)}
            onDeleteDocument={(doc) => setDeleteDoc(doc)}
            onViewTemplate={(doc) => setTemplateViewerDoc(doc)}
            onAddProfile={() => {
              setEditingProfile(null)
              setProfileDialogOpen(true)
            }}
            onEditProfile={(prof) => {
              setEditingProfile(prof)
              setProfileDialogOpen(true)
            }}
            onViewProfile={(prof) => setViewingProfile(prof)}
          />
        </TabsContent>

        {/* Tab 2: BAC Secretariat */}
        <TabsContent value="BACSecretariat" className="space-y-6">
          <ProjectChecklistTab
            projects={projects}
            currentProject={currentProject}
            selectedProjectId={selectedProjectId}
            profiles={profiles}
            masterDocs={masterDocs}
            isLoading={isProjectsLoading || isChecklistLoading}
            isApplyingProfile={loadProfileMutation.isPending}
            existingChecklistCount={existingChecklistCount}
            onSelectedProjectChange={setSelectedProjectId}
            onApplyProfile={handleApplyProfile}
            onAddCustomRequirement={() => setCustomReqOpen(true)}
            onFinalizeChecklist={handleFinalizeChecklist}
            onResetChecklist={handleResetChecklist}
            onToggleChecklistDoc={handleToggleChecklistDoc}
            onViewTemplate={(doc) => setTemplateViewerDoc(doc)}
          />
        </TabsContent>

        {/* Tab 3: Public Portal Preview */}
        <TabsContent value="PublicPortal" className="space-y-6">
          <PublicPortalTab
            projects={projects}
            currentProject={currentProject}
            selectedProjectId={selectedProjectId}
            masterDocs={masterDocs}
            isLoading={isProjectsLoading || isChecklistLoading}
            onSelectedProjectChange={setSelectedProjectId}
            onDownloadTemplate={(file) =>
              toast.info(`Downloading template: ${file}`)
            }
            onViewTemplate={(doc) => setTemplateViewerDoc(doc)}
            onUploadFile={(itemId) => {
              const item = currentProject?.checklist.find((i) => i.id === itemId)
              if (item) setSupplierUploadItem(item)
            }}
            onRemoveUploaded={handleRemoveUploaded}
          />
        </TabsContent>
      </Tabs>

      {/* ── Modals & Dialogs ─────────────────────────────────────────────── */}
      <CreateMasterDocumentDialog
        open={createDocOpen}
        onOpenChange={setCreateDocOpen}
        onCreate={handleCreateDocument}
      />

      <EditMasterDocumentDialog
        doc={editDoc}
        open={Boolean(editDoc)}
        onOpenChange={(open) => !open && setEditDoc(null)}
        onUpdate={handleUpdateDocument}
      />

      <DeleteMasterDocumentDialog
        doc={deleteDoc}
        open={Boolean(deleteDoc)}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        onConfirm={handleDeleteDocument}
      />

      <TemplateViewerDialog
        doc={templateViewerDoc}
        open={Boolean(templateViewerDoc)}
        onOpenChange={(open) => !open && setTemplateViewerDoc(null)}
      />

      <ProfileDialog
        profile={editingProfile}
        masterDocs={masterDocs}
        open={profileDialogOpen}
        onOpenChange={setProfileDialogOpen}
        onSave={handleSaveProfile}
      />

      <ProfileDocumentsDialog
        profile={viewingProfile}
        masterDocs={masterDocs}
        open={Boolean(viewingProfile)}
        onOpenChange={(open) => !open && setViewingProfile(null)}
        onViewTemplate={(doc) => setTemplateViewerDoc(doc)}
      />

      <CustomRequirementDialog
        open={customReqOpen}
        onOpenChange={setCustomReqOpen}
        onAdd={handleAddCustomRequirement}
      />

      <SupplierUploadDialog
        item={supplierUploadItem}
        open={Boolean(supplierUploadItem)}
        onOpenChange={(open) => !open && setSupplierUploadItem(null)}
        onUpload={handleUploadFile}
      />

      <UploadedFileViewerDialog
        item={uploadedFileItem}
        open={Boolean(uploadedFileItem)}
        onOpenChange={(open) => !open && setUploadedFileItem(null)}
      />
    </div>
  )
}