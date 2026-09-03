import { PROCUREMENT_CATEGORY_LABELS } from '../../bidding-schedule/data/mockBiddingScheduleData'
import type {
  BiddingDocumentFieldKey,
  BiddingDocumentGates,
  BiddingDocumentPhaseKey,
  BiddingDocumentPreviewPage,
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
  getVisibleStructuredFieldDefinitions,
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

const EMPTY_FIELDS: Record<BiddingDocumentFieldKey, string> =
  createEmptyStructuredFieldValues()

const EMPTY_UPLOADS: Record<BiddingDocumentUploadSlotKey, null> = {
  technicalSpecifications: null,
  scheduleOfRequirements: null,
  specialConditions: null,
  drawingsAndTechnicalSpecifications: null,
  billOfQuantities: null,
  termsOfReference: null,
  technicalProposalForms: null,
}

const now = () => new Date().toISOString()

function createUpload(
  fileName: string,
  sizeBytes: number,
  uploadedBy: string,
  uploadedAt = now(),
) {
  return {
    fileName,
    sizeBytes,
    uploadedAt,
    uploadedBy,
  }
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

export function buildPreviewPages(
  record: BiddingDocumentRecord,
): Array<BiddingDocumentPreviewPage> {
  const categoryLabel = PROCUREMENT_CATEGORY_LABELS[record.procurementCategory]
  const uploadLines = getUploadSlotDefinitions(record).map((slot) => {
    const file = record.uploads[slot.key]
    return `${slot.label}: ${file ? file.fileName : 'Missing upload'}`
  })

  return [
    {
      id: `${record.id}-page-1`,
      title: `Template Selection — ${categoryLabel}`,
      lines: [
        `Agency: ${record.agencyName}`,
        `Address: ${record.agencyAddress}`,
        `BAC Chairperson: ${record.bacChairperson}`,
        `Project Title: ${record.projectTitle}`,
        `Contract ID: ${record.contractId}`,
        `ABC: ${formatCurrency(record.abc)}`,
        `Funding Source: ${record.fundingSource}`,
      ],
    },
    {
      id: `${record.id}-page-2`,
      title: 'Confirmed Calendar Dates',
      lines: [
        `IB Posting Date: ${record.scheduleSnapshot.ibPostingDate}`,
        `Pre-Bid Conference: ${record.scheduleSnapshot.preBidConference}`,
        `Bid Submission Deadline: ${record.scheduleSnapshot.bidSubmissionDeadline}`,
        `Bid Opening: ${record.scheduleSnapshot.bidOpening}`,
        `Bid Security Validity: ${record.scheduleSnapshot.bidSecurityValidity}`,
      ],
    },
    {
      id: `${record.id}-page-3`,
      title: 'Structured Inputs',
      lines: getVisibleStructuredFieldDefinitions(record).map((field) => {
        const value =
          getStructuredFieldDisplayValue(record, field).trim() || 'Not provided'
        return `${field.label}: ${value}`
      }),
    },
    {
      id: `${record.id}-page-4`,
      title: 'Inserted Uploaded Sections',
      lines: uploadLines,
    },
  ]
}

export function getMockBiddingDocumentDatabase(): Array<BiddingDocumentRecord> {
  return [
    {
      id: 'pbd-goods-004',
      bacResolutionId: 'bac-resolution-004',
      bacResolutionNumber: 'BAC-RES-2026-004',
      projectTitle: 'Fleet Maintenance Package',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-004',
      abc: 188000,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'goods',
      status: 'draft',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '30 calendar days from receipt of NTP',
        deliveryLocation: 'Regional Supply Office, Batangas City',
        performanceSecurity: '5% cash or surety bond',
        paymentTerms: 'Payment upon delivery, inspection, and acceptance',
        additionalRequirements:
          'Include warranty coverage and after-sales support for maintenance items.',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'fleet-maintenance-technical-specifications.docx',
          1_180_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: createUpload(
          'fleet-maintenance-schedule.xlsx',
          740_000,
          'TWG Secretariat Demo',
        ),
        specialConditions: createUpload(
          'fleet-maintenance-special-conditions.pdf',
          860_000,
          'BAC Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'May 05, 2026',
        preBidConference: 'May 12, 2026 9:00 AM',
        bidSubmissionDeadline: 'May 25, 2026 9:00 AM',
        bidOpening: 'May 25, 2026 10:00 AM',
        bidSecurityValidity: 'Sep 22, 2026',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: null,
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-goods-005',
      bacResolutionId: 'bac-resolution-005',
      bacResolutionNumber: 'BAC-RES-2026-005',
      projectTitle: 'Server Rack Accessories',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-005',
      abc: 73600,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'goods',
      status: 'draft',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '45 calendar days from receipt of NTP',
        deliveryLocation: 'ICT Warehouse, Batangas City',
        performanceSecurity: '5% cash or surety bond',
        paymentTerms: 'Payment upon complete delivery and inspection',
        additionalRequirements:
          'Include rack labeling and cable-management provisions.',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'server-rack-accessories-specifications.docx',
          1_150_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: createUpload(
          'server-rack-accessories-schedule.xlsx',
          720_000,
          'TWG Secretariat Demo',
        ),
        specialConditions: createUpload(
          'server-rack-accessories-special-conditions.pdf',
          835_000,
          'BAC Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'Pending TC-01 generation',
        preBidConference: 'Pending TC-01 generation',
        bidSubmissionDeadline: 'Pending TC-01 generation',
        bidOpening: 'Pending TC-01 generation',
        bidSecurityValidity: 'Pending TC-01 generation',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-goods-006',
      bacResolutionId: 'bac-resolution-006',
      bacResolutionNumber: 'BAC-RES-2026-006',
      projectTitle: 'Data Center Cooling Upgrade',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-006',
      abc: 620000,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'goods',
      status: 'draft',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '45 calendar days from receipt of NTP',
        deliveryLocation: 'Regional Supply Office, Batangas City',
        performanceSecurity: '5% cash or surety bond',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'technical-specifications-goods.docx',
          2_400_000,
          'TWG Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'May 15, 2026',
        preBidConference: 'May 22, 2026 9:00 AM',
        bidSubmissionDeadline: 'Jun 03, 2026 9:30 AM',
        bidOpening: 'Jun 03, 2026 10:00 AM',
        bidSecurityValidity: 'Oct 01, 2026',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: null,
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-goods-007',
      bacResolutionId: 'bac-resolution-007',
      bacResolutionNumber: 'BAC-RES-2026-007',
      projectTitle: 'Emergency Response Radios',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-007',
      abc: 308200,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'goods',
      status: 'generated',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '30 calendar days from receipt of NTP',
        deliveryLocation: 'Disaster Risk Office Logistics Hub',
        performanceSecurity: '5% cash or surety bond',
        paymentTerms: 'Payment after complete delivery and acceptance',
        additionalRequirements:
          'Include programming, battery testing, and deployment briefing.',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'emergency-response-radios-specs.docx',
          1_420_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: createUpload(
          'emergency-response-radios-schedule.xlsx',
          820_000,
          'TWG Secretariat Demo',
        ),
        specialConditions: createUpload(
          'emergency-response-radios-special-conditions.pdf',
          910_000,
          'BAC Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'Pending TC-01 generation',
        preBidConference: 'Pending TC-01 generation',
        bidSubmissionDeadline: 'Pending TC-01 generation',
        bidOpening: 'Pending TC-01 generation',
        bidSecurityValidity: 'Pending TC-01 generation',
      },
      generatedAt: now(),
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-civil-002',
      bacResolutionId: 'bac-resolution-002',
      bacResolutionNumber: 'BAC-RES-2026-002',
      projectTitle: 'Rehabilitation of District Engineering Office Annex',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-CW-002',
      abc: 12800000,
      fundingSource: 'Infrastructure Program FY 2026',
      procurementCategory: 'infrastructure',
      status: 'draft',
      gates: {
        // Intentionally blocked in mock data until the TC-01 flow can feed
        // this record from a confirmed schedule instead of a seeded stub.
        confirmedSchedule: false,
        consolidatedPrApproved: true,
        bacResolutionIssued: false,
        gppbTemplatesAvailable: true,
      },
      structuredFields: { ...EMPTY_FIELDS },
      uploads: { ...EMPTY_UPLOADS },
      scheduleSnapshot: {
        ibPostingDate: 'Pending TC-01 confirmation',
        preBidConference: 'Pending TC-01 confirmation',
        bidSubmissionDeadline: 'Pending TC-01 confirmation',
        bidOpening: 'Pending TC-01 confirmation',
        bidSecurityValidity: 'Pending TC-01 confirmation',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: null,
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-consulting-003',
      bacResolutionId: 'bac-resolution-003',
      bacResolutionNumber: 'BAC-RES-2026-003',
      projectTitle:
        'Consulting Services for Feasibility Study and Detailed Engineering Design',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-CS-007',
      abc: 3450000,
      fundingSource: 'Consulting Services Fund FY 2026',
      procurementCategory: 'consulting',
      status: 'generated',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single engagement package',
        deliveryPeriod: '120 calendar days from Notice to Proceed',
        deliveryLocation: 'Regional Planning and Design Division',
        performanceSecurity: 'Consulting security per template provisions',
        paymentTerms:
          'Monthly progress billing subject to deliverable acceptance',
        additionalRequirements:
          'Include key personnel availability, inception report, and stakeholder workshop schedule.',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        termsOfReference: createUpload(
          'consulting-terms-of-reference.docx',
          1_600_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: createUpload(
          'consulting-schedule-of-requirements.xlsx',
          860_000,
          'TWG Secretariat Demo',
        ),
        technicalProposalForms: createUpload(
          'consulting-technical-proposal-forms.pdf',
          910_000,
          'TWG Secretariat Demo',
        ),
        specialConditions: createUpload(
          'consulting-special-conditions.pdf',
          980_000,
          'BAC Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'Mar 03, 2026',
        preBidConference: 'Mar 17, 2026 1:30 PM',
        bidSubmissionDeadline: 'Apr 16, 2026 9:00 AM',
        bidOpening: 'Apr 16, 2026 10:00 AM',
        bidSecurityValidity: 'Aug 14, 2026',
      },
      generatedAt: now(),
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-goods-008',
      bacResolutionId: 'bac-resolution-008',
      bacResolutionNumber: 'BAC-RES-2026-008',
      projectTitle: 'Medical Supplies Q2',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-008',
      abc: 980000,
      fundingSource: 'Medical Services Fund FY 2026',
      procurementCategory: 'goods',
      status: 'draft',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '30 calendar days from receipt of NTP',
        deliveryLocation: 'Regional Supply Office, Batangas City',
        performanceSecurity: '',
        paymentTerms: 'Payment upon delivery, inspection, and acceptance',
        additionalRequirements: '',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'medical-supplies-technical-specifications.docx',
          1_200_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: null,
        specialConditions: null,
      },
      scheduleSnapshot: {
        ibPostingDate: 'Pending TC-01 generation',
        preBidConference: 'Pending TC-01 generation',
        bidSubmissionDeadline: 'Pending TC-01 generation',
        bidOpening: 'Pending TC-01 generation',
        bidSecurityValidity: 'Pending TC-01 generation',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-goods-009',
      bacResolutionId: 'bac-resolution-009',
      bacResolutionNumber: 'BAC-RES-2026-009',
      projectTitle: 'IT Backbone Expansion',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-009',
      abc: 424800,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'goods',
      status: 'draft',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '',
        deliveryLocation: 'ICT Office Main Data Room',
        performanceSecurity: '',
        paymentTerms: '',
        additionalRequirements: '',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'it-backbone-expansion-specifications.docx',
          1_340_000,
          'TWG Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'Pending TC-01 generation',
        preBidConference: 'Pending TC-01 generation',
        bidSubmissionDeadline: 'Pending TC-01 generation',
        bidOpening: 'Pending TC-01 generation',
        bidSecurityValidity: 'Pending TC-01 generation',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-goods-010',
      bacResolutionId: 'bac-resolution-010',
      bacResolutionNumber: 'BAC-RES-2026-010',
      projectTitle: 'ICT Backbone Expansion Follow-On Package',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-010',
      abc: 144000,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'goods',
      status: 'draft',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '60 calendar days from receipt of NTP',
        deliveryLocation: 'ICT Office Main Data Room',
        performanceSecurity: '5% cash or surety bond',
        paymentTerms: 'Progress billing upon accepted milestone deliveries',
        additionalRequirements:
          'Include rack integration testing and turnover documentation.',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'ict-backbone-follow-on-specifications.docx',
          1_030_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: createUpload(
          'ict-backbone-follow-on-schedule.xlsx',
          690_000,
          'TWG Secretariat Demo',
        ),
        specialConditions: createUpload(
          'ict-backbone-follow-on-special-conditions.pdf',
          790_000,
          'BAC Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'Pending TC-01 generation',
        preBidConference: 'Pending TC-01 generation',
        bidSubmissionDeadline: 'Pending TC-01 generation',
        bidOpening: 'Pending TC-01 generation',
        bidSecurityValidity: 'Pending TC-01 generation',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-goods-012',
      bacResolutionId: 'bac-resolution-012',
      bacResolutionNumber: 'BAC-RES-2026-012',
      projectTitle: 'Emergency Response Radios',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-GOODS-012',
      abc: 308200,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'goods',
      status: 'posted',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '30 calendar days from receipt of NTP',
        deliveryLocation: 'Regional Supply Office, Batangas City',
        performanceSecurity: '5% cash or surety bond',
        paymentTerms: 'Payment upon delivery, inspection, and acceptance',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        technicalSpecifications: createUpload(
          'emergency-response-radios-specs.docx',
          1_420_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: createUpload(
          'emergency-response-radios-schedule.xlsx',
          820_000,
          'TWG Secretariat Demo',
        ),
        specialConditions: createUpload(
          'emergency-response-radios-special-conditions.pdf',
          910_000,
          'BAC Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'May 20, 2026',
        preBidConference: 'May 27, 2026 9:00 AM',
        bidSubmissionDeadline: 'Jun 08, 2026 9:00 AM',
        bidOpening: 'Jun 08, 2026 10:00 AM',
        bidSecurityValidity: 'Oct 06, 2026',
      },
      generatedAt: now(),
      postedAt: now(),
      postedBy: 'BAC Secretariat Demo',
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
    {
      id: 'pbd-civil-003',
      bacResolutionId: 'bac-resolution-019',
      bacResolutionNumber: 'BAC-RES-2026-019',
      projectTitle: 'Road Signage and Markings Installation',
      agencyName: 'DPWH Regional Office IV-A',
      agencyAddress: 'J.P. Rizal Street, Batangas City',
      bacChairperson: 'Engr. Maria Corazon Dela Cruz',
      contractId: 'PB-2026-CW-003',
      abc: 298500,
      fundingSource: 'General Appropriations Act FY 2026',
      procurementCategory: 'infrastructure',
      status: 'draft',
      gates: { ...DEFAULT_BIDDING_DOCUMENT_GATES },
      structuredFields: {
        ...EMPTY_FIELDS,
        bidValidityDays: '120',
        lotGrouping: 'Single lot',
        deliveryPeriod: '45 calendar days from receipt of NTP',
        deliveryLocation: 'District Engineering Office, Batangas City',
        performanceSecurity: '5% cash or surety bond',
        paymentTerms: 'Payment upon delivery, inspection, and acceptance',
        additionalRequirements:
          'Include reflective materials, installation, and pavement marking provisions.',
      },
      uploads: {
        ...EMPTY_UPLOADS,
        drawingsAndTechnicalSpecifications: createUpload(
          'road-signage-drawings-and-specifications.docx',
          1_240_000,
          'TWG Secretariat Demo',
        ),
        billOfQuantities: createUpload(
          'road-signage-boq.xlsx',
          640_000,
          'TWG Secretariat Demo',
        ),
        scheduleOfRequirements: createUpload(
          'road-signage-schedule.xlsx',
          780_000,
          'TWG Secretariat Demo',
        ),
        specialConditions: createUpload(
          'road-signage-special-conditions.pdf',
          890_000,
          'BAC Secretariat Demo',
        ),
      },
      scheduleSnapshot: {
        ibPostingDate: 'Jun 05, 2026',
        preBidConference: 'Jun 12, 2026 9:00 AM',
        bidSubmissionDeadline: 'Jun 26, 2026 9:00 AM',
        bidOpening: 'Jun 26, 2026 10:00 AM',
        bidSecurityValidity: 'Oct 24, 2026',
      },
      generatedAt: null,
      postedAt: null,
      postedBy: null,
      lastDraftSavedAt: now(),
      previewPages: [],
      needsRegeneration: false,
    },
  ].map((record) => withWorkspace(record as BiddingDocumentRecord))
}
