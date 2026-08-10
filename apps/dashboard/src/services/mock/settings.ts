import type {
  OfficeTypeSetting,
  OfficeCategorySetting,
  ProcurementWorkflowSetting,
  SatelliteClusterSetting,
  PositionTypeSetting,
  PositionCategorySetting,
  SalaryGradeSetting,
  PlantillaTypeSetting,
  StepSetting,
  PMTMaximumSeatsSetting,
  PersonnelReportingTypeSetting,
  AllSettings,
} from '@/components/features/planning/organizational-structure/types'

// ============================================
// IN-MEMORY DATABASE FOR SETTINGS
// ============================================

let OFFICE_TYPES_DB: OfficeTypeSetting[] = [
  {
    id: 'ot-1',
    name: 'Office',
    code: 'OFF',
    description: 'Standard organizational office - lowest level unit',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'administrative', 'technical', 'support', 'oversight', 'delivery', 'regulatory'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'ot-2',
    name: 'Division',
    code: 'DIV',
    description: 'Major organizational unit - can contain offices and sections',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'administrative', 'technical', 'delivery', 'regulatory', 'oversight'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'ot-3',
    name: 'Section',
    code: 'SEC',
    description: 'Sub-division unit - cannot have child units',
    status: 'active',
    canHaveChildren: false,
    allowedCategories: ['administrative', 'technical', 'support', 'delivery'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'ot-4',
    name: 'Department',
    code: 'DEPT',
    description: 'Department level - major functional grouping',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'administrative', 'technical', 'delivery', 'regulatory'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'ot-5',
    name: 'Bureau',
    code: 'BURE',
    description: 'Bureau level - highest organizational unit',
    status: 'active',
    canHaveChildren: true,
    allowedCategories: ['executive', 'regulatory', 'oversight'],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

let OFFICE_CATEGORIES_DB: OfficeCategorySetting[] = [
  {
    id: 'oc-1',
    name: 'Administrative',
    code: 'ADMIN',
    description: 'Administrative and support functions - handles internal operations',
    status: 'active',
    officeType: 'office',
    budgetingApproach: 'cost-center',
    requiresCluster: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'oc-2',
    name: 'Technical',
    code: 'TECH',
    description: 'Technical and operational units - manages specialized operations',
    status: 'active',
    officeType: 'division',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'oc-3',
    name: 'Delivery',
    code: 'DELIV',
    description: 'Service delivery units - provides services to stakeholders',
    status: 'active',
    officeType: 'division',
    budgetingApproach: 'responsibility-center',
    requiresCluster: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'oc-4',
    name: 'Executive',
    code: 'EXEC',
    description: 'Executive management level - leadership and strategic decisions',
    status: 'active',
    officeType: 'department',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oc-5',
    name: 'Regulatory',
    code: 'REG',
    description: 'Regulatory and compliance - ensures adherence to policies',
    status: 'active',
    officeType: 'bureau',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oc-6',
    name: 'Support',
    code: 'SUP',
    description: 'Support functions - provides internal support services',
    status: 'active',
    officeType: 'office',
    budgetingApproach: 'cost-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'oc-7',
    name: 'Oversight',
    code: 'OVER',
    description: 'Oversight and monitoring - provides quality assurance',
    status: 'active',
    officeType: 'department',
    budgetingApproach: 'responsibility-center',
    requiresCluster: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

let PROCUREMENT_WORKFLOWS_DB: ProcurementWorkflowSetting[] = [
  {
    id: 'pw-1',
    name: 'Centralized',
    code: 'CENT',
    description: 'Centralized procurement',
    status: 'active',
    thresholdAmount: 500000,
    approvalLevels: 3,
    requiresBiddingProcess: true,
    estimatedProcessDays: 30,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pw-2',
    name: 'Decentralized',
    code: 'DECENT',
    description: 'Decentralized procurement',
    status: 'active',
    thresholdAmount: 100000,
    approvalLevels: 2,
    requiresBiddingProcess: false,
    estimatedProcessDays: 14,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

let SATELLITE_CLUSTERS_DB: SatelliteClusterSetting[] = [
  {
    id: 'sc-1',
    name: 'Metro Manila',
    code: 'MM',
    description: 'Metro Manila cluster',
    status: 'active',
    region: 'NCR',
    province: 'Metro Manila',
    municipality: 'Quezon City',
    barangay: 'Bagumbayan',
    maxSubUnits: 5,
    coordinationMechanism: 'Monthly coordination meetings',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sc-2',
    name: 'Visayas',
    code: 'VIS',
    description: 'Visayas cluster',
    status: 'active',
    region: 'Region VII',
    province: 'Cebu',
    municipality: 'Cebu City',
    barangay: 'Punta Princesa',
    maxSubUnits: 3,
    coordinationMechanism: 'Quarterly coordination meetings',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

let POSITION_TYPES_DB: PositionTypeSetting[] = [
  {
    id: 'pt-1',
    name: 'Executive',
    code: 'EXEC',
    description: 'Executive and senior management positions - Report to Minister/Secretary',
    status: 'active',
    positionType: 'executive',
    careerEligibilityRequired: true,
    requiredEducationLevel: "Master's Degree or equivalent",
    defaultCategory: 'professional',
    canReportDirectly: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pt-2',
    name: 'Managerial',
    code: 'MGR',
    description: 'Managerial positions - Supervises teams and manages operations',
    status: 'active',
    positionType: 'managerial',
    careerEligibilityRequired: true,
    requiredEducationLevel: "Bachelor's Degree",
    defaultCategory: 'professional',
    canReportDirectly: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pt-3',
    name: 'Supervisory',
    code: 'SUP',
    description: 'Supervisory positions - Oversees work of technical/support staff',
    status: 'active',
    positionType: 'supervisory',
    careerEligibilityRequired: true,
    requiredEducationLevel: "Bachelor's Degree",
    defaultCategory: 'professional',
    canReportDirectly: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pt-4',
    name: 'Technical',
    code: 'TECH',
    description: 'Technical and specialized positions - Provides technical expertise',
    status: 'active',
    positionType: 'technical',
    careerEligibilityRequired: false,
    requiredEducationLevel: "Bachelor's Degree in technical field",
    defaultCategory: 'professional',
    canReportDirectly: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pt-5',
    name: 'Administrative',
    code: 'ADMIN',
    description: 'Administrative and clerical positions - Provides office support',
    status: 'active',
    positionType: 'administrative',
    careerEligibilityRequired: false,
    requiredEducationLevel: "High School or equivalent",
    defaultCategory: 'non-professional',
    canReportDirectly: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pt-6',
    name: 'Support',
    code: 'SUPP',
    description: 'Support and service positions - Provides operational support',
    status: 'active',
    positionType: 'support',
    careerEligibilityRequired: false,
    requiredEducationLevel: 'High School',
    defaultCategory: 'non-professional',
    canReportDirectly: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'pt-7',
    name: 'Skilled Worker',
    code: 'SKILL',
    description: 'Skilled positions - Requires vocational or technical training',
    status: 'active',
    positionType: 'technical',
    careerEligibilityRequired: false,
    requiredEducationLevel: 'Vocational Certificate',
    defaultCategory: 'non-professional',
    canReportDirectly: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

let POSITION_CATEGORIES_DB: PositionCategorySetting[] = [
  {
    id: 'pc-1',
    name: 'Professional',
    code: 'PROF',
    description: 'Professional positions - SG 15 and above',
    status: 'active',
    positionType: 'executive',
    minSalaryGrade: '25',
    maxSalaryGrade: '33',
    allowedPlantillaTypes: ['permanent', 'coterminous'],
    requiresSpecialization: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pc-2',
    name: 'Sub-Professional',
    code: 'SUBPROF',
    description: 'Sub-professional positions - SG 6 to 14',
    status: 'active',
    positionType: 'technical',
    minSalaryGrade: '6',
    maxSalaryGrade: '14',
    allowedPlantillaTypes: ['permanent', 'contractual'],
    requiresSpecialization: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pc-3',
    name: 'Non-Professional',
    code: 'NONPROF',
    description: 'Non-professional positions - SG 1 to 5',
    status: 'active',
    positionType: 'support',
    minSalaryGrade: '1',
    maxSalaryGrade: '5',
    allowedPlantillaTypes: ['casual', 'contractual'],
    requiresSpecialization: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'pc-4',
    name: 'Managerial',
    code: 'MGR',
    description: 'Managerial positions - SG 15 to 24',
    status: 'active',
    positionType: 'managerial',
    minSalaryGrade: '15',
    maxSalaryGrade: '24',
    allowedPlantillaTypes: ['permanent', 'coterminous'],
    requiresSpecialization: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'pc-5',
    name: 'Elected Official',
    code: 'ELECT',
    description: 'Elected official positions - Ranges SG 20 to 33 depending on office',
    status: 'active',
    positionType: 'executive',
    minSalaryGrade: '20',
    maxSalaryGrade: '33',
    allowedPlantillaTypes: ['coterminous'],
    requiresSpecialization: false,
    createdAt: '2024-01-29',
    updatedAt: '2024-01-29',
  },
  {
    id: 'pc-6',
    name: 'Appointed Official',
    code: 'APPOINT',
    description: 'Appointed official positions - Ranges SG 15 to 29 depending on appointment',
    status: 'active',
    positionType: 'executive',
    minSalaryGrade: '15',
    maxSalaryGrade: '29',
    allowedPlantillaTypes: ['coterminous'],
    requiresSpecialization: false,
    createdAt: '2024-01-29',
    updatedAt: '2024-01-29',
  },
  {
    id: 'pc-7',
    name: 'Consultancy/COS',
    code: 'COS',
    description: 'Consultancy and COS (Contract of Service) positions - SG 15 to 27',
    status: 'active',
    positionType: 'technical',
    minSalaryGrade: '15',
    maxSalaryGrade: '27',
    allowedPlantillaTypes: ['contractual'],
    requiresSpecialization: true,
    createdAt: '2024-01-29',
    updatedAt: '2024-01-29',
  },
]

let SALARY_GRADES_DB: SalaryGradeSetting[] = [
  {
    id: 'sg-1',
    name: 'Salary Grade 1',
    code: 'SG-1',
    description: 'Entry-level non-professional positions',
    salaryGradeNumber: 1,
    monthlySalaryMin: 12000,
    monthlySalaryMax: 12780,
    stepIncrementAmount: 780,
    numberOfSteps: 1,
    minStep: 1,
    maxStep: 1,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sg-2',
    name: 'Salary Grade 5',
    code: 'SG-5',
    description: 'Non-professional support positions',
    salaryGradeNumber: 5,
    monthlySalaryMin: 16000,
    monthlySalaryMax: 18120,
    stepIncrementAmount: 1360,
    numberOfSteps: 2,
    minStep: 1,
    maxStep: 2,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sg-3',
    name: 'Salary Grade 11',
    code: 'SG-11',
    description: 'Sub-professional positions',
    salaryGradeNumber: 11,
    monthlySalaryMin: 24517,
    monthlySalaryMax: 29412,
    stepIncrementAmount: 1940,
    numberOfSteps: 3,
    minStep: 1,
    maxStep: 3,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sg-4',
    name: 'Salary Grade 15',
    code: 'SG-15',
    description: 'Professional and managerial positions',
    salaryGradeNumber: 15,
    monthlySalaryMin: 32916,
    monthlySalaryMax: 39516,
    stepIncrementAmount: 2466,
    numberOfSteps: 3,
    minStep: 1,
    maxStep: 3,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sg-5',
    name: 'Salary Grade 20',
    code: 'SG-20',
    description: 'Senior managerial positions',
    salaryGradeNumber: 20,
    monthlySalaryMin: 39517,
    monthlySalaryMax: 47580,
    stepIncrementAmount: 2986,
    numberOfSteps: 3,
    minStep: 1,
    maxStep: 3,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sg-6',
    name: 'Salary Grade 25',
    code: 'SG-25',
    description: 'Executive positions',
    salaryGradeNumber: 25,
    monthlySalaryMin: 42597,
    monthlySalaryMax: 49276,
    stepIncrementAmount: 3339,
    numberOfSteps: 8,
    minStep: 1,
    maxStep: 8,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sg-7',
    name: 'Salary Grade 26',
    code: 'SG-26',
    description: 'Senior executive positions',
    salaryGradeNumber: 26,
    monthlySalaryMin: 47537,
    monthlySalaryMax: 54924,
    stepIncrementAmount: 3725,
    numberOfSteps: 8,
    minStep: 1,
    maxStep: 8,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'sg-8',
    name: 'Salary Grade 33',
    code: 'SG-33',
    description: 'Cabinet-level and highest positions',
    salaryGradeNumber: 33,
    monthlySalaryMin: 149037,
    monthlySalaryMax: 172099,
    stepIncrementAmount: 15351,
    numberOfSteps: 2,
    minStep: 1,
    maxStep: 2,
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

let PLANTILLA_TYPES_DB: PlantillaTypeSetting[] = [
  {
    id: 'plt-1',
    name: 'Permanent',
    code: 'PERM',
    description: 'Permanent plantilla positions - Indefinite tenure subject to laws',
    status: 'active',
    duration: undefined,
    requiresActingAppointment: false,
    allowsContractualConversion: false,
    benefitsEligibility: ['GSIS', 'PhilHealth', 'PAG-IBIG'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'plt-2',
    name: 'Casual',
    code: 'CASUAL',
    description: 'Casual positions - Temporary employment up to 6 months renewable',
    status: 'active',
    duration: 6,
    requiresActingAppointment: false,
    allowsContractualConversion: true,
    benefitsEligibility: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'plt-3',
    name: 'Contractual',
    code: 'CONT',
    description: 'Contractual positions - Fixed period employment up to 1 year',
    status: 'active',
    duration: 12,
    requiresActingAppointment: false,
    allowsContractualConversion: false,
    benefitsEligibility: ['PhilHealth'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'plt-4',
    name: 'Coterminous',
    code: 'COTERM',
    description: 'Coterminous with appointing authority - Duration of agency head appointment',
    status: 'active',
    duration: 48,
    requiresActingAppointment: false,
    allowsContractualConversion: false,
    benefitsEligibility: ['GSIS', 'PhilHealth', 'PAG-IBIG'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'plt-5',
    name: 'Job Order',
    code: 'JO',
    description: 'Job order positions - Temporary employment for specific work',
    status: 'active',
    duration: 6,
    requiresActingAppointment: false,
    allowsContractualConversion: true,
    benefitsEligibility: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'plt-6',
    name: 'COS (Consultancy)',
    code: 'COS',
    description: 'Consultancy Services - Specialized expertise for limited period',
    status: 'active',
    duration: 12,
    requiresActingAppointment: false,
    allowsContractualConversion: false,
    benefitsEligibility: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

let STEPS_DB: StepSetting[] = [
  {
    id: 'step-1',
    name: 'Step 1',
    code: 'STEP-1',
    description: 'First step of salary progression',
    status: 'active',
    stepNumber: 1,
    minStep: 1,
    maxStep: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'step-2',
    name: 'Step 2',
    code: 'STEP-2',
    description: 'Second step of salary progression',
    status: 'active',
    stepNumber: 2,
    minStep: 1,
    maxStep: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'step-3',
    name: 'Step 3',
    code: 'STEP-3',
    description: 'Third step of salary progression',
    status: 'active',
    stepNumber: 3,
    minStep: 1,
    maxStep: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'step-4',
    name: 'Step 4',
    code: 'STEP-4',
    description: 'Fourth step of salary progression',
    status: 'active',
    stepNumber: 4,
    minStep: 1,
    maxStep: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'step-5',
    name: 'Step 5',
    code: 'STEP-5',
    description: 'Fifth step of salary progression',
    status: 'active',
    stepNumber: 5,
    minStep: 1,
    maxStep: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'step-6',
    name: 'Step 6',
    code: 'STEP-6',
    description: 'Sixth step of salary progression',
    status: 'active',
    stepNumber: 6,
    minStep: 1,
    maxStep: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'step-7',
    name: 'Step 7',
    code: 'STEP-7',
    description: 'Seventh step of salary progression',
    status: 'active',
    stepNumber: 7,
    minStep: 1,
    maxStep: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'step-8',
    name: 'Step 8',
    code: 'STEP-8',
    description: 'Eighth step of salary progression',
    status: 'active',
    stepNumber: 8,
    minStep: 1,
    maxStep: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
]

let PMT_MAXIMUM_SEATS_DB: PMTMaximumSeatsSetting[] = [
  {
    id: 'pmt-1',
    name: 'Cabinet-Level PMT',
    code: 'PMTCAB',
    description: 'Performance Management Team seats for Cabinet and Executive Level (SG 33-30)',
    status: 'active',
    maxSeats: 8,
    organizationWide: true,
    minimumGradeLevel: '30',
    reportingLevel: 'executive',
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pmt-2',
    name: 'Senior Management PMT',
    code: 'PMTSENIOR',
    description: 'PMT seats for Senior Management (SG 25-27)',
    status: 'active',
    maxSeats: 10,
    organizationWide: true,
    minimumGradeLevel: '25',
    reportingLevel: 'executive',
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pmt-3',
    name: 'Middle Management PMT',
    code: 'PMTMID',
    description: 'PMT seats for Middle Management (SG 18-24)',
    status: 'active',
    maxSeats: 5,
    organizationWide: true,
    minimumGradeLevel: '18',
    reportingLevel: 'managerial',
    effectiveDate: '2024-01-01',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'pmt-4',
    name: 'Supervisory PMT',
    code: 'PMTSUP',
    description: 'PMT seats for Supervisory Level (SG 11-17)',
    status: 'active',
    maxSeats: 3,
    organizationWide: true,
    minimumGradeLevel: '11',
    reportingLevel: 'supervisory',
    effectiveDate: '2024-01-15',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

let PERSONNEL_REPORTING_TYPES_DB: PersonnelReportingTypeSetting[] = [
  {
    id: 'prt-1',
    name: 'Direct Reporting Line',
    code: 'DIRECT',
    description: 'Single direct reporting line - Employee reports directly to one supervisor',
    status: 'active',
    reportingStructureType: 'direct',
    requiresApproval: false,
    maxLevels: 8,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'prt-2',
    name: 'Functional Reporting',
    code: 'FUNC',
    description: 'Functional reporting structure - Employee reports functionally to multiple supervisors',
    status: 'active',
    reportingStructureType: 'functional',
    requiresApproval: true,
    maxLevels: 5,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'prt-3',
    name: 'Matrix Reporting',
    code: 'MATRIX',
    description: 'Matrix reporting structure - Combines direct and functional reporting',
    status: 'active',
    reportingStructureType: 'functional',
    requiresApproval: true,
    maxLevels: 6,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: 'prt-4',
    name: 'Dotted Line Reporting',
    code: 'DOTTED',
    description: 'Dotted line reporting - Secondary reporting relationship for coordination',
    status: 'active',
    reportingStructureType: 'direct',
    requiresApproval: false,
    maxLevels: 8,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
]

// ============================================
// OFFICE TYPE CRUD OPERATIONS
// ============================================

export async function fetchOfficeTypes(): Promise<OfficeTypeSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...OFFICE_TYPES_DB]), 100)
  })
}

export async function fetchOfficeTypeById(id: string): Promise<OfficeTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = OFFICE_TYPES_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createOfficeType(payload: Omit<OfficeTypeSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeTypeSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: OfficeTypeSetting = {
        ...payload,
        id: `ot-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      OFFICE_TYPES_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updateOfficeType(id: string, updates: Partial<OfficeTypeSetting>): Promise<OfficeTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = OFFICE_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      OFFICE_TYPES_DB[index] = {
        ...OFFICE_TYPES_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(OFFICE_TYPES_DB[index])
    }, 100)
  })
}

export async function deleteOfficeType(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = OFFICE_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      OFFICE_TYPES_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// OFFICE CATEGORY CRUD OPERATIONS
// ============================================

export async function fetchOfficeCategories(): Promise<OfficeCategorySetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...OFFICE_CATEGORIES_DB]), 100)
  })
}

export async function fetchOfficeCategoryById(id: string): Promise<OfficeCategorySetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = OFFICE_CATEGORIES_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createOfficeCategory(payload: Omit<OfficeCategorySetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<OfficeCategorySetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: OfficeCategorySetting = {
        ...payload,
        id: `oc-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      OFFICE_CATEGORIES_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updateOfficeCategory(id: string, updates: Partial<OfficeCategorySetting>): Promise<OfficeCategorySetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = OFFICE_CATEGORIES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      OFFICE_CATEGORIES_DB[index] = {
        ...OFFICE_CATEGORIES_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(OFFICE_CATEGORIES_DB[index])
    }, 100)
  })
}

export async function deleteOfficeCategory(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = OFFICE_CATEGORIES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      OFFICE_CATEGORIES_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// PROCUREMENT WORKFLOW CRUD OPERATIONS
// ============================================

export async function fetchProcurementWorkflows(): Promise<ProcurementWorkflowSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...PROCUREMENT_WORKFLOWS_DB]), 100)
  })
}

export async function fetchProcurementWorkflowById(id: string): Promise<ProcurementWorkflowSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = PROCUREMENT_WORKFLOWS_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createProcurementWorkflow(payload: Omit<ProcurementWorkflowSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcurementWorkflowSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: ProcurementWorkflowSetting = {
        ...payload,
        id: `pw-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      PROCUREMENT_WORKFLOWS_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updateProcurementWorkflow(id: string, updates: Partial<ProcurementWorkflowSetting>): Promise<ProcurementWorkflowSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PROCUREMENT_WORKFLOWS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      PROCUREMENT_WORKFLOWS_DB[index] = {
        ...PROCUREMENT_WORKFLOWS_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(PROCUREMENT_WORKFLOWS_DB[index])
    }, 100)
  })
}

export async function deleteProcurementWorkflow(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PROCUREMENT_WORKFLOWS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      PROCUREMENT_WORKFLOWS_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// SATELLITE CLUSTER CRUD OPERATIONS
// ============================================

export async function fetchSatelliteClusters(): Promise<SatelliteClusterSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...SATELLITE_CLUSTERS_DB]), 100)
  })
}

export async function fetchSatelliteClusterById(id: string): Promise<SatelliteClusterSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = SATELLITE_CLUSTERS_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createSatelliteCluster(payload: Omit<SatelliteClusterSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<SatelliteClusterSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: SatelliteClusterSetting = {
        ...payload,
        id: `sc-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      SATELLITE_CLUSTERS_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updateSatelliteCluster(id: string, updates: Partial<SatelliteClusterSetting>): Promise<SatelliteClusterSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = SATELLITE_CLUSTERS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      SATELLITE_CLUSTERS_DB[index] = {
        ...SATELLITE_CLUSTERS_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(SATELLITE_CLUSTERS_DB[index])
    }, 100)
  })
}

export async function deleteSatelliteCluster(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = SATELLITE_CLUSTERS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      SATELLITE_CLUSTERS_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// POSITION TYPE CRUD OPERATIONS
// ============================================

export async function fetchPositionTypes(): Promise<PositionTypeSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...POSITION_TYPES_DB]), 100)
  })
}

export async function fetchPositionTypeById(id: string): Promise<PositionTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = POSITION_TYPES_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createPositionType(payload: Omit<PositionTypeSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<PositionTypeSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: PositionTypeSetting = {
        ...payload,
        id: `pt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      POSITION_TYPES_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updatePositionType(id: string, updates: Partial<PositionTypeSetting>): Promise<PositionTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = POSITION_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      POSITION_TYPES_DB[index] = {
        ...POSITION_TYPES_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(POSITION_TYPES_DB[index])
    }, 100)
  })
}

export async function deletePositionType(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = POSITION_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      POSITION_TYPES_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// POSITION CATEGORY CRUD OPERATIONS
// ============================================

export async function fetchPositionCategories(): Promise<PositionCategorySetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...POSITION_CATEGORIES_DB]), 100)
  })
}

export async function fetchPositionCategoryById(id: string): Promise<PositionCategorySetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = POSITION_CATEGORIES_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createPositionCategory(payload: Omit<PositionCategorySetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<PositionCategorySetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: PositionCategorySetting = {
        ...payload,
        id: `pc-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      POSITION_CATEGORIES_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updatePositionCategory(id: string, updates: Partial<PositionCategorySetting>): Promise<PositionCategorySetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = POSITION_CATEGORIES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      POSITION_CATEGORIES_DB[index] = {
        ...POSITION_CATEGORIES_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(POSITION_CATEGORIES_DB[index])
    }, 100)
  })
}

