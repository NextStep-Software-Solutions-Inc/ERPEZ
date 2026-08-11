// Types for Organizational Structure Tabs

// Tab 1: Structural Management Tab
export interface StructuralManagementTabProps {
  structuralSearch?: string
  isMultiSite?: boolean
  selectedUnitId: string | null
  onSelectUnit: (id: string | null) => void
}

// Tab 2: Staffing and Plantilla Tab
export interface StaffingAndPlantillaTabProps {
  staffingSearch?: string
  unitId?: string | null
}

// Tab 3: Personnel Reporting Tab
export interface PersonnelReportingTabProps {
  unitId?: string | null
}

// Tab 4: Settings Tab
export interface SettingsTabProps {
  staffingSearch?: string
  unitId?: string | null
}

// Common types used across tabs
export type TabFilter = 'all' | 'filled' | 'vacant' | 'active' | 'inactive'

export interface TabSearchProps {
  searchTerm?: string
  filter?: TabFilter
}

// Position status types (for consistency)
export type PositionStatus = 'vacant' | 'filled' | 'frozen'

// Organization unit status types
export type OrgUnitStatus = 'active' | 'inactive' | 'dissolved'

// Personnel status types
export type PersonnelStatus = 'active' | 'inactive' | 'on-leave' | 'retired'

// KPI calculation types
export interface StaffingKPIs {
  totalAuthorized: number
  totalFilled: number
  vacancyRate: number
  averageTenure?: number
}

// Table action types
export type TableAction = 'view' | 'edit' | 'delete' | 'assign' | 'transfer'

// Dialog state types
export interface DialogState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'delete' | 'view'
  selectedId?: string
}

// =============================================================================
// V2 SCHEMA DEFINITIONS - Aligned with Government Standards
// =============================================================================

// Base entity interface
export interface BaseEntity {
  id: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

// OFFICE/ORGANIZATIONAL UNIT V2 SCHEMA
export interface OfficeV2 extends BaseEntity {
  // Core Identity
  name: string
  code: string
  shortName?: string

  // Classification
  type: OfficeType
  category: OfficeCategory
  level: OfficeLevel

  // Hierarchy
  parentId?: string | null
  hierarchyPath?: string[] // Full path from root

  // Government Schema Fields (DBM/DOA Standards)
  uacsCode?: string // Unified Accounts Code Structure
  responsibilityCenter?: string
  agencyId?: string
  departmentId?: string

  // Geographic Jurisdiction
  region?: string
  province?: string
  municipality?: string
  barangay?: string
  cluster?: string // Satellite/Cluster designation

  // Operational Details
  procurementWorkflow?: ProcurementWorkflow
  budgetingCostCenter?: string
  costCenterCode?: string

  // Status & Lifecycle
  status: OrgUnitStatus
  effectiveDate?: string
  dissolutionDate?: string

  // Metadata
  description?: string
  objectives?: string[]
  functions?: string[]
  contactInfo?: ContactInfo

  // Position count from backend
  positionCount?: number
}

// POSITION V2 SCHEMA
// POSITION V2 SCHEMA
export interface PositionV2 extends BaseEntity {
  // Core Identity
  title: string
  code: string
  shortTitle?: string

  // Classification
  type: PositionType
  category: PositionCategory
  plantillaType: PlantillaType

  // Organizational Context
  orgUnitId: string
  office?: OfficeV2 // Populated reference

  // Government Schema Fields (DBM Plantilla Standards)
  itemNumber: string // DBM Plantilla Item Number
  plantillaNumber?: string
  salaryGrade: string
  stepIncrement: number
  authorizedFTE: number

  // Compensation Details
  monthlySalary?: number
  annualSalary?: number
  benefits?: Benefit[]

  // Requirements & Qualifications
  education?: EducationRequirement[]
  experience?: ExperienceRequirement[]
  eligibility?: string[]
  competencies?: Competency[]

  // Status & Lifecycle
  status: PositionStatus
  effectiveDate?: string
  expiryDate?: string
  isPermanent?: boolean

  // Incumbent Information (when filled)
  incumbentId?: string
  incumbent?: StaffV2

  // Metadata
  description?: string
  responsibilities?: string[]
  reportingTo?: string // Position ID
  supervisees?: string[] // Position IDs
}


// Simplified representation used for dropdowns/selector lists
export interface PositionDropdownItem {
  id: string
  title: string
  code: string
  isVacant: boolean
}

// STAFF/PERSONNEL V2 SCHEMA
export interface StaffV2 extends BaseEntity {
  // Personal Information
  firstName: string
  middleName?: string
  lastName: string
  nameSuffix?: string
  fullName: string // Computed field

