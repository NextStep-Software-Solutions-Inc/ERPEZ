import type { ProcurementCategory } from '../../bidding-schedule/types'
import type {
  BiddingDocumentFieldDefinition,
  BiddingDocumentFieldOption,
  BiddingDocumentRecord,
  BiddingDocumentSectionDefinition,
} from '../types'

type LotGroupingEntry = {
  id: string
  lotName: string
  scope: string
}

type TechnicalEvaluationCriterion = {
  id: string
  criterion: string
  weightPercent: string
  minimumScore: string
}

type TechnicalProposalPageLimitEntry = {
  id: string
  sectionName: string
  maxPages: string
}

const TECHNICAL_PROPOSAL_PAGE_LIMIT_TEMPLATE = [
  'TPF 1 - Consultant / Firm Information',
  'TPF 2 - Relevant Experience',
  'TPF 3 - Comments and Suggestions',
  'TPF 4 - Work Plan / Methodology',
] as const

const SOURCE_CONTACT_NAME = 'Head, BAC Secretariat'
const SOURCE_CONTACT_PHONE = '(043) 723-4567 / (043) 723-4568'
const SOURCE_CONTACT_EMAIL = 'bac.secretariat@dpwh4a.gov.ph'
const SOURCE_WEBSITE = 'https://region4a.dpwh.gov.ph'

const SUBMISSION_METHOD_OPTIONS: Array<BiddingDocumentFieldOption> = [
  { value: 'manual', label: 'Manual' },
  { value: 'online', label: 'Online' },
  { value: 'both', label: 'Both / Hybrid' },
]

const ALLOWED_NOT_ALLOWED_OPTIONS: Array<BiddingDocumentFieldOption> = [
  { value: 'allowed', label: 'Allowed' },
  { value: 'not-allowed', label: 'Not allowed' },
]

const YES_NO_OPTIONS: Array<BiddingDocumentFieldOption> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

const CONSULTING_EVALUATION_OPTIONS: Array<BiddingDocumentFieldOption> = [
  { value: 'qcbs', label: 'QCBS / QCBE' },
  { value: 'qbs', label: 'QBS / QBE' },
  { value: 'fixed-budget', label: 'Fixed Budget' },
  { value: 'least-cost', label: 'Least Cost' },
]

const PERFORMANCE_SECURITY_TYPE_OPTIONS: Array<BiddingDocumentFieldOption> = [
  { value: 'cash', label: 'Cash' },
  { value: 'surety-bond', label: 'Surety Bond' },
  { value: 'bank-guarantee', label: 'Bank Guarantee' },
  { value: 'letter-of-credit', label: 'Letter of Credit' },
]

export const BIDDING_DOCUMENT_SECTION_DEFINITIONS: Array<BiddingDocumentSectionDefinition> =
  [
    {
      key: 'source-and-schedule',
      label: 'Source and Schedule Data',
      description:
        'Read-only values coming from the Agency Profile, Consolidated PR, BAC Resolution, and confirmed TC-01 schedule.',
    },
    {
      key: 'submission-and-security',
      label: 'Submission and Security Settings',
      description:
        'BAC-configured rules that affect submission, eligibility, bid security, and Phase 0A readiness.',
    },
    {
      key: 'venues-and-contact',
      label: 'Venues and Contact Details',
      description:
        'Editable venue defaults plus source-owned contact details that appear in the assembled PBD.',
    },
    {
      key: 'goods',
      label: 'Goods-Specific Inputs',
      description: 'Render only when the procurement category is Goods.',
    },
    {
      key: 'infrastructure',
      label: 'Infrastructure-Specific Inputs',
      description:
        'Render only when the procurement category is Infrastructure.',
    },
    {
      key: 'consulting',
      label: 'Consulting-Specific Inputs',
      description:
        'Render only when the procurement category is Consulting Services.',
    },
  ]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 2,
  }).format(amount)
}

function buildVenue(address: string) {
  return `BAC Conference Room, ${address}`
}

function buildSuggestedBiddingFee(abc: number) {
  if (abc <= 500_000) {
    return '500'
  }

  if (abc <= 1_000_000) {
    return '1000'
  }

  if (abc <= 5_000_000) {
    return '5000'
  }

  if (abc <= 10_000_000) {
    return '10000'
  }

  return '25000'
}

function buildPerformanceSecurityAmounts(
  abc: number,
  securityType: string,
): string {
  switch (securityType) {
    case 'cash':
      return `5% of ABC = ${formatCurrency(abc * 0.05)}`
    case 'surety-bond':
      return `3% of ABC = ${formatCurrency(abc * 0.03)}`
    case 'bank-guarantee':
      return `2% of ABC = ${formatCurrency(abc * 0.02)}`
    case 'letter-of-credit':
      return `3% of ABC = ${formatCurrency(abc * 0.03)}`
    default:
      return 'Select a security type'
  }
}