export async function deletePositionCategory(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = POSITION_CATEGORIES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      POSITION_CATEGORIES_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// SALARY GRADE CRUD OPERATIONS
// ============================================

export async function fetchSalaryGrades(): Promise<SalaryGradeSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...SALARY_GRADES_DB]), 100)
  })
}

export async function fetchSalaryGradeById(id: string): Promise<SalaryGradeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = SALARY_GRADES_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createSalaryGrade(payload: Omit<SalaryGradeSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryGradeSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: SalaryGradeSetting = {
        ...payload,
        id: `sg-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      SALARY_GRADES_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updateSalaryGrade(id: string, updates: Partial<SalaryGradeSetting>): Promise<SalaryGradeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = SALARY_GRADES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      SALARY_GRADES_DB[index] = {
        ...SALARY_GRADES_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(SALARY_GRADES_DB[index])
    }, 100)
  })
}

export async function deleteSalaryGrade(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = SALARY_GRADES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      SALARY_GRADES_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// PLANTILLA TYPE CRUD OPERATIONS
// ============================================

export async function fetchPlantillaTypes(): Promise<PlantillaTypeSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...PLANTILLA_TYPES_DB]), 100)
  })
}

export async function fetchPlantillaTypeById(id: string): Promise<PlantillaTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = PLANTILLA_TYPES_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createPlantillaType(payload: Omit<PlantillaTypeSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlantillaTypeSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: PlantillaTypeSetting = {
        ...payload,
        id: `plt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      PLANTILLA_TYPES_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updatePlantillaType(id: string, updates: Partial<PlantillaTypeSetting>): Promise<PlantillaTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PLANTILLA_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      PLANTILLA_TYPES_DB[index] = {
        ...PLANTILLA_TYPES_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(PLANTILLA_TYPES_DB[index])
    }, 100)
  })
}

