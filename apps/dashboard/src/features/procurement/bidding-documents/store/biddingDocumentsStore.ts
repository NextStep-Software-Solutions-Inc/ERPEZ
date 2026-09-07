import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  buildPreviewPages,
  getOverallProgress,
  getStructuredProgress,
  getUploadProgress,
  getMockBiddingDocumentDatabase,
  normalizeUploadSlots,
} from '../data/mockBiddingDocumentsData'
import { normalizeStructuredFieldValues } from '../data/structuredFieldCatalog'
import { getActivePhase } from '../data/workspaceScaffold'
import type {
  BiddingDocumentFieldKey,
  BiddingDocumentGateKey,
  BiddingDocumentRecord,
  BiddingDocumentUploadSlotKey,
  UploadedSectionFile,
} from '../types'

type BiddingDocumentsState = {
  documents: Array<BiddingDocumentRecord>
}

type BiddingDocumentsActions = {
  getDocumentByResolutionId: (
    bacResolutionId: string,
  ) => BiddingDocumentRecord | undefined
  updateStructuredField: (
    documentId: string,
    field: BiddingDocumentFieldKey,
    value: string,
  ) => void
  saveDraft: (documentId: string) => void
  toggleGate: (documentId: string, gate: BiddingDocumentGateKey) => void
  replaceUpload: (
    documentId: string,
    slot: BiddingDocumentUploadSlotKey,
    file: UploadedSectionFile,
  ) => void
  setCustomizedSpecialConditionsRequired: (
    documentId: string,
    required: boolean,
  ) => void
  generatePreview: (documentId: string) => void
  markPosted: (documentId: string, postedBy: string) => void
}

const PERSIST_KEY =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    ? 'bidding-documents-store-dev'
    : 'bidding-documents-store'

function withPreview(record: BiddingDocumentRecord) {
  const previewPages =
    record.status === 'generated' || record.status === 'posted'
      ? record.previewPages.length > 0
        ? record.previewPages
        : buildPreviewPages(record)
      : record.previewPages

  const nextRecord = {
    ...record,
    previewPages,
  }

  return syncWorkspaceState(nextRecord)
}

function syncWorkspaceState(
  record: BiddingDocumentRecord,
): BiddingDocumentRecord {
  const normalizedRecord = {
    ...record,
    structuredFields: normalizeStructuredFieldValues(
      record.structuredFields,
      record,
    ),
    uploads: normalizeUploadSlots(record),
  }
  const structuredProgress = getStructuredProgress(normalizedRecord)
  const uploadProgress = getUploadProgress(normalizedRecord)
  const overallProgress = getOverallProgress(normalizedRecord)

  const progress = {
    prerequisites: {
      complete: Object.values(normalizedRecord.gates).filter(Boolean).length,
      total: Object.values(normalizedRecord.gates).length,
    },
    structuredInputs: structuredProgress,
    uploads: uploadProgress,
    overall: overallProgress,
  }

  return {
    ...normalizedRecord,
    workflow: {
      status: normalizedRecord.status,
      needsRegeneration: normalizedRecord.needsRegeneration,
      generatedAt: normalizedRecord.generatedAt,
      postedAt: normalizedRecord.postedAt,
      postedBy: normalizedRecord.postedBy,
      isReadOnly: normalizedRecord.status === 'posted',
    },
    workspace: {
      ...(normalizedRecord.workspace ?? {}),
      activePhase: getActivePhase({
        ...normalizedRecord,
        workspace: {
          ...(normalizedRecord.workspace ?? {}),
          progress,
        },
      }),
      draft: {
        ...(normalizedRecord.workspace?.draft ?? {}),
        form: {
          ...(normalizedRecord.workspace?.draft?.form ?? {}),
          values: {
            ...(normalizedRecord.workspace?.draft?.form?.values ?? {}),
            ...normalizedRecord.structuredFields,
          },
          lastSavedAt: normalizedRecord.lastDraftSavedAt,
        },
        uploads: {
          ...(normalizedRecord.workspace?.draft?.uploads ?? {}),
          slots: {
            ...(normalizedRecord.workspace?.draft?.uploads?.slots ?? {}),
            ...normalizedRecord.uploads,
          },
          customizedSections: {
            specialConditions:
              normalizedRecord.workspace?.draft?.uploads?.customizedSections
                ?.specialConditions ??
              Boolean(normalizedRecord.uploads.specialConditions),
          },
        },
      },
      review: {
        ...(normalizedRecord.workspace?.review ?? {}),
        templateKey: normalizedRecord.procurementCategory,
        previewPages: normalizedRecord.previewPages,
      },
      progress,
    },
  }
}

export const useBiddingDocumentsStore = create<
  BiddingDocumentsState & BiddingDocumentsActions
