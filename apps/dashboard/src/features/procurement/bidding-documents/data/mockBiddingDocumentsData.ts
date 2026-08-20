import type {
  BiddingDocumentFieldKey,
  BiddingDocumentGates,
  BiddingDocumentPhaseKey,
  BiddingDocumentProgressState,
  BiddingDocumentRecord,
  BiddingDocumentUploadSlotDefinition,
  BiddingDocumentUploadSlotKey,
} from '../types'
import {
  createEmptyStructuredFieldValues,
  getRequiredStructuredFieldDefinitions,
  getStructuredFieldDisplayValue,
  getStructuredFieldSections,
  isStructuredFieldComplete,
  normalizeStructuredFieldValues,
} from './structuredFieldCatalog'
import {
  BIDDING_DOCUMENT_PHASE_SCAFFOLD,
  getActivePhase,
} from './workspaceScaffold'

export const UPLOAD_SLOT_DEFINITIONS: Array<BiddingDocumentUploadSlotDefinition> =
  [
    {
      key: 'technicalSpecifications',
      label: 'Technical Specifications (Section VII)',
      required: true,
      accept: '.docx,.pdf',
      acceptedExtensions: ['.docx', '.pdf'],
      helperText:
        'Goods only. TWG-prepared technical specifications. Max 10 MB.',
    },
    {
      key: 'scheduleOfRequirements',
      label: 'Schedule of Requirements (Section VI)',
      required: true,
      accept: '.docx,.pdf,.xlsx',
      acceptedExtensions: ['.docx', '.pdf', '.xlsx'],
      helperText: 'Required for all categories. Max 10 MB.',
    },
    {
      key: 'specialConditions',
      label: 'Special Conditions of Contract (Section V)',
      required: true,
      accept: '.docx,.pdf',
      acceptedExtensions: ['.docx', '.pdf'],
      helperText:
        'Required only when the BAC/TWG is using customized SCC content. Max 10 MB.',
    },
    {
      key: 'drawingsAndTechnicalSpecifications',
      label: 'Drawings and Technical Specifications',
      required: true,
      accept: '.docx,.pdf',
      acceptedExtensions: ['.docx', '.pdf'],
      helperText:
        'Infrastructure only. Required for works packages. Max 10 MB.',
    },
    {
      key: 'billOfQuantities',
      label: 'Bill of Quantities (BOQ)',
      required: true,
      accept: '.xlsx,.pdf',
      acceptedExtensions: ['.xlsx', '.pdf'],
      helperText: 'Infrastructure only. Required BOQ file. Max 10 MB.',
    },
    {
      key: 'termsOfReference',
      label: 'Terms of Reference (TOR)',
      required: true,
      accept: '.docx,.pdf',
      acceptedExtensions: ['.docx', '.pdf'],
      helperText: 'Consulting only. Required TOR upload. Max 10 MB.',
    },
    {
      key: 'technicalProposalForms',
      label: 'Technical Proposal Forms (TPF 1 to 8)',
      required: true,
      accept: '.docx,.pdf',
      acceptedExtensions: ['.docx', '.pdf'],
      helperText:
        'Consulting only. Required technical proposal forms upload. Max 10 MB.',
    },
  ]

export const DEFAULT_BIDDING_DOCUMENT_GATES: BiddingDocumentGates = {
  confirmedSchedule: true,
  consolidatedPrApproved: true,
  bacResolutionIssued: true,
  gppbTemplatesAvailable: true,
}

const EMPTY_UPLOADS: Record<BiddingDocumentUploadSlotKey, null> = {
  technicalSpecifications: null,
  scheduleOfRequirements: null,
  specialConditions: null,
  drawingsAndTechnicalSpecifications: null,
  billOfQuantities: null,
  termsOfReference: null,
  technicalProposalForms: null,
}

export function areAllGatesPassed(gates: BiddingDocumentGates) {
  return Object.values(gates).every(Boolean)
}

export function isFieldComplete(value: string) {
  return value.trim().length > 0
}

export function getRequiredFieldDefinitions(record: BiddingDocumentRecord) {
  return getRequiredStructuredFieldDefinitions(record)
}

export function getUploadSlotDefinitions(
  record: Pick<
    BiddingDocumentRecord,
    'procurementCategory' | 'uploads' | 'workspace'
  >,
) {
  const keys: Array<BiddingDocumentUploadSlotKey> = [
    'scheduleOfRequirements',
    'specialConditions',
  ]

  if (record.procurementCategory === 'goods') {
    keys.unshift('technicalSpecifications')
  }

  if (record.procurementCategory === 'infrastructure') {
    keys.unshift('drawingsAndTechnicalSpecifications', 'billOfQuantities')
  }

  if (record.procurementCategory === 'consulting') {
    keys.unshift('termsOfReference', 'technicalProposalForms')
  }

  const customizedSpecialConditions =
    record.workspace?.draft?.uploads?.customizedSections?.specialConditions ??
    Boolean(record.uploads.specialConditions)

  return keys
    .map((key) => UPLOAD_SLOT_DEFINITIONS.find((slot) => slot.key === key))
    .filter((slot): slot is BiddingDocumentUploadSlotDefinition =>
      Boolean(slot),
    )
    .map((slot) => ({
      ...slot,
      required:
        slot.key === 'specialConditions' ? customizedSpecialConditions : true,
    }))
}

export function getRequiredUploadDefinitions(record: BiddingDocumentRecord) {
  return getUploadSlotDefinitions(record).filter((slot) => slot.required)
}

