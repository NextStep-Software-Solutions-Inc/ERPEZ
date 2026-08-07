export type OfficeCeilingAgencyMasterBudget = {
  id: string
  fundSourceId: string
  fiscalYearId: string
  psAmount: number
  mooeAmount: number
  coAmount: number
  sourceDocumentType?: string
}

export type OfficeCeilingFiscalYear = {
  id: string
  year: number
  description?: string
}

export type OfficeCeilingOffice = {
  id: string
  name: string
  code: string
}

export type OfficeCeiling = {
  id: string
  fiscalYearId: string
  officeId: string
  agencyMasterBudgetId: string
  psAmount: number
  mooeAmount: number
  coAmount: number
  status: string
  targetType: string
  isSupplemental: boolean
  subOfficeCeilingCount: number
  fiscalYear?: OfficeCeilingFiscalYear
  office?: OfficeCeilingOffice
  agencyMasterBudget?: OfficeCeilingAgencyMasterBudget
}