  // Government IDs
  employeeNumber: string // Agency Employee Number
  tin?: string // Tax Identification Number
  gsis?: string // Government Service Insurance System
  philhealth?: string // PhilHealth Number
  pagibig?: string // PAG-IBIG Number
  bir?: string // BIR ID

  // Employment Details
  positionId?: string
  position?: PositionV2 // Populated reference

  // Employment Lifecycle
  employmentStatus: EmploymentStatus
  appointmentType: AppointmentType
  startDate?: string
  endDate?: string
  contractEndDate?: string

  // Compensation & Benefits
  monthlySalary?: number
  annualSalary?: number
  benefits?: Benefit[]

  // Contact Information
  email?: string
  phone?: string
  emergencyContact?: ContactInfo

  // Personal Details
  birthDate?: string
  age?: number
  gender?: 'Male' | 'Female' | 'Other'
  civilStatus?: CivilStatus

  // Address Information
  presentAddress?: Address
  permanentAddress?: Address

  // Qualifications & Experience
  education?: Education[]
  certifications?: Certification[]
  workExperience?: WorkExperience[]

  // Performance & Development
  performanceRating?: number
  lastPerformanceReview?: string
  trainingHistory?: TrainingRecord[]

  // Status & Lifecycle
  status: PersonnelStatus
  isActive: boolean

  // Organizational Context
  orgUnitId?: string
  office?: OfficeV2
  supervisorId?: string
  supervisor?: StaffV2