>()(
  persist(
    (set, get) => ({
      documents: getMockBiddingDocumentDatabase().map(withPreview),

      getDocumentByResolutionId(bacResolutionId) {
        return get().documents.find(
          (document) => document.bacResolutionId === bacResolutionId,
        )
      },

      updateStructuredField(documentId, field, value) {
        set((state) => ({
          documents: state.documents.map((document) =>
            document.id === documentId
              ? syncWorkspaceState({
                  ...document,
                  structuredFields: {
                    ...document.structuredFields,
                    [field]: value,
                  },
                  needsRegeneration:
                    document.status === 'generated'
                      ? true
                      : document.needsRegeneration,
                })
              : document,
          ),
        }))
      },

      saveDraft(documentId) {
        const timestamp = new Date().toISOString()

        set((state) => ({
          documents: state.documents.map((document) =>
            document.id === documentId
              ? syncWorkspaceState({
                  ...document,
                  lastDraftSavedAt: timestamp,
                })
              : document,
          ),
        }))
      },

      toggleGate(documentId, gate) {
        set((state) => ({
          documents: state.documents.map((document) =>
            document.id === documentId
              ? syncWorkspaceState({
                  ...document,
                  gates: {
                    ...document.gates,
                    [gate]: !document.gates[gate],
                  },
                })
              : document,
          ),
        }))
      },

      replaceUpload(documentId, slot, file) {
        set((state) => ({
          documents: state.documents.map((document) =>
            document.id === documentId
              ? syncWorkspaceState({
                  ...document,
                  uploads: {
                    ...document.uploads,
                    [slot]: file,
                  },
                  needsRegeneration:
                    document.status === 'generated'
                      ? true
                      : document.needsRegeneration,
                })
              : document,
          ),
        }))
      },

      setCustomizedSpecialConditionsRequired(documentId, required) {
        set((state) => ({
          documents: state.documents.map((document) =>
            document.id === documentId
              ? syncWorkspaceState({
                  ...document,
                  workspace: {
                    ...document.workspace,
                    draft: {
                      ...document.workspace.draft,
                      uploads: {
                        ...document.workspace.draft.uploads,
                        customizedSections: {
                          ...document.workspace.draft.uploads
                            .customizedSections,
                          specialConditions: required,
                        },
                      },
                    },
                  },
                })
              : document,
          ),
        }))
      },

      generatePreview(documentId) {
        const timestamp = new Date().toISOString()

        set((state) => ({
          documents: state.documents.map((document) => {
            if (document.id !== documentId || document.status === 'posted') {
              return document
            }

            const nextRecord: BiddingDocumentRecord = {
              ...document,
              status: 'generated',
              generatedAt: timestamp,
              lastDraftSavedAt: timestamp,
              needsRegeneration: false,
            }

            return syncWorkspaceState({
              ...nextRecord,
              previewPages: buildPreviewPages(nextRecord),
            })
          }),
        }))
      },

      markPosted(documentId, postedBy) {
        const timestamp = new Date().toISOString()

        set((state) => ({
          documents: state.documents.map((document) => {
            if (document.id !== documentId || document.status === 'posted') {
              return document
            }

            return syncWorkspaceState({
              ...document,
              status: 'posted',
              postedAt: timestamp,
              postedBy,
              needsRegeneration: false,
            })
          }),
        }))
      },
    }),
    {
      name: PERSIST_KEY,
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as {
          documents?: Array<BiddingDocumentRecord>
        }

        if (!Array.isArray(state.documents)) {
          return persistedState
        }

        const currentResolutionIds = new Set(
          state.documents.map((document) => document.bacResolutionId),
        )

        const migratedDocuments = state.documents.map((document) => {
          // Ensure workspace and related fields exist for old persisted records
          const migratedDoc = {
            ...document,
            workspace: document.workspace ?? {
              activePhase: 'prerequisites' as const,
              draft: {
                form: {
                  values: {},
                  lastSavedAt: null,
                },
                uploads: {
                  slots: {},
                  customizedSections: {
                    specialConditions: false,
                  },
                },
              },
              review: {
                templateKey: document.procurementCategory,
                previewPages: [],
              },
              progress: {
                prerequisites: { complete: 0, total: 0 },
                structuredInputs: { complete: 0, total: 0 },
                uploads: { complete: 0, total: 0 },
                overall: { complete: 0, total: 0 },
              },
            },
            workflow: document.workflow ?? {
              status: document.status,
              needsRegeneration: document.needsRegeneration,
              generatedAt: document.generatedAt,
              postedAt: document.postedAt,
              postedBy: document.postedBy,
              isReadOnly: document.status === 'posted',
            },
          }
          return withPreview(migratedDoc)
        })

        const documents = [
          ...migratedDocuments,
          ...getMockBiddingDocumentDatabase()
            .filter(
              (document) => !currentResolutionIds.has(document.bacResolutionId),
            )
            .map(withPreview),
        ]

        return {
          ...state,
          documents,
        }
      },
    },
  ),
)