export async function deletePlantillaType(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PLANTILLA_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      PLANTILLA_TYPES_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// PMT MAXIMUM SEATS CRUD OPERATIONS
// ============================================

export async function fetchPMTMaximumSeats(): Promise<PMTMaximumSeatsSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...PMT_MAXIMUM_SEATS_DB]), 100)
  })
}

export async function fetchPMTMaximumSeatById(id: string): Promise<PMTMaximumSeatsSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = PMT_MAXIMUM_SEATS_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createPMTMaximumSeats(payload: Omit<PMTMaximumSeatsSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<PMTMaximumSeatsSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: PMTMaximumSeatsSetting = {
        ...payload,
        id: `pmt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      PMT_MAXIMUM_SEATS_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updatePMTMaximumSeats(id: string, updates: Partial<PMTMaximumSeatsSetting>): Promise<PMTMaximumSeatsSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PMT_MAXIMUM_SEATS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      PMT_MAXIMUM_SEATS_DB[index] = {
        ...PMT_MAXIMUM_SEATS_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(PMT_MAXIMUM_SEATS_DB[index])
    }, 100)
  })
}

export async function deletePMTMaximumSeats(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PMT_MAXIMUM_SEATS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      PMT_MAXIMUM_SEATS_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// PERSONNEL REPORTING TYPE CRUD OPERATIONS
// ============================================

export async function fetchPersonnelReportingTypes(): Promise<PersonnelReportingTypeSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...PERSONNEL_REPORTING_TYPES_DB]), 100)
  })
}

export async function fetchPersonnelReportingTypeById(id: string): Promise<PersonnelReportingTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = PERSONNEL_REPORTING_TYPES_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createPersonnelReportingType(payload: Omit<PersonnelReportingTypeSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<PersonnelReportingTypeSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: PersonnelReportingTypeSetting = {
        ...payload,
        id: `prt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      PERSONNEL_REPORTING_TYPES_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updatePersonnelReportingType(id: string, updates: Partial<PersonnelReportingTypeSetting>): Promise<PersonnelReportingTypeSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PERSONNEL_REPORTING_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      PERSONNEL_REPORTING_TYPES_DB[index] = {
        ...PERSONNEL_REPORTING_TYPES_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(PERSONNEL_REPORTING_TYPES_DB[index])
    }, 100)
  })
}