  // Metadata
  notes?: string
  tags?: string[]
}

// =============================================================================
// ENUMERATION TYPES (V2 Standards)
// =============================================================================

// Office Types
export type OfficeType =
  | 'office'
  | 'division'
  | 'section'
  | 'unit'
  | 'department'
  | 'bureau'
  | 'service'
  | 'center'

export type OfficeCategory =
  | 'executive'
  | 'administrative'
  | 'technical'
  | 'support'
  | 'oversight'
  | 'delivery'
  | 'regulatory'

export type OfficeLevel =
  | 'central'
  | 'regional'
  | 'provincial'
  | 'municipal'
  | 'barangay'
  | 'satellite'

// Position Types
export type PositionType =
  | 'executive'
  | 'managerial'
  | 'supervisory'
  | 'technical'
  | 'administrative'
  | 'support'
  | 'labor'

export type PositionCategory =
  | 'professional'
  | 'sub-professional'
  | 'non-professional'

export type PlantillaType =
  | 'permanent'
  | 'casual'
  | 'contractual'
  | 'coterminous'
  | 'elective'

// Employment Types
export type EmploymentStatus =
  | 'active'
  | 'on-leave'
  | 'resigned'
  | 'retired'
  | 'terminated'
  | 'deceased'

export type AppointmentType =
  | 'permanent'
  | 'temporary'
  | 'casual'
  | 'contractual'
  | 'coterminous'
  | 'elective'
  | 'co-terminous'

// Procurement Workflow Types
export type ProcurementWorkflow =
  | 'centralized'
  | 'decentralized'
  | 'mixed'
  | 'none'

// Civil Status
export type CivilStatus =
  | 'Single'
  | 'Married'
  | 'Widowed'
  | 'Separated'
  | 'Divorced'

// =============================================================================
// COMPLEX TYPE DEFINITIONS
// =============================================================================

// Contact Information
export interface ContactInfo {
  email?: string
  phone?: string
  mobile?: string
  fax?: string
  address?: Address
}

// Address Structure
export interface Address {
  street?: string
  barangay?: string
  municipality?: string
  province?: string
  region?: string
  zipCode?: string
  country?: string
}

// Benefits Structure
export interface Benefit {
  type: string
  amount?: number
  frequency?: 'monthly' | 'annual' | 'one-time'
  isMandatory: boolean
  description?: string
}

// Education Requirements
export interface EducationRequirement {
  level: string // e.g., "Bachelor's Degree", "Master's Degree"
  field?: string // e.g., "Computer Science", "Business Administration"
  isRequired: boolean
}

// Experience Requirements
export interface ExperienceRequirement {
  years: number
  field?: string
  level?: string
  isRequired: boolean
}

// Competencies
export interface Competency {
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  isRequired: boolean
}

// Education Records
export interface Education {
  level: string
  degree?: string
  field: string
  school: string
  yearGraduated?: number
  honors?: string
}

// Certifications
export interface Certification {
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
}

// Work Experience
export interface WorkExperience {
  position: string
  company: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  responsibilities?: string[]
  achievements?: string[]
}

// Training Records
export interface TrainingRecord {
  title: string
  provider: string
  startDate: string
  endDate: string
  hours?: number
  certificate?: string
  status: 'completed' | 'ongoing' | 'planned'
}

// =============================================================================
// LEGACY TYPE COMPATIBILITY (V1 -> V2 Migration)
// =============================================================================

// Backward compatibility types (maps V1 to V2)
export type OrgUnit = OfficeV2 // Legacy alias
export type Position = PositionV2 // Legacy alias
export type Person = StaffV2 // Legacy alias

// =============================================================================
// SETTINGS TYPES (Organization-wide Configuration)
// =============================================================================

// Base Settings Entity
export interface BaseSetting extends BaseEntity {
  name: string
  description?: string
  status: 'active' | 'inactive'
}

// ======= STRUCTURE MANAGEMENT SETTINGS =======

export interface OfficeTypeSetting {
  id: string
  name: string
  code: string
  canHaveChildren: boolean
  isActive: boolean
  createdAt: string
  createdBy: string
  defaultCategory?: OfficeCategory
  allowedCategories?: OfficeCategory[]
  metadata?: Record<string, any>
  updatedAt?: string
}

// Actual API Response Type for Office Types
export interface OfficeTypeEntity {
  id: string
  name: string
  code: string
  canHaveChildren: boolean
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
}

// Form values for Office Type (API payload)
export interface OfficeTypeFormData {
  name: string
  code: string
  canHaveChildren: boolean
}

export interface OfficeCategorySetting {
  id: string
  name: string
  code: string
  canHaveChildren: boolean
  isActive: boolean
  createdAt: string
  createdBy: string
  officeType: OfficeType
  budgetingApproach?: 'cost-center' | 'responsibility-center'
  requiresCluster?: boolean
  metadata?: Record<string, any>
  updatedAt?: string
}

// Actual API Response Type for Office Categories
export interface OfficeCategoryEntity {
  id: string
  name: string
  code: string
  canHaveChildren: boolean
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
}

// Form values for Office Category (API payload)
export interface OfficeCategoryFormData {
  name: string
  code: string
  canHaveChildren: boolean
}

export interface ProcurementWorkflowSetting {
  id: string
  name: string
  code: string
  approvalLevel: number
  isActive: boolean
  createdAt: string
  createdBy?: string
  updatedAt?: string
}

// Form values for Procurement Workflow (API payload)
export interface ProcurementWorkflowFormValues {
  name: string
  code: string
  approvalLevel: number
  isActive?: boolean
}

export interface AdministrativeLevelSetting {
  id: string
  name: string
  code: string
  canHaveChildren: boolean
  isActive: boolean
  createdAt: string
  createdBy: string
  hierarchyOrder: number
  metadata?: Record<string, any>
  updatedAt?: string
}

// Actual API Response Type for Administrative Levels
export interface AdministrativeLevel {
  id: string
  name: string
  code: string
  canHaveChildren: boolean
  isActive: boolean
  createdAt: string
  createdBy: string
  updatedAt?: string
}

// Form values for Administrative Level (API payload)
export interface AdministrativeLevelFormData {
  name: string
  code: string
  canHaveChildren: boolean
}

export interface SatelliteClusterSetting {
  id: string
  name: string
  code: string
  // geographic breakdown used when auto-populating addresses
  region?: string
  province?: string
  municipality?: string
  barangay?: string

  // human-readable address (fallback / override)
  address?: string

  description?: string
  status?: string
  coordinationMechanism?: string

  // number of sub-units that may be created under this cluster
  maxSubUnits: number