function isOnlineSubmission(record: BiddingDocumentRecord) {
  const submissionMethod = getStoredStructuredFieldValue(
    record,
    'bidSubmissionMethod',
  )

  return submissionMethod === 'online' || submissionMethod === 'both'
}

function shouldShowSubcontractingDetails(record: BiddingDocumentRecord) {
  return (
    getStoredStructuredFieldValue(record, 'subcontractingPolicy') === 'allowed'
  )
}

function shouldShowLotGroupingDetails(record: BiddingDocumentRecord) {
  return (
    getStoredStructuredFieldValue(record, 'partialBidsPolicy') === 'allowed'
  )
}

function shouldShowConsultingStaffMonths(record: BiddingDocumentRecord) {
  return (
    getStoredStructuredFieldValue(record, 'evaluationProcedure') !==
    'fixed-budget'
  )
}

function createBuilderId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`
}

function getDefaultTechnicalEvaluationCriteria() {
  return [
    {
      id: createBuilderId('criterion', 0),
      criterion: 'Experience of the consultant / firm',
      weightPercent: '',
      minimumScore: '',
    },
    {
      id: createBuilderId('criterion', 1),
      criterion: 'Qualifications of key experts',
      weightPercent: '',
      minimumScore: '',
    },
    {
      id: createBuilderId('criterion', 2),
      criterion: 'Methodology and work plan',
      weightPercent: '',
      minimumScore: '',
    },
    {
      id: createBuilderId('criterion', 3),
      criterion: 'Knowledge transfer / local participation',
      weightPercent: '',
      minimumScore: '',
    },
  ]
}

function getDefaultTechnicalProposalPageLimits() {
  return TECHNICAL_PROPOSAL_PAGE_LIMIT_TEMPLATE.map((sectionName, index) => ({
    id: createBuilderId('page-limit', index),
    sectionName,
    maxPages: '',
  }))
}

export const STRUCTURED_FIELD_DEFINITIONS: Array<BiddingDocumentFieldDefinition> =
  [
    {
      key: 'procuringEntityName',
      section: 'source-and-schedule',
      label: 'Procuring Entity name',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Agency Profile.',
    },
    {
      key: 'sourceOfFundingAndYear',
      section: 'source-and-schedule',
      label: 'Source of funding and year',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Consolidated PR.',
    },
    {
      key: 'approvedBudgetForContract',
      section: 'source-and-schedule',
      label: 'Approved Budget for the Contract (ABC)',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Consolidated PR.',
    },
    {
      key: 'projectTitle',
      section: 'source-and-schedule',
      label: 'Project title',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the BAC Resolution and PR context.',
    },
    {
      key: 'contractIdentificationNumber',
      section: 'source-and-schedule',
      label: 'Contract identification number',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the procurement record.',
    },
    {
      key: 'bacChairpersonName',
      section: 'source-and-schedule',
      label: 'BAC Chairperson name',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the BAC profile.',
    },
    {
      key: 'preBidConferenceDateTime',
      section: 'source-and-schedule',
      label: 'Pre-Bid Conference date and time',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'schedule',
      sourceNote: 'Auto-filled from the confirmed TC-01 schedule.',
    },
    {
      key: 'bidSubmissionDeadlineDateTime',
      section: 'source-and-schedule',
      label: 'Bid submission deadline date and time',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'schedule',
      sourceNote: 'Auto-filled from the confirmed TC-01 schedule.',
    },
    {
      key: 'bidOpeningDateTime',
      section: 'source-and-schedule',
      label: 'Bid opening date and time',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'schedule',
      sourceNote: 'Auto-filled from the confirmed TC-01 schedule.',
    },
    {
      key: 'availabilityOfBiddingDocumentsDate',
      section: 'source-and-schedule',
      label: 'Availability of bidding documents date',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'schedule',
      sourceNote: 'Auto-filled from the confirmed TC-01 schedule.',
    },
    {
      key: 'bidSecurityValidityDate',
      section: 'source-and-schedule',
      label: 'Bid security validity date',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'schedule',
      sourceNote: 'Auto-filled from the confirmed TC-01 schedule.',
    },
    {
      key: 'biddingDocumentsFee',
      section: 'submission-and-security',
      label: 'Bidding documents fee (PHP)',
      required: true,
      inputType: 'number',
      placeholder: '1000',
      helperText:
        'Mock prefill based on ABC bracket. Final rule can be tightened later.',
    },
    {
      key: 'trackRecordPeriodYears',
      section: 'submission-and-security',
      label: 'Track record period (years)',
      required: true,
      inputType: 'number',
      placeholder: '5',
      helperText:
        'Consulting will later add the stricter maximum-10-years validation rule.',
    },
    {
      key: 'bidValidityPeriodDays',
      section: 'submission-and-security',
      label: 'Bid validity period (days)',
      required: true,
      inputType: 'number',
      placeholder: '120',
    },
    {
      key: 'bidSubmissionMethod',
      section: 'submission-and-security',
      label: 'Bid submission method',
      required: true,
      inputType: 'select',
      options: SUBMISSION_METHOD_OPTIONS,
      helperText: 'Controls whether the optional online-only fields are shown.',
    },
    {
      key: 'foreignBidderParticipation',
      section: 'submission-and-security',
      label: 'Foreign bidder participation',
      required: true,
      inputType: 'select',
      options: ALLOWED_NOT_ALLOWED_OPTIONS,
    },
    {
      key: 'subcontractingPolicy',
      section: 'submission-and-security',
      label: 'Subcontracting',
      required: true,
      inputType: 'select',
      options: ALLOWED_NOT_ALLOWED_OPTIONS,
    },
    {
      key: 'subcontractingDetails',
      section: 'submission-and-security',
      label: 'Subcontracting details',
      required: true,
      inputType: 'textarea',
      placeholder: 'Describe the allowed portions and maximum percentage.',
      helperText: 'Shown only when subcontracting is allowed.',
      visibleWhen: shouldShowSubcontractingDetails,
    },
    {
      key: 'partialBidsPolicy',
      section: 'submission-and-security',
      label: 'Partial bids / lot groupings',
      required: true,
      inputType: 'select',
      options: ALLOWED_NOT_ALLOWED_OPTIONS,
    },
    {
      key: 'partialBidsLotGroupingDetails',
      section: 'submission-and-security',
      label: 'Lot grouping details',
      required: true,
      inputType: 'textarea',
      placeholder: 'Describe the permitted lots or grouping structure.',
      helperText:
        'Define the lots and scope that bidders may partially bid for.',
      visibleWhen: shouldShowLotGroupingDetails,
    },
    {
      key: 'arithmeticalCorrectionPolicy',
      section: 'submission-and-security',
      label: 'Arithmetical correction',
      required: true,
      inputType: 'select',
      options: YES_NO_OPTIONS,
      applicableCategories: ['goods', 'infrastructure'],
      helperText: 'Applies only to Goods and Infrastructure.',
    },
    {
      key: 'performanceSecuringDeclarationPolicy',
      section: 'submission-and-security',
      label: 'Performance Securing Declaration allowed',
      required: true,
      inputType: 'select',
      options: YES_NO_OPTIONS,
    },
    {
      key: 'performanceSecurityType',
      section: 'submission-and-security',
      label: 'Performance security type',
      required: true,
      inputType: 'select',
      options: PERFORMANCE_SECURITY_TYPE_OPTIONS,
      helperText: 'Select the form of security to be submitted with bids.',
    },
    {
      key: 'performanceSecurityAmounts',
      section: 'submission-and-security',
      label: 'Performance security amounts',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'computed',
      sourceNote: 'Computed from the ABC based on selected security type.',
    },
    {
      key: 'bidSecurityAmounts',
      section: 'submission-and-security',
      label: 'Bid security amounts',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'computed',
      sourceNote: 'Computed from the ABC at 2% and 5%.',
    },
    {
      key: 'officeHoursForInspection',
      section: 'venues-and-contact',
      label: 'Office hours for document inspection',
      required: true,
      inputType: 'text',
      placeholder: '8:00 AM - 5:00 PM',
      helperText:
        'Prefilled from the mock agency profile and remains editable.',
    },
    {
      key: 'preBidConferenceVenue',
      section: 'venues-and-contact',
      label: 'Pre-Bid Conference venue',
      required: true,
      inputType: 'text',
      placeholder: 'BAC Conference Room',
      helperText:
        'Prefilled from the mock agency profile and remains editable.',
    },
    {
      key: 'bidOpeningVenue',
      section: 'venues-and-contact',
      label: 'Bid opening venue',
      required: true,
      inputType: 'text',
      placeholder: 'BAC Conference Room',
      helperText:
        'Prefilled from the mock agency profile and remains editable.',
    },
    {
      key: 'videoConferencingPlatformLink',
      section: 'venues-and-contact',
      label: 'Video conferencing platform and link',
      required: false,
      inputType: 'text',
      placeholder: 'Zoom / Teams link',
      visibleWhen: isOnlineSubmission,
      helperText: 'Shown only when bid submission is online or hybrid.',
    },
    {
      key: 'procuringEntityAddress',
      section: 'venues-and-contact',
      label: 'Procuring Entity address',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Agency Profile.',
    },
    {
      key: 'contactPersonNameAndDesignation',
      section: 'venues-and-contact',
      label: 'Contact person name and designation',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Agency Profile.',
    },
    {
      key: 'contactTelephoneAndFax',
      section: 'venues-and-contact',
      label: 'Contact telephone and fax',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Agency Profile.',
    },
    {
      key: 'contactEmailAddress',
      section: 'venues-and-contact',
      label: 'Contact email address',
      required: true,
      inputType: 'email',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Agency Profile.',
    },
    {
      key: 'procuringEntityWebsite',
      section: 'venues-and-contact',
      label: 'Procuring Entity website',
      required: true,
      inputType: 'text',
      readOnly: true,
      source: 'system',
      sourceNote: 'Auto-filled from the Agency Profile.',
    },
    {
      key: 'projectDescription',
      section: 'goods',
      label: 'Project description',
      required: true,
      inputType: 'textarea',
      placeholder: 'Describe the goods package and scope.',
      applicableCategories: ['goods'],
    },
    {
      key: 'requiredDeliveryDateOrContractDuration',
      section: 'goods',
      label: 'Required delivery date or contract duration',
      required: true,
      inputType: 'text',
      placeholder: '45 calendar days from receipt of NTP',
      applicableCategories: ['goods'],
    },
    {
      key: 'placeOfDestination',
      section: 'goods',
      label: 'Place of destination',
      required: true,
      inputType: 'text',
      placeholder: 'Regional Supply Office, Batangas City',
      applicableCategories: ['goods'],
    },
    {
      key: 'sparePartsSupplyPeriodMonths',
      section: 'goods',
      label: 'Spare parts supply period (months)',
      required: true,
      inputType: 'number',
      placeholder: '12',
      applicableCategories: ['goods'],
    },
    {
      key: 'descriptionOfWorks',
      section: 'infrastructure',
      label: 'Description of works to be procured',
      required: true,
      inputType: 'textarea',
      placeholder: 'Describe the works package.',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'requiredCompletionDate',
      section: 'infrastructure',
      label: 'Required completion date',
      required: true,
      inputType: 'date',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'intendedCompletionDate',
      section: 'infrastructure',
      label: 'Intended completion date',
      required: true,
      inputType: 'date',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'projectSiteLocation',
      section: 'infrastructure',
      label: 'Project site location',
      required: true,
      inputType: 'text',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'drawingNumberForProjectSite',
      section: 'infrastructure',
      label: 'Drawing number for project site',
      required: true,
      inputType: 'text',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'worksSummaryAndRelationship',
      section: 'infrastructure',
      label: 'Works summary and relationship to other contracts',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'definitionOfSimilarProject',
      section: 'infrastructure',
      label: 'Definition of similar project',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'additionalTrackRecordRequirement',
      section: 'infrastructure',
      label: 'Additional track record requirement',
      required: false,
      inputType: 'textarea',
      applicableCategories: ['infrastructure'],
      helperText: 'Optional field for foreign-funded infrastructure projects.',
    },
    {
      key: 'advancePaymentPercentageAndSchedule',
      section: 'infrastructure',
      label: 'Advance payment percentage and schedule',
      required: true,
      inputType: 'text',
      placeholder:
        '15% upon mobilization; balance per approved billing schedule',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'minimumWorksCompletionFirstProgressPayment',
      section: 'infrastructure',
      label: 'Minimum works completion for first progress payment (%)',
      required: true,
      inputType: 'number',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'penaltyPercentageForUncompletedWork',
      section: 'infrastructure',
      label: 'Penalty percentage for uncompleted work (%)',
      required: true,
      inputType: 'number',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'groundsForExtensionOfContractTime',
      section: 'infrastructure',
      label: 'Grounds for extension of contract time',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['infrastructure'],
    },
    {
      key: 'descriptionOfConsultingServices',
      section: 'consulting',
      label: 'Description of consulting services',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['consulting'],
    },
    {
      key: 'objectivesAndScopeOfProject',
      section: 'consulting',
      label: 'Objectives and scope of project',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['consulting'],
    },
    {
      key: 'evaluationProcedure',
      section: 'consulting',
      label: 'Evaluation procedure',
      required: true,
      inputType: 'select',
      options: CONSULTING_EVALUATION_OPTIONS,
      applicableCategories: ['consulting'],
    },
    {
      key: 'numberOfShortlistedConsultants',
      section: 'consulting',
      label: 'Number of shortlisted consultants',
      required: true,
      inputType: 'number',
      applicableCategories: ['consulting'],
      helperText: 'Later validation will enforce the 3 to 7 range.',
    },
    {
      key: 'shortlistingDocumentOpeningDateTime',
      section: 'consulting',
      label: 'Shortlisting document opening date and time',
      required: true,
      inputType: 'datetime-local',
      applicableCategories: ['consulting'],
    },
    {
      key: 'shortlistingSubmissionAddress',
      section: 'consulting',
      label: 'Submission address for shortlisting documents',
      required: true,
      inputType: 'text',
      applicableCategories: ['consulting'],
    },
    {
      key: 'onlineSubmissionEmail',
      section: 'consulting',
      label: 'Email address for online submission',
      required: false,
      inputType: 'email',
      applicableCategories: ['consulting'],
      visibleWhen: isOnlineSubmission,
    },
    {
      key: 'descriptionOfSimilarContracts',
      section: 'consulting',
      label: 'Description of similar contracts',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['consulting'],
    },
    {
      key: 'estimatedProfessionalStaffMonths',
      section: 'consulting',
      label: 'Estimated professional staff-months',
      required: false,
      inputType: 'number',
      applicableCategories: ['consulting'],
      visibleWhen: shouldShowConsultingStaffMonths,
      helperText:
        'Hidden when the evaluation procedure is Fixed Budget, per the task card.',
    },
    {
      key: 'technicalEvaluationWeightsAndMinimumScores',
      section: 'consulting',
      label: 'Technical evaluation weights and minimum scores per criterion',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['consulting'],
      helperText:
        'Build the technical evaluation matrix. Total weight must equal 100%.',
    },
    {
      key: 'minimumTechnicalScoreToPass',
      section: 'consulting',
      label: 'Minimum technical score to pass',
      required: true,
      inputType: 'number',
      applicableCategories: ['consulting'],
    },
    {
      key: 'financialProposalOpeningDateTime',
      section: 'consulting',
      label: 'Financial proposal opening date and time',
      required: true,
      inputType: 'datetime-local',
      applicableCategories: ['consulting'],
    },
    {
      key: 'financialProposalOpeningVenue',
      section: 'consulting',
      label: 'Financial proposal opening venue',
      required: true,
      inputType: 'text',
      applicableCategories: ['consulting'],
    },
    {
      key: 'nameOfFundingSource',
      section: 'consulting',
      label: 'Name of funding source',
      required: false,
      inputType: 'text',
      applicableCategories: ['consulting'],
      helperText: 'Optional for foreign-funded consulting projects.',
    },
    {
      key: 'contractTimePeriod',
      section: 'consulting',
      label: 'Contract time period',
      required: true,
      inputType: 'text',
      placeholder: '12 months',
      applicableCategories: ['consulting'],
    },
    {
      key: 'maximumPagesPerTechnicalProposalSection',
      section: 'consulting',
      label: 'Maximum pages per Technical Proposal section',
      required: true,
      inputType: 'textarea',
      applicableCategories: ['consulting'],
      helperText:
        'Set the page limits per Technical Proposal section using the matrix below.',
    },
    {
      key: 'maximumWordsForCommentsAndSuggestions',
      section: 'consulting',
      label: 'Maximum words for comments and suggestions',
      required: true,
      inputType: 'number',
      applicableCategories: ['consulting'],
    },
  ]

function getDefaultStructuredFieldValues(record: BiddingDocumentRecord) {
  return {
    biddingDocumentsFee: buildSuggestedBiddingFee(record.abc),
    trackRecordPeriodYears:
      record.procurementCategory === 'consulting' ? '10' : '5',
    bidValidityPeriodDays: '120',
    bidSubmissionMethod: 'manual',
    foreignBidderParticipation: 'not-allowed',
    subcontractingPolicy: 'not-allowed',
    subcontractingDetails: '',
    partialBidsPolicy: 'not-allowed',
    partialBidsLotGroupingDetails: '',
    arithmeticalCorrectionPolicy:
      record.procurementCategory === 'consulting' ? '' : 'yes',
    performanceSecuringDeclarationPolicy: 'yes',
    performanceSecurityType: 'cash',
    officeHoursForInspection: '8:00 AM - 5:00 PM',
    preBidConferenceVenue: buildVenue(record.agencyAddress),
    bidOpeningVenue: buildVenue(record.agencyAddress),
    videoConferencingPlatformLink: '',
    projectDescription: record.projectTitle,
    requiredDeliveryDateOrContractDuration: '',
    placeOfDestination: record.agencyAddress,
    sparePartsSupplyPeriodMonths: '12',
    descriptionOfWorks: record.projectTitle,
    requiredCompletionDate: '',
    intendedCompletionDate: '',
    projectSiteLocation: record.agencyAddress,
    drawingNumberForProjectSite: '',
    worksSummaryAndRelationship: '',
    definitionOfSimilarProject: '',
    additionalTrackRecordRequirement: '',
    advancePaymentPercentageAndSchedule: '',
    minimumWorksCompletionFirstProgressPayment: '',
    penaltyPercentageForUncompletedWork: '',
    groundsForExtensionOfContractTime: '',
    descriptionOfConsultingServices: record.projectTitle,
    objectivesAndScopeOfProject: '',
    evaluationProcedure: 'qcbs',
    numberOfShortlistedConsultants: '3',
    shortlistingDocumentOpeningDateTime: '',
    shortlistingSubmissionAddress: record.agencyAddress,
    onlineSubmissionEmail: '',
    descriptionOfSimilarContracts: '',
    estimatedProfessionalStaffMonths: '',
    technicalEvaluationWeightsAndMinimumScores: '',
    minimumTechnicalScoreToPass: '',
    financialProposalOpeningDateTime: '',
    financialProposalOpeningVenue: buildVenue(record.agencyAddress),
    nameOfFundingSource: '',
    contractTimePeriod: '',
    maximumPagesPerTechnicalProposalSection: '',
    maximumWordsForCommentsAndSuggestions: '',
  }
}

function getLegacyStructuredFieldValue(
  values: Record<string, string>,
  key: string,
) {
  return typeof values[key] === 'string' ? values[key] : ''
}

export function createEmptyStructuredFieldValues() {
  return STRUCTURED_FIELD_DEFINITIONS.filter((field) => !field.readOnly).reduce<
    Record<string, string>
  >((state, field) => {
    state[field.key] = ''
    return state
  }, {})
}

export function normalizeStructuredFieldValues(
  values: Record<string, string> | undefined,
  record: BiddingDocumentRecord,
) {
  const source = values ?? {}
  const normalized = {
    ...createEmptyStructuredFieldValues(),
    ...getDefaultStructuredFieldValues(record),
  }

  const legacyBidValidityDays = getLegacyStructuredFieldValue(
    source,
    'bidValidityDays',
  )
  if (legacyBidValidityDays) {
    normalized.bidValidityPeriodDays = legacyBidValidityDays
  }

  const legacyLotGrouping = getLegacyStructuredFieldValue(source, 'lotGrouping')
  if (legacyLotGrouping) {
    normalized.partialBidsLotGroupingDetails = legacyLotGrouping
    normalized.partialBidsPolicy = /single/i.test(legacyLotGrouping)
      ? 'not-allowed'
      : 'allowed'
  }

  const legacyDeliveryPeriod = getLegacyStructuredFieldValue(
    source,
    'deliveryPeriod',
  )
  if (legacyDeliveryPeriod) {
    if (record.procurementCategory === 'consulting') {
      normalized.contractTimePeriod = legacyDeliveryPeriod
    } else {
      normalized.requiredDeliveryDateOrContractDuration = legacyDeliveryPeriod
    }
  }

  const legacyDeliveryLocation = getLegacyStructuredFieldValue(
    source,
    'deliveryLocation',
  )
  if (legacyDeliveryLocation) {
    if (record.procurementCategory === 'infrastructure') {
      normalized.projectSiteLocation = legacyDeliveryLocation
    } else if (record.procurementCategory === 'consulting') {
      normalized.shortlistingSubmissionAddress = legacyDeliveryLocation
    } else {
      normalized.placeOfDestination = legacyDeliveryLocation
    }
  }

  const legacyPerformanceSecurity = getLegacyStructuredFieldValue(
    source,
    'performanceSecurity',
  )
  if (legacyPerformanceSecurity) {
    // Legacy field mapping: old text field → new type selector (default to 'cash')
    normalized.performanceSecurityType = 'cash'
  }

  STRUCTURED_FIELD_DEFINITIONS.forEach((field) => {
    if (field.readOnly) {
      return
    }

    const value = getLegacyStructuredFieldValue(source, field.key)
    if (value) {
      ;(normalized as Record<string, string>)[field.key] = value
    }
  })

  return normalized
}

export function getStoredStructuredFieldValue(
  record: BiddingDocumentRecord,
  fieldKey: Record<number, string>,
) {
  const normalized = normalizeStructuredFieldValues(
    record.structuredFields,
    record,
  )
  return (normalized as Record<string, string>)[fieldKey as string] ?? ''
}

export function getStructuredFieldValue(
  record: BiddingDocumentRecord,
  fieldKey: string,
) {
  switch (fieldKey) {
    case 'procuringEntityName':
      return record.agencyName
    case 'sourceOfFundingAndYear':
      return record.fundingSource
    case 'approvedBudgetForContract':
      return formatCurrency(record.abc)
    case 'projectTitle':
      return record.projectTitle
    case 'contractIdentificationNumber':
      return record.contractId
    case 'bacChairpersonName':
      return record.bacChairperson
    case 'preBidConferenceDateTime':
      return record.scheduleSnapshot.preBidConference
    case 'bidSubmissionDeadlineDateTime':
      return record.scheduleSnapshot.bidSubmissionDeadline
    case 'bidOpeningDateTime':
      return record.scheduleSnapshot.bidOpening
    case 'availabilityOfBiddingDocumentsDate':
      return record.scheduleSnapshot.ibPostingDate
    case 'bidSecurityValidityDate':
      return record.scheduleSnapshot.bidSecurityValidity
    case 'bidSecurityAmounts':
      return `2% of ABC = ${formatCurrency(record.abc * 0.02)}; 5% of ABC = ${formatCurrency(record.abc * 0.05)}`
    case 'performanceSecurityAmounts': {
      const securityType = getStoredStructuredFieldValue(
        record,
        'performanceSecurityType',
      )
      return buildPerformanceSecurityAmounts(record.abc, securityType)
    }
    case 'procuringEntityAddress':
      return record.agencyAddress
    case 'contactPersonNameAndDesignation':
      return SOURCE_CONTACT_NAME
    case 'contactTelephoneAndFax':
      return SOURCE_CONTACT_PHONE
    case 'contactEmailAddress':
      return SOURCE_CONTACT_EMAIL
    case 'procuringEntityWebsite':
      return SOURCE_WEBSITE
    default:
      return getStoredStructuredFieldValue(record, fieldKey)
  }
}

export function getStructuredFieldDisplayValue(
  record: BiddingDocumentRecord,
  field: BiddingDocumentFieldDefinition,
) {
  const value = getStructuredFieldValue(record, field.key)

  if (field.key === 'partialBidsLotGroupingDetails') {
    return parseLotGroupingBuilderValue(value)
      .map((entry) => `${entry.lotName}: ${entry.scope}`)
      .join('; ')
  }

  if (field.key === 'technicalEvaluationWeightsAndMinimumScores') {
    return parseTechnicalEvaluationBuilderValue(value)
      .map(
        (entry) =>
          `${entry.criterion} (${entry.weightPercent}% / min ${entry.minimumScore})`,
      )
      .join('; ')
  }

  if (field.key === 'maximumPagesPerTechnicalProposalSection') {
    return parseTechnicalProposalPageLimitBuilderValue(value)
      .map((entry) => `${entry.sectionName}: ${entry.maxPages} pages`)
      .join('; ')
  }

  if (!field.options) {
    return value
  }

  return field.options.find((option) => option.value === value)?.label ?? value
}

export function isStructuredFieldComplete(
  record: BiddingDocumentRecord,
  field: BiddingDocumentFieldDefinition,
) {
  const value = getStructuredFieldValue(record, field.key).trim()

  if (!value) {
    return false
  }

  if (getStructuredFieldValidationMessage(record, field)) {
    return false
  }

  return !/^Pending /i.test(value)
}

function parseDateValue(value: string) {
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) {
    return null
  }

  return timestamp
}

function parseJsonArray<T>(value: string) {
  try {
    const parsed = JSON.parse(value) as Array<T>
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parseLotGroupingBuilderValue(value: string) {
  const parsed = parseJsonArray<LotGroupingEntry>(value)

  return parsed.filter(
    (entry) =>
      typeof entry.id === 'string' &&
      typeof entry.lotName === 'string' &&
      typeof entry.scope === 'string',
  )
}

export function serializeLotGroupingBuilderValue(
  entries: Array<LotGroupingEntry>,
) {
  return JSON.stringify(entries)
}

export function createLotGroupingEntry(index: number): LotGroupingEntry {
  return {
    id: createBuilderId('lot', index),
    lotName: '',
    scope: '',
  }
}

export function parseTechnicalEvaluationBuilderValue(value: string) {
  const parsed = parseJsonArray<TechnicalEvaluationCriterion>(value)

  if (parsed.length === 0) {
    return getDefaultTechnicalEvaluationCriteria()
  }

  return parsed.filter(
    (entry) =>
      typeof entry.id === 'string' &&
      typeof entry.criterion === 'string' &&
      typeof entry.weightPercent === 'string' &&
      typeof entry.minimumScore === 'string',
  )
}

export function serializeTechnicalEvaluationBuilderValue(
  entries: Array<TechnicalEvaluationCriterion>,
) {
  return JSON.stringify(entries)
}

export function createTechnicalEvaluationCriterion(
  index: number,
): TechnicalEvaluationCriterion {
  return {
    id: createBuilderId('criterion', index),
    criterion: '',
    weightPercent: '',
    minimumScore: '',
  }
}

export function parseTechnicalProposalPageLimitBuilderValue(value: string) {
  const parsed = parseJsonArray<TechnicalProposalPageLimitEntry>(value)
  const defaults = getDefaultTechnicalProposalPageLimits()

  if (parsed.length === 0) {
    return defaults
  }

  const sanitized = parsed.filter(
    (entry) =>
      typeof entry.id === 'string' &&
      typeof entry.sectionName === 'string' &&
      typeof entry.maxPages === 'string',
  )

  const remainingEntries = [...sanitized]
  const templateMatches = defaults.map((templateEntry) => {
    const matchedIndex = remainingEntries.findIndex(
      (entry) =>
        entry.sectionName.trim().toLowerCase() ===
        templateEntry.sectionName.toLowerCase(),
    )

    if (matchedIndex === -1) {
      return null
    }

    return remainingEntries.splice(matchedIndex, 1)[0] ?? null
  })

  return defaults.map((templateEntry, index) => {
    const matchedEntry = templateMatches[index] ?? remainingEntries.shift()

    return {
      ...templateEntry,
      maxPages: matchedEntry?.maxPages ?? '',
    }
  })
}

export function serializeTechnicalProposalPageLimitBuilderValue(
  entries: Array<TechnicalProposalPageLimitEntry>,
) {
  return JSON.stringify(entries)
}

export function getTechnicalEvaluationWeightTotal(value: string) {
  return parseTechnicalEvaluationBuilderValue(value).reduce((total, entry) => {
    const next = Number(entry.weightPercent)
    return total + (Number.isFinite(next) ? next : 0)
  }, 0)
}

export function getStructuredFieldValidationMessage(
  record: BiddingDocumentRecord,
  field: BiddingDocumentFieldDefinition,
) {
  const value = getStructuredFieldValue(record, field.key).trim()

  if (!value) {
    return field.required ? 'This field is required.' : null
  }

  switch (field.key) {
    case 'trackRecordPeriodYears': {
      if (record.procurementCategory === 'consulting' && Number(value) > 10) {
        return 'Consulting track record period must not exceed 10 years.'
      }

      return null
    }

    case 'numberOfShortlistedConsultants': {
      const count = Number(value)
      if (!Number.isFinite(count) || count < 3 || count > 7) {
        return 'Number of shortlisted consultants must be between 3 and 7.'
      }

      return null
    }

    case 'shortlistingDocumentOpeningDateTime': {
      const shortlistingDate = parseDateValue(value)
      const bidSubmissionDate = parseDateValue(
        record.scheduleSnapshot.bidSubmissionDeadline,
      )

      if (shortlistingDate === null) {
        return 'Enter a valid shortlisting opening date and time.'
      }

      if (bidSubmissionDate !== null && shortlistingDate >= bidSubmissionDate) {
        return 'Shortlisting opening must fall before the bid submission deadline.'
      }

      return null
    }

    case 'partialBidsLotGroupingDetails': {
      const entries = parseLotGroupingBuilderValue(value)
      if (entries.length === 0) {
        return 'Add at least one lot grouping entry.'
      }

      if (
        entries.some((entry) => !entry.lotName.trim() || !entry.scope.trim())
      ) {
        return 'Each lot grouping needs a lot name and scope.'
      }

      return null
    }

    case 'technicalEvaluationWeightsAndMinimumScores': {
      const entries = parseTechnicalEvaluationBuilderValue(value)
      if (
        entries.some(
          (entry) =>
            !entry.criterion.trim() ||
            !entry.weightPercent.trim() ||
            !entry.minimumScore.trim(),
        )
      ) {
        return 'Each technical evaluation criterion needs a label, weight, and minimum score.'
      }

      if (getTechnicalEvaluationWeightTotal(value) !== 100) {
        return 'Technical evaluation weights must total 100%.'
      }

      return null
    }

    case 'maximumPagesPerTechnicalProposalSection': {
      const entries = parseTechnicalProposalPageLimitBuilderValue(value)
      if (
        entries.some(
          (entry) => !entry.maxPages.trim() || Number(entry.maxPages) <= 0,
        )
      ) {
        return 'Each Technical Proposal section needs a section name and a page limit greater than zero.'
      }

      return null
    }

    default:
      return null
  }
}

function isFieldVisible(
  record: BiddingDocumentRecord,
  field: BiddingDocumentFieldDefinition,
) {
  const matchesCategory =
    !field.applicableCategories ||
    field.applicableCategories.includes(record.procurementCategory)

  if (!matchesCategory) {
    return false
  }

  return field.visibleWhen ? field.visibleWhen(record) : true
}

export function getVisibleStructuredFieldDefinitions(
  record: BiddingDocumentRecord,
) {
  return STRUCTURED_FIELD_DEFINITIONS.filter((field) =>
    isFieldVisible(record, field),
  )
}

export function getRequiredStructuredFieldDefinitions(
  record: BiddingDocumentRecord,
) {
  return getVisibleStructuredFieldDefinitions(record).filter(
    (field) => field.required,
  )
}

export function getStructuredFieldSections(record: BiddingDocumentRecord) {
  return BIDDING_DOCUMENT_SECTION_DEFINITIONS.map((section) => ({
    ...section,
    fields: getVisibleStructuredFieldDefinitions(record).filter(
      (field) => field.section === section.key,
    ),
  })).filter((section) => section.fields.length > 0)
}

export function getProcurementCategorySpecificFieldKeys(
  category: ProcurementCategory,
) {
  return STRUCTURED_FIELD_DEFINITIONS.filter(
    (field) =>
      field.applicableCategories &&
      field.applicableCategories.includes(category),
  ).map((field) => field.key)
}