export function normalizeUploadSlots(record: BiddingDocumentRecord) {
  const normalized = {
    ...EMPTY_UPLOADS,
    ...record.uploads,
  }

  if (
    record.procurementCategory === 'infrastructure' &&
    record.uploads.technicalSpecifications &&
    !record.uploads.drawingsAndTechnicalSpecifications
  ) {
    normalized.drawingsAndTechnicalSpecifications =
      record.uploads.technicalSpecifications
  }

  if (
    record.procurementCategory === 'consulting' &&
    record.uploads.technicalSpecifications &&
    !record.uploads.termsOfReference
  ) {
    normalized.termsOfReference = record.uploads.technicalSpecifications
  }

  return normalized
}

export function getStructuredProgress(record: BiddingDocumentRecord) {
  const requiredFields = getRequiredFieldDefinitions(record)
  const completed = requiredFields.filter((field) =>
    isStructuredFieldComplete(record, field),
  ).length

  return {
    complete: completed,
    total: requiredFields.length,
  }
}

export function getUploadProgress(record: BiddingDocumentRecord) {
  const requiredUploads = getRequiredUploadDefinitions(record)
  const completed = requiredUploads.filter(
    (slot) => record.uploads[slot.key],
  ).length

  return {
    complete: completed,
    total: requiredUploads.length,
  }
}

export function getOverallProgress(record: BiddingDocumentRecord) {
  const fieldProgress = getStructuredProgress(record)
  const uploadProgress = getUploadProgress(record)
  const complete = fieldProgress.complete + uploadProgress.complete
  const total = fieldProgress.total + uploadProgress.total

  return {
    complete,
    total,
    percent: total === 0 ? 0 : Math.round((complete / total) * 100),
  }
}

function getProgressState(
  record: BiddingDocumentRecord,
): BiddingDocumentProgressState {
  const prerequisitesComplete = Object.values(record.gates).filter(
    Boolean,
  ).length
  const prerequisitesTotal = Object.values(record.gates).length
  const structuredInputs = getStructuredProgress(record)
  const uploads = getUploadProgress(record)
  const overall = {
    complete:
      structuredInputs.complete + uploads.complete + prerequisitesComplete,
    total: structuredInputs.total + uploads.total + prerequisitesTotal,
    percent: 0,
  }

  overall.percent =
    overall.total === 0
      ? 0
      : Math.round((overall.complete / overall.total) * 100)

  return {
    prerequisites: {
      complete: prerequisitesComplete,
      total: prerequisitesTotal,
    },
    structuredInputs,
    uploads,
    overall,
  }
}

function buildWorkspace(record: BiddingDocumentRecord) {
  const progress = getProgressState(record)
  const customizedSpecialConditions =
    record.workspace?.draft?.uploads?.customizedSections?.specialConditions ??
    Boolean(record.uploads.specialConditions)

  return {
    phaseOrder: BIDDING_DOCUMENT_PHASE_SCAFFOLD.map(
      (phase) => phase.key,
    ) as Array<BiddingDocumentPhaseKey>,
    activePhase: getActivePhase(record, progress),
    draft: {
      form: {
        values: { ...record.structuredFields },
        persistenceKey: `pbd-draft-${record.bacResolutionId}`,
        lastSavedAt: record.lastDraftSavedAt,
      },
      uploads: {
        slots: { ...record.uploads },
        customizedSections: {
          specialConditions: customizedSpecialConditions,
        },
      },
    },
    review: {
      templateKey: record.procurementCategory,
      previewPages: record.previewPages,
      currentPage: 0,
    },
    progress,
    sourceLinks: {
      schedule: `/v2/bac-resolutions/${record.bacResolutionId}/bidding-schedule`,
      pr: '/v2/consolidate-prs',
      agencyProfile: '/v2/organization',
      bacProfile: '/v2/bac-resolutions',
    },
  }
}

function withWorkspace(record: BiddingDocumentRecord): BiddingDocumentRecord {
  const normalizedRecord = {
    ...record,
    structuredFields: normalizeStructuredFieldValues(
      record.structuredFields,
      record,
    ),
    uploads: normalizeUploadSlots(record),
  }
  const workspace = buildWorkspace(normalizedRecord)

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
    workspace,
  }
}

export function getSectionProgress(record: BiddingDocumentRecord) {
  const structuredSections = getStructuredFieldSections(record).map(
    (section) => {
      const requiredFields = section.fields.filter((field) => field.required)

      return {
        key: section.key,
        label: section.label,
        complete: requiredFields.filter((field) =>
          isStructuredFieldComplete(record, field),
        ).length,
        total: requiredFields.length,
      }
    },
  )

  return [
    ...structuredSections,
    {
      key: 'uploads',
      label: 'Section Uploads',
      complete: getUploadProgress(record).complete,
      total: getUploadProgress(record).total,
    },
  ]
}

export function canGenerateBiddingDocument(record: BiddingDocumentRecord) {
  const fieldProgress = getStructuredProgress(record)
  const uploadProgress = getUploadProgress(record)

  return (
    areAllGatesPassed(record.gates) &&
    fieldProgress.complete === fieldProgress.total &&
    uploadProgress.complete === uploadProgress.total
  )
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatFileSize(sizeBytes: number) {
  const mb = sizeBytes / (1024 * 1024)
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`
  }

  return `${Math.round(sizeBytes / 1024)} KB`
}