  isActive?: boolean
  createdAt: string
  updatedAt?: string
  createdBy?: string
}

// Form values for Satellite Cluster (API payload)
export interface SatelliteClusterFormValues {
  name: string
  code: string
  // the form currently only exposes the address field but other
  // geographic pieces are available if needed in the future
  address: string
  maxSubUnits: number
  isActive?: boolean
  description?: string
  status?: string
  region?: string
  province?: string
  municipality?: string
  barangay?: string
}


// ======= STAFFING & PLANTILLA SETTINGS =======

export interface PositionTypeSetting {
  id: string
  name: string
  code: string
  description: string
  educationalLevel: string
  category: string
  isCareerEligibilityRequired: boolean
  canReportDirectly: boolean
  isActive?: boolean
  status?: string
  createdAt: string
  createdBy?: string
  updatedAt?: string
}

export interface PositionCategorySetting {
  id: string
  name: string
  code: string
  description?: string
  isActive?: boolean
  status?: string
  createdAt: string
  createdBy?: string
  positionType: PositionType
  minSalaryGrade?: string
  maxSalaryGrade?: string
  allowedPlantillaTypes?: PlantillaType[]
  requiresSpecialization?: boolean
  metadata?: Record<string, any>
  updatedAt?: string
}

export interface SalaryGradeSetting {
  id: string
  name: string
  code: string
  gradeNumber?: number
  salaryGradeNumber?: number
  monthlySalaryMin?: number
  monthlySalaryMax?: number
  minStep?: number
  maxStep?: number
  stepIncrementAmount: number
  numberOfSteps: number
  effectiveDate: string
  description: string
  isActive?: boolean
  status?: string
  createdAt: string
  updatedAt?: string
}

export interface PlantillaTypeSetting {
  id: string
  name: string
  code: string
  duration?: number | null
  requiresActingAppointments?: boolean
  requiresActingAppointment?: boolean
  allowsContractual?: boolean
  allowsContractualConversion?: boolean
  benefitsEligibility?: string[]
  isActive?: boolean
  status?: string
  benefits?: string
  description?: string
  createdAt: string
  updatedAt?: string
}

export interface StepSetting {
  id: string
  name: string
  code: string
  stepNumber: number
  minStep: number
  maxStep: number
  description?: string
  status?: string
  isActive?: boolean
  createdAt: string
  updatedAt?: string
}

// ======= PERSONNEL REPORTING SETTINGS =======

export interface PMTMaximumSeatsSetting {
  id: string
  name: string
  code: string
  isActive?: boolean
  status?: string
  createdAt: string
  createdBy?: string
  maxSeats: number
  effectiveDate?: string
  organizationWide: boolean
  officeId?: string // if not organization-wide
  minimumGradeLevel?: string
  reportingLevel?: 'executive' | 'managerial' | 'supervisory'
  description?: string
  metadata?: Record<string, any>
  updatedAt?: string
}

export interface PersonnelReportingTypeSetting {
  id: string
  name: string
  code: string
  isActive?: boolean
  status?: string
  createdAt: string
  createdBy?: string
  reportingStructureType: 'direct' | 'functional' | 'matrix' | 'dotted'
  requiresApproval: boolean
  escalationPath?: string[]
  maxLevels?: number
  description?: string
  metadata?: Record<string, any>
  updatedAt?: string
}

// ======= COMBINED SETTINGS QUERIES =======

export interface AllSettings {
  officeTypes: OfficeTypeEntity[]
  officeCategories: OfficeCategoryEntity[]
  procurementWorkflows: ProcurementWorkflowSetting[]
  satelliteClusters: SatelliteClusterSetting[]
  positionTypes: PositionTypeSetting[]
  positionCategories: PositionCategorySetting[]
  salaryGrades: SalaryGradeSetting[]
  plantillaTypes: PlantillaTypeSetting[]
  steps: StepSetting[]
  pmtMaximumSeats: PMTMaximumSeatsSetting[]
  personnelReportingTypes: PersonnelReportingTypeSetting[]
}

// ======= FORM VALUE TYPES =======

export type OfficeTypeFormValues = OfficeTypeFormData
export type OfficeCategoryFormValues = OfficeCategoryFormData
export type AdministrativeLevelFormValues = AdministrativeLevelFormData
export type PositionTypeFormValues = Omit<PositionTypeSetting, 'id' | 'createdAt' | 'createdBy'>
export type PositionCategoryFormValues = Omit<PositionCategorySetting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
export type SalaryGradeFormValues = Omit<SalaryGradeSetting, 'id' | 'createdAt'>
export type PlantillaTypeFormValues = Omit<PlantillaTypeSetting, 'id' | 'createdAt'>
export type StepFormValues = Omit<StepSetting, 'id' | 'createdAt'>
export type PMTMaximumSeatsFormValues = Omit<PMTMaximumSeatsSetting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
export type PersonnelReportingTypeFormValues = Omit<PersonnelReportingTypeSetting, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>