export async function deletePersonnelReportingType(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = PERSONNEL_REPORTING_TYPES_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      PERSONNEL_REPORTING_TYPES_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// STEP CRUD OPERATIONS
// ============================================

export async function fetchSteps(): Promise<StepSetting[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...STEPS_DB]), 100)
  })
}

export async function fetchStepById(id: string): Promise<StepSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const setting = STEPS_DB.find((s) => s.id === id)
      resolve(setting || null)
    }, 100)
  })
}

export async function createStep(payload: Omit<StepSetting, 'id' | 'createdAt' | 'updatedAt'>): Promise<StepSetting> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSetting: StepSetting = {
        ...payload,
        id: `step-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      STEPS_DB.push(newSetting)
      resolve(newSetting)
    }, 100)
  })
}

export async function updateStep(id: string, updates: Partial<StepSetting>): Promise<StepSetting | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = STEPS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(null)
        return
      }
      STEPS_DB[index] = {
        ...STEPS_DB[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      }
      resolve(STEPS_DB[index])
    }, 100)
  })
}

export async function deleteStep(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = STEPS_DB.findIndex((s) => s.id === id)
      if (index === -1) {
        resolve(false)
        return
      }
      STEPS_DB.splice(index, 1)
      resolve(true)
    }, 100)
  })
}

// ============================================
// BULK OPERATIONS
// ============================================

export async function fetchAllSettings(): Promise<AllSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        officeTypes: [...OFFICE_TYPES_DB],
        officeCategories: [...OFFICE_CATEGORIES_DB],
        procurementWorkflows: [...PROCUREMENT_WORKFLOWS_DB],
        satelliteClusters: [...SATELLITE_CLUSTERS_DB],
        positionTypes: [...POSITION_TYPES_DB],
        positionCategories: [...POSITION_CATEGORIES_DB],
        salaryGrades: [...SALARY_GRADES_DB],
        plantillaTypes: [...PLANTILLA_TYPES_DB],
        steps: [...STEPS_DB],
        pmtMaximumSeats: [...PMT_MAXIMUM_SEATS_DB],
        personnelReportingTypes: [...PERSONNEL_REPORTING_TYPES_DB],
      })
    }, 100)
  })
}
